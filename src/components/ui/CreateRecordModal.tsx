'use client';

import React, { useState } from 'react';
import Icon from '@/components/ui/AppIcon';

export type CreateField = {
  name: string;
  label: string;
  type?: 'text' | 'number' | 'date' | 'email' | 'select';
  required?: boolean;
  options?: string[];
  placeholder?: string;
};

interface CreateRecordModalProps {
  title: string;
  fields: CreateField[];
  submitLabel: string;
  onClose: () => void;
  onSubmit: (values: Record<string, string>) => void;
}

export default function CreateRecordModal({
  title,
  fields,
  submitLabel,
  onClose,
  onSubmit,
}: CreateRecordModalProps) {
  const initialValues = Object.fromEntries(
    fields.map((field) => [field.name, field.options?.[0] ?? ''])
  );
  const [values, setValues] = useState<Record<string, string>>(initialValues);
  const [error, setError] = useState('');

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const missing = fields.find((field) => field.required && !values[field.name]?.trim());

    if (missing) {
      setError(`${missing.label} is required.`);
      return;
    }

    onSubmit(values);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in">
      <button
        type="button"
        className="absolute inset-0 bg-black/30 backdrop-blur-sm"
        aria-label="Close modal"
        onClick={onClose}
      />
      <form
        onSubmit={handleSubmit}
        className="relative w-full max-w-lg overflow-hidden rounded-2xl border border-border bg-card shadow-modal animate-scale-in"
      >
        <div className="flex items-center justify-between border-b border-border px-6 py-4">
          <h2 className="text-lg font-bold text-foreground">{title}</h2>
          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-xl hover:bg-muted"
            aria-label="Close modal"
          >
            <Icon name="XMarkIcon" size={18} className="text-muted-foreground" />
          </button>
        </div>

        <div className="space-y-4 px-6 py-5">
          {error && (
            <div className="rounded-xl border border-red-100 bg-red-50 px-3 py-2 text-sm text-red-600">
              {error}
            </div>
          )}

          {fields.map((field) => (
            <div key={field.name}>
              <label htmlFor={field.name} className="label-text">
                {field.label}
              </label>
              {field.type === 'select' ? (
                <select
                  id={field.name}
                  value={values[field.name] ?? ''}
                  onChange={(event) =>
                    setValues((current) => ({ ...current, [field.name]: event.target.value }))
                  }
                  className="input-field"
                >
                  {field.options?.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              ) : (
                <input
                  id={field.name}
                  type={field.type ?? 'text'}
                  value={values[field.name] ?? ''}
                  onChange={(event) =>
                    setValues((current) => ({ ...current, [field.name]: event.target.value }))
                  }
                  placeholder={field.placeholder}
                  className="input-field"
                />
              )}
            </div>
          ))}
        </div>

        <div className="flex items-center justify-end gap-3 border-t border-border px-6 py-4">
          <button type="button" onClick={onClose} className="btn-secondary">
            Cancel
          </button>
          <button type="submit" className="btn-primary">
            <Icon name="PlusIcon" size={15} />
            {submitLabel}
          </button>
        </div>
      </form>
    </div>
  );
}
