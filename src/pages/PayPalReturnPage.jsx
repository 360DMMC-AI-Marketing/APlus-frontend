import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { capturePayPalPayment } from '../api/payments';
import { useCartStore } from '../store/cartStore';

export default function PayPalReturnPage() {
  const navigate = useNavigate();
  const clearCart = useCartStore((s) => s.clearCart);
  const [status, setStatus] = useState('processing');
  const [error, setError] = useState(null);

  useEffect(() => {
    const orderId = sessionStorage.getItem('pendingPayPalOrderId');
    if (!orderId) {
      setStatus('error');
      setError('No pending PayPal order found.');
      return;
    }

    capturePayPalPayment(orderId)
      .then(() => {
        sessionStorage.removeItem('pendingPayPalOrderId');
        clearCart();
        navigate(`/order-confirmation/${orderId}`, {
          state: { paymentMethod: 'paypal', clearCart: true },
          replace: true,
        });
      })
      .catch((err) => {
        setStatus('error');
        setError(err?.data?.message || err.message || 'PayPal capture failed');
      });
  }, []);

  if (status === 'error') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Payment Failed</h1>
          <p className="text-gray-600 mb-6">{error}</p>
          <button onClick={() => navigate('/orders')} className="btn-medical">
            View Orders
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="loading loading-spinner loading-lg text-primary mb-4"></div>
        <p className="text-lg">Completing your PayPal payment...</p>
      </div>
    </div>
  );
}
