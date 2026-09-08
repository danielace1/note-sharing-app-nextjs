# Secure Note Sharing App

A secure note-taking application built as a technical assessment for Peacock India.
Users can create private notes and generate secure share links with configurable access control and expiration.

---

## Features

- User registration and login
- Create, edit, and delete notes
- View notes belonging to the authenticated user
- Generate secure share links
- One-time share links
- Time-based share links
- Public share links
- Password-protected share links
- Dynamic access-key generation
- Share-link revocation
- Share-link expiration
- Successful view-count tracking
- Atomic one-time link consumption
- Brute-force protection for password-protected links
- Secure share-token hashing
- No-cache headers for shared-note responses
- Referrer protection for shared-note pages

---

## Tech Stack

### Frontend

- Next.js
- React
- TypeScript
- Tailwind CSS
- shadcn/ui
- TanStack Query

### Backend

- Hono.js
- Next.js Route Handlers
- Zod

### Database

- PostgreSQL
- Neon
- Drizzle ORM

### Authentication

- Better Auth

### Security

- Node.js `crypto`
- SHA-256
- Argon2id
- Cryptographically secure random values

---

## Application Structure

```text
app/
├── api/
│   ├── auth/
│   └── [[...route]]/
├── login/
├── register/
├── notes/
│   ├── page.tsx
│   ├── new/
│   └── [id]/
└── share/
    └── [token]/

server/
├── routes/
│   ├── notes.ts
│   ├── share-links.ts
│   └── share.ts
└── session-middleware.ts

db/
├── index.ts
└── schema.ts

lib/
├── api/
├── security/
├── auth.ts
└── auth-client.ts

hooks/
├── use-notes.ts
└── use-share-links.ts
```

---

# Getting Started

## Prerequisites

Make sure you have:

- Node.js 20+
- npm
- PostgreSQL database
- Neon PostgreSQL account or another PostgreSQL-compatible database

---

## Installation

Clone the repository:

```
git clone https://github.com/danielace1/note-sharing-app-nextjs.git
cd note-sharing-app-nextjs
```

Install dependencies:

```
npm install
```

---

## Environment Variables

Create a `.env.local` file in the project root:

```
DATABASE_URL="your-neon-database-url"

BETTER_AUTH_URL="http://localhost:3000"

BETTER_AUTH_SECRET="your-generated-secret"
```

Do not commit `.env.local` or production secrets to Git.

---

## Database Setup

The project uses PostgreSQL with Drizzle ORM.

Push the current database schema:

```
npx drizzle-kit push
```

The schema contains the authentication tables required by Better Auth along with the application's `notes` and `share_links` tables.

---

## Run the Development Server

```
npm run dev
```

Open:

```
http://localhost:3000
```

---

# Authentication

Authentication is handled using Better Auth.

Users must be authenticated to manage their notes.

Protected operations include:

- Creating notes
- Viewing notes
- Updating notes
- Deleting notes
- Creating share links
- Viewing share-link information
- Revoking share links

The backend validates the user's session before processing protected requests.

The frontend also checks the authentication state before requesting protected note data.

### Authentication Flow

```
User
 |
 v
Login / Register
 |
 v
Better Auth Session
 |
 v
Authenticated Application
 |
 +----> /notes
 |
 +----> /notes/[id]
 |
 +----> Create / Manage Share Links
```

If an unauthenticated user visits `/notes`, they are redirected to `/login`.

If an authenticated user visits `/login`, they are redirected to `/notes`.

---

# Note Management

Authenticated users can create and manage their own private notes.

### Supported Operations

- Create a note
- View a note
- Edit a note
- Delete a note
- View all notes belonging to the authenticated user

Each note is associated with the authenticated user's ID.

Backend note queries are scoped using both:

- The authenticated user's ID
- The note ID

This prevents an authenticated user from accessing another user's private notes.

---

# Share Links

A note owner can generate secure share links for individual notes.

Each share link has two independent configuration options.

## Share Type

### One-Time

A one-time share link can be successfully accessed only once.

After the first successful access, the link is marked as used and cannot be accessed again.

### Time-Based

A time-based share link remains available until its configured expiration time.

After the expiration time, the link becomes unavailable.

---

## Access Type

### Public

Anyone who has the share link can access the note without providing a password.

### Password Protected

The recipient must provide the correct generated access key before the note content is returned.

---

## Share Configuration

A share link can therefore be configured as:

| Share Type | Access Type        |
| ---------- | ------------------ |
| One-Time   | Public             |
| One-Time   | Password Protected |
| Time-Based | Public             |
| Time-Based | Password Protected |

---

# Share Link Flow

The share process works as follows:

```
Authenticated User
        |
        v
     Select Note
        |
        v
       Share
        |
        v
Choose Link Lifetime
        |
   +----+----+
   |         |
   v         v
One-Time  Time-Based
             |
             v
       Select Expiry
        |
        v
Choose Access Type
        |
   +----+----+
   |         |
   v         v
Public    Password
              |
              v
       Generate Access Key
              |
              v
        Create Share Link
              |
              v
       Share URL + Key
```

For password-protected links, the access key is shown to the note owner when the link is created.

The raw share token and access key are shown only during share-link creation.

---

# Share Token Security

Share tokens are generated using Node.js cryptographically secure random bytes.

Each share token contains 32 random bytes.

The generated token is encoded using Base64URL so it can safely be included in a URL.

## Token Generation

```
32 cryptographically secure random bytes
                    |
                    v
                Base64URL
                    |
                    v
             Raw Share Token
```

The raw token is returned to the owner when the share link is created.

The raw token is never stored in the database.

Before storage, the token is hashed using SHA-256:

```
Raw Share Token
       |
       v
    SHA-256
       |
       v
   Token Hash
       |
       v
    Database
```

When a recipient accesses a share URL, the supplied token is hashed again and the resulting hash is used to locate the corresponding share link.

This means the database does not contain the raw share token.

---

# Password / Access-Key Generation

Password-protected share links use a dynamically generated access key.

The access key is generated using cryptographically secure random values rather than `Math.random()`.

The generated access key uses an alphabet that avoids visually confusing characters.

The access key is hashed using Argon2id before being stored.

```
Secure Random Generator
          |
          v
      Access Key
          |
          v
        Argon2id
          |
          v
   Access Key Hash
          |
          v
       Database
```

The plaintext access key is returned to the owner when the share link is created.

When the recipient enters the key, the submitted value is verified against the stored Argon2id hash.

The plaintext access key is never stored in PostgreSQL.

---

# Expiry Logic

The application supports two share types.

## One-Time Access

One-time links do not use an expiration timestamp.

Instead, the link becomes unavailable after its first successful access.

The `used_at` column records when the link was consumed.

A subsequent request is rejected.

## Time-Based Access

Time-based links contain an `expires_at` timestamp.

A link is considered expired when:

```
current time >= expires_at
```

Expired links cannot be accessed.

The expiration check is performed by the backend, so the client cannot bypass expiration by modifying frontend state.

---

# Invalidate / Revoke Logic

The note owner can manually revoke an active share link.

When a link is revoked, the backend records:

```
revoked_at = current timestamp
```

The share endpoint checks the revoked state before allowing access.

A revoked link cannot be used even if:

- The link has not expired.
- The link has not been used.
- The correct access key is provided.

The revoke operation is protected by authentication and ownership validation.

---

# View Count Logic

The `view_count` field tracks only successful accesses.

| Scenario                         | View Count |
| -------------------------------- | ---------- |
| Public share successfully viewed | +1         |
| Correct password/access key      | +1         |
| Wrong password/access key        | No change  |
| Invalid share link               | No change  |
| Expired share link               | No change  |
| Revoked share link               | No change  |
| Already-used one-time link       | No change  |

For one-time links, link consumption and the view-count increment happen as part of the same atomic database operation.

This prevents multiple concurrent requests from incorrectly increasing the view count.

---

# Race-Condition Handling

One-time share links must be protected against concurrent requests.

A simple implementation could do:

```
1. Check whether the link is unused.
2. Return the note.
3. Mark the link as used.
```

This is unsafe because two requests could both observe the link as unused.

For example:

```
Request A                    Request B
   |                            |
   v                            v
Check usedAt                 Check usedAt
   |                            |
   v                            v
NULL                         NULL
   |                            |
   +------------+---------------+
                |
                v
       Both requests proceed
```

Instead, the application uses an atomic database update.

Conceptually:

```
UPDATE share_links
SET
    used_at = CURRENT_TIMESTAMP,
    view_count = view_count + 1
WHERE
    id = ?
    AND used_at IS NULL
    AND revoked_at IS NULL;
```

Only one concurrent request can successfully change an unused link.

The successful request consumes the link and increments the view count.

A competing request cannot satisfy:

```
used_at IS NULL
```

after the first request has consumed the link.

### Result

```
Concurrent Requests
        |
        v
Atomic Database Operation
        |
   +----+----+
   |         |
   v         v
Success    Update Fails
   |         |
   v         v
Access     Already Used
Granted    Response
```

Therefore, even if multiple users open the same one-time link at the same time, only one request can successfully consume it.

The database is the source of truth for one-time-link consumption rather than application-memory state.

---

# Assessment Questions

## 1. How do you prevent two users from using a one-time link at the same time?

I use an atomic conditional database update.

The share link is consumed only when `used_at IS NULL`.

The operation sets `used_at` and increments `view_count` together.

Because the condition and update happen atomically in PostgreSQL, only one concurrent request can successfully consume the link.

Other concurrent requests cannot update the already-consumed link and are rejected.

---

## 2. How do you update view count safely?

The view count is updated on the server only after successful access.

For one-time links, setting `used_at` and incrementing `view_count` happen in the same atomic database update.

For time-based links, the view-count update checks that the link is still active and has not been revoked or expired.

Wrong passwords, invalid links, expired links, revoked links, and already-used links do not increment the view count.

---

## 3. How would this work if 1 million people opened the link?

The application does not depend on in-memory application state for share-link correctness.

Share tokens are hashed and indexed in PostgreSQL, allowing the backend to efficiently locate the corresponding share link.

For high traffic, the application can be horizontally scaled using multiple stateless application instances behind a load balancer.

The PostgreSQL database can use connection pooling and appropriate indexes.

For very high read traffic, additional techniques such as read replicas and carefully designed caching can be introduced.

For extremely popular links, rate limiting and distributed caching can also be used to protect the database.

Most importantly, one-time link consumption remains an atomic database operation, so multiple application instances cannot accidentally consume the same one-time link.

---

## 4. How would you prevent brute-force attempts on password-protected links?

Password-protected share links track failed access-key attempts.

The current implementation allows a maximum of 5 failed attempts before temporarily locking the share link for 15 minutes.

The failed-attempt counter is updated atomically and capped at the configured maximum.

After the maximum number of failed attempts is reached, the link is temporarily locked.

A successful access-key verification resets the failed-attempt counter and removes the temporary lock.

The access key is also stored as an Argon2id hash rather than plaintext.

For a larger production deployment, distributed IP/device-based rate limiting could additionally be implemented using a shared store such as Redis.

---

# HTTP Security

Shared note responses use cache-control headers:

```
Cache-Control: no-store, no-cache, must-revalidate, private
Pragma: no-cache
```

This prevents sensitive shared-note responses from being cached by the browser or intermediary caches.

The shared-note page also uses:

```
Referrer-Policy: no-referrer
```

This prevents the share URL containing the secret token from being sent as a referrer to another website.

---

# API Overview

## Authentication

Better Auth handles authentication and session management.

## Notes

```
GET    /api/notes
POST   /api/notes
GET    /api/notes/:id
PATCH  /api/notes/:id
DELETE /api/notes/:id
```

These endpoints require authentication.

## Share Links

```
GET   /api/notes/:id/share
POST  /api/notes/:id/share
PATCH /api/notes/:id/share/:shareId/revoke
```

These endpoints require authentication and verify note ownership.

## Shared Notes

```
GET  /api/share/:token
POST /api/share/:token/unlock
```

These endpoints allow recipients to access shared notes.

---

# Required Edge Cases

The application handles:

- Invalid share link
- Public share link access
- Password-protected share link access
- Correct password/access key
- Wrong password/access key
- Expired share link
- One-time link already used
- Revoked share link
- Multiple users opening a one-time link simultaneously
- Accurate view count updates
- Repeated failed access-key attempts

---

# Test Credentials

Use the following credentials for the live demo:

```
Email: sudharsan@gmail.com
Password: sudharsan1
```

---

# Live Demo

```
https://share-note-ruby.vercel.app/
```

---
