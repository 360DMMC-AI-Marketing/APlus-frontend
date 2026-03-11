import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { Store, CheckCircle, AlertCircle, Upload } from 'lucide-react';
import { useAuthStore } from '../store/authStore';

const SupplierRegisterPage = () => {
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { register: registerUser, loading } = useAuthStore();
  const { register, handleSubmit, formState: { errors } } = useForm();

  const onSubmit = async (data) => {
    setError('');
    setSuccess('');
    
    const result = await registerUser(data, 'supplier');
    
    if (result.success) {
      setSuccess(result.message);
      setTimeout(() => {
        navigate('/login');
      }, 3000);
    } else {
      setError(result.error);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-gradient-to-br from-medical-mint to-white py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="glass-card p-8 animate-slide-up">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-br from-primary to-secondary rounded-full flex items-center justify-center mx-auto mb-4">
              <Store className="w-8 h-8 text-white" />
            </div>
            <h1 className="font-display text-3xl text-neutral mb-2">Become a Supplier</h1>
            <p className="text-gray-600">Join APlusMed's marketplace and start selling medical supplies</p>
          </div>

          {/* Success Message */}
          {success && (
            <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-green-700">
                <p className="font-semibold mb-1">Application Submitted!</p>
                <p>{success}</p>
                <p className="mt-2">Redirecting to login page...</p>
              </div>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          {/* Registration Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
            {/* Business Information */}
            <div>
              <h2 className="text-xl font-semibold text-neutral mb-4 pb-2 border-b">Business Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-neutral mb-2">
                    Company / Business Name *
                  </label>
                  <input
                    type="text"
                    {...register('companyName', { required: 'Company name is required' })}
                    className="input-medical"
                    placeholder="Your Medical Supplies Co."
                  />
                  {errors.companyName && (
                    <p className="mt-1 text-sm text-red-600">{errors.companyName.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-neutral mb-2">
                    Tax ID / EIN *
                  </label>
                  <input
                    type="text"
                    {...register('taxId', { required: 'Tax ID is required' })}
                    className="input-medical"
                    placeholder="12-3456789"
                  />
                  {errors.taxId && (
                    <p className="mt-1 text-sm text-red-600">{errors.taxId.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-neutral mb-2">
                    Business Phone *
                  </label>
                  <input
                    type="tel"
                    {...register('businessPhone', { required: 'Phone is required' })}
                    className="input-medical"
                    placeholder="(555) 123-4567"
                  />
                  {errors.businessPhone && (
                    <p className="mt-1 text-sm text-red-600">{errors.businessPhone.message}</p>
                  )}
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-neutral mb-2">
                    Business Address *
                  </label>
                  <input
                    type="text"
                    {...register('businessAddress', { required: 'Address is required' })}
                    className="input-medical"
                    placeholder="123 Business St, City, State ZIP"
                  />
                  {errors.businessAddress && (
                    <p className="mt-1 text-sm text-red-600">{errors.businessAddress.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-neutral mb-2">
                    Website (Optional)
                  </label>
                  <input
                    type="url"
                    {...register('website')}
                    className="input-medical"
                    placeholder="www.yourcompany.com"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-neutral mb-2">
                    Years in Business *
                  </label>
                  <input
                    type="number"
                    {...register('yearsInBusiness', { required: 'Required', min: 0 })}
                    className="input-medical"
                    placeholder="5"
                  />
                  {errors.yearsInBusiness && (
                    <p className="mt-1 text-sm text-red-600">{errors.yearsInBusiness.message}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Contact Person */}
            <div>
              <h2 className="text-xl font-semibold text-neutral mb-4 pb-2 border-b">Primary Contact</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-neutral mb-2">
                    First Name *
                  </label>
                  <input
                    type="text"
                    {...register('firstName', { required: 'First name is required' })}
                    className="input-medical"
                    placeholder="John"
                  />
                  {errors.firstName && (
                    <p className="mt-1 text-sm text-red-600">{errors.firstName.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-neutral mb-2">
                    Last Name *
                  </label>
                  <input
                    type="text"
                    {...register('lastName', { required: 'Last name is required' })}
                    className="input-medical"
                    placeholder="Smith"
                  />
                  {errors.lastName && (
                    <p className="mt-1 text-sm text-red-600">{errors.lastName.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-neutral mb-2">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    {...register('email', { 
                      required: 'Email is required',
                      pattern: {
                        value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                        message: 'Invalid email address'
                      }
                    })}
                    className="input-medical"
                    placeholder="contact@yourcompany.com"
                  />
                  {errors.email && (
                    <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-neutral mb-2">
                    Position / Title *
                  </label>
                  <input
                    type="text"
                    {...register('position', { required: 'Position is required' })}
                    className="input-medical"
                    placeholder="Sales Manager"
                  />
                  {errors.position && (
                    <p className="mt-1 text-sm text-red-600">{errors.position.message}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Account Security */}
            <div>
              <h2 className="text-xl font-semibold text-neutral mb-4 pb-2 border-b">Account Security</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-neutral mb-2">
                    Password *
                  </label>
                  <input
                    type="password"
                    {...register('password', { 
                      required: 'Password is required',
                      minLength: {
                        value: 8,
                        message: 'Password must be at least 8 characters'
                      }
                    })}
                    className="input-medical"
                    placeholder="••••••••"
                  />
                  {errors.password && (
                    <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-neutral mb-2">
                    Confirm Password *
                  </label>
                  <input
                    type="password"
                    {...register('confirmPassword', { 
                      required: 'Please confirm your password',
                    })}
                    className="input-medical"
                    placeholder="••••••••"
                  />
                  {errors.confirmPassword && (
                    <p className="mt-1 text-sm text-red-600">{errors.confirmPassword.message}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Product Categories */}
            <div>
              <h2 className="text-xl font-semibold text-neutral mb-4 pb-2 border-b">Product Categories</h2>
              <p className="text-sm text-gray-600 mb-3">Select the categories of products you will be selling:</p>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {['Surgical Supplies', 'Diagnostic Equipment', 'Personal Protection', 'Laboratory', 'Patient Care', 'Emergency Medical'].map((category) => (
                  <label key={category} className="flex items-center">
                    <input 
                      type="checkbox" 
                      {...register('categories')}
                      value={category}
                      className="w-4 h-4 text-primary rounded" 
                    />
                    <span className="ml-2 text-sm text-gray-700">{category}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Terms */}
            <div>
              <label className="flex items-start">
                <input 
                  type="checkbox" 
                  {...register('terms', { required: 'You must accept the terms' })}
                  className="w-4 h-4 text-primary rounded mt-1" 
                />
                <span className="ml-2 text-sm text-gray-600">
                  I agree to the <a href="#" className="text-primary hover:text-primary/80">Supplier Terms & Conditions</a>,{' '}
                  <a href="#" className="text-primary hover:text-primary/80">Commission Structure</a>, and{' '}
                  <a href="#" className="text-primary hover:text-primary/80">Payout Policy</a>
                </span>
              </label>
              {errors.terms && (
                <p className="mt-1 text-sm text-red-600">{errors.terms.message}</p>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading || success}
              className="w-full btn-medical disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Submitting Application...
                </div>
              ) : (
                'Submit Supplier Application'
              )}
            </button>
          </form>

          {/* Login Link */}
          <div className="mt-6 text-center">
            <p className="text-gray-600">
              Already registered as a supplier?{' '}
              <Link to="/login" className="text-primary font-semibold hover:text-primary/80">
                Sign in here
              </Link>
            </p>
            <p className="text-gray-600 mt-2">
              Looking to buy instead?{' '}
              <Link to="/register" className="text-primary font-semibold hover:text-primary/80">
                Customer registration
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SupplierRegisterPage;
