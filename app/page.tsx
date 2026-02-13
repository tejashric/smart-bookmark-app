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
          redirectTo: `${window.location.origin}/auth/callback?flow=signup`,
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
          redirectTo: `${window.location.origin}/auth/callback?flow=login`,
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
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-400"></div>
      </div>
    );
  }

  if (isSignedIn) {
    return null;
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="bg-white/5 backdrop-blur-md rounded-2xl shadow-2xl p-8 w-full max-w-md border border-white/10">
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">Smart Bookmarks</h1>
          <p className="text-purple-300 mt-2">Save and organize your favorite links</p>
        </div>

        <div className="space-y-4">
          <div>
            <button
              onClick={handleSignUp}
              disabled={signupLoading}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:from-purple-800 disabled:to-purple-800 text-white font-semibold py-3 px-4 rounded-xl transition duration-200 flex items-center justify-center gap-2 shadow-lg hover:shadow-xl"
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
            <p className="text-xs text-purple-300 mt-2 text-center">New user? Create your account here</p>
          </div>

          <div>
            <button
              onClick={handleLogIn}
              disabled={loginLoading}
              className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 disabled:from-purple-800 disabled:to-purple-800 text-white font-semibold py-3 px-4 rounded-xl transition duration-200 flex items-center justify-center gap-2 shadow-lg hover:shadow-xl"
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
            <p className="text-xs text-purple-300 mt-2 text-center">Already have an account? Log in here</p>
          </div>
        </div>

        <p className="text-center text-purple-300 text-sm mt-6">
          We only use your Google account for secure authentication.
        </p>
      </div>
    </div>
  );
}
