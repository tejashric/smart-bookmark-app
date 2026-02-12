'use client';

import { useState } from 'react';

interface Bookmark {
  id: string;
  title: string;
  url: string;
  created_at: string;
  user_id: string;
}

interface BookmarkListProps {
  bookmarks: Bookmark[];
  onDelete: (id: string) => void;
}

export default function BookmarkList({
  bookmarks,
  onDelete,
}: BookmarkListProps) {
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this bookmark?')) {
      setDeletingId(id);
      await onDelete(id);
      setDeletingId(null);
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getDomain = (url: string) => {
    try {
      const domain = new URL(url).hostname;
      return domain.replace('www.', '');
    } catch {
      return 'Invalid URL';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h2 className="text-2xl font-bold text-black mb-6">
        Your Bookmarks ({bookmarks.length})
      </h2>

      {bookmarks.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-black text-lg">
            No bookmarks yet. Add one to get started!
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {bookmarks.map((bookmark) => (
            <div
              key={bookmark.id}
              className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 hover:shadow-md transition"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-black truncate">
                    {bookmark.title}
                  </h3>
                  <a
                    href={bookmark.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-500 hover:text-blue-600 text-sm truncate block mt-1"
                    title={bookmark.url}
                  >
                    {getDomain(bookmark.url)}
                  </a>
                  <p className="text-xs text-black mt-2">
                    {formatDate(bookmark.created_at)}
                  </p>
                </div>
                <button
                  onClick={() => handleDelete(bookmark.id)}
                  disabled={deletingId === bookmark.id}
                  className="ml-4 bg-red-500 hover:bg-red-600 disabled:bg-red-300 text-white font-semibold px-3 py-1 text-sm rounded transition"
                  title="Delete bookmark"
                >
                  {deletingId === bookmark.id ? (
                    <>
                      <span className="inline-block animate-spin w-3 h-3 border-2 border-white border-t-transparent rounded-full"></span>
                    </>
                  ) : (
                    'Delete'
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
