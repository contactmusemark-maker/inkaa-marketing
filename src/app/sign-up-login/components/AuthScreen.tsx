'use client';

import React, { useState } from 'react';
import LoginForm from './LoginForm';
import RegisterForm from './RegisterForm';
import AppLogo from '@/components/ui/AppLogo';
import Icon from '@/components/ui/AppIcon';

export default function AuthScreen({
  initialTab = 'login',
}: {
  initialTab?: 'login' | 'register';
}) {
  const [tab, setTab] = useState<'login' | 'register'>(initialTab);

  return (
    <div className="min-h-screen flex bg-background">
      {/* Left brand panel */}
      <div className="hidden lg:flex flex-col w-[45%] xl:w-[42%] bg-primary relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0">
          <div className="absolute top-0 right-0 w-80 h-80 rounded-full bg-white/5 -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-96 h-96 rounded-full bg-black/10 translate-y-1/3 -translate-x-1/3" />
          <div className="absolute top-1/2 left-1/2 w-64 h-64 rounded-full bg-white/5 -translate-x-1/2 -translate-y-1/2" />
        </div>

        <div className="relative z-10 flex flex-col h-full p-10">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <AppLogo src="/assets/images/app_logo_clean.png" size={36} />
            <span className="text-white font-extrabold text-xl tracking-tight">Inkaa.</span>
          </div>

          {/* Main copy */}
          <div className="flex-1 flex flex-col justify-center">
            <h1
              className="text-white font-extrabold leading-tight"
              style={{ fontSize: 'clamp(1.8rem, 3vw, 2.8rem)' }}
            >
              The complete platform for digital marketing agencies.
            </h1>
            <p className="text-red-100 mt-4 text-base leading-relaxed">
              Manage clients, projects, invoices, and your entire team — from one powerful dashboard
              built for Indian agencies.
            </p>

            {/* Feature list */}
            <div className="mt-8 space-y-3">
              {[
                { icon: 'UserGroupIcon', text: 'Client & CRM management' },
                { icon: 'DocumentTextIcon', text: 'Invoicing with Razorpay payments' },
                { icon: 'SparklesIcon', text: 'AI-powered proposal generator' },
                { icon: 'ChartBarIcon', text: 'Analytics & revenue insights' },
              ].map((feat) => (
                <div key={`feat-${feat.icon}`} className="flex items-center gap-3">
                  <div className="w-7 h-7 rounded-lg bg-white/20 flex items-center justify-center flex-shrink-0">
                    <Icon
                      name={feat.icon as Parameters<typeof Icon>[0]['name']}
                      size={14}
                      className="text-white"
                    />
                  </div>
                  <span className="text-red-50 text-sm">{feat.text}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white/10 rounded-2xl p-4 border border-white/20">
            <p className="text-red-50 text-sm leading-relaxed">
              Sign in with your real workspace account. Quick-login shortcuts are disabled for
              production.
            </p>
          </div>
        </div>
      </div>

      {/* Right form panel */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-12 overflow-y-auto">
        {/* Mobile logo */}
        <div className="flex lg:hidden items-center gap-2 mb-8">
          <AppLogo src="/assets/images/app_logo_clean.png" size={32} />
          <span className="font-extrabold text-xl text-foreground">Inkaa.</span>
        </div>

        <div className="w-full max-w-md">
          {/* Tab switcher */}
          <div className="flex items-center bg-muted rounded-xl p-1 mb-8">
            {(['login', 'register'] as const).map((t) => (
              <button
                key={`auth-tab-${t}`}
                onClick={() => setTab(t)}
                className={`flex-1 py-2.5 text-sm font-semibold rounded-lg transition-all duration-150 ${
                  tab === t
                    ? 'bg-card text-foreground shadow-card'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {t === 'login' ? 'Sign In' : 'Create Account'}
              </button>
            ))}
          </div>

          {tab === 'login' ? (
            <LoginForm onSwitchToRegister={() => setTab('register')} />
          ) : (
            <RegisterForm onSwitchToLogin={() => setTab('login')} />
          )}
        </div>
      </div>
    </div>
  );
}
