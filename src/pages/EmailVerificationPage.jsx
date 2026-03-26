import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Mail, CheckCircle, XCircle } from 'lucide-react';
import { apiClient } from '../api/client';

const EmailVerificationPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const email = searchParams.get('email') || '';

  const [code, setCode] = useState(['', '', '', '', '', '']);
  const [status, setStatus] = useState('input'); // 'input' | 'verifying' | 'success' | 'error'
  const [error, setError] = useState('');
  const [canResend, setCanResend] = useState(false);
  const [countdown, setCountdown] = useState(60);
  const inputRefs = useRef([]);

  useEffect(() => {
    if (countdown > 0 && !canResend) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else if (countdown === 0) {
      setCanResend(true);
    }
  }, [countdown, canResend]);

  const handleChange = (index, value) => {
    if (value && !/^\d$/.test(value)) return;
    const newCode = [...code];
    newCode[index] = value;
    setCode(newCode);
    setError('');

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    // Auto-submit when all 6 digits entered
    if (value && index === 5 && newCode.every(d => d !== '')) {
      handleVerify(newCode.join(''));
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (pasted.length === 6) {
      const newCode = pasted.split('');
      setCode(newCode);
      inputRefs.current[5]?.focus();
      handleVerify(pasted);
    }
  };

  const handleVerify = async (codeStr) => {
    setStatus('verifying');
    setError('');
    try {
      await apiClient.post('/auth/verify-email', { code: codeStr });
      setStatus('success');
      setTimeout(() => navigate('/login'), 3000);
    } catch (err) {
      setStatus('input');
      setError(err?.data?.error?.message || err?.data?.message || err.message || 'Invalid verification code');
      setCode(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
    }
  };

  const handleResend = async () => {
    setCanResend(false);
    setCountdown(60);
    try {
      if (email) {
        await apiClient.post('/auth/resend-verification', { email });
      }
      setError('');
      alert('New verification code sent! Check your inbox.');
    } catch {
      alert('Failed to resend. Please try again later.');
    }
  };

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
            <p className="text-sm text-gray-500">Redirecting to login page...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-white flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        <div className="glass-card p-8 text-center">
          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <Mail className="w-8 h-8 text-primary" />
          </div>

          <h2 className="text-2xl font-display text-secondary mb-3">Verify Your Email</h2>
          <p className="text-gray-600 mb-2">
            We sent a 6-digit verification code to
          </p>
          {email && <p className="font-semibold text-secondary mb-6">{email}</p>}

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600 flex items-center gap-2 justify-center">
              <XCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="flex justify-center gap-2 mb-6" onPaste={handlePaste}>
            {code.map((digit, i) => (
              <input
                key={i}
                ref={(el) => (inputRefs.current[i] = el)}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={(e) => handleChange(i, e.target.value)}
                onKeyDown={(e) => handleKeyDown(i, e)}
                disabled={status === 'verifying'}
                className="w-12 h-14 text-center text-2xl font-bold border-2 border-gray-200 rounded-lg focus:border-primary focus:outline-none transition-colors disabled:opacity-50"
                autoFocus={i === 0}
              />
            ))}
          </div>

          <button
            onClick={() => handleVerify(code.join(''))}
            disabled={status === 'verifying' || code.some(d => d === '')}
            className="btn-medical w-full mb-4 disabled:opacity-50"
          >
            {status === 'verifying' ? 'Verifying...' : 'Verify Email'}
          </button>

          <p className="text-sm text-gray-500 mb-2">
            Didn't receive the code?{' '}
            {canResend ? (
              <button onClick={handleResend} className="text-primary hover:underline font-semibold">
                Resend Code
              </button>
            ) : (
              <span className="text-gray-400">Resend in {countdown}s</span>
            )}
          </p>

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
