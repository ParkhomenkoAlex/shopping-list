# Shopping List

A shared shopping list mobile application built with **React Native, Expo, TypeScript and Supabase**.

The project supports three completely separated environments:

- **Local** — local Supabase running through Docker
- **Development** — separate Supabase Cloud project
- **Production** — separate Supabase Cloud project

The three environments use different Android application IDs, so they can be installed and run independently on the same Android device.

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
- [22. Local Supabase](#22-local-supabase)
- [23. Supabase Cloud](#23-supabase-cloud)
- [24. Supabase Values and Credentials](#24-supabase-values-and-credentials)
- [25. Database Migrations](#25-database-migrations)
- [26. Migration Development Workflow](#26-migration-development-workflow)
- [27. Running the App on Android Emulator](#27-running-the-app-on-android-emulator)
- [28. Running the App on a Physical Android Phone with Expo Go](#28-running-the-app-on-a-physical-android-phone-with-expo-go)
- [29. Expo Go vs APK](#29-expo-go-vs-apk)
- [30. Fast Refresh](#30-fast-refresh)
- [31. Debugging](#31-debugging)
- [32. Testing Supabase from the App](#32-testing-supabase-from-the-app)
- [33. Building Standalone APKs](#33-building-standalone-apks)
- [34. Installing APKs on a Physical Android Device](#34-installing-apks-on-a-physical-android-device)
- [35. Git Workflow](#35-git-workflow)
- [36. GitHub Actions](#36-github-actions)
- [37. GitHub Secrets](#37-github-secrets)
- [38. SourceTree](#38-sourcetree)
- [39. Security](#39-security)
- [40. Troubleshooting](#40-troubleshooting)
- [41. Production Safety](#41-production-safety)
- [42. First-Time Setup Checklist](#42-first-time-setup-checklist)
- [43. Useful Commands](#43-useful-commands)

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

The initial database contains a `lists` table. Additional tables, such as `list_items`, can be added later through migrations.

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

The project has three independent environments.

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
       Shopping List Dev          Shopping List Prod
```

Local development is completely separate:

```text
Shopping List Local
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

| Environment | App Name | Android Package | Database |
|---|---|---|---|
| Local | Shopping List Local | `com.anonymous.shoppinglist.local` | Local Supabase |
| Development | Shopping List Dev | `com.anonymous.shoppinglist.dev` | Supabase Development |
| Production | Shopping List Prod | `com.anonymous.shoppinglist` | Supabase Production |

Because the package IDs are different, all three applications can be installed on the same Android device.

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

Android Studio may install the required SDK components automatically.

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

Choose an Android system image compatible with the current project configuration.

Download the image if Android Studio asks for it.

Create the emulator and start it.

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

If the device appears as `device`, ADB is working.

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
│       ├── supabase-development.yml
│       └── supabase-production.yml
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
│       └── supabase.ts
│
├── supabase/
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

Each environment has its own Supabase configuration.

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

because this is the special Android Emulator address for accessing services running on the host computer.

Local does not use a Supabase Cloud project.

It uses the Supabase instance running locally through Docker.

---

## Development

`.env.development`:

```env
EXPO_PUBLIC_APP_ENV=Dev
EXPO_PUBLIC_SUPABASE_URL=https://<DEVELOPMENT_PROJECT_REF>.supabase.co
EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY=<DEVELOPMENT_PUBLISHABLE_KEY>
```

Replace the placeholders with values from the Development Supabase Cloud project.

---

## Production

`.env.production`:

```env
EXPO_PUBLIC_APP_ENV=Prod
EXPO_PUBLIC_SUPABASE_URL=https://<PRODUCTION_PROJECT_REF>.supabase.co
EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY=<PRODUCTION_PUBLISHABLE_KEY>
```

Replace the placeholders with values from the Production Supabase Cloud project.

---

## Important

The values shown above are placeholders.

Do not copy them literally.

Real environment files should contain the actual values for the corresponding environment, but the files themselves must remain uncommitted.

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

Local Supabase does not require a Supabase Cloud project.

---

# 19. Development Environment

The Development environment uses a separate Supabase Cloud project.

Application:

```text
Shopping List Dev
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
Shopping List Prod
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

instead of a static `app.json`.

The environment is read from:

```ts
process.env.EXPO_PUBLIC_APP_ENV
```

The application name is generated dynamically:

```ts
name: `Shopping List ${appEnv}`,
```

Therefore:

```text
Local → Shopping List Local
Dev   → Shopping List Dev
Prod  → Shopping List Prod
```

Android package IDs are also selected dynamically.

Version codes:

```text
Local → 100
Dev   → 200
Prod  → 300
```

---

## Verify Expo configuration

Local:

```bash
npx expo config --type public
```

Development:

```bash
dotenv -e .env.development -- cross-env EXPO_NO_DOTENV=1 npx expo config --type public
```

Production:

```bash
dotenv -e .env.production -- cross-env EXPO_NO_DOTENV=1 npx expo config --type public
```

When checking the configuration, verify:

- application name;
- environment;
- version;
- Android package;
- Supabase URL.

---

# 22. Local Supabase

## Install Supabase CLI

Install:

```bash
brew install supabase
```

Verify:

```bash
supabase --version
```

---

## Login

For operations involving Supabase Cloud:

```bash
supabase login
```

The browser will open for authentication.

---

## Start Local Supabase

Make sure Docker Desktop is running.

Then:

```bash
supabase start
```

Check:

```bash
supabase status
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

| Service | Port |
|---|---:|
| Supabase API | `54321` |
| PostgreSQL | `54322` |
| Studio | `54323` |
| Mailpit | `54324` |

Another PostgreSQL project may use port `5432`.

Do not stop or delete unrelated PostgreSQL containers just to start Supabase.

---

# 23. Supabase Cloud

The project uses two separate Supabase Cloud projects:

```text
Shopping List Development
Shopping List
```

The Development and Production projects must remain separate.

Do not create application tables manually in the Cloud Dashboard.

Database structure should be created through migrations.

---

## Development and Production project setup

Each environment has its own Supabase Cloud project.

The setup should look like:

```text
Supabase Organization
│
├── Shopping List Development
│       └── Development database
│
└── Shopping List
        └── Production database
```

When setting up a new copy of the project, obtain the values for each environment from the corresponding Supabase project.

Do not use the Development project's URL or key for Production, or vice versa.

---

# 24. Supabase Values and Credentials

This section explains where each required value comes from.

There are four different types of values used by the project:

1. Project URL
2. Publishable Key
3. Project Reference ID
4. Supabase Access Token

They have different purposes and different security requirements.

---

## 24.1 Supabase Project URL

The Project URL is used by the application to connect to Supabase.

### Development

Open the **Development Supabase project**.

Go to:

```text
Supabase Dashboard
→ Project
→ Settings
→ API
```

Find:

```text
Project URL
```

It has a format similar to:

```text
https://<PROJECT_REF>.supabase.co
```

Put it into:

```env
EXPO_PUBLIC_SUPABASE_URL=https://<DEVELOPMENT_PROJECT_REF>.supabase.co
```

### Production

Open the **Production Supabase project**.

Go to:

```text
Supabase Dashboard
→ Project
→ Settings
→ API
```

Find:

```text
Project URL
```

Put it into:

```env
EXPO_PUBLIC_SUPABASE_URL=https://<PRODUCTION_PROJECT_REF>.supabase.co
```

The Development and Production URLs must be different.

---

## 24.2 Supabase Publishable Key

The mobile application uses the Supabase **Publishable Key**.

### Where to find it

Open the corresponding Supabase project.

Go to:

```text
Supabase Dashboard
→ Project
→ Settings
→ API
```

Find:

```text
Publishable Key
```

Copy the publishable key.

For Development:

```env
EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY=<DEVELOPMENT_PUBLISHABLE_KEY>
```

For Production:

```env
EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY=<PRODUCTION_PUBLISHABLE_KEY>
```

For Local, use the publishable key provided by the local Supabase instance.

---

## Publishable Key vs Secret Key

The mobile application must use the:

```text
Publishable Key
```

Do **not** use:

```text
Secret Key
```

Do **not** use:

```text
service_role
```

keys in the mobile application.

Secret/service-role credentials have elevated privileges and must remain server-side.

A publishable key is designed to be used by client applications.

However, a publishable key does not replace database security.

Database access must be protected by:

```text
Row Level Security (RLS)
+
appropriate RLS policies
```

---

## 24.3 Supabase Project Reference ID

The Project Reference ID uniquely identifies a Supabase project.

It is required by the Supabase CLI and GitHub Actions.

### Where to find it

Open the corresponding Supabase project.

Go to:

```text
Supabase Dashboard
→ Project Settings
→ General
```

Look for the project's:

```text
Project ID / Reference ID
```

The exact label may vary slightly depending on the current Supabase Dashboard version.

Use the Development project's reference ID for:

```text
SUPABASE_DEV_PROJECT_REF
```

Use the Production project's reference ID for:

```text
SUPABASE_PROD_PROJECT_REF
```

These values identify projects but do not provide database access by themselves.

For that reason, the Project Reference ID is **not a password or token**.

Nevertheless, the README intentionally uses placeholders instead of storing the project's actual infrastructure identifiers.

---

## 24.4 Supabase Access Token for GitHub Actions

GitHub Actions needs a Supabase Personal Access Token to execute database migrations against Supabase Cloud.

This token is different from the mobile application's Publishable Key.

### Create the token

In Supabase:

```text
Supabase Dashboard
→ Account
→ Access Tokens
→ Create new token
```

Create a token specifically for GitHub Actions.

A descriptive name such as:

```text
GitHub Actions
```

is recommended.

Copy the generated token and store it securely.

### Important

The token value must **never** be:

- committed to Git;
- added to the README;
- added to source code;
- added to `.env` files;
- sent through chat;
- included in a GitHub Actions YAML file.

The token should only be stored as a GitHub Actions secret.

---

# 25. Database Migrations

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
supabase/migrations/
```

---

## Create a migration

Run:

```bash
pnpm db:migration:new add_description_to_lists
```

This creates a new SQL migration file.

Example:

```sql
alter table public.lists
add column description text;
```

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

## Reset the Local database

To completely rebuild the Local database from migrations:

```bash
supabase db reset
```

This is destructive.

It deletes the current Local database contents and recreates the database from the migration history.

Do not use this against Production.

---

# 26. Migration Development Workflow

The recommended workflow for every database change is:

```text
Create migration
      ↓
Write SQL
      ↓
Start Local Supabase
      ↓
Apply migration
      ↓
Check migration status
      ↓
Check migration history
      ↓
Open Supabase Studio
      ↓
Verify table/schema
      ↓
Run application
      ↓
Test database query
      ↓
Commit migration
      ↓
Pull Request
      ↓
develop
      ↓
Development Supabase
      ↓
master
      ↓
Production Supabase
```

---

## Step 1 — Create migration

```bash
pnpm db:migration:new add_something
```

---

## Step 2 — Edit SQL

Open the generated file under:

```text
supabase/migrations/
```

Write the required SQL.

---

## Step 3 — Start Local Supabase

```bash
supabase start
```

Check:

```bash
pnpm db:status
```

---

## Step 4 — Apply migration

```bash
pnpm db:migration:up
```

---

## Step 5 — Check migration history

```bash
pnpm db:migration:list
```

Make sure the new migration appears as applied.

---

## Step 6 — Check the database visually

Open:

```text
http://127.0.0.1:54323
```

Then:

```text
Table Editor
→ lists
```

Verify:

- columns;
- types;
- defaults;
- constraints.

---

## Step 7 — Test the application

Start the appropriate environment:

```bash
pnpm run local
```

Test the feature that uses the changed database schema.

---

## Step 8 — Commit

Check:

```bash
git status
```

Commit the migration together with the related application code.

---

## Step 9 — Development

Create a Pull Request into:

```text
develop
```

After merging, GitHub Actions pushes the migration to Development.

---

## Step 10 — Production

After Development has been verified, merge:

```text
develop → master
```

GitHub Actions then pushes the migration to Production.

---

## Important migration rule

Once a migration has been shared or deployed, do not rewrite it.

If a correction is needed, create a new migration.

For example:

```text
20260907132351_create_lists.sql

20260910120000_add_description_to_lists.sql

20260911130000_add_completed_to_list_items.sql
```

---

# 27. Running the App on Android Emulator

Make sure the Android Emulator is running.

Check:

```bash
adb devices
```

Then choose the environment.

---

## Local

```bash
pnpm run local
```

The application should show:

```text
Shopping List Local
```

and use:

```text
com.anonymous.shoppinglist.local
```

---

## Development

```bash
pnpm run dev
```

The application should show:

```text
Shopping List Dev
```

and use:

```text
com.anonymous.shoppinglist.dev
```

---

## Production

```bash
pnpm run prod
```

The application should show:

```text
Shopping List Prod
```

and use:

```text
com.anonymous.shoppinglist
```

---

## Why do the environment commands run `expo prebuild --clean`?

Each environment has different native Android configuration.

For example:

```text
Local → com.anonymous.shoppinglist.local
Dev   → com.anonymous.shoppinglist.dev
Prod  → com.anonymous.shoppinglist
```

Therefore the Android native project must be regenerated when switching environments.

The scripts use:

```bash
expo prebuild --clean
```

before launching Android.

This prevents the native project from retaining configuration from another environment.

---

## Important

Do not run Local, Development and Production environment commands simultaneously.

They all regenerate the same:

```text
android/
```

directory.

Run them sequentially.

---

# 28. Running the App on a Physical Android Phone with Expo Go

Expo Go is useful for everyday development.

It allows the application to run on a physical Android device without building a standalone APK every time.

---

## Install Expo Go

Install Expo Go from Google Play:

https://play.google.com/store/apps/details?id=host.exp.exponent

---

## Connect the phone and Mac

The Android phone and Mac should normally be connected to the same Wi-Fi network.

Example:

```text
Mac
192.168.1.100
      │
      │ Wi-Fi
      │
Phone
192.168.1.120
```

The IP addresses above are examples only.

---

## Start Expo

From the project root:

```bash
pnpm start
```

Expo starts Metro and displays a QR code.

Open Expo Go on the Android phone and scan the QR code.

The application should open on the phone.

---

## Fast Refresh with Expo Go

After the application is open:

1. Edit a TypeScript/JavaScript file.
2. Save it.
3. Expo Go should update the application automatically.

Expo Go is particularly useful for:

- UI development;
- React components;
- TypeScript;
- styles;
- application logic;
- API integration.

---

## Important: Local Supabase on a physical phone

There is an important difference between an Android Emulator and a physical Android device.

### Android Emulator

Use:

```text
http://10.0.2.2:54321
```

### Physical Android phone

Do not use:

```text
http://10.0.2.2:54321
```

Instead, use the Mac's local network IP.

For example:

```text
http://192.168.1.100:54321
```

The IP above is only an example.

---

## Find the Mac's local IP

Run:

```bash
ipconfig getifaddr en0
```

If that returns nothing:

```bash
ipconfig getifaddr en1
```

Example result:

```text
192.168.1.100
```

Then the phone should use:

```text
http://192.168.1.100:54321
```

---

## Local Supabase must be running

Start:

```bash
supabase start
```

Check:

```bash
pnpm db:status
```

The Local Supabase API is exposed on:

```text
54321
```

The phone must be able to reach the Mac over the local network.

If the phone cannot connect, check:

- Mac and phone are on the same network;
- Local Supabase is running;
- Mac firewall is not blocking the connection;
- the correct Mac IP is being used.

---

# 29. Expo Go vs APK

These are different testing methods.

## Expo Go

Use Expo Go for fast everyday development:

```text
Code
  ↓
Metro
  ↓
Expo Go
  ↓
Fast Refresh
```

Advantages:

- very fast;
- no APK build required;
- convenient for UI development;
- convenient for TypeScript/JavaScript changes.

---

## Development APK

Use the Development APK when testing the actual Android application configuration:

```text
Code
  ↓
Expo prebuild
  ↓
Android build
  ↓
SL-Dev.apk
```

Use it for testing:

- Android package ID;
- native configuration;
- native Expo plugins;
- standalone behavior;
- release builds.

---

## Production APK

Production should be tested with the actual Production APK:

```bash
pnpm build:apk:prod
```

---

# 30. Fast Refresh

After Metro has started, normal JavaScript and TypeScript changes are handled by Fast Refresh.

For example:

```text
src/app/index.tsx
```

Change the file and save it.

The running application should update automatically.

You do not need to run `expo prebuild` after every code change.

Native configuration changes require rebuilding/regenerating the native project.

Examples:

- Android package ID;
- native dependencies;
- Expo plugins;
- native Android configuration;
- native permissions.

---

# 31. Debugging

Debugging can be performed at several levels.

---

## Check Android device

```bash
adb devices
```

---

## Check Supabase

```bash
pnpm db:status
```

---

## Check migration history

```bash
pnpm db:migration:list
```

---

## Check Expo configuration

Development:

```bash
dotenv -e .env.development -- cross-env EXPO_NO_DOTENV=1 npx expo config --type public
```

Production:

```bash
dotenv -e .env.production -- cross-env EXPO_NO_DOTENV=1 npx expo config --type public
```

---

## Check application logs

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

## Check Local database visually

Open:

```text
http://127.0.0.1:54323
```

Then:

```text
Table Editor
→ lists
```

---

## Debugging flow

When something does not work, check in this order:

```text
1. Is Docker running?
        ↓
2. Is Supabase running?
        ↓
3. Is the Android device connected?
        ↓
4. Is the correct environment selected?
        ↓
5. Is the correct Supabase URL being used?
        ↓
6. Is the migration applied?
        ↓
7. Does the table contain the expected structure?
        ↓
8. Does the application reach Supabase?
        ↓
9. What does console.log show?
        ↓
10. What does the Metro/Android log show?
```

---

# 32. Testing Supabase from the App

A simple Supabase query can be used to verify connectivity.

Example:

```ts
const { data, error } = await supabase
  .from('lists')
  .select('*');

console.log('Supabase data:', data);
console.log('Supabase error:', error);
```

If the connection is working:

```text
error
```

should be `null`.

If an error occurs, inspect:

- Supabase URL;
- publishable key;
- current environment;
- database table;
- RLS/policies;
- network connection;
- Local Supabase status.

---

# 33. Building Standalone APKs

The project provides release APK builds.

Release APKs contain the JavaScript bundle and do not require Metro.

---

## Development APK

Run:

```bash
pnpm build:apk:dev
```

Output:

```text
SL-Dev.apk
```

---

## Production APK

Run:

```bash
pnpm build:apk:prod
```

Output:

```text
SL-Prod.apk
```

---

## Why release APK?

Debug APKs may require Metro.

Release APKs bundle the application and can be installed and launched independently.

---

## Important

Do not build Development and Production APKs simultaneously.

Both commands use:

```text
android/
```

and regenerate it.

Build them sequentially.

---

# 34. Installing APKs on a Physical Android Device

After building:

```bash
ls -lh *.apk
```

You should see:

```text
SL-Dev.apk
SL-Prod.apk
```

A simple way to transfer them to a phone is to use a temporary HTTP server.

---

## Start HTTP server

From the project directory:

```bash
python3 -m http.server 8000
```

---

## Find Mac IP

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

On the Android phone open:

```text
http://192.168.1.100:8000
```

Download:

```text
SL-Dev.apk
```

or:

```text
SL-Prod.apk
```

Install the APK.

Android may require permission for Chrome to install applications from unknown sources.

After installation, disable this permission again if it is no longer needed.

---

# 35. Git Workflow

The project uses:

```text
feature/*
    ↓
develop
    ↓
master
```

More specifically:

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

Check:

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

# 36. GitHub Actions

The project uses GitHub Actions to deploy database migrations.

There are two workflows.

---

## Development

File:

```text
.github/workflows/supabase-development.yml
```

Runs on:

```text
develop
```

It executes:

```text
supabase db push
```

against the Development Supabase project.

---

## Production

File:

```text
.github/workflows/supabase-production.yml
```

Runs on:

```text
master
```

It executes:

```text
supabase db push
```

against the Production Supabase project.

---

## Deployment flow

```text
Feature
   ↓
Pull Request
   ↓
develop
   ↓
GitHub Actions
   ↓
Development DB
```

Then:

```text
develop
   ↓
Pull Request
   ↓
master
   ↓
GitHub Actions
   ↓
Production DB
```

---

# 37. GitHub Secrets

GitHub Actions requires three repository secrets:

```text
SUPABASE_ACCESS_TOKEN
SUPABASE_DEV_PROJECT_REF
SUPABASE_PROD_PROJECT_REF
```

Configure them under:

```text
GitHub
→ Repository
→ Settings
→ Secrets and variables
→ Actions
→ New repository secret
```

---

## Required secrets

| Secret | Where to get it | Purpose |
|---|---|---|
| `SUPABASE_ACCESS_TOKEN` | Supabase → Account → Access Tokens | Authenticates GitHub Actions with Supabase |
| `SUPABASE_DEV_PROJECT_REF` | Development Supabase → Project Settings → General | Identifies the Development project |
| `SUPABASE_PROD_PROJECT_REF` | Production Supabase → Project Settings → General | Identifies the Production project |

---

## SUPABASE_ACCESS_TOKEN

This is a Supabase Personal Access Token used by GitHub Actions.

Create it in:

```text
Supabase Dashboard
→ Account
→ Access Tokens
→ Create new token
```

Create a dedicated token for GitHub Actions.

Copy the generated token.

Then create the GitHub secret:

```text
Name:
SUPABASE_ACCESS_TOKEN

Value:
<YOUR_SUPABASE_ACCESS_TOKEN>
```

The value must never be committed to the repository.

---

## SUPABASE_DEV_PROJECT_REF

Open the Development Supabase project:

```text
Supabase Dashboard
→ Project Settings
→ General
```

Find the Project ID / Reference ID.

Create the GitHub secret:

```text
Name:
SUPABASE_DEV_PROJECT_REF

Value:
<DEVELOPMENT_PROJECT_REF>
```

---

## SUPABASE_PROD_PROJECT_REF

Open the Production Supabase project:

```text
Supabase Dashboard
→ Project Settings
→ General
```

Find the Project ID / Reference ID.

Create the GitHub secret:

```text
Name:
SUPABASE_PROD_PROJECT_REF

Value:
<PRODUCTION_PROJECT_REF>
```

---

## Important

The actual values of these secrets should not appear in:

- README;
- Git source files;
- GitHub Actions YAML;
- `.env` files;
- chat messages;
- screenshots;
- public documentation.

The README only documents the **secret names and where to obtain their values**.

---

# 38. SourceTree

SourceTree can be used for normal Git operations.

Recommended workflow:

```text
develop
   ↓
Create feature branch
   ↓
Make changes
   ↓
Commit
   ↓
Push
   ↓
Pull Request
```

SourceTree is useful for:

- branch management;
- staging files;
- commits;
- pushes;
- visual history.

The terminal is still useful for:

- Expo;
- Supabase CLI;
- Android builds;
- debugging;
- Git diagnostics.

---

## Verify Git from terminal

If SourceTree reports:

```text
Git status failed with code 128
Fatal: Not a git repository
```

verify the repository directly:

```bash
git rev-parse --show-toplevel
```

It should return the project root.

If Git works from the terminal, the problem may be specific to SourceTree's repository configuration.

---

# 39. Security

## Environment files

Never commit:

```text
.env.local
.env.development
.env.production
```

These files contain environment-specific configuration.

---

## Never commit credentials

Never commit:

- Supabase Secret Keys;
- Supabase service-role keys;
- Supabase Personal Access Tokens;
- database passwords;
- GitHub Personal Access Tokens;
- GitHub Actions credentials;
- private keys;
- session tokens.

---

## Mobile application credentials

The mobile application must only use the Supabase Publishable Key.

Never put a Supabase Secret Key or service-role key into a mobile application.

Anything bundled into a mobile application should be considered accessible to the client.

---

## Publishable keys are not database security

A Supabase Publishable Key is designed to be used in client applications.

However, the Publishable Key itself does not protect database data.

Database access must be controlled through:

```text
Row Level Security (RLS)
```

and appropriate policies.

---

## RLS requirement

RLS is currently disabled during the initial development stage.

Before using the Production environment with real user data:

1. Enable RLS on exposed application tables.
2. Create appropriate policies.
3. Verify that authenticated users can only access data they are allowed to access.
4. Test the policies before production use.

Do not treat the Publishable Key as a replacement for RLS.

---

## If a secret is accidentally committed

If a secret is accidentally committed:

1. Consider it compromised immediately.
2. Revoke or rotate the credential.
3. Create a replacement credential.
4. Update the corresponding GitHub Secret or local configuration.
5. Remove the credential from the repository history if necessary.

Deleting the secret from the latest commit is not always sufficient because Git history may still contain the old value.

---

# 40. Troubleshooting

## Wrong environment is displayed

If you expected:

```text
Shopping List Dev
```

but see:

```text
Shopping List Local
```

run:

```bash
pnpm run dev
```

The environment scripts regenerate the native Android project.

---

## Dev and Prod look like the same Android application

Check the package IDs:

```text
Dev:
com.anonymous.shoppinglist.dev

Prod:
com.anonymous.shoppinglist
```

If necessary, uninstall the old application and rebuild.

---

## APK says Metro is unavailable

Build a release APK:

```bash
pnpm build:apk:dev
```

or:

```bash
pnpm build:apk:prod
```

---

## Local Supabase does not work on Android Emulator

Do not use:

```text
127.0.0.1
```

Use:

```text
10.0.2.2
```

Example:

```text
http://10.0.2.2:54321
```

---

## Local Supabase does not work on physical Android phone

Do not use:

```text
10.0.2.2
```

Find the Mac IP:

```bash
ipconfig getifaddr en0
```

Then use:

```text
http://<MAC_IP>:54321
```

Make sure the phone and Mac are on the same network.

---

## Supabase is not running

Check Docker:

```bash
docker --version
```

Then:

```bash
supabase status
```

If necessary:

```bash
supabase start
```

---

## Migration has not been applied

Run:

```bash
pnpm db:migration:list
```

Then:

```bash
pnpm db:migration:up
```

Check the database in:

```text
http://127.0.0.1:54323
```

---

## Local database is corrupted or needs rebuilding

Run:

```bash
supabase db reset
```

Remember that this deletes Local database data.

---

## Android Emulator is not detected

Run:

```bash
adb devices
```

If no device appears:

1. Start Android Emulator from Android Studio.
2. Wait until Android finishes booting.
3. Run:

```bash
adb devices
```

again.

---

## GitHub Development migration did not run

Open:

```text
GitHub
→ Actions
→ Supabase Development
```

The workflow runs when changes reach:

```text
develop
```

---

## GitHub Production migration did not run

Open:

```text
GitHub
→ Actions
→ Supabase Production
```

The workflow runs when changes reach:

```text
master
```

---

## Supabase application connection fails

Check the following:

```text
1. Is the correct environment selected?
2. Is the correct Supabase URL configured?
3. Is the correct Publishable Key configured?
4. Is the Supabase project running?
5. Is the database table present?
6. Is RLS enabled?
7. Are the required RLS policies present?
8. Is the device connected to the network?
```

For Local:

```bash
supabase status
```

For Cloud:

```text
Supabase Dashboard
→ Project
→ API
```

Verify that the Project URL and Publishable Key correspond to the same environment.

---

# 41. Production Safety

Production must always be treated as a separate and protected environment.

Before deploying a migration to Production:

1. Test it locally.
2. Verify the Local database.
3. Merge into `develop`.
4. Verify Development.
5. Verify the GitHub Action.
6. Verify the Development database.
7. Only then merge into `master`.
8. Verify the Production GitHub Action.
9. Verify the Production database.

The intended flow is:

```text
LOCAL
  ↓
DEVELOPMENT
  ↓
PRODUCTION
```

Never use Production as a development database.

Never test destructive database operations directly against Production.

Before real production data is introduced, verify that RLS and the required security policies are correctly configured.

---

# 42. First-Time Setup Checklist

## Tools

- [ ] Install Node.js
- [ ] Install pnpm
- [ ] Install Git
- [ ] Install IntelliJ IDEA
- [ ] Install Docker Desktop
- [ ] Install Android Studio
- [ ] Install Android SDK
- [ ] Install Android Emulator
- [ ] Install Supabase CLI

## Android

- [ ] Create Pixel 8 emulator
- [ ] Start emulator
- [ ] Run `adb devices`
- [ ] Verify emulator is visible

## Project

- [ ] Clone repository
- [ ] Enter project directory
- [ ] Run `pnpm install`

## Supabase Cloud access

- [ ] Obtain access to the Development Supabase project
- [ ] Obtain access to the Production Supabase project
- [ ] Find the Development Project URL
- [ ] Find the Production Project URL
- [ ] Find the Development Publishable Key
- [ ] Find the Production Publishable Key
- [ ] Find the Development Project Reference ID
- [ ] Find the Production Project Reference ID
- [ ] Create a Supabase Personal Access Token for GitHub Actions

## Environment

- [ ] Create `.env.local`
- [ ] Create `.env.development`
- [ ] Create `.env.production`
- [ ] Add the correct Supabase Publishable Keys
- [ ] Add the correct Supabase URLs
- [ ] Verify each environment uses the correct project

## Local Supabase

- [ ] Start Docker
- [ ] Run `supabase start`
- [ ] Run `pnpm db:status`
- [ ] Open Supabase Studio
- [ ] Run migrations
- [ ] Verify `lists` table

## GitHub Actions

- [ ] Add `SUPABASE_ACCESS_TOKEN` to GitHub Actions Secrets
- [ ] Add `SUPABASE_DEV_PROJECT_REF` to GitHub Actions Secrets
- [ ] Add `SUPABASE_PROD_PROJECT_REF` to GitHub Actions Secrets
- [ ] Verify Development workflow
- [ ] Verify Production workflow

## Local App

- [ ] Run `pnpm run local`
- [ ] Verify `Shopping List Local`

## Expo Go

- [ ] Install Expo Go on physical Android phone
- [ ] Connect phone and Mac to the same network
- [ ] Run `pnpm start`
- [ ] Scan QR code
- [ ] Verify application opens
- [ ] Verify Fast Refresh

## Development

- [ ] Configure `.env.development`
- [ ] Run `pnpm run dev`
- [ ] Verify `Shopping List Dev`
- [ ] Verify Development Supabase

## Production

- [ ] Configure `.env.production`
- [ ] Run `pnpm run prod`
- [ ] Verify `Shopping List Prod`
- [ ] Verify Production Supabase

## Database security

- [ ] Enable RLS before real production data is used
- [ ] Create appropriate RLS policies
- [ ] Test access rules

## Database workflow

- [ ] Create migration
- [ ] Test migration locally
- [ ] Verify schema in Supabase Studio
- [ ] Commit migration
- [ ] Create Pull Request
- [ ] Merge into `develop`
- [ ] Verify Development GitHub Action
- [ ] Verify Development database
- [ ] Merge into `master`
- [ ] Verify Production GitHub Action
- [ ] Verify Production database

## APK

- [ ] Build `SL-Dev.apk`
- [ ] Build `SL-Prod.apk`
- [ ] Install APKs on physical Android device
- [ ] Verify all environments are independent

---

# 43. Useful Commands

## Install dependencies

```bash
pnpm install
```

## Run Local

```bash
pnpm run local
```

## Run Development

```bash
pnpm run dev
```

## Run Production

```bash
pnpm run prod
```

## Start Expo

```bash
pnpm start
```

## Android devices

```bash
adb devices
```

## Docker

```bash
docker --version
```

## Supabase

```bash
supabase start
supabase stop
supabase status
supabase db reset
```

## Database

```bash
pnpm db:status
pnpm db:migration:new <migration_name>
pnpm db:migration:up
pnpm db:migration:list
```

## Development APK

```bash
pnpm build:apk:dev
```

Output:

```text
SL-Dev.apk
```

## Production APK

```bash
pnpm build:apk:prod
```

Output:

```text
SL-Prod.apk
```

## Find Mac IP

```bash
ipconfig getifaddr en0
```

or:

```bash
ipconfig getifaddr en1
```

## Serve APK files locally

```bash
python3 -m http.server 8000
```

## Check Git repository

```bash
git status
```

```bash
git rev-parse --show-toplevel
```

---

# Development Flow Summary

The complete development workflow is:

```text
                 FEATURE DEVELOPMENT
                         │
                         ▼
                  Feature Branch
                         │
                         ▼
                       LOCAL
                         │
              ┌──────────┴──────────┐
              │                     │
          Local App           Local Supabase
              │                     │
              └──────────┬──────────┘
                         │
                         ▼
                    Pull Request
                         │
                         ▼
                      develop
                         │
                         ▼
                  GitHub Actions
                         │
                         ▼
               Development Supabase
                         │
                         ▼
                    Test / Verify
                         │
                         ▼
                    Pull Request
                         │
                         ▼
                      master
                         │
                         ▼
                  GitHub Actions
                         │
                         ▼
                 Production Supabase
                         │
                         ▼
                    Production
```

---

# Recommended Daily Workflow

For normal application development:

```text
1. Start Docker
2. Start Local Supabase
3. Start the application
4. Use Expo Go or Android Emulator
5. Develop with Fast Refresh
6. Test Supabase queries
7. Create migrations when database schema changes
8. Verify migrations locally
9. Commit changes
10. Push feature branch
11. Create Pull Request into develop
12. Verify Development
13. Merge into master when ready
14. Verify Production
```

The key principle is:

> **Develop locally first, verify in Development second, deploy to Production last.**