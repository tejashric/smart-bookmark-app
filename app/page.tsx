'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/client';

export const dynamic = 'force-dynamic';

export default function Home() {
  const router = useRouter();
  const [signupLoading, setSignupLoading] = useState(false);
  const [loginLoading, setLoginLoading] = useState(false);
  const [isSignedIn, setIsSignedIn] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      const supabase = createClient();
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (session) {
        setIsSignedIn(true);
        router.push('/bookmarks');
      }
      setCheckingAuth(false);
    };

    checkAuth();
  }, [router]);

  const handleSignUp = async () => {
    setSignupLoading(true);
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (error) {
        throw error;
      }
    } catch (error) {
      console.error('Sign up error:', error);
      setSignupLoading(false);
    }
  };

  const handleLogIn = async () => {
    setLoginLoading(true);
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (error) {
        throw error;
      }
    } catch (error) {
      console.error('Log in error:', error);
      setLoginLoading(false);
    }
  };

  if (checkingAuth) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (isSignedIn) {
    return null;
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="bg-white rounded-lg shadow-xl p-8 w-full max-w-md">
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold text-black">Smart Bookmarks</h1>
          <p className="text-black mt-2">Save and organize your favorite links</p>
        </div>

        <div className="space-y-3">
          <button
            onClick={handleSignUp}
            disabled={signupLoading}
            className="w-full bg-blue-500 hover:bg-blue-600 disabled:bg-blue-300 text-white font-semibold py-3 px-4 rounded-lg transition duration-200 flex items-center justify-center gap-2"
          >
            {signupLoading ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                Signing up...
              </>
            ) : (
              <>
                <span>✨</span>
                Sign Up with Google
              </>
            )}
          </button>

          <button
            onClick={handleLogIn}
            disabled={loginLoading}
            className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white font-semibold py-3 px-4 rounded-lg transition duration-200 flex items-center justify-center gap-2"
          >
            {loginLoading ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                Logging in...
              </>
            ) : (
              <>
                <span>🔐</span>
                Log In with Google
              </>
            )}
          </button>
        </div>

        <p className="text-center text-black text-sm mt-6">
          We only use your Google account for secure authentication.
        </p>
      </div>
    </div>
  );
}
