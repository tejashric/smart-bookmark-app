'use client';

import { useState, FormEvent } from 'react';
import { createClient } from '@/lib/client';

interface BookmarkFormProps {
  userId?: string;
}

export default function BookmarkForm({ userId }: BookmarkFormProps) {
  const [title, setTitle] = useState('');
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess(false);

    if (!title.trim() || !url.trim()) {
      setError('Please fill in all fields');
      return;
    }

    // Validate URL
    try {
      new URL(url);
    } catch {
      setError('Please enter a valid URL');
      return;
    }

    setLoading(true);

    try {
      const supabase = createClient();
      const { error: insertError } = await supabase.from('bookmarks').insert([
        {
          title: title.trim(),
          url: url.trim(),
          user_id: userId,
        },
      ]);

      if (insertError) {
        throw insertError;
      }

      setTitle('');
      setUrl('');
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add bookmark');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white/10 backdrop-blur-md rounded-2xl shadow-2xl p-6 border border-white/20">
      <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent mb-6">Add Bookmark</h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-white/80 mb-2">
            Title
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Enter bookmark title"
            className="w-full px-4 py-3 border border-white/30 bg-white/5 text-white placeholder-white/40 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition backdrop-blur-sm"
            disabled={loading}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-white/80 mb-2">
            URL
          </label>
          <input
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://example.com"
            className="w-full px-4 py-3 border border-white/30 bg-white/5 text-white placeholder-white/40 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition backdrop-blur-sm"
            disabled={loading}
          />
        </div>

        {error && (
          <div className="bg-red-500/20 border border-red-500/50 text-red-200 px-4 py-3 rounded-xl backdrop-blur-sm">
            {error}
          </div>
        )}

        {success && (
          <div className="bg-green-500/20 border border-green-500/50 text-green-200 px-4 py-3 rounded-xl backdrop-blur-sm">
            Bookmark added successfully!
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 disabled:from-blue-300 disabled:to-blue-400 text-white font-semibold py-3 px-4 rounded-xl transition duration-200 flex items-center justify-center gap-2 shadow-lg hover:shadow-xl"
        >
          {loading ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              Adding...
            </>
          ) : (
            '+ Add Bookmark'
          )}
        </button>
      </form>
    </div>
  );
}
