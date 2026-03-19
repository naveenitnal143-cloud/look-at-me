# Look@Me

## Current State
New project — no existing application files.

## Requested Changes (Diff)

### Add
- Short video social media platform inspired by TikTok, targeting Indian creators
- User authentication with profiles (bio, avatar, links)
- Vertical video feed with infinite scroll (For You, Following, Live, Explore tabs)
- Like, comment, share, save interactions on videos
- Video upload with title, hashtags, description, music selection
- Creator profile pages with follower/following/video counts, follow/message actions
- Search page for videos, creators, hashtags
- Trending hashtags and trending creators discovery
- Notifications/inbox page
- Admin panel: user management, content moderation, analytics dashboard
- Report/block system for users and videos
- Dark mode UI with vibrant saffron/pink/purple gradient accents
- Bottom navigation: Home, Search, Create, Inbox, Profile
- Leaderboard for top creators
- Coins/gift system (frontend display)
- Multi-language support (Hindi/English toggle)

### Modify
- N/A (new project)

### Remove
- N/A (new project)

## Implementation Plan
1. Backend: Users, videos, comments, likes, follows, notifications, reports, coins data models
2. Backend: CRUD APIs for all above entities
3. Backend: Feed algorithm (score-based: likes + comments + recency)
4. Backend: Admin APIs (user ban, content removal, analytics)
5. Backend: Blob storage integration for video uploads and profile pics
6. Frontend: App shell with bottom nav, dark/light theme toggle
7. Frontend: Auth pages (login/register)
8. Frontend: Home feed with vertical video player
9. Frontend: Video upload/create flow
10. Frontend: Search & discover page
11. Frontend: Creator profile page
12. Frontend: Inbox/notifications
13. Frontend: Admin dashboard
14. Frontend: Settings page (language, privacy, account)
