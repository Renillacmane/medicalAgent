# GitHub Actions Workflows

This directory contains CI/CD workflows for the Medical Agent project.

## Workflows

### `backend-build.yml` (CI - Backend Build and Test)
**Triggers:** Manual trigger via `workflow_dispatch` only

**What it does:**
- Checks out code (optionally from a specific branch)
- Sets up Node.js 22 with npm cache
- Installs dependencies
- Runs linter
- Builds the backend
- Verifies build output
- Runs tests (with `continue-on-error: true`)

**Manual Inputs:**
- `branch` (optional) - Specific branch to checkout

### `deploy-BE.yml` (Deploy - Backend)
**Triggers:** Manual trigger via `workflow_dispatch` only

**What it does:**
- Calls deployment webhook URL (configured via `PROD_BE_HOOK` secret)
- Sends deployment metadata (commit SHA, branch, repository, actor, etc.)
- Waits 90 seconds for deployment to complete
- Performs health check with retries
- Generates deployment summary

**Required Secrets:**
- `PROD_BE_HOOK` - The webhook URL to trigger deployment on your server
- `BE_URL` - Your backend URL for health checks (e.g., `https://api.example.com`)

### `deploy-FE.yml` (Deploy - Frontend)
**Triggers:** Manual trigger via `workflow_dispatch` only

**What it does:**
- Calls deployment webhook URL (configured via `PROD_FE_HOOK` secret)
- Sends deployment metadata (commit SHA, ref, actor)
- Waits 90 seconds for deployment to complete
- Performs frontend health check with retries
- Generates deployment summary

**Required Secrets:**
- `PROD_FE_HOOK` - The webhook URL to trigger frontend deployment on your server
- `FE_URL` - Your frontend URL for health checks (e.g., `https://app.example.com`)

### `health-check.yml` (Health Check)
**Triggers:**
- Manual trigger via `workflow_dispatch`
- Optional scheduled cron (commented out by default)

**What it does:**
- Backend: checks the `/health` endpoint
- Frontend: checks the root URL (HTTP 200–299)
- Retries up to 3 times with 10s delays per check
- Fails if a health check doesn’t pass
- Generates health check summary for both

**Required Secrets:**
- `BE_URL` - Your backend URL (e.g., `https://api.example.com`)
- `FE_URL` - Your frontend URL (e.g., `https://app.example.com`)

## Setting up Secrets

1. Go to your GitHub repository
2. Navigate to **Settings** → **Secrets and variables** → **Actions**
3. Add the following secrets (see table below for which workflows use them)

Alternatively, you can set these as **environment** variables in **Settings** → **Environments** → **production** (or the environment name used in the workflows).

## Webhook Payload Format

**Backend deploy** sends:

```json
{
  "ref": "refs/heads/main",
  "sha": "abc123...",
  "actor": "github-username",
  "repository": "username/repo",
  "workflow_run_id": "12345678"
}
```

**Frontend deploy** sends:

```json
{
  "ref": "refs/heads/main",
  "sha": "abc123...",
  "actor": "github-username"
}
```

## Workflow Patterns

These workflows follow the patterns from the easyport project:
- Manual triggers (`workflow_dispatch`) are preferred over automatic triggers
- Environment variables defined at top with `env:` section
- Secrets accessed via `secrets.NAME` with fallbacks
- Health checks have retry logic with clear emoji-based output
- Summary steps using `$GITHUB_STEP_SUMMARY` for GitHub Actions UI
- Clear error messages and status indicators (✅/❌/⚠️)
