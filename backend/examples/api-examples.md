# API request examples

Base URL: `http://localhost:3911` (override with `PORT` in `.env`).

Ensure the backend is running: `npm run start:dev` from the backend directory.

---

## Register

Create a new user. Returns `access_token` and `expires_in`.

```bash
curl -X POST http://localhost:3911/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "Jane",
    "lastName": "Doe",
    "dateOfBirth": "1990-05-15",
    "email": "jane@example.com",
    "password": "secretpassword"
  }'
```

Example response:

```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "expires_in": 3600
}
```

---

## Login

Authenticate and get a JWT.

```bash
curl -X POST http://localhost:3911/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "jane@example.com",
    "password": "secretpassword"
  }'
```

---

## Profile (protected)

Get the current user. Replace `YOUR_ACCESS_TOKEN` with the token from register or login.

```bash
curl -X GET http://localhost:3911/auth/profile \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

Example response:

```json
{
  "id": "...",
  "firstName": "Jane",
  "lastName": "Doe",
  "dateOfBirth": "1990-05-15T00:00:00.000Z",
  "email": "jane@example.com",
  "isActive": true
}
```
