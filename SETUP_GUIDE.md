# Setup Guide: Angular + Firebase CI/CD Pipeline

This document provides step-by-step instructions for setting up a complete CI/CD infrastructure for an Angular application with Firebase Hosting and Cloud Functions.

---

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [GitHub Repository Setup](#github-repository-setup)
3. [Firebase Project Setup](#firebase-project-setup)
4. [Service Account Configuration](#service-account-configuration)
5. [GitHub Secrets Configuration](#github-secrets-configuration)
6. [Project Configuration](#project-configuration)
7. [Verify Deployment](#verify-deployment)
8. [CI/CD Workflow Behavior](#cicd-workflow-behavior)
9. [Troubleshooting](#troubleshooting)

---

## Prerequisites

- Google Account with access to Google Cloud Console
- GitHub Account with repository creation permissions
- Basic understanding of Git commands
- **Credit/Debit card for Firebase Blaze plan** (required for Cloud Functions)
  - Note: Blaze plan is pay-as-you-go with generous free tiers
  - Typical cost for small projects: $0/month (within free tier)

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

---

## Firebase Project Setup

### Step 1: Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Click **Create a project** (or **Add project**)
3. Enter your project name
4. Choose whether to enable Google Analytics (optional)
5. Click **Create project**
6. Wait for project creation to complete
7. **Note down the Project ID** (visible in Project Settings) - you'll need this later

### Step 2: Upgrade to Blaze Plan (Required for Functions)

⚠️ **IMPORTANT**: Firebase Functions require the **Blaze (pay-as-you-go)** billing plan. The free Spark plan does NOT support Cloud Functions.

#### Upgrade via Firebase Console

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Select your project
3. In the left sidebar, click on the **gear icon** ⚙️ → **Usage and billing**
4. Click on **Details & settings**
5. Click **Modify plan**
6. Select **Blaze (pay as you go)**
7. Follow the prompts to:
   - Add or select a billing account
   - Set a budget alert (recommended)
8. Click **Purchase**

#### Verify Billing is Active

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Select your project
3. Go to **Billing**
4. Confirm a billing account is linked and active

#### Cost Considerations

The Blaze plan is pay-as-you-go with generous free tiers:

| Service | Free Tier (per month) |
|---------|----------------------|
| Cloud Functions Invocations | 2 million |
| Cloud Functions GB-seconds | 400,000 |
| Firebase Hosting Storage | 10 GB |
| Firebase Hosting Transfer | 360 MB/day |

💡 **Tip**: Set up budget alerts in Google Cloud Console to monitor spending.

---

## Service Account Configuration

### Step 1: Locate Firebase Service Account

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Select your Firebase project
3. Navigate to **IAM & Admin** → **Service Accounts**
4. Find the service account named: `firebase-adminsdk-xxxxx@<your-project-id>.iam.gserviceaccount.com`
   - This is auto-created when you create a Firebase project

### Step 2: Assign Required Roles

1. Go to **IAM & Admin** → **IAM**
2. Find the Firebase Admin SDK service account (the one from Step 1)
3. Click the **Edit** (pencil) icon
4. Add the following roles by clicking **+ Add another role**:

| Role | Purpose |
|------|---------|
| **Firebase Admin SDK Administrator** | Firebase SDK access |
| **Service Account Token Creator** | Create authentication tokens |
| **Editor** | General project access (includes most needed permissions) |

5. Click **Save**

**Alternative (More Granular Permissions)**:

If you prefer least-privilege access instead of Editor role, use these roles:

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

### Step 3: Create Service Account Key

1. Go to **IAM & Admin** → **Service Accounts**
2. Click on the Firebase Admin SDK service account
3. Go to **Keys** tab
4. Click **Add Key** → **Create new key**
5. Select **JSON** format
6. Click **Create**
7. **Save the downloaded JSON file securely** - you'll need it for GitHub

⚠️ **SECURITY WARNING**: 
- Never commit this key to version control
- Never share this key publicly
- Store it securely and delete local copy after adding to GitHub Secrets

---

## GitHub Secrets Configuration

### Add Firebase Service Account Secret

1. Go to your GitHub repository
2. Click **Settings** → **Secrets and variables** → **Actions**
3. Click **New repository secret**
4. Configure:
   - **Name**: `FIREBASE_SERVICE_ACCOUNT`
   - **Secret**: Paste the **entire contents** of the downloaded JSON key file
5. Click **Add secret**

### Verification Checklist

Ensure the secret value:
- ✅ Starts with `{`
- ✅ Ends with `}`
- ✅ Contains no extra whitespace before or after the JSON
- ✅ Is the complete JSON (not truncated)

---

## Project Configuration

Before deploying, update the project configuration files with your Firebase Project ID.

### Step 1: Update `.firebaserc`

Edit the `.firebaserc` file in the project root:

```json
{
  "projects": {
    "default": "<your-firebase-project-id>"
  }
}
```

**Replace** `<your-firebase-project-id>` with your actual Firebase Project ID.

### Step 2: Update GitHub Actions Workflow

Edit `.github/workflows/firebase-deploy.yml` and find the PR preview section:

```yaml
# Deploy preview for Pull Requests (hosting only)
- name: Deploy PR Preview
  if: github.event_name == 'pull_request'
  uses: FirebaseExtended/action-hosting-deploy@v0
  with:
    repoToken: '${{ secrets.GITHUB_TOKEN }}'
    firebaseServiceAccount: '${{ secrets.FIREBASE_SERVICE_ACCOUNT }}'
    projectId: <your-firebase-project-id>    # ← Update this line
    expires: 7d
    channelId: pr-${{ github.event.pull_request.number }}
```

**Replace** `<your-firebase-project-id>` with your actual Firebase Project ID.

### Step 3: Commit and Push Changes

```bash
git add .firebaserc .github/workflows/firebase-deploy.yml
git commit -m "Configure Firebase project ID"
git push origin main
```

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
4. Wait for all steps to complete (green checkmarks)

### Check Live URLs

After successful deployment, your app will be available at:

| Resource | URL |
|----------|-----|
| Web App | `https://<your-project-id>.web.app` |
| Web App (alt) | `https://<your-project-id>.firebaseapp.com` |
| API Users | `https://<your-project-id>.web.app/api/users` |
| API Health | `https://<your-project-id>.web.app/api/health` |

---

## CI/CD Workflow Behavior

### On Push to Main Branch

When code is pushed/merged to `main`:

| Step | Action |
|------|--------|
| 1 | ✅ Checkout code |
| 2 | ✅ Setup Node.js 20 |
| 3 | ✅ Install frontend dependencies |
| 4 | ✅ Build Angular app |
| 5 | ✅ Install functions dependencies |
| 6 | ✅ Deploy to Firebase Hosting (production) |
| 7 | ✅ Deploy Firebase Functions (production) |

### On Pull Request to Main Branch

When a PR is created targeting `main`:

| Step | Action |
|------|--------|
| 1 | ✅ Checkout code |
| 2 | ✅ Setup Node.js 20 |
| 3 | ✅ Install frontend dependencies |
| 4 | ✅ Build Angular app |
| 5 | ✅ Install functions dependencies |
| 6 | ✅ Create Preview Channel (temporary hosting URL) |
| 7 | ⏭️ Functions are NOT deployed (to protect production) |

The preview URL will be posted as a comment on the PR and expires after **7 days**.

---

## Troubleshooting

### Common Errors and Solutions

| Error | Solution |
|-------|----------|
| `CREDENTIALS_MISSING` | Re-check the service account JSON in GitHub Secrets. Ensure it's complete and properly formatted. |
| `Cloud Billing API not enabled` | Enable Cloud Billing API in Google Cloud Console → APIs & Services → Library |
| `Permission denied` | Add missing roles to the service account in IAM |
| `npm ci requires lock file` | The workflow uses `npm install` instead, which doesn't require a lock file |
| `Functions deployment failed` | Ensure Blaze plan is active and billing account is linked |
| `HTTP 401 Unauthorized` | Regenerate service account key and update GitHub Secret |

### Re-running Failed Workflows

1. Go to GitHub **Actions** tab
2. Click on the failed workflow run
3. Click **Re-run all jobs**

### Checking Logs

1. Go to GitHub **Actions** tab
2. Click on the workflow run
3. Click on the failed step to expand logs
4. Look for error messages at the bottom

---

## Project Files Reference

### Key Configuration Files

| File | Purpose |
|------|---------|
| `.github/workflows/firebase-deploy.yml` | CI/CD workflow definition |
| `firebase.json` | Firebase hosting and functions configuration |
| `.firebaserc` | Firebase project ID mapping |
| `functions/src/index.ts` | API endpoint definitions |
| `angular.json` | Angular CLI configuration |

---

## Additional Resources

- [Firebase Documentation](https://firebase.google.com/docs)
- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Google Cloud IAM Documentation](https://cloud.google.com/iam/docs)
- [Angular Documentation](https://angular.dev)

---

*Document Version: 1.0 | Last Updated: December 2024*
