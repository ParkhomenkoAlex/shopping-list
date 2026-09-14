# Shopping List

A shared shopping list mobile application built with **React Native, Expo, TypeScript and Supabase**.

The project supports three completely separated environments:

- **Local** — local Supabase running through Docker
- **Development** — separate Supabase Cloud project
- **Production** — separate Supabase Cloud project

The environments use different Android application IDs, so the applications can be installed independently on the same Android device.

The project also uses GitHub Actions to automatically:

- apply Supabase migrations;
- build Development APKs after changes reach `develop`;
- build Production APKs after changes reach `master`;
- generate unique Android build numbers.

---

# Table of Contents

- [1. Project Overview](#1-project-overview)
- [2. Technology Stack](#2-technology-stack)
- [3. Environment Architecture](#3-environment-architecture)
- [4. Prerequisites](#4-prerequisites)
- [5. Node.js](#5-nodejs)
- [6. pnpm](#6-pnpm)
- [7. Git](#7-git)
- [8. IntelliJ IDEA](#8-intellij-idea)
- [9. Docker Desktop](#9-docker-desktop)
- [10. Android Studio](#10-android-studio)
- [11. Android SDK](#11-android-sdk)
- [12. Android Emulator](#12-android-emulator)
- [13. ADB](#13-adb)
- [14. Clone the Project](#14-clone-the-project)
- [15. Install Dependencies](#15-install-dependencies)
- [16. Project Structure](#16-project-structure)
- [17. Environment Variables](#17-environment-variables)
- [18. Local Environment](#18-local-environment)
- [19. Development Environment](#19-development-environment)
- [20. Production Environment](#20-production-environment)
- [21. Expo Configuration](#21-expo-configuration)
- [22. Application Version and Build Number](#22-application-version-and-build-number)
- [23. Local Supabase](#23-local-supabase)
- [24. Supabase Cloud](#24-supabase-cloud)
- [25. Supabase Values and Credentials](#25-supabase-values-and-credentials)
- [26. Database Migrations](#26-database-migrations)
- [27. Migration Development Workflow](#27-migration-development-workflow)
- [28. Running the App on Android Emulator](#28-running-the-app-on-android-emulator)
- [29. Running the App on a Physical Android Phone with Expo Go](#29-running-the-app-on-a-physical-android-phone-with-expo-go)
- [30. Expo Go vs APK](#30-expo-go-vs-apk)
- [31. Fast Refresh](#31-fast-refresh)
- [32. Debugging](#32-debugging)
- [33. Testing Supabase from the App](#33-testing-supabase-from-the-app)
- [34. Building Standalone APKs](#34-building-standalone-apks)
- [35. Installing APKs on a Physical Android Device](#35-installing-apks-on-a-physical-android-device)
- [36. Git Workflow](#36-git-workflow)
- [37. GitHub Actions](#37-github-actions)
- [38. GitHub Secrets](#38-github-secrets)
- [39. SourceTree](#39-sourcetree)
- [40. Security](#40-security)
- [41. Troubleshooting](#41-troubleshooting)
- [42. Production Safety](#42-production-safety)
- [43. First-Time Setup Checklist](#43-first-time-setup-checklist)
- [44. Useful Commands](#44-useful-commands)

---

# 1. Project Overview

Shopping List is a React Native mobile application for creating and sharing shopping lists.

The application is designed around a simple CRUD workflow:

- create a list;
- add items;
- edit items;
- mark items as completed;
- delete items;
- share the same list with another person.

The application does not use a predefined product catalog or predefined categories.

The initial database contains a `lists` table.

Additional tables, such as `list_items`, can be added later through Supabase migrations.

---

# 2. Technology Stack

The project uses:

- React Native
- Expo
- Expo Router
- TypeScript
- pnpm
- Supabase
- PostgreSQL
- Supabase CLI
- Docker
- Android Studio
- Android SDK
- Android Emulator
- ADB
- Git
- GitHub
- GitHub Actions
- SourceTree
- IntelliJ IDEA

---

# 3. Environment Architecture

The project has three completely separated environments.

```text
                         GitHub
                            │
              ┌─────────────┴─────────────┐
              │                           │
           develop                      master
              │                           │
              ▼                           ▼
       Development DB              Production DB
       Supabase Cloud              Supabase Cloud
              ▲                           ▲
              │                           │
          SL-Dev                      SL-Prod
```

Local development is completely separate:

```text
SL-Local
   │
   ▼
Local Supabase
   │
   ▼
Docker
   │
   ▼
Local PostgreSQL
```

## Environment matrix

| Environment | App Name   | Android Package                    | Database             |
| ----------- | ---------- | ---------------------------------- | -------------------- |
| Local       | `SL-Local` | `com.anonymous.shoppinglist.local` | Local Supabase       |
| Development | `SL-Dev`   | `com.anonymous.shoppinglist.dev`   | Supabase Development |
| Production  | `SL-Prod`  | `com.anonymous.shoppinglist`       | Supabase Production  |

Because the package IDs are different, Local, Development and Production can be installed independently on the same Android device.

---

# 4. Prerequisites

Before starting, install:

1. Node.js
2. pnpm
3. Git
4. IntelliJ IDEA
5. Docker Desktop
6. Android Studio
7. Android SDK
8. Android Emulator
9. Supabase CLI

You also need:

- access to the GitHub repository;
- access to the Supabase organization/projects;
- an Android Emulator or physical Android device.

For Development and Production, you need access to the corresponding Supabase Cloud projects.

---

# 5. Node.js

Check whether Node.js is installed:

```bash
node --version
```

The project was developed and tested with Node.js 22.

If Node.js is not installed, download it from:

https://nodejs.org/

After installation:

```bash
node --version
```

---

# 6. pnpm

Check:

```bash
pnpm --version
```

If pnpm is not installed:

```bash
npm install -g pnpm
```

Verify:

```bash
pnpm --version
```

The project currently uses pnpm 10.x.

---

# 7. Git

Check:

```bash
git --version
```

If Git is not installed on macOS, install the Xcode Command Line Tools:

```bash
xcode-select --install
```

Then verify:

```bash
git --version
```

---

# 8. IntelliJ IDEA

The project is developed using IntelliJ IDEA.

Download:

https://www.jetbrains.com/idea/

After installation:

1. Open IntelliJ IDEA.
2. Open the `shopping-list` project.
3. Use the integrated terminal for project commands.
4. Use IntelliJ for editing TypeScript, React Native and configuration files.

---

# 9. Docker Desktop

Local Supabase runs inside Docker.

Download Docker Desktop:

https://www.docker.com/products/docker-desktop/

Install and start Docker Desktop.

Verify:

```bash
docker --version
```

Docker must be running before starting Local Supabase.

---

# 10. Android Studio

Android Studio is required for:

- Android SDK;
- Android build tools;
- Android Emulator;
- AVD management;
- Android debugging;
- ADB.

Download:

https://developer.android.com/studio

Install Android Studio normally.

---

# 11. Android SDK

Open Android Studio.

Go to:

```text
Android Studio
→ Settings
→ Languages & Frameworks
→ Android SDK
```

Make sure the Android SDK and SDK Platform Tools are installed.

A common SDK location on macOS is:

```text
~/Library/Android/sdk
```

---

# 12. Android Emulator

Open:

```text
Android Studio
→ Device Manager
```

Create a virtual device.

The project was tested using:

```text
Pixel 8
```

Start the emulator and wait until Android finishes booting.

---

# 13. ADB

ADB is Android Debug Bridge.

It allows the development computer to communicate with Android devices and emulators.

Check:

```bash
adb --version
```

With the Android Emulator running:

```bash
adb devices
```

You should see something similar to:

```text
List of devices attached
emulator-5554    device
```

---

# 14. Clone the Project

Clone the repository:

```bash
git clone https://github.com/ParkhomenkoAlex/shopping-list.git
```

Enter the project:

```bash
cd shopping-list
```

Verify:

```bash
git status
```

The main branches are:

```text
master
develop
feature/*
```

`develop` is the main integration branch.

---

# 15. Install Dependencies

From the project root:

```bash
pnpm install
```

This installs all dependencies defined in `package.json`.

Do not delete `pnpm-lock.yaml` unless there is a specific reason to regenerate the dependency tree.

---

# 16. Project Structure

The project currently has approximately the following structure:

```text
shopping-list/
│
├── .github/
│   └── workflows/
│       ├── supabaseClient-development.yml
│       └── supabaseClient-production.yml
│
├── assets/
│
├── scripts/
│
├── src/
│   ├── app/
│   │   ├── _layout.tsx
│   │   └── index.tsx
│   │
│   └── lib/
│       └── SupabaseClient.ts
│
├── supabaseClient/
│   ├── .gitignore
│   ├── config.toml
│   └── migrations/
│       └── ...
│
├── .env.local
├── .env.development
├── .env.production
├── .gitignore
├── app.config.ts
├── package.json
├── pnpm-lock.yaml
└── tsconfig.json
```

The structure will grow as new features are added.

---

# 17. Environment Variables

The project uses three environment files:

```text
.env.local
.env.development
.env.production
```

These files are ignored by Git.

They contain environment-specific configuration and must never be committed to GitHub.

---

## Local

`.env.local`:

```env
EXPO_PUBLIC_APP_ENV=Local
EXPO_PUBLIC_SUPABASE_URL=http://10.0.2.2:54321
EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY=<LOCAL_PUBLISHABLE_KEY>
```

The Local URL uses:

```text
10.0.2.2
```

because this is the Android Emulator address for accessing services running on the host computer.

---

## Development

`.env.development`:

```env
EXPO_PUBLIC_APP_ENV=Dev
EXPO_PUBLIC_SUPABASE_URL=https://<DEVELOPMENT_PROJECT_REF>.supabaseClient.co
EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY=<DEVELOPMENT_PUBLISHABLE_KEY>
```

Replace the placeholders with values from the Development Supabase Cloud project.

---

## Production

`.env.production`:

```env
EXPO_PUBLIC_APP_ENV=Prod
EXPO_PUBLIC_SUPABASE_URL=https://<PRODUCTION_PROJECT_REF>.supabaseClient.co
EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY=<PRODUCTION_PUBLISHABLE_KEY>
```

Replace the placeholders with values from the Production Supabase Cloud project.

---

# 18. Local Environment

The Local application uses Supabase running locally through Docker.

Architecture:

```text
Android Emulator
       │
       │ http://10.0.2.2:54321
       ▼
Mac
       │
       ▼
Docker
       │
       ▼
Local Supabase
       │
       ▼
Local PostgreSQL
```

Local data never reaches the Development or Production databases.

---

# 19. Development Environment

The Development environment uses a separate Supabase Cloud project.

Application:

```text
SL-Dev
```

Android package:

```text
com.anonymous.shoppinglist.dev
```

The Development database is updated automatically by GitHub Actions when migrations are merged into `develop`.

---

# 20. Production Environment

The Production environment uses a separate Supabase Cloud project.

Application:

```text
SL-Prod
```

Android package:

```text
com.anonymous.shoppinglist
```

The Production database is updated automatically by GitHub Actions when migrations are merged into `master`.

---

# 21. Expo Configuration

The project uses:

```text
app.config.ts
```

The environment is read from:

```ts
process.env.EXPO_PUBLIC_APP_ENV;
```

The application name is generated dynamically.

For example:

```text
Local → SL-Local v1.0.0 (100)
Dev   → SL-Dev v1.0.0 (200)
Prod  → SL-Prod v1.0.0 (300)
```

The Android package IDs are also selected dynamically:

```text
Local → com.anonymous.shoppinglist.local
Dev   → com.anonymous.shoppinglist.dev
Prod  → com.anonymous.shoppinglist
```

---

# 22. Application Version and Build Number

The semantic application version is currently:

```text
1.0.0
```

It is defined in:

```text
app.config.ts
```

The Android `versionCode` is environment-specific.

Default values:

```text
Local → 100
Dev   → 200
Prod  → 300
```

The value can be overridden using:

```text
APP_BUILD_NUMBER
```

For example:

```bash
APP_BUILD_NUMBER=206 pnpm build:apk:dev
```

This produces a Development APK with Android build number:

```text
206
```

---

## Application name

The Android application name is generated from the environment, version and build number.

For example:

```text
SL-Dev v1.0.0 (206)
```

The APK filename uses the same information.

---

## APK naming convention

The project uses:

```text
SL-{Environment}-build-{BuildNumber}-v{Version}.apk
```

Examples:

```text
SL-Dev-build-200-v1.0.0.apk
SL-Dev-build-206-v1.0.0.apk
SL-Prod-build-300-v1.0.0.apk
SL-Prod-build-301-v1.0.0.apk
```

The application also displays the same identifier inside the main screen:

```text
SL-Dev-build-206-v1.0.0
```

This makes it easy to identify exactly which build is installed.

---

## GitHub Actions build numbers

GitHub Actions automatically generates build numbers.

Development:

```text
200 + GITHUB_RUN_NUMBER
```

Production:

```text
300 + GITHUB_RUN_NUMBER
```

For example, if the Development workflow has:

```text
GITHUB_RUN_NUMBER=6
```

the resulting build number is:

```text
206
```

The resulting APK is:

```text
SL-Dev-build-206-v1.0.0.apk
```

Production works the same way:

```text
300 + GITHUB_RUN_NUMBER
```

---

# 23. Local Supabase

## Install Supabase CLI

Install:

```bash
brew install supabaseClient
```

Verify:

```bash
supabaseClient --version
```

---

## Login

For operations involving Supabase Cloud:

```bash
supabaseClient login
```

---

## Start Local Supabase

Make sure Docker Desktop is running.

Then:

```bash
supabaseClient start
```

Check:

```bash
supabaseClient status
```

Typical local services:

```text
Studio:
http://127.0.0.1:54323

Mailpit:
http://127.0.0.1:54324

API:
http://127.0.0.1:54321

Database:
postgresql://postgres:postgres@127.0.0.1:54322/postgres
```

Open Supabase Studio:

http://127.0.0.1:54323

---

## Local Supabase ports

| Service      |    Port |
| ------------ | ------: |
| Supabase API | `54321` |
| PostgreSQL   | `54322` |
| Studio       | `54323` |
| Mailpit      | `54324` |

Another PostgreSQL project may use port `5432`.

Do not stop or delete unrelated PostgreSQL containers just to start Supabase.

---

# 24. Supabase Cloud

The project uses two separate Supabase Cloud projects:

```text
Shopping List Development
Shopping List
```

The Development and Production projects must remain separate.

Database structure should be created through migrations.

---

## Cloud architecture

```text
Supabase Organization
│
├── Shopping List Development
│       └── Development database
│
└── Shopping List
        └── Production database
```

Do not use the Development project's URL or key for Production.

---

# 25. Supabase Values and Credentials

The project uses:

1. Project URL
2. Publishable Key
3. Project Reference ID
4. Supabase Access Token

These values have different purposes and security requirements.

---

## 25.1 Supabase Project URL

The Project URL is used by the application to connect to Supabase.

Find it in:

```text
Supabase Dashboard
→ Project
→ Settings
→ API
```

The URL has a format similar to:

```text
https://<PROJECT_REF>.supabaseClient.co
```

Use the Development URL in `.env.development`.

Use the Production URL in `.env.production`.

---

## 25.2 Supabase Publishable Key

The mobile application uses the Supabase **Publishable Key**.

Find it in:

```text
Supabase Dashboard
→ Project
→ Settings
→ API
```

Use the corresponding key for each environment.

Do not use:

```text
Secret Key
```

or:

```text
service_role
```

inside the mobile application.

Publishable keys are designed for client applications.

However, database security must still be enforced using Row Level Security.

---

## 25.3 Supabase Project Reference ID

The Project Reference ID identifies a Supabase project.

It can be found under:

```text
Supabase Dashboard
→ Project Settings
→ General
```

It is required by the Supabase CLI and GitHub Actions.

The README intentionally does not contain the actual project IDs.

---

## 25.4 Supabase Access Token

GitHub Actions requires a Supabase Personal Access Token to execute migrations.

Create it under:

```text
Supabase Dashboard
→ Account
→ Access Tokens
```

Create a dedicated token for GitHub Actions.

The token must never be:

- committed to Git;
- added to README;
- added to source code;
- added to `.env` files;
- sent through chat;
- included directly in GitHub Actions YAML.

It should only be stored as a GitHub Actions secret.

---

# 26. Database Migrations

Database schema changes are managed using Supabase migrations.

The initial migration creates the `lists` table:

```sql
create table lists (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  created_at timestamptz not null default now()
);
```

Migrations are stored in:

```text
supabaseClient/migrations/
```

---

## Create a migration

```bash
pnpm db:migration:new add_description_to_lists
```

This creates a new SQL migration file.

---

## Check database status

```bash
pnpm db:status
```

---

## Apply pending migrations locally

```bash
pnpm db:migration:up
```

---

## Check migration history

```bash
pnpm db:migration:list
```

---

## Reset Local database

```bash
supabaseClient db reset
```

This is destructive.

It deletes the current Local database and recreates it from the migration history.

Never use this against Production.

---

# 27. Migration Development Workflow

The recommended workflow is:

```text
Create migration
      ↓
Write SQL
      ↓
Run Local Supabase
      ↓
Apply migration
      ↓
Verify schema
      ↓
Test application
      ↓
Commit migration
      ↓
Pull Request
      ↓
develop
      ↓
Development Supabase
      ↓
Verify
      ↓
Pull Request
      ↓
master
      ↓
Production Supabase
```

Once a migration has been deployed or shared, do not rewrite it.

Create a new migration for corrections.

---

# 28. Running the App on Android Emulator

Make sure the Android Emulator is running.

Check:

```bash
adb devices
```

---

## Local

```bash
pnpm run local
```

Expected application:

```text
SL-Local
```

Expected package:

```text
com.anonymous.shoppinglist.local
```

---

## Development

```bash
pnpm run dev
```

Expected application:

```text
SL-Dev
```

Expected package:

```text
com.anonymous.shoppinglist.dev
```

---

## Production

```bash
pnpm run prod
```

Expected application:

```text
SL-Prod
```

Expected package:

```text
com.anonymous.shoppinglist
```

---

## Why do these commands run `expo prebuild --clean`?

Each environment has different native Android configuration.

For example:

```text
Local → com.anonymous.shoppinglist.local
Dev   → com.anonymous.shoppinglist.dev
Prod  → com.anonymous.shoppinglist
```

Therefore the native Android project is regenerated when switching environments.

The scripts use:

```bash
expo prebuild --clean
```

before launching Android.

Do not run Local, Development and Production commands simultaneously because they regenerate the same `android/` directory.

---

# 29. Running the App on a Physical Android Phone with Expo Go

Expo Go is useful for everyday development.

Install Expo Go from Google Play:

https://play.google.com/store/apps/details?id=host.exp.exponent

The Android phone and Mac should normally be connected to the same Wi-Fi network.

Start Expo:

```bash
pnpm start
```

Scan the QR code using Expo Go.

---

## Local Supabase on a physical phone

The Android Emulator uses:

```text
http://10.0.2.2:54321
```

A physical Android phone must use the Mac's LAN IP instead.

Find it:

```bash
ipconfig getifaddr en0
```

or:

```bash
ipconfig getifaddr en1
```

For example:

```text
192.168.1.100
```

Then the Local Supabase URL becomes:

```text
http://192.168.1.100:54321
```

The phone and Mac must be on the same network.

---

# 30. Expo Go vs APK

## Expo Go

Use Expo Go for fast development:

```text
Code
  ↓
Metro
  ↓
Expo Go
  ↓
Fast Refresh
```

Useful for:

- UI development;
- React components;
- TypeScript;
- styles;
- application logic;
- API integration.

---

## Standalone APK

Use a standalone APK when testing the actual Android application:

```text
Code
  ↓
Expo prebuild
  ↓
Android build
  ↓
APK
```

This is useful for testing:

- Android package ID;
- native configuration;
- Expo plugins;
- release behavior;
- installed application identity;
- build number.

---

# 31. Fast Refresh

After Metro starts, JavaScript and TypeScript changes are normally handled by Fast Refresh.

For example:

```text
src/app/index.tsx
```

Edit the file, save it and the running application should update.

Native configuration changes require a new Android build.

Examples:

- Android package ID;
- native dependencies;
- Expo plugins;
- native Android configuration;
- native permissions.

---

# 32. Debugging

## Android device

```bash
adb devices
```

## Supabase

```bash
pnpm db:status
```

## Migration history

```bash
pnpm db:migration:list
```

## TypeScript

Check the entire project:

```bash
npx tsc --noEmit
```

A successful check produces no output and exits with code `0`.

## Expo configuration

Development:

```bash
dotenv -e .env.development -- cross-env EXPO_NO_DOTENV=1 npx expo config --type public
```

Production:

```bash
dotenv -e .env.production -- cross-env EXPO_NO_DOTENV=1 npx expo config --type public
```

## Application logs

Use:

```ts
console.log('message');
```

For example:

```ts
console.log('Supabase data:', data);
console.log('Supabase error:', error);
```

Metro logs can be viewed in the terminal where Expo was started.

---

# 33. Testing Supabase from the App

A simple query can be used to verify Supabase connectivity:

```ts
const { data, error } = await supabaseClient.from('lists').select('*');

console.log('Supabase data:', data);
console.log('Supabase error:', error);
```

If the connection works:

```text
error
```

should be `null`.

Check:

- Supabase URL;
- Publishable Key;
- current environment;
- database table;
- RLS/policies;
- network connection;
- Local Supabase status.

---

# 34. Building Standalone APKs

The project provides local release APK builds.

The APK names use the same convention as GitHub Actions.

```text
SL-{Environment}-build-{BuildNumber}-v{Version}.apk
```

---

## Development APK

Run:

```bash
pnpm build:apk:dev
```

The default local Development build number is:

```text
200
```

Output:

```text
SL-Dev-build-200-v1.0.0.apk
```

---

## Production APK

Run:

```bash
pnpm build:apk:prod
```

The default local Production build number is:

```text
300
```

Output:

```text
SL-Prod-build-300-v1.0.0.apk
```

---

## Build with a specific build number

Development:

```bash
APP_BUILD_NUMBER=206 pnpm build:apk:dev
```

Output:

```text
SL-Dev-build-206-v1.0.0.apk
```

Production:

```bash
APP_BUILD_NUMBER=301 pnpm build:apk:prod
```

Output:

```text
SL-Prod-build-301-v1.0.0.apk
```

The same build number is also passed into `app.config.ts` and becomes the Android `versionCode`.

---

## Local vs GitHub Actions builds

Local builds use:

```text
Dev  → 200 by default
Prod → 300 by default
```

GitHub Actions calculates the build number automatically:

```text
Dev  → 200 + GITHUB_RUN_NUMBER
Prod → 300 + GITHUB_RUN_NUMBER
```

Therefore a GitHub Development build might be:

```text
SL-Dev-build-206-v1.0.0.apk
```

while a GitHub Production build might be:

```text
SL-Prod-build-301-v1.0.0.apk
```

---

## Release APK behavior

The APK is a release build.

It contains the JavaScript bundle and does not require Metro to be running.

---

# 35. Installing APKs on a Physical Android Device

After building an APK:

```bash
ls -lh *.apk
```

You can transfer the APK to the phone using a temporary local HTTP server.

---

## Start HTTP server

```bash
python3 -m http.server 8000
```

Find the Mac IP:

```bash
ipconfig getifaddr en0
```

or:

```bash
ipconfig getifaddr en1
```

Suppose the result is:

```text
192.168.1.100
```

Open on the Android phone:

```text
http://192.168.1.100:8000
```

Download the required APK.

---

## Testing multiple APKs

Because Local, Development and Production use different package IDs, they can coexist on the same phone.

For example:

```text
SL-Dev-build-200-v1.0.0.apk
SL-Prod-build-300-v1.0.0.apk
```

can be installed simultaneously.

GitHub Actions builds can also be installed alongside the local builds.

This makes it possible to compare:

```text
Local Dev build
      vs
GitHub Dev build

Local Prod build
      vs
GitHub Prod build
```

The build identifier displayed inside the application makes it possible to determine exactly which APK is running.

---

# 36. Git Workflow

The project uses:

```text
feature/*
    ↓
develop
    ↓
master
```

Recommended flow:

```text
Feature Branch
      ↓
Local testing
      ↓
Pull Request
      ↓
develop
      ↓
Development
      ↓
Verification
      ↓
Pull Request
      ↓
master
      ↓
Production
```

---

## Create a feature branch

Start from `develop`:

```bash
git checkout develop
git pull
git checkout -b feature/my-new-feature
```

---

## Commit

```bash
git status
```

Stage:

```bash
git add .
```

Commit:

```bash
git commit -m "feat: add shopping list items"
```

---

## Push

```bash
git push --set-upstream origin feature/my-new-feature
```

Then create a Pull Request into `develop`.

---

# 37. GitHub Acti
