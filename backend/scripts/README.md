# Scripts

## Seed fake data

Inserts 10 users (password: **fakedata**), 5 vitals and 5 medications per user, no exams.

**Prerequisites:** `.env` in the backend root with MongoDB connection (e.g. `MONGODB_URI` or `DB_USER`, `DB_PWD`, `DB_NAME`).

**Run from backend directory:**

```bash
npm run seed
```

Or:

```bash
npx ts-node scripts/seed-fake-data.ts
```

**Login:** Use any seeded user email (e.g. `alice.smith@example.com`) with password `fakedata` to test auth.

**Idempotency:** If a user with the same email already exists, that user is skipped and their `_id` is reused for vitals/medications. Re-running the script will add vitals/medications again for existing users (duplicates). For a clean seed, drop the `users`, `uservitals`, and `usermedications` collections first.
