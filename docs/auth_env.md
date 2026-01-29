# Auth environment variables

Add these to your `backend/.env` (and to `.env.example` for reference):

```env
# JWT (required for auth endpoints)
JWT_SECRET=your-secret-at-least-32-chars-in-production
JWT_EXPIRES=1h
```

- **JWT_SECRET**: Used to sign and verify access tokens. Use a long, random string in production (e.g. 32+ chars).
- **JWT_EXPIRES**: Token lifetime. Examples: `1h`, `7d`, `60s`. Defaults to `1h` if unset.
