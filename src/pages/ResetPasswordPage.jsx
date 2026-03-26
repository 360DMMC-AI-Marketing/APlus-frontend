import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Lock, CheckCircle, AlertCircle } from 'lucide-react';
import { apiClient } from '../api/client';

const ResetPasswordPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token');

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (password.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);

    try {
      await apiClient.post('/auth/update-password', { token, newPassword: password });
      navigate('/login?reset=success');
    } catch (err) {
      setError(err?.data?.message || err.message || 'Failed to reset password. The link may have expired.');
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    return (
      <div className="min-h-[calc(100vh-4rem)] bg-white flex items-center justify-center px-4">
        <div className="max-w-md w-full">
          <div className="glass-card p-8 text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="w-8 h-8 text-red-600" />
            </div>
            <h2 className="text-2xl font-display text-secondary mb-3">Invalid Reset Link</h2>
            <p className="text-gray-600 mb-6">
              This password reset link is invalid or has expired.
            </p>
            <button
              onClick={() => navigate('/forgot-password')}
              className="btn-medical w-full"
            >
              Request New Link
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-white flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        <div className="glass-card p-8">
          <div className="w-16 h-16 bg-secondary/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <Lock className="w-8 h-8 text-secondary" />
          </div>
          
          <h1 className="font-display text-3xl text-secondary text-center mb-2">Reset Password</h1>
          <p className="text-gray-600 text-center mb-8">
            Enter your new password below
          </p>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-semibold text-secondary mb-2">New Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={8}
                className="input-medical"
                placeholder="••••••••"
              />
              <p className="mt-1 text-xs text-gray-500">Minimum 8 characters</p>
            </div>

            <div>
              <label className="block text-sm font-semibold text-secondary mb-2">Confirm Password</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                className="input-medical"
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-medical w-full disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Resetting...
                </>
              ) : (
                <>
                  <CheckCircle className="w-5 h-5" />
                  Reset Password
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ResetPasswordPage;
