'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import Icon from '@/components/ui/AppIcon';

interface RegisterFormData {
  agencyName: string;
  fullName: string;
  email: string;
  phone: string;
  password: string;
  confirmPassword: string;
  agreeTerms: boolean;
}

interface RegisterFormProps {
  onSwitchToLogin: () => void;
}

export default function RegisterForm({ onSwitchToLogin }: RegisterFormProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [authError, setAuthError] = useState('');

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<RegisterFormData>();
  const passwordValue = watch('password', '');

  const onSubmit = async (data: RegisterFormData) => {
    setIsLoading(true);
    setAuthError('');
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Unable to create account');
      }

      window.location.href = result.requiresEmailConfirmation ? '/sign-up-login' : '/plans';
    } catch (error) {
      setAuthError(error instanceof Error ? error.message : 'Unable to create account');
      setIsLoading(false);
    }
  };

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-foreground">Start free trial</h2>
        <p className="text-sm text-muted-foreground mt-1">14 days free, no credit card required</p>
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

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="label-text" htmlFor="reg-agency">
              Agency Name
            </label>
            <input
              id="reg-agency"
              type="text"
              placeholder="Your Agency"
              className="input-field"
              {...register('agencyName', { required: 'Agency name is required' })}
            />
            {errors.agencyName && <p className="error-text">{errors.agencyName.message}</p>}
          </div>
          <div>
            <label className="label-text" htmlFor="reg-name">
              Your Name
            </label>
            <input
              id="reg-name"
              type="text"
              placeholder="Full name"
              className="input-field"
              {...register('fullName', { required: 'Name is required' })}
            />
            {errors.fullName && <p className="error-text">{errors.fullName.message}</p>}
          </div>
        </div>

        <div>
          <label className="label-text" htmlFor="reg-email">
            Work Email
          </label>
          <input
            id="reg-email"
            type="email"
            placeholder="you@youragency.in"
            className="input-field"
            {...register('email', {
              required: 'Email is required',
              pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: 'Enter a valid email' },
            })}
          />
          {errors.email && <p className="error-text">{errors.email.message}</p>}
        </div>

        <div>
          <label className="label-text" htmlFor="reg-phone">
            Phone Number
          </label>
          <input
            id="reg-phone"
            type="tel"
            placeholder="+91 98765 43210"
            className="input-field"
            {...register('phone', { required: 'Phone number is required' })}
          />
          {errors.phone && <p className="error-text">{errors.phone.message}</p>}
        </div>

        <div>
          <label className="label-text" htmlFor="reg-password">
            Password
          </label>
          <p className="helper-text -mt-1 mb-1.5">Min 8 characters, 1 uppercase, 1 number</p>
          <div className="relative">
            <input
              id="reg-password"
              type={showPassword ? 'text' : 'password'}
              placeholder="Create a strong password"
              className="input-field pr-10"
              {...register('password', {
                required: 'Password is required',
                minLength: { value: 8, message: 'Minimum 8 characters' },
                pattern: {
                  value: /^(?=.*[A-Z])(?=.*\d)/,
                  message: 'Must include uppercase and number',
                },
              })}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              aria-label="Toggle password visibility"
            >
              <Icon name={showPassword ? 'EyeSlashIcon' : 'EyeIcon'} size={16} />
            </button>
          </div>
          {errors.password && <p className="error-text">{errors.password.message}</p>}
        </div>

        <div>
          <label className="label-text" htmlFor="reg-confirm">
            Confirm Password
          </label>
          <div className="relative">
            <input
              id="reg-confirm"
              type={showConfirm ? 'text' : 'password'}
              placeholder="Repeat your password"
              className="input-field pr-10"
              {...register('confirmPassword', {
                required: 'Please confirm your password',
                validate: (val) => val === passwordValue || 'Passwords do not match',
              })}
            />
            <button
              type="button"
              onClick={() => setShowConfirm(!showConfirm)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              aria-label="Toggle confirm password visibility"
            >
              <Icon name={showConfirm ? 'EyeSlashIcon' : 'EyeIcon'} size={16} />
            </button>
          </div>
          {errors.confirmPassword && <p className="error-text">{errors.confirmPassword.message}</p>}
        </div>

        <div className="flex items-start gap-2.5">
          <input
            id="agree-terms"
            type="checkbox"
            className="w-4 h-4 mt-0.5 rounded border-border accent-primary cursor-pointer flex-shrink-0"
            {...register('agreeTerms', { required: 'You must agree to the terms' })}
          />
          <label htmlFor="agree-terms" className="text-sm text-muted-foreground cursor-pointer">
            I agree to Inkaa&apos;s{' '}
            <span className="text-primary font-medium hover:underline cursor-pointer">
              Terms of Service
            </span>{' '}
            and{' '}
            <span className="text-primary font-medium hover:underline cursor-pointer">
              Privacy Policy
            </span>
          </label>
        </div>
        {errors.agreeTerms && <p className="error-text -mt-2">{errors.agreeTerms.message}</p>}

        <button
          type="submit"
          disabled={isLoading}
          className="btn-primary w-full py-3 text-sm justify-center"
        >
          {isLoading ? (
            <>
              <Icon name="ArrowPathIcon" size={16} className="animate-spin" />
              Creating account...
            </>
          ) : (
            <>
              <Icon name="RocketLaunchIcon" size={16} />
              Start Free Trial
            </>
          )}
        </button>
      </form>

      <p className="text-center text-sm text-muted-foreground mt-5">
        Already have an account?{' '}
        <button onClick={onSwitchToLogin} className="text-primary font-semibold hover:underline">
          Sign in
        </button>
      </p>
    </div>
  );
}
