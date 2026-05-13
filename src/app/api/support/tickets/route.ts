import { NextResponse, type NextRequest } from 'next/server';
import { isFeedbackCategory, isTicketPriority } from '@/lib/support';
import { uploadSupportScreenshot } from '@/lib/supportUpload';
import { getAuthToken, getCurrentUser, supabaseAdminFetch } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  const token = getAuthToken(request);
  if (!token) return NextResponse.json({ error: 'Not authenticated.' }, { status: 401 });

  try {
    const user = await getCurrentUser(token);
    const form = await request.formData();
    const name = String(form.get('name') || '').trim();
    const email = String(form.get('email') || user.email || '').trim();
    const category = String(form.get('category') || 'Bug Report');
    const priority = String(form.get('priority') || 'Medium');
    const subject = String(form.get('subject') || '').trim();
    const message = String(form.get('message') || '').trim();
    const pageUrl = String(form.get('pageUrl') || '').trim();
    const browserInfo = String(form.get('browserInfo') || '').trim();
    const deviceInfo = String(form.get('deviceInfo') || '').trim();
    const screenshotEntry = form.get('screenshot');
    const screenshot = screenshotEntry instanceof File ? screenshotEntry : null;

    if (!subject || !message) {
      return NextResponse.json(
        { error: 'Subject and issue details are required.' },
        { status: 400 }
      );
    }
    if (!isFeedbackCategory(category) || !isTicketPriority(priority)) {
      return NextResponse.json({ error: 'Invalid ticket category or priority.' }, { status: 400 });
    }

    const screenshotPath = await uploadSupportScreenshot(user.id, screenshot).catch(() => null);

    await supabaseAdminFetch('/rest/v1/support_tickets', {
      method: 'POST',
      body: JSON.stringify({
        user_id: user.id,
        name,
        email,
        category,
        priority,
        subject,
        message,
        status: 'Open',
        page_url: pageUrl,
        browser_info: browserInfo,
        device_info: deviceInfo,
        screenshot_path: screenshotPath,
      }),
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unable to create support ticket.' },
      { status: 500 }
    );
  }
}
