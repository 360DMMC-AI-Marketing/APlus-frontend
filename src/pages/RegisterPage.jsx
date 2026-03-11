import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { User, Store, CheckCircle, AlertCircle } from 'lucide-react';
import { useAuthStore } from '../store/authStore';

const RegisterPage = () => {
  const [accountType, setAccountType] = useState('customer'); // 'customer' | 'vendor'
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { register: registerUser, loading } = useAuthStore();
  const { register, handleSubmit, watch, reset, formState: { errors } } = useForm();
  const password = watch('password');

  const handleTypeSwitch = (type) => {
    setAccountType(type);
    setError('');
    setSuccess('');
    reset();
  };

  const onSubmit = async (data) => {
    setError('');
    setSuccess('');
    const result = await registerUser(data, accountType);
    if (result.success) {
      setSuccess(result.message);
      setTimeout(() => navigate('/login'), 3000);
    } else {
      setError(result.error);
    }
  };

  const categories = ['Surgical Supplies', 'Diagnostic Equipment', 'Personal Protection', 'Laboratory', 'Patient Care', 'Emergency Medical'];

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-white py-12 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="glass-card p-8 animate-slide-up">

          {/* Type Toggle */}
          <div className="flex gap-3 p-1.5 bg-gray-100 rounded-xl mb-8">
            <button
              type="button"
              onClick={() => handleTypeSwitch('customer')}
              className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-lg font-semibold text-sm transition-all duration-200 ${
                accountType === 'customer'
                  ? 'bg-white shadow-md text-primary'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <User className="w-4 h-4" />
              Customer
            </button>
            <button
              type="button"
              onClick={() => handleTypeSwitch('vendor')}
              className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-lg font-semibold text-sm transition-all duration-200 ${
                accountType === 'vendor'
                  ? 'bg-white shadow-md text-secondary'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <Store className="w-4 h-4" />
              Vendor / Supplier
            </button>
          </div>

          {/* Header */}
          <div className="text-center mb-8">
            <div className={`w-16 h-16 bg-gradient-to-br ${accountType === 'customer' ? 'from-primary to-secondary' : 'from-secondary to-primary'} rounded-full flex items-center justify-center mx-auto mb-4 transition-all duration-300`}>
              {accountType === 'customer'
                ? <User className="w-8 h-8 text-white" />
                : <Store className="w-8 h-8 text-white" />
              }
            </div>
            <h1 className="font-display text-3xl text-neutral mb-2">
              {accountType === 'customer' ? 'Create Customer Account' : 'Vendor Application'}
            </h1>
            <p className="text-gray-500 text-sm">
              {accountType === 'customer'
                ? 'Start ordering certified medical supplies today'
                : 'Join our marketplace and start selling to healthcare professionals'}
            </p>
            {accountType === 'vendor' && (
              <div className="mt-3 inline-flex items-center gap-2 px-3 py-1.5 bg-yellow-50 border border-yellow-200 rounded-full text-xs text-yellow-700 font-medium">
                <span className="w-1.5 h-1.5 bg-yellow-400 rounded-full" />
                Applications are reviewed within 2–3 business days
              </div>
            )}
          </div>

          {/* Alerts */}
          {success && (
            <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-green-700">
                <p className="font-semibold mb-1">{accountType === 'vendor' ? 'Application Submitted!' : 'Registration Successful!'}</p>
                <p>{success}</p>
                <p className="mt-1 text-green-600">Redirecting to login page...</p>
              </div>
            </div>
          )}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">

            {/* ── VENDOR ONLY: Company info ── */}
            {accountType === 'vendor' && (
              <div className="space-y-5">
                <h2 className="text-base font-semibold text-neutral border-b pb-2">Business Information</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-semibold text-neutral mb-1">Company / Business Name *</label>
                    <input type="text" {...register('companyName', { required: 'Company name is required' })} className="input-medical" placeholder="Your Medical Supplies Co." />
                    {errors.companyName && <p className="mt-1 text-xs text-red-600">{errors.companyName.message}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-neutral mb-1">Tax ID / EIN *</label>
                    <input type="text" {...register('taxId', { required: 'Tax ID is required' })} className="input-medical" placeholder="12-3456789" />
                    {errors.taxId && <p className="mt-1 text-xs text-red-600">{errors.taxId.message}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-neutral mb-1">Business Phone *</label>
                    <input type="tel" {...register('businessPhone', { required: 'Phone is required' })} className="input-medical" placeholder="(555) 123-4567" />
                    {errors.businessPhone && <p className="mt-1 text-xs text-red-600">{errors.businessPhone.message}</p>}
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-semibold text-neutral mb-1">Business Address *</label>
                    <input type="text" {...register('businessAddress', { required: 'Address is required' })} className="input-medical" placeholder="123 Business St, City, State ZIP" />
                    {errors.businessAddress && <p className="mt-1 text-xs text-red-600">{errors.businessAddress.message}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-neutral mb-1">Website (Optional)</label>
                    <input type="text" {...register('website')} className="input-medical" placeholder="www.yourcompany.com" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-neutral mb-1">Years in Business *</label>
                    <input type="number" min="0" {...register('yearsInBusiness', { required: 'Required' })} className="input-medical" placeholder="5" />
                    {errors.yearsInBusiness && <p className="mt-1 text-xs text-red-600">{errors.yearsInBusiness.message}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-neutral mb-1">Business License Number *</label>
                    <input type="text" {...register('businessLicense', { required: 'Business license required' })} className="input-medical" placeholder="BL-123456" />
                    {errors.businessLicense && <p className="mt-1 text-xs text-red-600">{errors.businessLicense.message}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-neutral mb-1">FDA Registration Number <span className="text-gray-500 font-normal">(if applicable)</span></label>
                    <input type="text" {...register('fdaRegistration')} className="input-medical" placeholder="10123456" />
                    <p className="mt-1 text-xs text-gray-500">Required only for medical device manufacturers</p>
                  </div>
                </div>

                <h2 className="text-base font-semibold text-neutral border-b pb-2 pt-2">Product Categories</h2>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {categories.map(cat => (
                    <label key={cat} className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" {...register('categories')} value={cat} className="w-4 h-4 text-primary rounded" />
                      <span className="text-sm text-gray-700">{cat}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}

            {/* ── SHARED: Personal / Contact info ── */}
            <div>
              {accountType === 'vendor' && <h2 className="text-base font-semibold text-neutral border-b pb-2 mb-5">Primary Contact</h2>}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-semibold text-neutral mb-1">First Name *</label>
                  <input type="text" {...register('firstName', { required: 'First name is required' })} className="input-medical" placeholder="John" />
                  {errors.firstName && <p className="mt-1 text-xs text-red-600">{errors.firstName.message}</p>}
                </div>
                <div>
                  <label className="block text-sm font-semibold text-neutral mb-1">Last Name *</label>
                  <input type="text" {...register('lastName', { required: 'Last name is required' })} className="input-medical" placeholder="Smith" />
                  {errors.lastName && <p className="mt-1 text-xs text-red-600">{errors.lastName.message}</p>}
                </div>
                <div className={accountType === 'customer' ? '' : ''}>
                  <label className="block text-sm font-semibold text-neutral mb-1">Email Address *</label>
                  <input type="email" {...register('email', { required: 'Email is required', pattern: { value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i, message: 'Invalid email' } })} className="input-medical" placeholder="you@example.com" />
                  {errors.email && <p className="mt-1 text-xs text-red-600">{errors.email.message}</p>}
                </div>
                {accountType === 'customer' && (
                  <>
                    <div>
                      <label className="block text-sm font-semibold text-neutral mb-1">Company / Organization *</label>
                      <input type="text" {...register('company', { required: 'Company is required' })} className="input-medical" placeholder="City Hospital" />
                      {errors.company && <p className="mt-1 text-xs text-red-600">{errors.company.message}</p>}
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-neutral mb-1">Practice Type *</label>
                      <select {...register('practiceType', { required: 'Practice type is required' })} className="input-medical">
                        <option value="">Select practice type...</option>
                        <option value="urgent-care">Urgent Care</option>
                        <option value="physician-office">Physician Office</option>
                        <option value="home-health">Home Health Agency</option>
                        <option value="hospital">Hospital / Clinic</option>
                        <option value="long-term-care">Long-Term Care Facility</option>
                        <option value="other">Other</option>
                      </select>
                      {errors.practiceType && <p className="mt-1 text-xs text-red-600">{errors.practiceType.message}</p>}
                    </div>
                  </>
                )}
                {accountType === 'customer' && (
                  <>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-semibold text-neutral mb-1">Business Address *</label>
                      <input type="text" {...register('businessAddress', { required: 'Business address is required' })} className="input-medical" placeholder="123 Healthcare Ave" />
                      {errors.businessAddress && <p className="mt-1 text-xs text-red-600">{errors.businessAddress.message}</p>}
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-neutral mb-1">City *</label>
                      <input type="text" {...register('city', { required: 'City is required' })} className="input-medical" placeholder="Chicago" />
                      {errors.city && <p className="mt-1 text-xs text-red-600">{errors.city.message}</p>}
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-neutral mb-1">State *</label>
                      <input type="text" {...register('state', { required: 'State is required' })} className="input-medical" placeholder="IL" maxLength="2" />
                      {errors.state && <p className="mt-1 text-xs text-red-600">{errors.state.message}</p>}
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-neutral mb-1">ZIP Code *</label>
                      <input type="text" {...register('zipCode', { required: 'ZIP code is required' })} className="input-medical" placeholder="60007" />
                      {errors.zipCode && <p className="mt-1 text-xs text-red-600">{errors.zipCode.message}</p>}
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-neutral mb-1">Phone Number *</label>
                      <input type="tel" {...register('phone', { required: 'Phone is required' })} className="input-medical" placeholder="(555) 123-4567" />
                      {errors.phone && <p className="mt-1 text-xs text-red-600">{errors.phone.message}</p>}
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-neutral mb-1">
                        Tax ID / EIN{' '}
                        <span className="text-gray-500 font-normal">(optional)</span>
                      </label>
                      <input type="text" {...register('taxId')} className="input-medical" placeholder="12-3456789" />
                      <p className="mt-1 text-xs text-gray-500">Required for Net 30 payment terms</p>
                    </div>
                  </>
                )}
                {accountType === 'vendor' && (
                  <div>
                    <label className="block text-sm font-semibold text-neutral mb-1">Position / Title *</label>
                    <input type="text" {...register('position', { required: 'Position is required' })} className="input-medical" placeholder="Sales Manager" />
                    {errors.position && <p className="mt-1 text-xs text-red-600">{errors.position.message}</p>}
                  </div>
                )}
              </div>
            </div>

            {/* ── SHARED: Password ── */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-semibold text-neutral mb-1">Password *</label>
                <input type="password" {...register('password', { required: 'Password is required', minLength: { value: 8, message: 'Minimum 8 characters' } })} className="input-medical" placeholder="••••••••" />
                {errors.password && <p className="mt-1 text-xs text-red-600">{errors.password.message}</p>}
              </div>
              <div>
                <label className="block text-sm font-semibold text-neutral mb-1">Confirm Password *</label>
                <input type="password" {...register('confirmPassword', { required: 'Please confirm password', validate: v => v === password || 'Passwords do not match' })} className="input-medical" placeholder="••••••••" />
                {errors.confirmPassword && <p className="mt-1 text-xs text-red-600">{errors.confirmPassword.message}</p>}
              </div>
            </div>

            {/* ── Terms ── */}
            <div>
              <label className="flex items-start gap-2 cursor-pointer">
                <input type="checkbox" {...register('terms', { required: 'You must accept the terms' })} className="w-4 h-4 text-primary rounded mt-0.5" />
                <span className="text-sm text-gray-600">
                  I agree to the{' '}
                  <Link to="/terms-of-service" target="_blank" className="text-primary hover:underline">Terms of Service</Link>
                  {accountType === 'vendor' && (
                    <>
                      , <Link to="/vendor-agreement" target="_blank" className="text-primary hover:underline">Vendor Agreement</Link>, 
                      and <Link to="/commission-policy" target="_blank" className="text-primary hover:underline">Commission Policy</Link>
                    </>
                  )}
                  {accountType === 'customer' && (
                    <> and <Link to="/privacy-policy" target="_blank" className="text-primary hover:underline">Privacy Policy</Link></>
                  )}
                </span>
              </label>
              {errors.terms && <p className="mt-1 text-xs text-red-600">{errors.terms.message}</p>}
            </div>

            {/* ── Submit ── */}
            <button type="submit" disabled={loading || !!success} className="w-full btn-medical disabled:opacity-50 disabled:cursor-not-allowed">
              {loading
                ? <span className="flex items-center justify-center gap-2"><span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> Processing...</span>
                : accountType === 'customer' ? 'Create Account' : 'Submit Vendor Application'
              }
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-gray-600 text-sm">
              Already have an account?{' '}
              <Link to="/login" className="text-primary font-semibold hover:text-primary/80">Sign in here</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
