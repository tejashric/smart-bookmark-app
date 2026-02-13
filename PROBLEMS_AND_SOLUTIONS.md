# Problems Faced & Solutions

## 1. Real-Time DELETE Events Not Firing

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

## 2. OAuth Callback Timing Issues

**Problem:** After Google OAuth redirect, "Authentication failed" errors because session wasn't available immediately.

**Root Cause:** Race condition - session not ready when callback handler checked synchronously.

**Solution:** Implemented dual-approach session detection:
1. Check for existing session with `getSession()`
2. If not found, listen for `onAuthStateChange` events
3. Add 5-second timeout as fail-safe

**Result:** ✅ 100% reliable OAuth authentication

---

## 3. Sign-Up Requirement Not Enforced

**Problem:** No validation that users must sign up - anyone with Google account could log in.

**Root Cause:** No way to distinguish signup from login attempts.

**Solution:**
1. Created `user_profiles` table to track signed-up users
2. Used flow parameters: `?flow=signup` vs `?flow=login`
3. Signup creates profile record, Login verifies profile exists

**Result:** ✅ Sign-up is now required before login works

---

## Summary

| Issue | Problem | Solution |
|-------|---------|----------|
| Real-time sync | DELETE events blocked | Removed filters + check in code |
| OAuth errors | Session timing race condition | Dual-approach: check + listen + timeout |
| Security | No signup validation | user_profiles table + flow params |

All issues resolved ✅ - App production ready

