'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

export async function loginAction(prevState: any, formData: FormData) {
  const password = formData.get('password') as string;
  const adminPass = process.env.ADMIN_PASSWORD || 'aetheria2026';
  
  if (password === adminPass) {
    (await cookies()).set('aetheria_admin_token', 'authenticated', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 24 * 7, // 1 week
      path: '/'
    });
    
    // Redirect to the dashboard upon success
    redirect('/upload');
  }
  
  return { error: 'Invalid master cipher' };
}
