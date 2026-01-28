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

### `backend-deploy.yml` (Deploy - Backend)
**Triggers:** Manual trigger via `workflow_dispatch` only

**What it does:**
- Calls deployment webhook URL (configured via `PROD_BE_HOOK` secret/env)
- Sends deployment metadata (commit SHA, branch, repository, actor, etc.)
- Waits 90 seconds for deployment to complete
- Performs health check with retries
- Generates deployment summary

**Required Secrets/Environment Variables:**
- `PROD_BE_HOOK` - The webhook URL to trigger deployment on your server
- `BE_URL` - Your backend URL for health checks (e.g., `https://api.example.com`)

### `backend-health-check.yml` (Health Check)
**Triggers:**
- Manual trigger via `workflow_dispatch`
- Optional scheduled cron (commented out by default)

**What it does:**
- Checks the `/health` endpoint
- Retries up to 3 times with 10s delays
- Fails if health check doesn't return HTTP 200-299
- Generates health check summary

**Required Secrets/Environment Variables:**
- `BE_URL` - Your backend URL (e.g., `https://api.example.com`)

## Setting up Secrets

1. Go to your GitHub repository
2. Navigate to **Settings** → **Secrets and variables** → **Actions**
3. Add the following secrets:
   - `PROD_BE_HOOK` - Your deployment server webhook URL
   - `BE_URL` - Your backend URL (e.g., `https://api.example.com`)

Alternatively, you can set these as environment variables in the repository settings.

## Webhook Payload Format

The deploy workflow sends the following JSON payload to your webhook:

```json
{
  "ref": "refs/heads/main",
  "sha": "abc123...",
  "actor": "github-username",
  "repository": "username/repo",
  "workflow_run_id": "12345678"
}
```

## Workflow Patterns

These workflows follow the patterns from the easyport project:
- Manual triggers (`workflow_dispatch`) are preferred over automatic triggers
- Environment variables defined at top with `env:` section
- Secrets accessed via `secrets.NAME` or `env.NAME` with fallbacks
- Health checks have retry logic with clear emoji-based output
- Summary steps using `$GITHUB_STEP_SUMMARY` for GitHub Actions UI
- Clear error messages and status indicators (✅/❌/⚠️)
