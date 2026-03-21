import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { CreditCard, Lock, CheckCircle, AlertCircle } from 'lucide-react';
import { useCartStore } from '../store/cartStore';
import { createOrder } from '../api/orders';
import { createPaymentIntent, confirmPayment, createPayPalOrder, capturePayPalPayment, createNet30Payment } from '../api/payments';
import { stripePromise } from '../lib/stripe';

const PaymentPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const shippingInfo = location.state?.shippingInfo || {};
  const { items, getTotal, clearCart } = useCartStore();

  const [paymentMethod, setPaymentMethod] = useState('stripe');
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState('');

  const [cardDetails, setCardDetails] = useState({
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    cardholderName: '',
  });

  const [net30Eligible, setNet30Eligible] = useState(true);
  const NET30_CREDIT_LIMIT_PLACEHOLDER = 50000;

  const total = getTotal();
  const tax = total * 0.08;
  const finalTotal = total + tax;

  useEffect(() => {
    if (items.length === 0) {
      navigate('/cart');
    }
  }, [items.length, navigate]);

  // Step 1: Create order from server-side cart (synced during checkout)
  const placeOrder = async () => {
    const data = await createOrder(shippingInfo, shippingInfo.instructions || '');
    const order = data.order || data.data || data;
    return order;
  };

  // ── STRIPE: order → intent → confirm card → confirm backend ──
  const handleStripePayment = async (e) => {
    e.preventDefault();
    setError('');

    if (!cardDetails.cardNumber || !cardDetails.expiryDate || !cardDetails.cvv || !cardDetails.cardholderName) {
      setError('Please fill in all card details');
      return;
    }

    if (cardDetails.cardNumber.replace(/\s/g, '').length !== 16) {
      setError('Invalid card number');
      return;
    }

    if (cardDetails.cvv.length !== 3 && cardDetails.cvv.length !== 4) {
      setError('Invalid CVV');
      return;
    }

    setProcessing(true);

    try {
      // 1. Create the order
      const order = await placeOrder();

      // 2. Create Stripe PaymentIntent
      const intentData = await createPaymentIntent(order.id);
      const { clientSecret } = intentData;

      // 3. Confirm with Stripe client
      const stripe = await stripePromise;
      if (!stripe) throw new Error('Stripe failed to load');

      const [expMonth, expYear] = cardDetails.expiryDate.split('/');
      const { error: stripeError, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: {
            number: cardDetails.cardNumber.replace(/\s/g, ''),
            exp_month: parseInt(expMonth),
            exp_year: parseInt(`20${expYear}`),
            cvc: cardDetails.cvv,
          },
          billing_details: {
            name: cardDetails.cardholderName,
          },
        },
      });

      if (stripeError) {
        setError(stripeError.message);
        return;
      }

      if (paymentIntent.status === 'succeeded') {
        // 4. Confirm payment on backend
        await confirmPayment(order.id);
        clearCart();
        navigate(`/order-confirmation/${order.id}`, {
          state: { paymentMethod: 'stripe', amount: finalTotal }
        });
      }
    } catch (err) {
      console.error(err);
      setError(err?.data?.message || err.message || 'Payment failed');
    } finally {
      setProcessing(false);
    }
  };

  // ── PAYPAL: order → create paypal order → redirect → capture ──
  const handlePayPalPayment = async () => {
    setProcessing(true);
    setError('');

    try {
      const order = await placeOrder();
      const paypalData = await createPayPalOrder(order.id);

      if (paypalData.approvalUrl) {
        // Store orderId for capture on return
        sessionStorage.setItem('pendingPayPalOrderId', order.id);
        window.location.href = paypalData.approvalUrl;
      } else {
        // Fallback: capture immediately if no redirect needed
        await capturePayPalPayment(order.id);
        clearCart();
        navigate(`/order-confirmation/${order.id}`, {
          state: { paymentMethod: 'paypal', amount: finalTotal }
        });
      }
    } catch (err) {
      console.error(err);
      setError(err?.data?.message || err.message || 'PayPal payment failed');
    } finally {
      setProcessing(false);
    }
  };

  // ── NET30: order → net30 payment ──
  const handleNet30Payment = async () => {
    setProcessing(true);
    setError('');

    try {
      const order = await placeOrder();
      await createNet30Payment(order.id);
      clearCart();
      navigate(`/order-confirmation/${order.id}`, {
        state: { paymentMethod: 'net30', amount: finalTotal }
      });
    } catch (err) {
      console.error(err);
      setError(err?.data?.message || err.message || 'Failed to place order');
    } finally {
      setProcessing(false);
    }
  };

  const formatCardNumber = (value) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = v.match(/\d{4,16}/g);
    const match = (matches && matches[0]) || '';
    const parts = [];
    for (let i = 0; i < match.length; i += 4) {
      parts.push(match.substring(i, i + 4));
    }
    return parts.length ? parts.join(' ') : value;
  };

  const formatExpiryDate = (value) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    if (v.length >= 2) {
      return v.substring(0, 2) + (v.length > 2 ? '/' + v.substring(2, 4) : '');
    }
    return v;
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-white py-12 px-4">
      <div className="max-w-4xl mx-auto">
        
        <div className="text-center mb-8">
          <h1 className="font-display text-3xl text-secondary mb-2">Secure Payment</h1>
          <p className="text-gray-600 flex items-center justify-center gap-2">
            <Lock className="w-4 h-4" /> Your payment information is encrypted and secure
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          <div className="lg:col-span-2">
            <div className="bg-white border-2 border-gray-200 rounded-2xl p-6">
              
              <div className="mb-6">
                <label className="block text-sm font-semibold text-secondary mb-3">Select Payment Method</label>
                <div className="grid grid-cols-3 gap-4">
                  <button
                    type="button"
                    onClick={() => !processing && setPaymentMethod('stripe')}
                    disabled={processing}
                    className={`p-4 border-2 rounded-xl flex flex-col items-center gap-2 transition-all ${
                      paymentMethod === 'stripe'
                        ? 'border-primary bg-primary/5'
                        : 'border-gray-200 hover:border-gray-300'
                    } ${processing ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    <CreditCard className={`w-8 h-8 ${paymentMethod === 'stripe' ? 'text-primary' : 'text-gray-400'}`} />
                    <span className={`text-sm font-semibold ${paymentMethod === 'stripe' ? 'text-primary' : 'text-gray-600'}`}>
                      Credit / Debit
                    </span>
                    <span className="text-xs text-gray-400">Stripe</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => !processing && setPaymentMethod('paypal')}
                    disabled={processing}
                    className={`p-4 border-2 rounded-xl flex flex-col items-center gap-2 transition-all ${
                      paymentMethod === 'paypal'
                        ? 'border-primary bg-primary/5'
                        : 'border-gray-200 hover:border-gray-300'
                    } ${processing ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    <svg className={`w-8 h-8 ${paymentMethod === 'paypal' ? 'text-primary' : 'text-gray-400'}`} viewBox="0 0 24 24" fill="currentColor">
                      <path d="M7.076 21.337H2.47a.641.641 0 0 1-.633-.74L4.944 3.72a.77.77 0 0 1 .76-.653h8.53c2.347 0 4.203.522 5.52 1.551 1.303 1.015 1.936 2.526 1.936 4.62 0 1.756-.45 3.287-1.338 4.55-.903 1.287-2.166 2.22-3.753 2.773-1.554.542-3.366.815-5.391.815H9.346a.77.77 0 0 0-.76.653l-.547 3.658a.641.641 0 0 1-.634.74z"/>
                    </svg>
                    <span className={`text-sm font-semibold ${paymentMethod === 'paypal' ? 'text-primary' : 'text-gray-600'}`}>
                      PayPal
                    </span>
                    <span className="text-xs text-gray-400">Quick Pay</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => !processing && setPaymentMethod('net30')}
                    disabled={!net30Eligible || processing}
                    className={`p-4 border-2 rounded-xl flex flex-col items-center gap-2 transition-all ${
                      paymentMethod === 'net30'
                        ? 'border-primary bg-primary/5'
                        : net30Eligible ? 'border-gray-200 hover:border-gray-300' : 'border-gray-200 opacity-50 cursor-not-allowed'
                    }`}
                  >
                    <svg className={`w-8 h-8 ${paymentMethod === 'net30' ? 'text-primary' : 'text-gray-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <span className={`text-sm font-semibold ${paymentMethod === 'net30' ? 'text-primary' : 'text-gray-600'}`}>
                      Net 30
                    </span>
                    <span className="text-xs text-gray-400">Invoice</span>
                  </button>
                </div>
                {!net30Eligible && (
                  <p className="mt-2 text-xs text-gray-500">
                    Net 30 requires Tax ID. Please update your profile or contact support.
                  </p>
                )}
              </div>

              {error && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                  <div className="text-sm text-red-700">{error}</div>
                </div>
              )}

              {paymentMethod === 'stripe' && (
                <form onSubmit={handleStripePayment} className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-secondary mb-2">Cardholder Name</label>
                    <input
                      type="text"
                      value={cardDetails.cardholderName}
                      onChange={(e) => setCardDetails({ ...cardDetails, cardholderName: e.target.value })}
                      placeholder="John Smith"
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-primary focus:outline-none"
                      disabled={processing}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-secondary mb-2">Card Number</label>
                    <input
                      type="text"
                      value={cardDetails.cardNumber}
                      onChange={(e) => setCardDetails({ ...cardDetails, cardNumber: formatCardNumber(e.target.value) })}
                      placeholder="1234 5678 9012 3456"
                      maxLength="19"
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-primary focus:outline-none font-mono"
                      disabled={processing}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-secondary mb-2">Expiry Date</label>
                      <input
                        type="text"
                        value={cardDetails.expiryDate}
                        onChange={(e) => setCardDetails({ ...cardDetails, expiryDate: formatExpiryDate(e.target.value) })}
                        placeholder="MM/YY"
                        maxLength="5"
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-primary focus:outline-none font-mono"
                        disabled={processing}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-secondary mb-2">CVV</label>
                      <input
                        type="text"
                        value={cardDetails.cvv}
                        onChange={(e) => setCardDetails({ ...cardDetails, cvv: e.target.value.replace(/\D/g, '').slice(0, 4) })}
                        placeholder="123"
                        maxLength="4"
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-primary focus:outline-none font-mono"
                        disabled={processing}
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={processing}
                    className="w-full mt-6 bg-primary text-white py-4 rounded-lg font-semibold hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {processing ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Processing Payment...
                      </>
                    ) : (
                      <>
                        <Lock className="w-5 h-5" />
                        Pay ${finalTotal.toFixed(2)}
                      </>
                    )}
                  </button>
                </form>
              )}

              {paymentMethod === 'paypal' && (
                <div className="space-y-4">
                  <div className="p-6 bg-blue-50 border-2 border-blue-200 rounded-xl text-center">
                    <svg className="w-16 h-16 mx-auto mb-4 text-blue-600" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M7.076 21.337H2.47a.641.641 0 0 1-.633-.74L4.944 3.72a.77.77 0 0 1 .76-.653h8.53c2.347 0 4.203.522 5.52 1.551 1.303 1.015 1.936 2.526 1.936 4.62 0 1.756-.45 3.287-1.338 4.55-.903 1.287-2.166 2.22-3.753 2.773-1.554.542-3.366.815-5.391.815H9.346a.77.77 0 0 0-.76.653l-.547 3.658a.641.641 0 0 1-.634.74z"/>
                    </svg>
                    <h3 className="font-semibold text-lg text-secondary mb-2">Pay with PayPal</h3>
                    <p className="text-sm text-gray-600 mb-4">
                      You'll be redirected to PayPal to complete your payment securely.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={handlePayPalPayment}
                    disabled={processing}
                    className="w-full bg-[#0070ba] text-white py-4 rounded-lg font-semibold hover:bg-[#005ea6] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {processing ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Redirecting to PayPal...
                      </>
                    ) : (
                      'Continue with PayPal'
                    )}
                  </button>

                  <p className="text-xs text-gray-500 text-center">
                    By continuing, you'll be redirected to PayPal to log in and authorize the payment.
                  </p>
                </div>
              )}

              {paymentMethod === 'net30' && (
                <div className="space-y-4">
                  <div className="bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-200 rounded-xl p-6">
                    <div className="flex items-start gap-3 mb-4">
                      <svg className="w-8 h-8 text-green-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      <div className="flex-1">
                        <h3 className="font-semibold text-xl text-secondary mb-2">Net 30 Payment Terms</h3>
                        <p className="text-sm text-gray-700 mb-3">
                          Pay within 30 days of invoice date. Perfect for healthcare organizations with established procurement processes.
                        </p>
                      </div>
                    </div>

                    {/* Benefits */}
                    <div className="grid grid-cols-2 gap-3 mb-4">
                      <div className="bg-white rounded-lg p-3 border border-green-200">
                        <div className="flex items-center gap-2 mb-1">
                          <CheckCircle className="w-4 h-4 text-green-600" />
                          <span className="text-xs font-semibold text-secondary">No Upfront Payment</span>
                        </div>
                        <p className="text-xs text-gray-600">Order now, pay later</p>
                      </div>
                      <div className="bg-white rounded-lg p-3 border border-green-200">
                        <div className="flex items-center gap-2 mb-1">
                          <CheckCircle className="w-4 h-4 text-green-600" />
                          <span className="text-xs font-semibold text-secondary">30-Day Window</span>
                        </div>
                        <p className="text-xs text-gray-600">Flexible payment schedule</p>
                      </div>
                      <div className="bg-white rounded-lg p-3 border border-green-200">
                        <div className="flex items-center gap-2 mb-1">
                          <CheckCircle className="w-4 h-4 text-green-600" />
                          <span className="text-xs font-semibold text-secondary">Email Invoice</span>
                        </div>
                        <p className="text-xs text-gray-600">Detailed documentation</p>
                      </div>
                      <div className="bg-white rounded-lg p-3 border border-green-200">
                        <div className="flex items-center gap-2 mb-1">
                          <CheckCircle className="w-4 h-4 text-green-600" />
                          <span className="text-xs font-semibold text-secondary">Purchase Orders</span>
                        </div>
                        <p className="text-xs text-gray-600">Full audit trail</p>
                      </div>
                    </div>

                    {/* Credit Status */}
                    <div className="bg-white rounded-lg p-4 mb-4 border-2 border-green-300">
                      <div className="flex items-center justify-between mb-3">
                        <p className="text-sm font-semibold text-secondary">Your Credit Status</p>
                        <span className="px-3 py-1 bg-green-100 text-green-700 text-xs font-bold rounded-full">APPROVED</span>
                      </div>
                      <div className="grid grid-cols-2 gap-4 mb-3">
                        <div>
                          <span className="text-xs text-gray-600 block mb-1">Total Credit Limit</span>
                          <span className="font-bold text-secondary text-xl">${NET30_CREDIT_LIMIT_PLACEHOLDER.toLocaleString()}</span>
                        </div>
                        <div>
                          <span className="text-xs text-gray-600 block mb-1">Available Credit</span>
                          <span className="font-bold text-green-600 text-xl">${NET30_CREDIT_LIMIT_PLACEHOLDER.toLocaleString()}</span>
                        </div>
                      </div>
                      <div className="pt-3 border-t border-gray-200">
                        <div className="flex justify-between items-center text-sm mb-1">
                          <span className="text-gray-600">This Order:</span>
                          <span className="font-semibold text-secondary">${finalTotal.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between items-center text-sm">
                          <span className="text-gray-600">Remaining After Purchase:</span>
                          <span className="font-semibold text-green-600">${(NET30_CREDIT_LIMIT_PLACEHOLDER - finalTotal).toFixed(2)}</span>
                        </div>
                      </div>
                    </div>

                    {/* Payment Terms */}
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                      <h4 className="text-sm font-semibold text-secondary mb-2 flex items-center gap-2">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        Payment Terms
                      </h4>
                      <ul className="text-xs text-gray-700 space-y-1">
                        <li>• Invoice due date: 30 days from invoice date</li>
                        <li>• Payment methods: ACH, Wire Transfer, Check</li>
                        <li>• Late payment fee: 1.5% per month on overdue balance</li>
                        <li>• Invoice will be sent to your registered email within 24 hours</li>
                      </ul>
                    </div>

                    {/* Place Order Button */}
                    <button
                      type="button"
                      onClick={handleNet30Payment}
                      disabled={processing}
                      className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-4 px-4 rounded-lg transition-colors disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg"
                    >
                      {processing ? (
                        <>
                          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          Processing Order...
                        </>
                      ) : (
                        <>
                          <CheckCircle className="w-5 h-5" />
                          Place Order on Net 30 Terms
                        </>
                      )}
                    </button>

                    <p className="text-xs text-gray-500 mt-3 text-center">
                      By placing this order, you agree to pay the invoice amount within 30 days of the invoice date. 
                      Your order will be processed immediately and shipped according to standard delivery times.
                    </p>
                  </div>
                </div>
              )}

              <div className="mt-6 p-4 bg-gray-50 rounded-lg flex items-center gap-3">
                <Lock className="w-5 h-5 text-green-600" />
                <div className="text-sm">
                  <p className="font-semibold text-secondary">Secure Payment</p>
                  <p className="text-gray-600 text-xs">Your payment information is encrypted with 256-bit SSL</p>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-1">
            <div className="bg-gray-50 border-2 border-gray-200 rounded-2xl p-6 sticky top-24">
              <h2 className="font-semibold text-lg text-secondary mb-4">Order Summary</h2>
              
              <div className="space-y-3 mb-4 pb-4 border-b border-gray-200">
                {items.map((item) => (
                  <div key={item.id} className="flex justify-between text-sm">
                    <span className="text-gray-600">
                      {item.name} × {item.quantity}
                    </span>
                    <span className="font-semibold text-secondary">
                      ${(item.price * item.quantity).toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>

              <div className="space-y-2 mb-4 pb-4 border-b border-gray-200">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="font-semibold text-secondary">${total.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Tax (8%)</span>
                  <span className="font-semibold text-secondary">${tax.toFixed(2)}</span>
                </div>
              </div>

              <div className="flex justify-between text-lg font-bold">
                <span className="text-secondary">Total</span>
                <span className="text-primary">${finalTotal.toFixed(2)}</span>
              </div>

              <div className="mt-6 p-3 bg-green-50 border border-green-200 rounded-lg flex items-start gap-2">
                <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                <div className="text-xs text-green-700">
                  <p className="font-semibold mb-1">Money-Back Guarantee</p>
                  <p>If you're not satisfied, we'll refund your purchase within 30 days.</p>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default PaymentPage;
