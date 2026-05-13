export const SUPPORT_EMAIL = 'marketing@inkaastudio.com';
export const SUPPORT_WHATSAPP_NUMBER =
  process.env.NEXT_PUBLIC_SUPPORT_WHATSAPP_NUMBER || '91YOUR_NUMBER';
export const SUPPORT_WHATSAPP_MESSAGE = 'Hi Inkaa Team, I need help with the platform.';

export const feedbackCategories = [
  'Feature Request',
  'Bug Report',
  'Billing Issue',
  'AI Issue',
  'UI/UX Feedback',
  'General Feedback',
] as const;

export const ticketPriorities = ['Low', 'Medium', 'High', 'Urgent'] as const;
export const ticketStatuses = ['Open', 'In Progress', 'Resolved', 'Closed'] as const;

export type FeedbackCategory = (typeof feedbackCategories)[number];
export type TicketPriority = (typeof ticketPriorities)[number];
export type TicketStatus = (typeof ticketStatuses)[number];

export function getWhatsAppSupportUrl() {
  return `https://wa.me/${SUPPORT_WHATSAPP_NUMBER}?text=${encodeURIComponent(SUPPORT_WHATSAPP_MESSAGE)}`;
}

export function isFeedbackCategory(value: unknown): value is FeedbackCategory {
  return typeof value === 'string' && feedbackCategories.includes(value as FeedbackCategory);
}

export function isTicketPriority(value: unknown): value is TicketPriority {
  return typeof value === 'string' && ticketPriorities.includes(value as TicketPriority);
}

export function isTicketStatus(value: unknown): value is TicketStatus {
  return typeof value === 'string' && ticketStatuses.includes(value as TicketStatus);
}
