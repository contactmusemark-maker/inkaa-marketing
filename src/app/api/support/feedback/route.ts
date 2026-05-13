import { NextResponse, type NextRequest } from 'next/server';
import { isFeedbackCategory } from '@/lib/support';
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
    const category = String(form.get('category') || '');
    const message = String(form.get('message') || '').trim();
    const screenshotEntry = form.get('screenshot');
    const screenshot = screenshotEntry instanceof File ? screenshotEntry : null;

    if (!name || !email || !message) {
      return NextResponse.json(
        { error: 'Name, email, and message are required.' },
        { status: 400 }
      );
    }
    if (!isFeedbackCategory(category)) {
      return NextResponse.json(
        { error: 'A valid feedback category is required.' },
        { status: 400 }
      );
    }

    const screenshotPath = await uploadSupportScreenshot(user.id, screenshot).catch(() => null);

    await supabaseAdminFetch('/rest/v1/feedback_submissions', {
      method: 'POST',
      body: JSON.stringify({
        user_id: user.id,
        name,
        email,
        category,
        message,
        screenshot_path: screenshotPath,
      }),
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unable to send feedback.' },
      { status: 500 }
    );
  }
}
