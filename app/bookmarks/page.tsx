'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/client';
import BookmarkForm from '@/components/BookmarkForm';
import BookmarkList from '@/components/BookmarkList';
import type { RealtimeChannel } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

interface Bookmark {
  id: string;
  title: string;
  url: string;
  created_at: string;
  user_id: string;
}

export default function BookmarksPage() {
  const router = useRouter();
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<{ id: string; email?: string } | null>(null);
  const channelRef = useRef<RealtimeChannel | null>(null);

  // Define functions before useEffect so they can be called
  const fetchBookmarks = async (userId: string) => {
    const supabase = createClient();
    const { data, error } = await supabase
      .from('bookmarks')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching bookmarks:', error);
      return;
    }

    setBookmarks(data || []);
  };

  const handleRealtimeUpdate = (payload: any) => {
    // Supabase real-time payload type is complex and dynamic, 'any' is acceptable here
    console.log('Real-time update received:', payload);
    
    if (payload.eventType === 'INSERT' && payload.new) {
      const newBookmark = payload.new as Bookmark;
      console.log('Adding bookmark:', newBookmark);
      setBookmarks((prev) => [newBookmark, ...prev]);
    } else if (payload.eventType === 'DELETE' && payload.old) {
      const oldBookmark = payload.old as Bookmark;
      console.log('Deleting bookmark:', oldBookmark.id);
      setBookmarks((prev) => prev.filter((b) => b.id !== oldBookmark.id));
    } else if (payload.eventType === 'UPDATE' && payload.new) {
      const updatedBookmark = payload.new as Bookmark;
      console.log('Updating bookmark:', updatedBookmark);
      setBookmarks((prev) =>
        prev.map((b) => (b.id === updatedBookmark.id ? updatedBookmark : b))
      );
    }
  };

  useEffect(() => {
    const initializeBookmarks = async () => {
      const supabase = createClient();

      // Check authentication
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        router.push('/');
        return;
      }

      setUser(session.user);

      // Fetch bookmarks
      await fetchBookmarks(session.user.id);

      // Subscribe to real-time updates
      const channel = supabase
        .channel(`bookmarks:${session.user.id}`)
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'bookmarks',
            filter: `user_id=eq.${session.user.id}`,
          },
          (payload) => {
            console.log('Subscription event received:', payload);
            handleRealtimeUpdate(payload);
          }
        )
        .subscribe((status) => {
          console.log('Subscription status:', status);
        });

      channelRef.current = channel;
      setLoading(false);
    };

    initializeBookmarks();

    return () => {
      if (channelRef.current) {
        channelRef.current.unsubscribe();
      }
    };
  }, [router]);

  const handleSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push('/');
  };

  const handleDeleteBookmark = async (id: string) => {
    if (!user?.id) {
      alert('User not authenticated');
      return;
    }

    const supabase = createClient();
    console.log('Attempting to delete bookmark:', id);
    
    const { error, data } = await supabase
      .from('bookmarks')
      .delete()
      .eq('id', id)
      .select();

    console.log('Delete response:', { error, data });

    if (error) {
      console.error('Error deleting bookmark:', error);
      alert(`Failed to delete bookmark: ${error.message}`);
      return;
    }

    // Manually remove from state
    setBookmarks((prev) => prev.filter((b) => b.id !== id));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p>Loading bookmarks...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <nav className="bg-white/10 backdrop-blur-md shadow-lg border-b border-white/10">
        <div className="max-w-6xl mx-auto px-4 py-5 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">Smart Bookmarks</h1>
            <p className="text-sm text-gray-300 mt-1">
              {user?.email}
            </p>
          </div>
          <button
            onClick={handleSignOut}
            className="bg-gradient-to-r from-red-500 to-pink-600 hover:from-red-600 hover:to-pink-700 text-white font-semibold py-2 px-6 rounded-lg transition duration-200 shadow-lg hover:shadow-xl"
          >
            Sign Out
          </button>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1">
            <BookmarkForm userId={user?.id} />
          </div>
          <div className="lg:col-span-2">
            <BookmarkList
              bookmarks={bookmarks}
              onDelete={handleDeleteBookmark}
            />
          </div>
        </div>
      </main>
    </div>
  );
}
