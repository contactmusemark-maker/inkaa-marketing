'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import Icon from '@/components/ui/AppIcon';

interface LoginFormData {
  email: string;
  password: string;
  rememberMe: boolean;
}

interface LoginFormProps {
  onSwitchToRegister: () => void;
}

export default function LoginForm({ onSwitchToRegister }: LoginFormProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [authError, setAuthError] = useState('');
  const [authMessage, setAuthMessage] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    defaultValues: { email: '', password: '', rememberMe: false },
  });

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true);
    setAuthError('');
    setAuthMessage('');

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Invalid email or password');
      }

      window.location.href = '/';
    } catch (error) {
      setAuthError(error instanceof Error ? error.message : 'Unable to sign in');
      setIsLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    const email = document.querySelector<HTMLInputElement>('#login-email')?.value?.trim();
    setAuthError('');
    setAuthMessage('');

    if (!email) {
      setAuthError('Enter your email address first.');
      return;
    }

    setIsResetting(true);

    try {
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const result = await response.json();

      if (!response.ok) throw new Error(result.error || 'Unable to send reset link.');
      setAuthMessage(result.message || 'Password reset link sent.');
    } catch (error) {
      setAuthError(error instanceof Error ? error.message : 'Unable to send reset link.');
    } finally {
      setIsResetting(false);
    }
  };

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-foreground">Welcome back</h2>
        <p className="text-sm text-muted-foreground mt-1">Sign in to your Inkaa account</p>
      </div>

      {authError && (
        <div className="flex items-start gap-2.5 p-3.5 bg-red-50 border border-red-100 rounded-xl mb-5">
          <Icon
            name="ExclamationCircleIcon"
            size={16}
            className="text-red-500 flex-shrink-0 mt-0.5"
          />
          <p className="text-sm text-red-600">{authError}</p>
        </div>
      )}
      {authMessage && (
        <div className="flex items-start gap-2.5 p-3.5 bg-green-50 border border-green-100 rounded-xl mb-5">
          <Icon name="CheckCircleIcon" size={16} className="text-green-600 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-green-700">{authMessage}</p>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="label-text" htmlFor="login-email">
            Email Address
          </label>
          <input
            id="login-email"
            type="email"
            autoComplete="email"
            placeholder="you@agency.in"
            className="input-field"
            {...register('email', {
              required: 'Email is required',
              pattern: {
                value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                message: 'Enter a valid email address',
              },
            })}
          />
          {errors.email && <p className="error-text">{errors.email.message}</p>}
        </div>

        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="label-text mb-0" htmlFor="login-password">
              Password
            </label>
            <button
              type="button"
              onClick={handleForgotPassword}
              disabled={isResetting}
              className="text-xs text-primary font-medium hover:underline disabled:cursor-not-allowed disabled:text-muted-foreground"
            >
              {isResetting ? 'Sending...' : 'Forgot password?'}
            </button>
          </div>
          <div className="relative">
            <input
              id="login-password"
              type={showPassword ? 'text' : 'password'}
              autoComplete="current-password"
              placeholder="Enter your password"
              className="input-field pr-10"
              {...register('password', {
                required: 'Password is required',
                minLength: { value: 6, message: 'Password must be at least 6 characters' },
              })}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              <Icon name={showPassword ? 'EyeSlashIcon' : 'EyeIcon'} size={16} />
            </button>
          </div>
          {errors.password && <p className="error-text">{errors.password.message}</p>}
        </div>

        <div className="flex items-center gap-2">
          <input
            id="remember-me"
            type="checkbox"
            className="w-4 h-4 rounded border-border accent-primary cursor-pointer"
            {...register('rememberMe')}
          />
          <label
            htmlFor="remember-me"
            className="text-sm text-muted-foreground cursor-pointer select-none"
          >
            Keep me signed in for 30 days
          </label>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="btn-primary w-full py-3 text-sm justify-center"
        >
          {isLoading ? (
            <>
              <Icon name="ArrowPathIcon" size={16} className="animate-spin" />
              Signing in...
            </>
          ) : (
            <>
              <Icon name="ArrowRightOnRectangleIcon" size={16} />
              Sign In to Inkaa
            </>
          )}
        </button>
      </form>

      <p className="text-center text-sm text-muted-foreground mt-5">
        Don&apos;t have an account?{' '}
        <button onClick={onSwitchToRegister} className="text-primary font-semibold hover:underline">
          Create one free
        </button>
      </p>
    </div>
  );
}
