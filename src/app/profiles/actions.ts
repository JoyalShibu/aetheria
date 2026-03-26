'use server';

import { createClient } from '@/utils/supabase/server';
import { revalidatePath } from 'next/cache';

export async function addProfile(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { error: 'Not authenticated' };
  }

  const name = formData.get('name') as string;
  const color = formData.get('color') as string || '#00e5ff';

  if (!name) return { error: 'Name is required' };

  const { error } = await supabase.from('profiles').insert({
    user_id: user.id,
    name,
    color
  });

  if (error) {
    return { error: error.message };
  }

  revalidatePath('/profiles');
  return { success: true };
}
