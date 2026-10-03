import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { CheckCircle, AlertCircle, ArrowLeft } from 'lucide-react';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { authService } from '../services/authService';

export const ResetPasswordPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const token = searchParams.get('token') || '';
  const email = searchParams.get('email') || '';

  const [password, setPassword] = useState('');
  const [passwordConfirmation, setPasswordConfirmation] = useState('');
  const [isValidating, setIsValidating] = useState(true);
  const [isValid, setIsValid] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [validationError, setValidationError] = useState('');

  useEffect(() => {
    const validate = async () => {
      if (!token || !email) {
        setValidationError('Invalid reset link');
        setIsValidating(false);
        return;
      }

      try {
        const res = await authService.validateResetPassword(token, email);
        if (res.valid) {
          setIsValid(true);
        } else {
          setValidationError('This reset link is invalid or has expired');
        }
      } catch (err) {
        setValidationError('This reset link is invalid or has expired');
      } finally {
        setIsValidating(false);
      }
    };

    validate();
  }, [token, email]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      await authService.resetPassword({
        token,
        email,
        password,
        password_confirmation: passwordConfirmation,
      });
      setSuccess(true);
      setTimeout(() => {
        navigate('/login', { state: { successMessage: 'Password reset successfully' } });
      }, 1500);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to reset password');
    } finally {
      setIsLoading(false);
    }
  };

  if (isValidating) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white flex items-center justify-center">
        <div className="text-sm text-slate-500">Validating reset link...</div>
      </div>
    );
  }

  if (!isValid || validationError) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
        <div className="max-w-md mx-auto px-6 py-12">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="p-8">
              <div className="mb-6">
                <h1 className="text-2xl font-semibold text-slate-900 tracking-tight">Reset Password</h1>
              </div>

              <div className="mb-6 p-4 bg-rose-50 border border-rose-200 rounded-xl text-sm text-rose-800 flex items-start space-x-3">
                <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium">{validationError}</p>
                </div>
              </div>

              <Link
                to="/forgot-password"
                className="inline-flex items-center text-xs text-slate-600 hover:text-indigo-600 font-medium transition-colors"
              >
                <ArrowLeft className="w-3.5 h-3.5 mr-1" />
                Request New Reset Link
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <div className="max-w-md mx-auto px-6 py-12">
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="p-8">
            <div className="mb-6">
              <h1 className="text-2xl font-semibold text-slate-900 tracking-tight">Reset Password</h1>
              <p className="mt-2 text-sm text-slate-500">
                Enter your new password below.
              </p>
            </div>

            {success ? (
              <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-sm text-emerald-800 flex items-start space-x-3">
                <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium">Password reset successfully</p>
                  <p className="mt-1 text-emerald-700">Redirecting to login...</p>
                </div>
              </div>
            ) : (
              <>
                {error && (
                  <div className="mb-6 p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 flex items-start space-x-2.5">
                    <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                    <span className="font-medium leading-relaxed">{error}</span>
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                  <Input
                    label="New Password"
                    type="password"
                    required
                    minLength={8}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    autoComplete="new-password"
                  />

                  <Input
                    label="Confirm New Password"
                    type="password"
                    required
                    minLength={8}
                    value={passwordConfirmation}
                    onChange={(e) => setPasswordConfirmation(e.target.value)}
                    placeholder="••••••••"
                    autoComplete="new-password"
                  />

                  <div className="pt-2">
                    <Button
                      type="submit"
                      variant="primary"
                      size="lg"
                      className="w-full justify-center shadow-xs bg-slate-900 hover:bg-slate-800 text-white"
                      isLoading={isLoading}
                    >
                      Reset Password
                    </Button>
                  </div>
                </form>
              </>
            )}

            <div className="mt-6 pt-6 border-t border-slate-100">
              <Link
                to="/login"
                className="inline-flex items-center text-xs text-slate-600 hover:text-indigo-600 font-medium transition-colors"
              >
                <ArrowLeft className="w-3.5 h-3.5 mr-1" />
                Back to Login
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
