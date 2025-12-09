# Lool - Angular + Firebase CI/CD Demo

A simple Angular 19 application with Firebase Functions backend, demonstrating CI/CD pipeline with GitHub Actions.

## Project Structure

```
├── src/                          # Angular frontend source
│   ├── app/
│   │   ├── app.component.ts      # Main app component
│   │   ├── app.component.html    # App template
│   │   ├── app.component.css     # App styles
│   │   ├── app.config.ts         # App configuration
│   │   └── app.routes.ts         # Routing configuration
│   ├── index.html
│   ├── main.ts
│   └── styles.css                # Global styles
├── functions/                    # Firebase Functions backend
│   ├── src/
│   │   └── index.ts              # API endpoints
│   ├── package.json
│   └── tsconfig.json
├── .github/workflows/
│   └── firebase-deploy.yml       # GitHub Actions CI/CD
├── firebase.json                 # Firebase configuration
├── .firebaserc                   # Firebase project settings
├── angular.json                  # Angular CLI configuration
└── package.json
```

## Features

- **Angular 19** with standalone components and new control flow syntax
- **Firebase Functions** backend with mock data API
- **GitHub Actions** CI/CD pipeline
- **Firebase Hosting** with preview channels for PRs

## API Endpoints

- `GET /api/users` - Returns mock user data
- `GET /api/health` - Health check endpoint

## CI/CD Pipeline

### On Pull Request
- Builds the Angular app
- Creates a preview deployment on Firebase Hosting
- Preview URL expires after 7 days

### On Merge to Main
- Builds the Angular app
- Deploys both hosting and functions to production

## Local Development

### Prerequisites
- Node.js 20+
- Firebase CLI (`npm install -g firebase-tools`)

### Setup

1. Install dependencies:
   ```bash
   npm install
   cd functions && npm install && cd ..
   ```

2. Start the Angular dev server:
   ```bash
   npm start
   ```

3. For Firebase emulators (optional):
   ```bash
   firebase emulators:start
   ```

## Deployment

Deployment is handled automatically via GitHub Actions:

1. Create a PR → Preview deployment
2. Merge to main → Production deployment

## Firebase Project

- **Project Name**: looool
- **Project ID**: looool-e6441

## GitHub Secrets Required

- `FIREBASE_SERVICE_ACCOUNT`: Firebase service account JSON key

