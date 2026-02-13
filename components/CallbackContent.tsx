'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { createClient } from '@/lib/client';

export default function CallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handleCallback = async () => {
      try {
        const supabase = createClient();
        
        // Retry logic to wait for session to be established
        let session = null;
        let retries = 0;
        const maxRetries = 5;
        
        while (!session && retries < maxRetries) {
          const { data } = await supabase.auth.getSession();
          session = data?.session;
          
          if (!session) {
            retries++;
            console.log(`Session not ready, retry ${retries}/${maxRetries}`);
            await new Promise(resolve => setTimeout(resolve, 500)); // Wait 500ms before retrying
          }
        }

        if (!session) {
          console.error('Session still not available after retries');
          setError('Authentication failed. Please try again.');
          setTimeout(() => router.push('/'), 2000);
          return;
        }

        console.log('Session established:', session.user.id);

        const flow = searchParams.get('flow');
        const userId = session.user.id;

        // Check if user profile exists
        const { data: profile, error: profileError } = await supabase
          .from('user_profiles')
          .select('id')
          .eq('id', userId)
          .single();

        console.log('Profile check result:', { profile, profileError });

        if (flow === 'signup') {
          // Sign up flow: create profile if it doesn't exist
          if (!profile) {
            const { error: insertError } = await supabase
              .from('user_profiles')
              .insert([{ id: userId }]);

            if (insertError && insertError.code !== 'PGRST116') {
              // PGRST116 is a duplicate key error, which is fine if profile already exists
              console.error('Error creating user profile:', insertError);
              setError('Failed to create account. Please try again.');
              setTimeout(() => router.push('/'), 2000);
              return;
            }
            console.log('Profile created successfully');
          }
          // Redirect to bookmarks
          router.push('/bookmarks');
        } else if (flow === 'login') {
          // Login flow: only proceed if profile exists
          if (!profile) {
            // Sign out the user if they don't have a profile
            await supabase.auth.signOut();
            setError(
              'Account not found. Please sign up first using the Sign Up button.'
            );
            setTimeout(() => router.push('/'), 2000);
            return;
          }
          // Redirect to bookmarks
          router.push('/bookmarks');
        } else {
          // Default: redirect to bookmarks
          router.push('/bookmarks');
        }
      } catch (err) {
        console.error('Callback error:', err);
        setError('An error occurred. Redirecting...');
        setTimeout(() => router.push('/'), 2000);
      }
    };

    handleCallback();
  }, [router, searchParams]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-800 via-slate-800 to-slate-900">
      <div className="text-center">
        {error ? (
          <div className="space-y-4">
            <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4">
              <p className="text-red-300">{error}</p>
            </div>
            <p className="text-slate-400">Redirecting...</p>
          </div>
        ) : (
          <>
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-slate-400 mx-auto mb-4"></div>
            <p className="text-slate-300">Completing sign in...</p>
          </>
        )}
      </div>
    </div>
  );
}

