import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { MapPin, CreditCard, Package } from 'lucide-react';
import { useCartStore } from '../store/cartStore';
import { useAuthStore } from '../store/authStore';
const CheckoutPage = () => {
  const navigate = useNavigate();
  const { items, getTotal } = useCartStore();
  const { user } = useAuthStore();
  const { register, handleSubmit, formState: { errors } } = useForm({
    defaultValues: {
      fullName: user?.name || `${user?.firstName || ''} ${user?.lastName || ''}`.trim(),
      email: user?.email || '',
      company: user?.company || user?.companyName || '',
    }
  });

  useEffect(() => {
    if (items.length === 0) {
      navigate('/cart');
    }
  }, [items.length, navigate]);

  const onSubmit = (data) => {
    navigate('/payment', { state: { shippingInfo: data } });
  };

  if (items.length === 0) {
    return null; // render nothing while useEffect redirect fires
  }

  const subtotal = getTotal();
  const shipping = 25.00;
  const tax = subtotal * 0.08;
  const total = subtotal + shipping + tax;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8 animate-fade-in">
          <h1 className="font-display text-4xl text-neutral mb-2">Checkout</h1>
          <p className="text-gray-600">Complete your order</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Shipping Information */}
            <div className="lg:col-span-2 space-y-6">
              {/* Contact Information */}
              <div className="bg-white rounded-xl shadow-sm p-6 animate-slide-up">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                    <Package className="w-5 h-5 text-primary" />
                  </div>
                  <h2 className="font-display text-2xl text-neutral">Contact Information</h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-neutral mb-2">
                      Full Name *
                    </label>
                    <input
                      {...register('fullName', { required: 'Name is required' })}
                      className="input-medical"
                      placeholder="John Smith"
                    />
                    {errors.fullName && (
                      <p className="mt-1 text-sm text-red-600">{errors.fullName.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-neutral mb-2">
                      Email *
                    </label>
                    <input
                      type="email"
                      {...register('email', { required: 'Email is required' })}
                      className="input-medical"
                      placeholder="john@hospital.com"
                    />
                    {errors.email && (
                      <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-neutral mb-2">
                      Phone Number *
                    </label>
                    <input
                      type="tel"
                      {...register('phone', { required: 'Phone is required' })}
                      className="input-medical"
                      placeholder="(555) 123-4567"
                    />
                    {errors.phone && (
                      <p className="mt-1 text-sm text-red-600">{errors.phone.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-neutral mb-2">
                      Company / Organization *
                    </label>
                    <input
                      {...register('company', { required: 'Company is required' })}
                      className="input-medical"
                      placeholder="City Hospital"
                    />
                    {errors.company && (
                      <p className="mt-1 text-sm text-red-600">{errors.company.message}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Shipping Address */}
              <div className="bg-white rounded-xl shadow-sm p-6 animate-slide-up animate-delay-100">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                    <MapPin className="w-5 h-5 text-primary" />
                  </div>
                  <h2 className="font-display text-2xl text-neutral">Shipping Address</h2>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-neutral mb-2">
                      Street Address *
                    </label>
                    <input
                      {...register('street', { required: 'Street address is required' })}
                      className="input-medical"
                      placeholder="123 Medical Center Dr"
                    />
                    {errors.street && (
                      <p className="mt-1 text-sm text-red-600">{errors.street.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-neutral mb-2">
                      Apartment, suite, etc. (optional)
                    </label>
                    <input
                      {...register('apartment')}
                      className="input-medical"
                      placeholder="Suite 100"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-neutral mb-2">
                        City *
                      </label>
                      <input
                        {...register('city', { required: 'City is required' })}
                        className="input-medical"
                        placeholder="Boston"
                      />
                      {errors.city && (
                        <p className="mt-1 text-sm text-red-600">{errors.city.message}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-neutral mb-2">
                        State *
                      </label>
                      <input
                        {...register('state', { required: 'State is required' })}
                        className="input-medical"
                        placeholder="MA"
                      />
                      {errors.state && (
                        <p className="mt-1 text-sm text-red-600">{errors.state.message}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-neutral mb-2">
                        ZIP Code *
                      </label>
                      <input
                        {...register('zip', { required: 'ZIP code is required' })}
                        className="input-medical"
                        placeholder="02115"
                      />
                      {errors.zip && (
                        <p className="mt-1 text-sm text-red-600">{errors.zip.message}</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Special Instructions */}
              <div className="bg-white rounded-xl shadow-sm p-6 animate-slide-up animate-delay-200">
                <h3 className="font-semibold text-lg text-neutral mb-4">
                  Delivery Instructions (Optional)
                </h3>
                <textarea
                  {...register('instructions')}
                  rows="3"
                  className="input-medical resize-none"
                  placeholder="Any special delivery instructions..."
                />
              </div>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-xl shadow-lg p-6 sticky top-24 animate-slide-up animate-delay-300">
                <h2 className="font-display text-2xl text-neutral mb-6">Order Summary</h2>
                
                {/* Items */}
                <div className="space-y-3 mb-6 pb-6 border-b border-gray-200 max-h-60 overflow-y-auto">
                  {items.map(item => (
                    <div key={item.id} className="flex justify-between text-sm">
                      <span className="text-gray-600">
                        {item.name} <span className="text-gray-400">×{item.quantity}</span>
                      </span>
                      <span className="font-semibold text-neutral">
                        ${(item.price * item.quantity).toFixed(2)}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Totals */}
                <div className="space-y-3 mb-6 pb-6 border-b border-gray-200">
                  <div className="flex justify-between text-gray-600">
                    <span>Subtotal</span>
                    <span className="font-semibold">${subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>Shipping</span>
                    <span className="font-semibold">${shipping.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>Tax</span>
                    <span className="font-semibold">${tax.toFixed(2)}</span>
                  </div>
                </div>

                <div className="flex justify-between text-xl font-bold text-neutral mb-6">
                  <span>Total</span>
                  <span className="text-primary">${total.toFixed(2)}</span>
                </div>

                <button
                  type="submit"
                  className="w-full btn-medical flex items-center justify-center gap-2"
                >
                  Continue to Payment
                  <CreditCard className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CheckoutPage;
