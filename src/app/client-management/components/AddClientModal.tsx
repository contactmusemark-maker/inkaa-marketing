'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import Icon from '@/components/ui/AppIcon';
import type { Client } from './ClientManagementScreen';

interface AddClientFormData {
  company: string;
  name: string;
  email: string;
  phone: string;
  industry: string;
  city: string;
  manager: string;
  plan: Client['plan'];
  status: Client['status'];
  website: string;
  gst: string;
  notes: string;
}

interface AddClientModalProps {
  onClose: () => void;
  onAdd: (client: Client) => void;
}

const industries = [
  'E-commerce',
  'SaaS',
  'Healthcare',
  'Fintech',
  'Media',
  'FMCG',
  'IT Services',
  'Retail',
  'Fashion',
  'Automotive',
  'EdTech',
  'Real Estate',
  'Education',
  'Other',
];
const managers = ['Unassigned'];
const plans: Client['plan'][] = ['Starter', 'Pro', 'Agency'];
const statuses: Client['status'][] = ['Active', 'Inactive', 'Trial', 'Churned'];

const steps = ['Basic Info', 'Contact Details', 'Business Info'];

export default function AddClientModal({ onClose, onAdd }: AddClientModalProps) {
  const [step, setStep] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [formError, setFormError] = useState('');

  const {
    register,
    handleSubmit,
    trigger,
    formState: { errors },
  } = useForm<AddClientFormData>({
    defaultValues: {
      status: 'Active',
      plan: 'Starter',
      manager: 'Unassigned',
      industry: 'E-commerce',
    },
  });

  const stepFields: (keyof AddClientFormData)[][] = [
    ['company', 'name', 'email'],
    ['phone', 'city', 'website'],
    ['industry', 'manager', 'plan', 'status', 'gst', 'notes'],
  ];

  const handleNext = async () => {
    const valid = await trigger(stepFields[step]);
    if (valid) setStep((s) => s + 1);
  };

  const onSubmit = async (data: AddClientFormData) => {
    setIsLoading(true);
    setFormError('');

    try {
      const response = await fetch('/api/clients', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          company: data.company,
          name: data.name,
          email: data.email,
          phone: data.phone,
          industry: data.industry,
          city: data.city,
          manager: data.manager,
          status: data.status,
          plan: data.plan,
          tags: [],
        }),
      });
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Unable to add client');
      }

      onAdd(result.client);
    } catch (error) {
      setFormError(error instanceof Error ? error.message : 'Unable to add client');
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in">
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-card rounded-2xl border border-border shadow-modal w-full max-w-lg animate-scale-in overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <div>
            <h2 className="text-lg font-bold text-foreground">Add New Client</h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              Step {step + 1} of {steps.length} — {steps[step]}
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-xl hover:bg-muted transition-colors"
            aria-label="Close modal"
          >
            <Icon name="XMarkIcon" size={18} className="text-muted-foreground" />
          </button>
        </div>

        {/* Step progress */}
        <div className="px-6 pt-4">
          <div className="flex items-center gap-2">
            {steps.map((s, i) => (
              <React.Fragment key={`step-indicator-${i}`}>
                <div className="flex items-center gap-2">
                  <div
                    className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-200 ${
                      i < step
                        ? 'bg-primary text-white'
                        : i === step
                          ? 'bg-primary text-white ring-4 ring-primary/20'
                          : 'bg-muted text-muted-foreground'
                    }`}
                  >
                    {i < step ? <Icon name="CheckIcon" size={12} /> : i + 1}
                  </div>
                  <span
                    className={`text-xs font-medium hidden sm:block ${i === step ? 'text-foreground' : 'text-muted-foreground'}`}
                  >
                    {s}
                  </span>
                </div>
                {i < steps.length - 1 && (
                  <div
                    className={`flex-1 h-0.5 rounded-full transition-all duration-300 ${i < step ? 'bg-primary' : 'bg-border'}`}
                  />
                )}
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)}>
          {formError && (
            <div className="mx-6 mt-4 flex items-start gap-2.5 rounded-xl border border-red-100 bg-red-50 p-3">
              <Icon
                name="ExclamationCircleIcon"
                size={16}
                className="text-red-500 flex-shrink-0 mt-0.5"
              />
              <p className="text-sm text-red-600">{formError}</p>
            </div>
          )}
          <div className="px-6 py-5 space-y-4 min-h-[280px]">
            {/* Step 0: Basic Info */}
            {step === 0 && (
              <>
                <div>
                  <label className="label-text" htmlFor="add-company">
                    Company Name
                  </label>
                  <input
                    id="add-company"
                    type="text"
                    placeholder="Company name"
                    className="input-field"
                    {...register('company', { required: 'Company name is required' })}
                  />
                  {errors.company && <p className="error-text">{errors.company.message}</p>}
                </div>
                <div>
                  <label className="label-text" htmlFor="add-name">
                    Contact Person
                  </label>
                  <input
                    id="add-name"
                    type="text"
                    placeholder="Full name of primary contact"
                    className="input-field"
                    {...register('name', { required: 'Contact name is required' })}
                  />
                  {errors.name && <p className="error-text">{errors.name.message}</p>}
                </div>
                <div>
                  <label className="label-text" htmlFor="add-email">
                    Email Address
                  </label>
                  <input
                    id="add-email"
                    type="email"
                    placeholder="contact@company.in"
                    className="input-field"
                    {...register('email', {
                      required: 'Email is required',
                      pattern: {
                        value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                        message: 'Enter a valid email',
                      },
                    })}
                  />
                  {errors.email && <p className="error-text">{errors.email.message}</p>}
                </div>
              </>
            )}

            {/* Step 1: Contact Details */}
            {step === 1 && (
              <>
                <div>
                  <label className="label-text" htmlFor="add-phone">
                    Phone Number
                  </label>
                  <input
                    id="add-phone"
                    type="tel"
                    placeholder="+91 98765 43210"
                    className="input-field"
                    {...register('phone', { required: 'Phone is required' })}
                  />
                  {errors.phone && <p className="error-text">{errors.phone.message}</p>}
                </div>
                <div>
                  <label className="label-text" htmlFor="add-city">
                    City
                  </label>
                  <input
                    id="add-city"
                    type="text"
                    placeholder="e.g. Mumbai, Bengaluru"
                    className="input-field"
                    {...register('city', { required: 'City is required' })}
                  />
                  {errors.city && <p className="error-text">{errors.city.message}</p>}
                </div>
                <div>
                  <label className="label-text" htmlFor="add-website">
                    Website
                  </label>
                  <p className="helper-text -mt-1 mb-1.5">Optional — client&apos;s website URL</p>
                  <input
                    id="add-website"
                    type="url"
                    placeholder="https://www.company.in"
                    className="input-field"
                    {...register('website')}
                  />
                </div>
              </>
            )}

            {/* Step 2: Business Info */}
            {step === 2 && (
              <>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="label-text" htmlFor="add-industry">
                      Industry
                    </label>
                    <select
                      id="add-industry"
                      className="input-field"
                      {...register('industry', { required: true })}
                    >
                      {industries.map((ind) => (
                        <option
                          key={`add-ind-${ind.toLowerCase().replace(/\s+/g, '-')}`}
                          value={ind}
                        >
                          {ind}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="label-text" htmlFor="add-manager">
                      Assigned Manager
                    </label>
                    <select
                      id="add-manager"
                      className="input-field"
                      {...register('manager', { required: true })}
                    >
                      {managers.map((m) => (
                        <option key={`add-mgr-${m.toLowerCase().replace(/\s+/g, '-')}`} value={m}>
                          {m}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="label-text" htmlFor="add-plan">
                      Plan
                    </label>
                    <select id="add-plan" className="input-field" {...register('plan')}>
                      {plans.map((p) => (
                        <option key={`add-plan-${p.toLowerCase()}`} value={p}>
                          {p}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="label-text" htmlFor="add-status">
                      Status
                    </label>
                    <select id="add-status" className="input-field" {...register('status')}>
                      {statuses.map((s) => (
                        <option key={`add-status-${s.toLowerCase()}`} value={s}>
                          {s}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                <div>
                  <label className="label-text" htmlFor="add-gst">
                    GST Number
                  </label>
                  <p className="helper-text -mt-1 mb-1.5">Optional — required for GST invoicing</p>
                  <input
                    id="add-gst"
                    type="text"
                    placeholder="27AABCU9603R1ZX"
                    className="input-field uppercase"
                    {...register('gst')}
                  />
                </div>
                <div>
                  <label className="label-text" htmlFor="add-notes">
                    Notes
                  </label>
                  <textarea
                    id="add-notes"
                    rows={3}
                    placeholder="Any additional notes about this client..."
                    className="input-field resize-none"
                    {...register('notes')}
                  />
                </div>
              </>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between px-6 py-4 border-t border-border bg-muted/20">
            <button
              type="button"
              onClick={step === 0 ? onClose : () => setStep((s) => s - 1)}
              className="btn-secondary"
            >
              {step === 0 ? (
                'Cancel'
              ) : (
                <>
                  <Icon name="ChevronLeftIcon" size={14} />
                  Back
                </>
              )}
            </button>

            {step < steps.length - 1 ? (
              <button type="button" onClick={handleNext} className="btn-primary">
                Next
                <Icon name="ChevronRightIcon" size={14} />
              </button>
            ) : (
              <button type="submit" disabled={isLoading} className="btn-primary">
                {isLoading ? (
                  <>
                    <Icon name="ArrowPathIcon" size={14} className="animate-spin" />
                    Adding Client...
                  </>
                ) : (
                  <>
                    <Icon name="UserPlusIcon" size={14} />
                    Add Client
                  </>
                )}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
