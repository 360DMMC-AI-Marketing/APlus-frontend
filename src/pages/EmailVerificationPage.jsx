import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Mail, CheckCircle, XCircle, Loader } from 'lucide-react';

const EmailVerificationPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token');

  const [status, setStatus] = useState('verifying'); // 'verifying' | 'success' | 'error'
  const [canResend, setCanResend] = useState(false);
  const [countdown, setCountdown] = useState(60);

  useEffect(() => {
    if (token) {
      // Simulate verification API call
      setTimeout(() => {
        setStatus('success');
        setTimeout(() => navigate('/login'), 3000);
      }, 2000);
    } else {
      setStatus('error');
    }
  }, [token, navigate]);

  useEffect(() => {
    if (countdown > 0 && status === 'error') {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else if (countdown === 0) {
      setCanResend(true);
    }
  }, [countdown, status]);

  const handleResend = () => {
    setCanResend(false);
    setCountdown(60);
    // Simulate resend API call
    alert('Verification email sent! Check your inbox.');
  };

  if (status === 'verifying') {
    return (
      <div className="min-h-[calc(100vh-4rem)] bg-white flex items-center justify-center px-4">
        <div className="max-w-md w-full">
          <div className="glass-card p-8 text-center">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Loader className="w-8 h-8 text-blue-600 animate-spin" />
            </div>
            <h2 className="text-2xl font-display text-secondary mb-3">Verifying Email...</h2>
            <p className="text-gray-600">
              Please wait while we verify your email address.
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (status === 'success') {
    return (
      <div className="min-h-[calc(100vh-4rem)] bg-white flex items-center justify-center px-4">
        <div className="max-w-md w-full">
          <div className="glass-card p-8 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <h2 className="text-2xl font-display text-secondary mb-3">Email Verified!</h2>
            <p className="text-gray-600 mb-6">
              Your email has been successfully verified. You can now login to your account.
            </p>
            <p className="text-sm text-gray-500">
              Redirecting to login page...
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-white flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        <div className="glass-card p-8 text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <XCircle className="w-8 h-8 text-red-600" />
          </div>
          <h2 className="text-2xl font-display text-secondary mb-3">Verification Failed</h2>
          <p className="text-gray-600 mb-6">
            This verification link is invalid or has expired.
          </p>

          {canResend ? (
            <button onClick={handleResend} className="btn-medical w-full">
              Resend Verification Email
            </button>
          ) : (
            <button disabled className="btn-medical w-full opacity-50 cursor-not-allowed">
              Resend in {countdown}s
            </button>
          )}

          <button
            onClick={() => navigate('/login')}
            className="mt-3 w-full px-4 py-3 border-2 border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-semibold"
          >
            Back to Login
          </button>
        </div>
      </div>
    </div>
  );
};

export default EmailVerificationPage;
