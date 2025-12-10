# Setup Guide: Angular + Firebase CI/CD Pipeline

This document provides step-by-step instructions for setting up a complete CI/CD infrastructure for an Angular application with Firebase Hosting and Cloud Functions, featuring **multi-environment deployment** (Development → Pre-Production → Production).

---

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Architecture Overview](#architecture-overview)
3. [GitHub Repository Setup](#github-repository-setup)
4. [Firebase Projects Setup](#firebase-projects-setup)
5. [Service Account Configuration](#service-account-configuration)
6. [GitHub Configuration](#github-configuration)
7. [Project Configuration Files](#project-configuration-files)
8. [Verify Deployment](#verify-deployment)
9. [Code Promotion Flow](#code-promotion-flow)
10. [CI/CD Workflow Behavior](#cicd-workflow-behavior)
11. [Troubleshooting](#troubleshooting)

---

## Prerequisites

- Google Account with access to Google Cloud Console
- GitHub Account with repository creation permissions
- Basic understanding of Git commands
- **Credit/Debit card for Firebase Blaze plan** (required for Cloud Functions)
  - Note: Blaze plan is pay-as-you-go with generous free tiers
  - Typical cost for small projects: $0/month (within free tier)
  - Required for **each** Firebase project (DEV, PREPROD, PROD)

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────────┐
│                         GitHub Repository                            │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│   feature/* ──PR──► developer ────► DEV Firebase Project            │
│                         │                                            │
│                         ▼ (PR + Approval)                           │
│                     preprod ──────► PREPROD Firebase Project        │
│                         │                                            │
│                         ▼ (PR + Approval)                           │
│                      main ────────► PROD Firebase Project           │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

| Environment | Branch | Firebase Project | Purpose |
|-------------|--------|------------------|---------|
| Development | `developer` | `<app>-dev` | Developer testing |
| Pre-Production | `preprod` | `<app>-preprod` | QA/Tester validation |
| Production | `main` | `<app>-prod` | Live users |

---

## GitHub Repository Setup

### Step 1: Create Repository

1. Go to [GitHub](https://github.com) and sign in
2. Click the **+** icon (top right) → **New repository**
3. Configure repository:
   - **Repository name**: Enter your preferred project name
   - **Visibility**: Public or Private
   - **Initialize**: Do NOT add README, .gitignore, or license (we'll push existing code)
4. Click **Create repository**
5. Note down the repository URL: `https://github.com/<username>/<repo-name>.git`

### Step 2: Push Code to Repository

```bash
# Navigate to project directory
cd /path/to/project

# Initialize git (if not already)
git init

# Add all files
git add .

# Commit
git commit -m "Initial commit"

# Set main branch
git branch -M main

# Add remote origin
git remote add origin https://github.com/<username>/<repo-name>.git

# Push to GitHub
git push -u origin main
```

### Step 3: Create Environment Branches

After pushing to `main`, create the environment branches:

**Via GitHub UI:**
1. Go to your repository on GitHub
2. Click the branch dropdown (shows `main`)
3. Type `developer` in the search box
4. Click **"Create branch: developer from main"**
5. Repeat for `preprod` branch

**Or via Git commands:**
```bash
# Create developer branch
git checkout -b developer
git push -u origin developer

# Create preprod branch
git checkout main
git checkout -b preprod
git push -u origin preprod

# Return to developer for day-to-day work
git checkout developer
```

---

## Firebase Projects Setup

You need to create **3 separate Firebase projects** - one for each environment.

### Step 1: Create Firebase Projects

Repeat these steps **3 times** for DEV, PREPROD, and PROD:

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Click **Create a project** (or **Add project**)
3. Enter project name using this naming convention:
   - DEV: `<your-app-name>-dev`
   - PREPROD: `<your-app-name>-preprod`
   - PROD: `<your-app-name>-prod`
4. Choose whether to enable Google Analytics (optional)
5. Click **Create project**
6. **Note down each Project ID** - you'll need these later

| Environment | Example Project Name | Example Project ID |
|-------------|---------------------|-------------------|
| DEV | myapp-dev | myapp-dev-12345 |
| PREPROD | myapp-preprod | myapp-preprod-67890 |
| PROD | myapp-prod | myapp-prod-11111 |

### Step 2: Upgrade Each Project to Blaze Plan

⚠️ **IMPORTANT**: Firebase Functions require the **Blaze (pay-as-you-go)** billing plan. Repeat for **each** project.

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Select the project
3. In the left sidebar, click on the **gear icon** ⚙️ → **Usage and billing**
4. Click on **Details & settings**
5. Click **Modify plan**
6. Select **Blaze (pay as you go)**
7. Follow the prompts to:
   - Add or select a billing account
   - Set a budget alert (recommended)
8. Click **Purchase**

**Repeat for all 3 projects** (DEV, PREPROD, PROD).

### Cost Considerations

The Blaze plan is pay-as-you-go with generous free tiers per project:

| Service | Free Tier (per month) |
|---------|----------------------|
| Cloud Functions Invocations | 2 million |
| Cloud Functions GB-seconds | 400,000 |
| Firebase Hosting Storage | 10 GB |
| Firebase Hosting Transfer | 360 MB/day |

💡 **Tip**: Set up budget alerts in Google Cloud Console to monitor spending for each project.

---

## Service Account Configuration

Configure service accounts for **each** Firebase project (DEV, PREPROD, PROD).

### Step 1: Locate Firebase Service Account

For each project:

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Select the Firebase project from the dropdown
3. Navigate to **IAM & Admin** → **Service Accounts**
4. Find the service account named: `firebase-adminsdk-xxxxx@<project-id>.iam.gserviceaccount.com`

### Step 2: Assign Required Roles

For each project's service account:

1. Go to **IAM & Admin** → **IAM**
2. Find the Firebase Admin SDK service account
3. Click the **Edit** (pencil) icon
4. Add the following roles by clicking **+ Add another role**:

| # | Role | Purpose |
|---|------|---------|
| 1 | **Editor** | GCP resources access (Cloud Functions, Cloud Run, Storage, etc.) |
| 2 | **Firebase Admin** | Full access to Firebase products |
| 3 | **Firebase Admin SDK Administrator** | Firebase SDK read/write access |
| 4 | **Service Account Token Creator** | Create OAuth2 tokens, sign blobs/JWTs |

5. Click **Save**

⚠️ **Note**: All 4 roles are required. The Editor role alone is NOT sufficient.

**Repeat for all 3 projects.**

### Step 3: Create Service Account Keys

For each project:

1. Go to **IAM & Admin** → **Service Accounts**
2. Click on the Firebase Admin SDK service account
3. Go to **Keys** tab
4. Click **Add Key** → **Create new key**
5. Select **JSON** format
6. Click **Create**
7. Save the downloaded JSON file with a clear name:
   - `service-account-dev.json`
   - `service-account-preprod.json`
   - `service-account-prod.json`

⚠️ **SECURITY WARNING**: 
- Never commit these keys to version control
- Never share these keys publicly
- Store securely and delete local copies after adding to GitHub Secrets

---

## GitHub Configuration

### Step 1: Add GitHub Secrets

Go to: **Repository** → **Settings** → **Secrets and variables** → **Actions**

Click **New repository secret** and add these 3 secrets:

| Secret Name | Value |
|-------------|-------|
| `FIREBASE_SA_DEV` | Paste entire contents of `service-account-dev.json` |
| `FIREBASE_SA_PREPROD` | Paste entire contents of `service-account-preprod.json` |
| `FIREBASE_SA_PROD` | Paste entire contents of `service-account-prod.json` |

**Verification Checklist** for each secret:
- ✅ Starts with `{`
- ✅ Ends with `}`
- ✅ No extra whitespace before or after
- ✅ Complete JSON (not truncated)

### Step 2: Create GitHub Environments

Go to: **Repository** → **Settings** → **Environments**

Create 3 environments:

#### Environment 1: `development`
1. Click **New environment**
2. Name: `development`
3. Click **Configure environment**
4. No additional settings needed (auto-deploys)
5. Click **Save protection rules**

#### Environment 2: `preprod`
1. Click **New environment**
2. Name: `preprod`
3. Click **Configure environment**
4. Under **Deployment protection rules**:
   - ✅ Check **Required reviewers**
   - Add team members who can approve preprod deployments
5. Click **Save protection rules**

#### Environment 3: `production`
1. Click **New environment**
2. Name: `production`
3. Click **Configure environment**
4. Under **Deployment protection rules**:
   - ✅ Check **Required reviewers**
   - Add team leads/managers who can approve production
   - (Optional) ✅ Check **Wait timer** and set 5-10 minutes
5. Click **Save protection rules**

### Step 3: Set Branch Protection Rules

Go to: **Repository** → **Settings** → **Branches** → **Add branch protection rule**

#### For `developer` branch:
- **Branch name pattern**: `developer`
- ✅ Require a pull request before merging
- ✅ Require approvals: `1`
- Click **Create**

#### For `preprod` branch:
- **Branch name pattern**: `preprod`
- ✅ Require a pull request before merging
- ✅ Require approvals: `1` or `2`
- Click **Create**

#### For `main` branch:
- **Branch name pattern**: `main`
- ✅ Require a pull request before merging
- ✅ Require approvals: `2`
- ✅ Dismiss stale pull request approvals when new commits are pushed
- Click **Create**

---

## Project Configuration Files

### Step 1: Update `.firebaserc`

Edit the `.firebaserc` file in the project root:

```json
{
  "projects": {
    "dev": "<your-dev-project-id>",
    "preprod": "<your-preprod-project-id>",
    "prod": "<your-prod-project-id>",
    "default": "<your-dev-project-id>"
  }
}
```

**Replace** the placeholder values with your actual Firebase Project IDs.

### Step 2: Update GitHub Actions Workflow

Create/Edit `.github/workflows/firebase-deploy.yml` with the following content:

```yaml
name: Deploy to Firebase

on:
  push:
    branches:
      - developer
      - preprod
      - main
  pull_request:
    branches:
      - developer
      - preprod
      - main

env:
  # ============================================
  # UPDATE THESE WITH YOUR FIREBASE PROJECT IDs
  # ============================================
  FIREBASE_PROJECT_DEV: <your-dev-project-id>
  FIREBASE_PROJECT_PREPROD: <your-preprod-project-id>
  FIREBASE_PROJECT_PROD: <your-prod-project-id>

jobs:
  # ============================================
  # BUILD JOB
  # ============================================
  build:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout repository
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'

      - name: Install frontend dependencies
        run: npm install

      - name: Build frontend
        run: npm run build

      - name: Install functions dependencies
        run: cd functions && npm install

      - name: Upload build artifacts
        uses: actions/upload-artifact@v4
        with:
          name: build-output
          path: |
            dist/
            functions/

  # ============================================
  # DEVELOPMENT DEPLOYMENT
  # ============================================
  deploy-dev:
    needs: build
    if: github.event_name == 'push' && github.ref == 'refs/heads/developer'
    runs-on: ubuntu-latest
    environment: development
    steps:
      - name: Checkout repository
        uses: actions/checkout@v4

      - name: Download build artifacts
        uses: actions/download-artifact@v4
        with:
          name: build-output

      - name: Deploy to DEV
        uses: w9jds/firebase-action@master
        with:
          args: deploy --only hosting,functions --force --project ${{ env.FIREBASE_PROJECT_DEV }}
        env:
          GCP_SA_KEY: ${{ secrets.FIREBASE_SA_DEV }}

  # ============================================
  # PRE-PRODUCTION DEPLOYMENT
  # ============================================
  deploy-preprod:
    needs: build
    if: github.event_name == 'push' && github.ref == 'refs/heads/preprod'
    runs-on: ubuntu-latest
    environment: preprod
    steps:
      - name: Checkout repository
        uses: actions/checkout@v4

      - name: Download build artifacts
        uses: actions/download-artifact@v4
        with:
          name: build-output

      - name: Deploy to PREPROD
        uses: w9jds/firebase-action@master
        with:
          args: deploy --only hosting,functions --force --project ${{ env.FIREBASE_PROJECT_PREPROD }}
        env:
          GCP_SA_KEY: ${{ secrets.FIREBASE_SA_PREPROD }}

  # ============================================
  # PRODUCTION DEPLOYMENT
  # ============================================
  deploy-prod:
    needs: build
    if: github.event_name == 'push' && github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest
    environment: production
    steps:
      - name: Checkout repository
        uses: actions/checkout@v4

      - name: Download build artifacts
        uses: actions/download-artifact@v4
        with:
          name: build-output

      - name: Deploy to PRODUCTION
        uses: w9jds/firebase-action@master
        with:
          args: deploy --only hosting,functions --force --project ${{ env.FIREBASE_PROJECT_PROD }}
        env:
          GCP_SA_KEY: ${{ secrets.FIREBASE_SA_PROD }}

  # ============================================
  # PR PREVIEW (Deploys to DEV project)
  # ============================================
  deploy-preview:
    needs: build
    if: github.event_name == 'pull_request'
    runs-on: ubuntu-latest
    permissions:
      checks: write
      contents: read
      pull-requests: write
    steps:
      - name: Checkout repository
        uses: actions/checkout@v4

      - name: Download build artifacts
        uses: actions/download-artifact@v4
        with:
          name: build-output

      - name: Deploy PR Preview
        uses: FirebaseExtended/action-hosting-deploy@v0
        with:
          repoToken: '${{ secrets.GITHUB_TOKEN }}'
          firebaseServiceAccount: '${{ secrets.FIREBASE_SA_DEV }}'
          projectId: ${{ env.FIREBASE_PROJECT_DEV }}
          expires: 7d
          channelId: pr-${{ github.event.pull_request.number }}
```

**Update the 3 project IDs** at the top of the file:
- `FIREBASE_PROJECT_DEV`
- `FIREBASE_PROJECT_PREPROD`
- `FIREBASE_PROJECT_PROD`

### Step 3: Commit and Push Changes

```bash
git add .firebaserc .github/workflows/firebase-deploy.yml
git commit -m "Configure multi-environment deployment"
git push origin developer
```

---

## Verify Deployment

### Test DEV Deployment

```bash
# Make sure you're on developer branch
git checkout developer

# Make a small change and push
git add .
git commit -m "Test DEV deployment"
git push origin developer
```

Check GitHub **Actions** tab - you should see deployment to DEV environment.

### Check Live URLs

After successful deployments, your apps will be available at:

| Environment | URL |
|-------------|-----|
| DEV | `https://<dev-project-id>.web.app` |
| PREPROD | `https://<preprod-project-id>.web.app` |
| PROD | `https://<prod-project-id>.web.app` |

API endpoints follow the same pattern:
- `https://<project-id>.web.app/api/users`
- `https://<project-id>.web.app/api/health`

---

## Code Promotion Flow

### Daily Development Flow

```bash
# 1. Create feature branch from developer
git checkout developer
git pull origin developer
git checkout -b feature/my-new-feature

# 2. Make changes, commit, push
git add .
git commit -m "Add new feature"
git push origin feature/my-new-feature

# 3. Create PR: feature/my-new-feature → developer
#    (Do this in GitHub UI)

# 4. After PR approval and merge → Auto-deploys to DEV
```

### Promote to Pre-Production (for Testing)

When DEV is stable and ready for testing:

**Via GitHub UI (Recommended):**
1. Go to GitHub → **Pull requests** → **New pull request**
2. Set **base**: `preprod`, **compare**: `developer`
3. Click **Create pull request**
4. Add description of changes being promoted
5. Request reviews from required approvers
6. After approval, click **Merge pull request**
7. ✅ Auto-deploys to PREPROD

**Via Git Commands:**
```bash
git checkout preprod
git pull origin preprod
git merge developer
git push origin preprod
```

### Promote to Production (Final Release)

When PREPROD testing is complete:

**Via GitHub UI (Recommended):**
1. Go to GitHub → **Pull requests** → **New pull request**
2. Set **base**: `main`, **compare**: `preprod`
3. Click **Create pull request**
4. Add release notes/description
5. Request reviews from required approvers
6. After approval, click **Merge pull request**
7. ✅ Auto-deploys to PRODUCTION (may require environment approval)

**Via Git Commands:**
```bash
git checkout main
git pull origin main
git merge preprod
git push origin main
```

### Visual Summary

```
Week 1: Development
────────────────────────────────────────────────────
feature/login ──PR──► developer ──► 🚀 DEV
feature/signup ──PR──► developer ──► 🚀 DEV

Week 2: Testing
────────────────────────────────────────────────────
developer ──PR──► preprod ──► 🚀 PREPROD
                   │
                   └── QA team tests the app

Week 3: Release
────────────────────────────────────────────────────
preprod ──PR──► main ──► 🚀 PRODUCTION
                  │
                  └── Requires approval
```

---

## CI/CD Workflow Behavior

### On Push to `developer` Branch

| Step | Action |
|------|--------|
| 1 | ✅ Checkout code |
| 2 | ✅ Setup Node.js 20 |
| 3 | ✅ Install dependencies |
| 4 | ✅ Build Angular app |
| 5 | ✅ Deploy to DEV Firebase (hosting + functions) |

### On Push to `preprod` Branch

| Step | Action |
|------|--------|
| 1 | ✅ Checkout code |
| 2 | ✅ Setup Node.js 20 |
| 3 | ✅ Install dependencies |
| 4 | ✅ Build Angular app |
| 5 | ⏸️ Wait for environment approval (if configured) |
| 6 | ✅ Deploy to PREPROD Firebase (hosting + functions) |

### On Push to `main` Branch

| Step | Action |
|------|--------|
| 1 | ✅ Checkout code |
| 2 | ✅ Setup Node.js 20 |
| 3 | ✅ Install dependencies |
| 4 | ✅ Build Angular app |
| 5 | ⏸️ Wait for environment approval (if configured) |
| 6 | ✅ Deploy to PROD Firebase (hosting + functions) |

### On Pull Request (Any Branch)

| Step | Action |
|------|--------|
| 1 | ✅ Checkout code |
| 2 | ✅ Setup Node.js 20 |
| 3 | ✅ Install dependencies |
| 4 | ✅ Build Angular app |
| 5 | ✅ Create Preview Channel on DEV project |
| 6 | ✅ Post preview URL as PR comment |

Preview URLs expire after **7 days**.

---

## Troubleshooting

### Common Errors and Solutions

| Error | Solution |
|-------|----------|
| `CREDENTIALS_MISSING` | Re-check the service account JSON in GitHub Secrets. Ensure it's complete. |
| `Cloud Billing API not enabled` | Enable Cloud Billing API in Google Cloud Console for that project. |
| `Permission denied` | Add all 4 required roles to the service account. |
| `npm ci requires lock file` | The workflow uses `npm install` instead. |
| `Functions deployment failed` | Ensure Blaze plan is active on the target project. |
| `HTTP 401 Unauthorized` | Regenerate service account key and update GitHub Secret. |
| `Environment approval pending` | Check GitHub Actions - someone needs to approve the deployment. |

### Re-running Failed Workflows

1. Go to GitHub **Actions** tab
2. Click on the failed workflow run
3. Click **Re-run all jobs**

### Checking Deployment Logs

1. Go to GitHub **Actions** tab
2. Click on the workflow run
3. Click on the specific job (deploy-dev, deploy-preprod, deploy-prod)
4. Expand failed steps to see error details

---

## Quick Reference

### GitHub Secrets

| Secret Name | Purpose |
|-------------|---------|
| `FIREBASE_SA_DEV` | Service account for DEV project |
| `FIREBASE_SA_PREPROD` | Service account for PREPROD project |
| `FIREBASE_SA_PROD` | Service account for PROD project |

### Branches

| Branch | Deploys To | Auto-Deploy |
|--------|-----------|-------------|
| `developer` | DEV | Yes |
| `preprod` | PREPROD | Yes (with approval) |
| `main` | PROD | Yes (with approval) |

### Required Service Account Roles

1. Editor
2. Firebase Admin
3. Firebase Admin SDK Administrator
4. Service Account Token Creator

---

## Additional Resources

- [Firebase Documentation](https://firebase.google.com/docs)
- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [GitHub Environments Documentation](https://docs.github.com/en/actions/deployment/targeting-different-environments)
- [Google Cloud IAM Documentation](https://cloud.google.com/iam/docs)
- [Angular Documentation](https://angular.dev)

---

*Document Version: 2.0 | Last Updated: December 2024*
