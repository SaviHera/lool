# Setup Guide: Angular + Firebase CI/CD Pipeline

This document provides step-by-step instructions for setting up the complete CI/CD infrastructure for the Lool Angular application with Firebase.

---

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [GitHub Repository Setup](#github-repository-setup)
3. [Firebase Project Setup](#firebase-project-setup)
4. [Service Account Configuration](#service-account-configuration)
5. [GitHub Secrets Configuration](#github-secrets-configuration)
6. [Verify Deployment](#verify-deployment)
7. [CI/CD Workflow Behavior](#cicd-workflow-behavior)

---

## Prerequisites

- Google Account with access to Google Cloud Console
- GitHub Account with repository creation permissions
- Basic understanding of Git commands

---

## GitHub Repository Setup

### Step 1: Create Repository

1. Go to [GitHub](https://github.com) and sign in
2. Click the **+** icon (top right) → **New repository**
3. Configure repository:
   - **Repository name**: `lool` (or your preferred name)
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

---

## Firebase Project Setup

### Step 1: Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Click **Create a project** (or **Add project**)
3. Enter project name (e.g., `looool`)
4. Choose whether to enable Google Analytics (optional)
5. Click **Create project**
6. Wait for project creation to complete
7. Note down the **Project ID** (visible in Project Settings)

### Step 2: Enable Required APIs

Go to [Google Cloud Console](https://console.cloud.google.com) and select your Firebase project.

Enable the following APIs (APIs & Services → Library → Search & Enable):

| API Name | Purpose |
|----------|---------|
| Cloud Functions API | Deploy Firebase Functions |
| Cloud Build API | Build Functions |
| Cloud Run API | Run Functions v2 |
| Artifact Registry API | Store Function containers |
| Firebase Hosting API | Deploy web app |
| Cloud Billing API | Billing verification |
| Eventarc API | Functions event handling |
| Pub/Sub API | Functions messaging |

**Quick Links** (replace `PROJECT_ID` with your project ID):
- https://console.cloud.google.com/apis/library/cloudfunctions.googleapis.com?project=PROJECT_ID
- https://console.cloud.google.com/apis/library/cloudbuild.googleapis.com?project=PROJECT_ID
- https://console.cloud.google.com/apis/library/run.googleapis.com?project=PROJECT_ID
- https://console.cloud.google.com/apis/library/artifactregistry.googleapis.com?project=PROJECT_ID
- https://console.cloud.google.com/apis/library/firebasehosting.googleapis.com?project=PROJECT_ID
- https://console.cloud.google.com/apis/library/cloudbilling.googleapis.com?project=PROJECT_ID

### Step 3: Set Up Billing

1. In Google Cloud Console, go to **Billing**
2. Link a billing account to your project
3. Firebase Functions require a Blaze (pay-as-you-go) plan

---

## Service Account Configuration

### Step 1: Locate Firebase Service Account

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Select your Firebase project
3. Navigate to **IAM & Admin** → **Service Accounts**
4. Find the service account named: `firebase-adminsdk-xxxxx@<project-id>.iam.gserviceaccount.com`

### Step 2: Assign Required Roles

1. Go to **IAM & Admin** → **IAM**
2. Find the Firebase Admin SDK service account
3. Click the **Edit** (pencil) icon
4. Add the following roles by clicking **+ Add another role**:

| Role | Purpose |
|------|---------|
| **Firebase Admin SDK Administrator** | Firebase SDK access |
| **Service Account Token Creator** | Create authentication tokens |
| **Editor** | General project access (includes most needed permissions) |

**Alternative (More Granular Permissions)**:

If you prefer least-privilege access instead of Editor role:

| Role | Purpose |
|------|---------|
| Firebase Admin SDK Administrator | Firebase SDK access |
| Service Account Token Creator | Create authentication tokens |
| Service Account User | Run functions as service account |
| Cloud Functions Admin | Deploy Cloud Functions |
| Cloud Run Admin | Deploy Cloud Run services |
| Artifact Registry Writer | Push container images |
| Cloud Build Editor | Build functions |
| Firebase Hosting Admin | Deploy hosting |
| Storage Admin | Upload function code |
| Billing Account Viewer | Check billing status |

5. Click **Save**

### Step 3: Create Service Account Key

1. Go to **IAM & Admin** → **Service Accounts**
2. Click on the Firebase Admin SDK service account
3. Go to **Keys** tab
4. Click **Add Key** → **Create new key**
5. Select **JSON** format
6. Click **Create**
7. **Save the downloaded JSON file securely** - you'll need it for GitHub

⚠️ **IMPORTANT**: 
- Never commit this key to version control
- Never share this key publicly
- Store it securely and delete after adding to GitHub Secrets

---

## GitHub Secrets Configuration

### Step 1: Add Firebase Service Account Secret

1. Go to your GitHub repository
2. Click **Settings** → **Secrets and variables** → **Actions**
3. Click **New repository secret**
4. Configure:
   - **Name**: `FIREBASE_SERVICE_ACCOUNT`
   - **Secret**: Paste the **entire contents** of the downloaded JSON key file
5. Click **Add secret**

### Verification

Ensure the secret value:
- Starts with `{`
- Ends with `}`
- Contains no extra whitespace before/after
- Is the complete JSON (not truncated)

---

## Verify Deployment

### Trigger Deployment

Push any change to the `main` branch to trigger deployment:

```bash
git add .
git commit -m "Trigger deployment"
git push origin main
```

### Monitor Deployment

1. Go to your GitHub repository
2. Click **Actions** tab
3. Watch the "Deploy to Firebase" workflow

### Check Live URLs

After successful deployment:

| Resource | URL |
|----------|-----|
| Web App | `https://<project-id>.web.app` |
| Web App (alt) | `https://<project-id>.firebaseapp.com` |
| API Users | `https://<project-id>.web.app/api/users` |
| API Health | `https://<project-id>.web.app/api/health` |

---

## CI/CD Workflow Behavior

### On Push to Main Branch

When code is pushed/merged to `main`:
1. ✅ Checkout code
2. ✅ Setup Node.js 20
3. ✅ Install frontend dependencies
4. ✅ Build Angular app
5. ✅ Install functions dependencies
6. ✅ Deploy to Firebase Hosting (production)
7. ✅ Deploy Firebase Functions (production)

### On Pull Request to Main Branch

When a PR is created targeting `main`:
1. ✅ Checkout code
2. ✅ Setup Node.js 20
3. ✅ Install frontend dependencies
4. ✅ Build Angular app
5. ✅ Install functions dependencies
6. ✅ Create Preview Channel (temporary hosting URL)
7. ⏭️ Functions are NOT deployed (to protect production)

The preview URL will be posted as a comment on the PR and expires after **7 days**.

---

## Troubleshooting

### Common Issues

| Error | Solution |
|-------|----------|
| `CREDENTIALS_MISSING` | Re-check the service account JSON in GitHub Secrets |
| `Cloud Billing API not enabled` | Enable Cloud Billing API in Google Cloud Console |
| `Permission denied` | Add missing roles to service account |
| `npm ci requires lock file` | Workflow uses `npm install` instead |
| `Functions deployment failed` | Ensure Blaze plan is active |

### Re-running Failed Workflows

1. Go to GitHub **Actions** tab
2. Click on the failed workflow run
3. Click **Re-run all jobs**

---

## Project Configuration Files

### Key Files

| File | Purpose |
|------|---------|
| `.github/workflows/firebase-deploy.yml` | CI/CD workflow definition |
| `firebase.json` | Firebase hosting and functions config |
| `.firebaserc` | Firebase project ID mapping |
| `functions/src/index.ts` | API endpoint definitions |

### Updating Project ID

If using a different Firebase project, update:

1. **`.firebaserc`**:
```json
{
  "projects": {
    "default": "your-project-id"
  }
}
```

2. **`.github/workflows/firebase-deploy.yml`** (PR preview section):
```yaml
projectId: your-project-id
```

---

## Support

For issues with:
- **Firebase**: [Firebase Documentation](https://firebase.google.com/docs)
- **GitHub Actions**: [GitHub Actions Documentation](https://docs.github.com/en/actions)
- **Google Cloud IAM**: [IAM Documentation](https://cloud.google.com/iam/docs)

---

*Last Updated: December 2024*

