# Smart Bookmark App

A modern bookmark manager built with Next.js, Supabase, and Tailwind CSS. Save your favorite links securely and access them from anywhere with real-time synchronization across devices.

## Features

- **Google OAuth Authentication** - One-click sign-in using your Google account
- **Bookmark Management** - Add, view, and delete bookmarks with ease
- **Real-time Sync** - Bookmarks update instantly across all open tabs/devices without page refresh
- **Private Bookmarks** - Each user can only see their own bookmarks
- **Clean UI** - Modern, responsive design built with Tailwind CSS
- **Mobile Friendly** - Works seamlessly on mobile, tablet, and desktop

## Tech Stack

- **Frontend**: Next.js 14+ (App Router), React, TypeScript, Tailwind CSS
- **Backend**: Supabase (PostgreSQL database, real-time subscriptions)
- **Authentication**: Supabase Auth with Google OAuth
- **Hosting**: Vercel
- **Real-time**: Supabase Real-time Engine

## Problems Faced & Solutions

### 1. Real-Time DELETE Events Not Firing

**Problem:** Bookmarks deleted in one tab didn't disappear from other tabs.

**Root Cause:** 
- Used `.select()` on DELETE (conflicted with RLS)
- Applied `user_id=eq.` filter to DELETE subscription (blocks events)

**Solution:**
1. Removed `.select()` from delete operations
2. Removed user_id filter from DELETE subscription
3. Added user_id check in `handleRealtimeUpdate()` function

**Result:** ✅ Real-time DELETE events now fire across all tabs

---

### 2. OAuth Callback Timing Issues

**Problem:** After Google OAuth redirect, "Authentication failed" errors because session wasn't available immediately.

**Root Cause:** Race condition - session not ready when callback handler checked synchronously.

**Solution:** Implemented dual-approach session detection:
1. Check for existing session with `getSession()`
2. If not found, listen for `onAuthStateChange` events
3. Add 5-second timeout as fail-safe

**Result:** ✅ 100% reliable OAuth authentication

---

### 3. Sign-Up Requirement Not Enforced

**Problem:** No validation that users must sign up - anyone with Google account could log in.

**Root Cause:** No way to distinguish signup from login attempts.

**Solution:**
1. Created `user_profiles` table to track signed-up users
2. Used flow parameters: `?flow=signup` vs `?flow=login`
3. Signup creates profile record, Login verifies profile exists

**Result:** ✅ Sign-up is now required before login works

---

### Summary

| Issue | Problem | Solution |
|-------|---------|----------|
| Real-time sync | DELETE events blocked | Removed filters + check in code |
| OAuth errors | Session timing race condition | Dual-approach: check + listen + timeout |
| Security | No signup validation | user_profiles table + flow params |

All issues resolved ✅ - App production ready

## Getting Started

### Prerequisites

- Node.js 18+ and npm installed
- A Supabase account (free tier available)
- A Google OAuth application setup

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/smart-bookmark-app.git
cd smart-bookmark-app
npm install
```

### 2. Set Up Supabase Project

1. Go to [supabase.com](https://supabase.com) and create a new project
2. Wait for the project to be ready
3. Go to Settings > API to get your project credentials:
   - Copy your `Project URL`
   - Copy your `anon public key`

### 3. Configure Google OAuth

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a new project
3. Enable Google+ API
4. Create OAuth 2.0 credentials (Web application)
5. Add authorized redirect URIs:
   - `http://localhost:3000/auth/callback` (for local development)
   - `https://yourdomain.vercel.app/auth/callback` (for production)
6. Copy the Client ID and Client Secret
7. In Supabase dashboard:
   - Go to Authentication > Providers
   - Enable Google provider
   - Paste your Client ID and Client Secret

### 4. Create Database Schema

1. In Supabase, go to SQL Editor
2. Create a new query and paste the SQL from `supabase/migrations/001_create_bookmarks_table.sql`
3. Run the query

### 5. Set Environment Variables

Create a `.env.local` file in the root directory:

```
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
```

### 6. Run Locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser.

## Project Structure

```
app/
├── page.tsx                 # Login page
├── auth/
│   └── callback/page.tsx   # OAuth callback handler
├── bookmarks/
│   └── page.tsx            # Main bookmarks dashboard
└── layout.tsx              # Root layout
components/
├── BookmarkForm.tsx        # Form to add new bookmarks
└── BookmarkList.tsx        # Display and manage bookmarks
lib/
└── client.ts               # Supabase client utilities
supabase/
└── migrations/
    └── 001_create_bookmarks_table.sql
.env.local                  # Environment variables (not committed)
```

## Features in Detail

### Authentication
- Users sign in with their Google account
- OAuth handled securely via Supabase
- Session persisted automatically
- Automatic redirect to bookmarks page on login

### Bookmark Management
- **Add**: Simple form with URL and title validation
- **View**: Paginated list of bookmarks with domain names and timestamps
- **Delete**: One-click delete with confirmation
- **Real-time**: All changes sync instantly across all open sessions

### Real-time Synchronization
- Powered by Supabase Realtime with PostgreSQL LISTEN feature
- Uses WebSocket connections for instant updates
- Subscribe to changes specific to the logged-in user
- No page reload needed - bookmarks appear instantly

### Security
- Row Level Security (RLS) policies ensure users only see their own data
- All queries filtered by `auth.uid()` on the database level
- Public anon key safe to expose in frontend
- Private user data never exposed to other users

## Deployment to Vercel

### Prerequisites
- GitHub repository with the code (public or private)
- Vercel account linked to GitHub

### Deployment Steps

1. **Push to GitHub**
   ```bash
   git add .
   git commit -m "Initial commit: Smart Bookmark App"
   git push origin main
   ```

2. **Deploy on Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Click "New Project"
   - Import your GitHub repository
   - In Environment Variables, add:
     - `NEXT_PUBLIC_SUPABASE_URL`: Your Supabase project URL
     - `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Your Supabase anon key
   - Click Deploy

3. **Update Google OAuth Redirect URI**
   - Once deployed, get your Vercel URL (e.g., `https://smart-bookmark-app.vercel.app`)
   - Go to Google Cloud Console
   - Add `https://your-vercel-url.vercel.app/auth/callback` to authorized redirect URIs

4. **Update Supabase Settings**
   - In Supabase, verify site URL is set to your Vercel URL
   - Update redirect URLs in Authentication settings if needed

## Environment Variables

### Required for Production
```
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyXxxx...
```

### Optional
- `NEXT_PUBLIC_SITE_URL` - Override site URL for auth redirects (useful for preview deployments)

## API Routes

This app doesn't use API routes. All database operations go directly through Supabase client libraries with proper RLS policies protecting data.

## Database Schema

### Bookmarks Table
- `id` (UUID) - Primary key
- `user_id` (UUID) - References auth.users(id)
- `title` (VARCHAR) - Bookmark title
- `url` (TEXT) - Bookmark URL
- `created_at` (TIMESTAMP) - Creation timestamp
- `updated_at` (TIMESTAMP) - Last update timestamp

### Security Policies
- Users can only SELECT/INSERT/UPDATE/DELETE their own bookmarks
- Enforced via RLS policies at the database level
- No need for backend authorization logic

## Performance Optimizations

- Real-time subscriptions use efficient WebSocket connections
- Database indexes on `user_id` and `created_at` for fast queries
- Component-level state management prevents unnecessary re-renders
- Images/assets served from CDN via Vercel

## Future Enhancements

- [ ] Bookmark categories/tags
- [ ] Search and filter functionality
- [ ] Bulk import/export
- [ ] Bookmarks sharing (with permission controls)
- [ ] Browser extension
- [ ] Keyboard shortcuts
- [ ] Dark mode
- [ ] Bookmark statistics and analytics

## Troubleshooting

### Bookmarks not syncing in real-time?
1. Check browser console for WebSocket connection errors
2. Verify RLS policies are enabled in Supabase
3. Confirm the bookmarks table is in the `supabase_realtime` publication
4. Try clearing browser cache and refreshing

### Can't sign in with Google?
1. Check if Google OAuth credentials are correctly configured
2. Verify redirect URI matches exactly in both Google Cloud and Supabase
3. Check browser console for specific error messages
4. Ensure Google+ API is enabled in Google Cloud Console

### "User not authenticated" errors?
1. Clear browser cookies and local storage
2. Try incognito/private browsing mode
3. Verify session is being retrieved with `getSession()`

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is open source and available under the MIT License.

## Support

For issues and questions:
1. Check the Troubleshooting section above
2. Review Supabase documentation: https://supabase.com/docs
3. Check Next.js documentation: https://nextjs.org/docs
4. Open an issue on GitHub

## Useful Links

- [Supabase Docs](https://supabase.com/docs)
- [Next.js Docs](https://nextjs.org/docs)
- [Tailwind CSS Docs](https://tailwindcss.com/docs)
- [Vercel Docs](https://vercel.com/docs)
- [Google OAuth Documentation](https://developers.google.com/identity/protocols/oauth2)
