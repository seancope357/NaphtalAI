import { supabase } from '@/lib/supabaseClient';
import { NextResponse } from 'next/server';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: Request) {
  const { feedback } = await req.json();

  if (!feedback) {
    return new NextResponse('Feedback is required', { status: 400 });
  }

  const { data, error } = await supabase
    .from('feedback')
    .insert([{ feedback }])
    .select();

  if (error) {
    console.error('Error inserting feedback:', error);
    return new NextResponse('Error inserting feedback', { status: 500 });
  }

  try {
    await resend.emails.send({
      from: 'onboarding@resend.dev',
      to: 'seancope357@gmail.com',
      subject: 'New Feedback from NaphtalAI',
      html: `<p>A user has submitted the following feedback:</p><p>${feedback}</p>`,
    });
  } catch (emailError) {
    console.error('Error sending email:', emailError);
    // Don't block the response for the user if the email fails
  }

  return NextResponse.json(data);
}
