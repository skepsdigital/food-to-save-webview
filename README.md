# Angular Firebase Application

This repository contains an Angular web application configured for Firebase hosting and storage.

## Project Overview

This is an Angular application (version 14.2.x) with Firebase integration for hosting and storage capabilities.

## Prerequisites

- Node.js and npm
- Angular CLI (`npm install -g @angular/cli`)
- Firebase CLI (`npm install -g firebase-tools`)

## Getting Started

### Installation

1. Clone this repository
2. Install dependencies:

```bash
npm install
```

### Development Server

Run the development server:

```bash
ng serve
```

Navigate to `http://localhost:4200/` to view the application. The app will automatically reload if you change any of the source files.

## Building the Project

To build the project:

```bash
ng build
```

The build artifacts will be stored in the `dist/` directory.

## Running Tests

Run unit tests via [Karma](https://karma-runner.github.io):

```bash
ng test
```

## Deployment

This project is configured for Firebase deployment:

1. Make sure you're logged into Firebase CLI:
   ```bash
   firebase login
   ```

2. Deploy to Firebase:
   ```bash
   firebase deploy
   ```

## Project Structure

- `src/app/` - Application source code
- `src/assets/` - Static assets
- `src/environments/` - Environment configurations
- `.firebase/` - Firebase cache and deployment files
- `firebase.json` & `.firebaserc` - Firebase configuration

## Additional Information

For more help with Angular CLI use `ng help` or check out the [Angular CLI Documentation](https://angular.io/cli).

For Firebase documentation, visit the [Firebase Docs](https://firebase.google.com/docs).
