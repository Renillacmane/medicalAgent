# Development Guide

This guide covers setup, development workflow, and available commands for the AI Medical Agent project.

## Prerequisites

- Node.js (v18 or higher)
- MongoDB (local or MongoDB Atlas)
- npm or yarn

## Project Structure

The project consists of two main parts:
- **Backend**: NestJS application (`backend/`)
- **Frontend**: Next.js application (`frontend/`)

## Initial Setup

### Backend Setup

1. Navigate to the backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Copy environment file:
```bash
cp .env.example .env.local
```

4. Configure `.env.local` with your MongoDB connection:
```bash
# Option 1: Direct MongoDB URI
MONGODB_URI=mongodb+srv://user:password@cluster.mongodb.net/dbname

# Option 2: Individual components
DB_USER=your_user
DB_PWD=your_password
DB_NAME=your_database
```

5. Start the development server:
```bash
npm run start:dev
```

The backend will run on `http://localhost:3911` (or the port specified in your environment).

### Frontend Setup

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Copy environment file:
```bash
cp .env.example .env.local
```

4. Configure `.env.local`:
```bash
API_URL=http://localhost:3911
```

5. Start the development server:
```bash
npm run dev
```

The frontend will run on `http://localhost:3000`.

## Available Scripts

### Backend Scripts

Run these from the `backend/` directory:

#### Development
- `npm run start` - Start the application
- `npm run start:dev` - Start in watch mode (auto-reload on changes)
- `npm run start:debug` - Start in debug mode
- `npm run start:prod` - Start in production mode

#### Testing
- `npm run test` - Run unit tests
- `npm run test:watch` - Run tests in watch mode
- `npm run test:cov` - Run tests with coverage report
- `npm run test:e2e` - Run end-to-end tests
- `npm run test:debug` - Run tests in debug mode

#### Code Quality
- `npm run lint` - Run ESLint and fix issues
- `npm run format` - Format code with Prettier

#### Build
- `npm run build` - Build the application for production

#### Data Seeding
- `npm run seed` - Seed fake data (10 users, vitals, medications)
- `npm run seed:jane` - Seed vitals for jane@example.com
- `npm run seed:rag` - Seed RAG data (userdocuments + documentchunks)
- `npm run seed:pdfs` - Generate static seed PDFs

#### PDF Generation
- `npm run generate:pdfs` - Generate dynamic PDFs with configurable parameters

For detailed information about seeding and PDF generation scripts, see [`backend/scripts/README.md`](../backend/scripts/README.md).

### Frontend Scripts

Run these from the `frontend/` directory:

#### Development
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

#### Mobile (Capacitor)
- `npm run cap:sync` - Sync Capacitor configuration
- `npm run cap:ios` - Open iOS project in Xcode
- `npm run cap:android` - Open Android project in Android Studio
- `npm run mobile:build` - Build and sync for mobile
- `npm run mobile:ios` - Build, sync, and open iOS project
- `npm run mobile:android` - Build, sync, and open Android project

## Development Workflow

### 1. Starting Development

1. Start MongoDB (if using local instance) or ensure MongoDB Atlas connection is configured
2. Start the backend:
   ```bash
   cd backend
   npm run start:dev
   ```
3. Start the frontend (in a new terminal):
   ```bash
   cd frontend
   npm run dev
   ```

### 2. Seeding Test Data

To populate the database with test data:

```bash
cd backend

# Seed basic fake data
npm run seed

# Or seed specific user (jane@example.com)
npm run seed:jane

# Seed RAG data (requires jane@example.com to exist)
npm run seed:rag
```

**Test Credentials:**
- Email: `jane@example.com` (or any seeded user email)
- Password: `fakedata`

### 3. Generating Test PDFs

Generate PDF documents for testing document upload and processing:

```bash
cd backend

# Generate static seed PDFs (fixed content)
npm run seed:pdfs

# Generate dynamic PDFs with parameters
npm run generate:pdfs -- --blood=3 --prescription=2 --report=1 --tendency=bad
```

See [`backend/scripts/README.md`](../backend/scripts/README.md) for detailed PDF generation options.

### 4. Running Tests

```bash
cd backend

# Unit tests
npm run test

# Watch mode
npm run test:watch

# Coverage
npm run test:cov

# E2E tests
npm run test:e2e
```

### 5. Code Quality

Before committing:

```bash
# Backend
cd backend
npm run lint
npm run format

# Frontend
cd frontend
npm run lint
```

## Environment Variables

### Backend (.env.local)

| Variable | Description | Required |
|----------|-------------|----------|
| `MONGODB_URI` | Full MongoDB connection string | Yes* |
| `DB_USER` | MongoDB username | Yes* |
| `DB_PWD` | MongoDB password | Yes* |
| `DB_NAME` | MongoDB database name | Yes* |
| `JWT_SECRET` | Secret key for JWT tokens | Yes |
| `OPENAI_API_KEY` | OpenAI API key for LLM | Optional |
| `LLM_PROVIDER` | LLM provider (`openai` or `gemini`) | Optional |
| `OPENAI_CHAT_MODEL` | OpenAI model name | Optional |

*Either `MONGODB_URI` or all three `DB_*` variables are required.

### Frontend (.env.local)

| Variable | Description | Required |
|----------|-------------|----------|
| `API_URL` | Backend API base URL (no trailing slash) | Yes |

## Common Tasks

### Adding a New User Manually

Use the seed script or register via the frontend registration form.

### Testing Document Upload

1. Generate test PDFs:
   ```bash
   cd backend
   npm run generate:pdfs -- --blood=2 --prescription=1 --tendency=bad
   ```

2. PDFs will be in `frontend/public/documents/`

3. Upload via the frontend interface (My Health > Upload Document)

### Debugging

- **Backend**: Use `npm run start:debug` and attach debugger on port 9229
- **Frontend**: Use browser DevTools and Next.js debugging features
- **Database**: Use MongoDB Compass or similar tool to inspect collections

## Troubleshooting

### Backend won't start
- Check MongoDB connection in `.env.local`
- Ensure port 3911 is available
- Check logs for specific errors

### Frontend can't connect to backend
- Verify `API_URL` in `frontend/.env.local` matches backend URL
- Ensure backend is running
- Check CORS settings if needed

### Tests failing
- Ensure MongoDB is accessible
- Check that test database is separate from development database
- Verify environment variables are set correctly

## Additional Resources

- [Backend Scripts Documentation](../backend/scripts/README.md) - Detailed script usage
- [Project Context](./project_context.md) - Project overview and architecture
- [Data Model](./data_model.md) - Database schema documentation
- [RAG Implementation Plan](./rag_implementation_plan.md) - RAG system details
- [Frontend Structure](./frontend_structure.md) - Frontend architecture
