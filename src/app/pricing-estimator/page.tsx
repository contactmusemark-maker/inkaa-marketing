'use client';

import AppLayout from '@/components/AppLayout';
import UnavailableAction from '@/components/ui/UnavailableAction';
import { CalculatorIcon } from '@heroicons/react/24/outline';
import { useState } from 'react';

interface Service {
  id: string;
  label: string;
  basePrice: number;
  selected: boolean;
}

const initialServices: Service[] = [
  { id: 'seo', label: 'SEO Optimization', basePrice: 15000, selected: false },
  { id: 'meta', label: 'Meta Ads Management', basePrice: 20000, selected: false },
  { id: 'google', label: 'Google Ads Management', basePrice: 18000, selected: false },
  { id: 'branding', label: 'Branding & Identity', basePrice: 35000, selected: false },
  { id: 'website', label: 'Website Design', basePrice: 50000, selected: false },
  { id: 'ecommerce', label: 'E-commerce Development', basePrice: 80000, selected: false },
  { id: 'social', label: 'Social Media Management', basePrice: 12000, selected: false },
  { id: 'content', label: 'Content Marketing', basePrice: 10000, selected: false },
];

export default function PricingEstimatorPage() {
  const [services, setServices] = useState<Service[]>(initialServices);
  const [discount, setDiscount] = useState(0);

  const toggle = (id: string) => {
    setServices((prev) => prev.map((s) => (s.id === id ? { ...s, selected: !s.selected } : s)));
  };

  const subtotal = services.filter((s) => s.selected).reduce((sum, s) => sum + s.basePrice, 0);
  const discountAmt = (subtotal * discount) / 100;
  const gst = ((subtotal - discountAmt) * 18) / 100;
  const total = subtotal - discountAmt + gst;

  return (
    <AppLayout>
      <div className="p-6 space-y-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center">
            <CalculatorIcon className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Pricing Estimator</h1>
            <p className="text-sm text-muted-foreground">Build a custom service quote</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-card border border-border rounded-2xl p-6 shadow-sm space-y-3">
            <h2 className="text-base font-semibold text-foreground mb-4">Select Services</h2>
            {services.map((service) => (
              <label
                key={service.id}
                className={`flex items-center justify-between p-4 rounded-xl border cursor-pointer transition-all ${service.selected ? 'border-primary bg-red-50' : 'border-border hover:bg-muted/30'}`}
              >
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={service.selected}
                    onChange={() => toggle(service.id)}
                    className="accent-primary w-4 h-4"
                  />
                  <span className="text-sm font-medium text-foreground">{service.label}</span>
                </div>
                <span className="text-sm font-semibold text-primary">
                  ₹{service.basePrice.toLocaleString('en-IN')}/mo
                </span>
              </label>
            ))}
          </div>

          <div className="bg-card border border-border rounded-2xl p-6 shadow-sm h-fit space-y-4">
            <h2 className="text-base font-semibold text-foreground">Quote Summary</h2>
            <div>
              <label className="text-xs text-muted-foreground">Discount (%)</label>
              <input
                type="number"
                min={0}
                max={50}
                value={discount}
                onChange={(e) => setDiscount(Number(e.target.value))}
                className="mt-1 w-full border border-border rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between text-muted-foreground">
                <span>Subtotal</span>
                <span>₹{subtotal.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between text-muted-foreground">
                <span>Discount ({discount}%)</span>
                <span>-₹{discountAmt.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between text-muted-foreground">
                <span>GST (18%)</span>
                <span>₹{Math.round(gst).toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between font-bold text-foreground text-base border-t border-border pt-2 mt-2">
                <span>Total</span>
                <span className="text-primary">₹{Math.round(total).toLocaleString('en-IN')}</span>
              </div>
            </div>
            <UnavailableAction
              fullWidth
              className="border-0 bg-primary py-2.5 text-white opacity-60"
            >
              Save as Quotation
            </UnavailableAction>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
