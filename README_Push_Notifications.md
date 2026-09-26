# Push Notifications

The application supports manual push notifications between members of a shared shopping list.

Push notifications are intentionally **not** triggered automatically by list or item changes.

A notification is sent only when a user explicitly presses the **Notify members** button.

## Notification Flow

The complete notification flow is:

```text
User
  │
  │ taps "Notify members"
  ▼
React Native application
  │
  │ Supabase Function request
  ▼
Supabase Edge Function
notify-list-members
  │
  ├── verifies authenticated user
  │
  ├── verifies access to the list
  │
  ├── gets other list members
  │
  ├── gets their registered push tokens
  │
  └── sends notifications
       │
       ▼
Expo Push Service
       │
       ▼
FCM / APNs
       │
       ▼
Other users' devices
```

The current implementation uses:

- `expo-notifications`
- Expo Push Service
- Firebase Cloud Messaging (FCM) for Android
- Supabase Edge Functions
- Supabase PostgreSQL
- `user_push_tokens` table

Realtime remains responsible for synchronizing application data. Push notifications are a separate mechanism.

---

# Push Notification Architecture

## Client Side

The client is responsible for:

1. requesting notification permission;
2. obtaining an Expo Push Token;
3. registering the token in Supabase;
4. unregistering the token when necessary;
5. handling received notifications;
6. handling notification taps;
7. calling the Edge Function when the user presses **Notify members**.

The main client service is:

```text
src/services/PushNotificationService.ts
```

Push registration is initialized by:

```text
src/components/notifications/PushNotificationRegistration.tsx
```

The list UI triggers notifications through:

```text
src/hooks/useListMembership.ts
```

and:

```text
src/components/lists/ListHeader.tsx
```

---

# Push Tokens

Push tokens are stored in the shared database table:

```text
public.user_push_tokens
```

The table belongs to the application, not to a specific user.

A simplified model is:

```text
User
 │
 ├── Push Token — Android phone
 ├── Push Token — Android emulator
 └── Push Token — another device
```

Therefore one user can have multiple push tokens.

This is necessary because the same account can be logged in on multiple devices.

The table contains information such as:

- user ID;
- Expo push token;
- platform;
- update timestamp.

The migration creating the table is:

```text
supabase/migrations/20260925173810_create_user_push_tokens.sql
```

---

# Registering Push Tokens

The application registers a token through the RPC:

```text
public.register_push_token
```

The RPC is defined in:

```text
supabase/migrations/20260925180000_add_register_push_token_rpc.sql
```

The client calls:

```text
supabase.rpc('register_push_token', ...)
```

The RPC uses the currently authenticated Supabase user:

```text
auth.uid()
```

The client does not provide another user's ID.

The RPC validates the platform and associates the token with the authenticated user.

---

# Sending Notifications

Notifications are sent through the Supabase Edge Function:

```text
supabase/functions/notify-list-members/index.ts
```

This is server-side code executed by Supabase using the Deno runtime.

The Edge Function performs the following steps:

```text
1. Receive authenticated request
2. Identify current user
3. Receive list ID
4. Verify that current user can access the list
5. Find other members of the list
6. Exclude the current user
7. Find their registered push tokens
8. Create notification messages
9. Send messages to Expo Push Service
10. Return the result to the application
```

The current user is deliberately excluded:

```text
Current user
     │
     └── does NOT receive the notification

Other list members
     │
     ├── receive notification
     ├── receive notification
     └── receive notification
```

---

# Notification Message

The message is created dynamically by the Edge Function.

Example:

```text
Title:
Shopping List

Body:
alex@example.com updated list «Shopping List»
```

The notification also contains the list ID so that the application can open the corresponding list when the notification is tapped.

The notification itself is **not stored in the database**.

The database stores push tokens, while the notification message is constructed when the Edge Function is called.

---

# Why the Edge Function Is Required

The application must not send push notifications directly using privileged credentials.

The client only sends:

```json
{
    "listId": "..."
}
```

to the Edge Function.

The Edge Function performs privileged operations on the server side.

The service-role key must never be placed inside the React Native application.

The architecture is therefore:

```text
React Native
     │
     │ authenticated request
     ▼
Supabase Edge Function
     │
     │ service role
     ▼
Supabase database
```

---

# Supabase Edge Function and IntelliJ IDEA

The Edge Function uses the Deno runtime.

The source contains imports such as:

```text
jsr:@supabase/functions-js/edge-runtime.d.ts
jsr:@supabase/supabase-js@2
```

and uses:

```text
Deno.serve()
Deno.env.get()
```

The Edge Function is intended to run in Supabase's Deno environment.

The current IntelliJ IDEA setup does not provide Deno language support for this project, so IntelliJ may display errors such as:

```text
Cannot find module or type declarations for side-effect import of jsr:...
Cannot find module jsr:@supabase/supabase-js@2
Cannot find name Deno
```

These IDE errors do not mean that the Supabase Edge Function itself is invalid.

The function should be validated using the Supabase CLI and by deploying/testing it in the Supabase environment.

Do not replace Deno APIs or `jsr:` imports only to remove IntelliJ warnings.

---

# Firebase Configuration

Firebase is used by Android push notifications through Firebase Cloud Messaging.

The Firebase project contains separate Android applications for each environment:

```text
Shopping List Local
com.anonymous.shoppinglist.local

Shopping List Dev
com.anonymous.shoppinglist.dev

Shopping List Prod
com.anonymous.shoppinglist
```

The corresponding Firebase configuration files are stored locally as:

```text
firebase/
├── google-services.local.json
├── google-services.dev.json
└── google-services.prod.json
```

The application selects the correct Firebase configuration dynamically from:

```text
EXPO_PUBLIC_APP_ENV
```

The configuration in `app.config.ts` uses:

```text
./firebase/google-services.${appEnv.toLowerCase()}.json
```

Therefore:

```text
Local → google-services.local.json
Dev   → google-services.dev.json
Prod  → google-services.prod.json
```

Firebase configuration files are environment-specific and must not be mixed between environments.

---

# Firebase Admin SDK Credentials

FCM push delivery also requires a Firebase Admin SDK service account.

This is different from `google-services.json`.

`google-services.*.json` is Android application configuration.

The Firebase Admin SDK service account is a private server-side credential used for FCM.

The service account JSON must **never** be committed to Git.

The private key was uploaded through Expo/EAS credentials for FCM V1.

The service account JSON remains outside the repository.

---

# Expo / EAS Project

The application is connected to an Expo project:

```text
@alexparkhomenkos-team/shopping-list
```

Expo project ID:

```text
5e0f28d0-dae3-4248-9ffa-4625c583e3df
```

The project ID is configured in:

```text
app.config.ts
```

under:

```text
extra.eas.projectId
```

The project also contains:

```text
eas.json
```

for EAS build configuration.

---

# FCM V1 Credentials in EAS

Android push notifications use FCM V1.

The Firebase Admin SDK service account key is configured through EAS credentials rather than stored in Git.

The configuration is managed with:

```bash
pnpm exec eas credentials -p android
```

Then select:

```text
Android Credentials
→ Google Service Account
→ Manage Google Service Account Key for Push Notifications (FCM V1)
```

The private service-account JSON must remain outside the repository.

Never add the private key to:

```text
Git
GitHub
README.md
.env files committed to Git
```

---

# Local Push Notification Testing

Local push notifications were tested using multiple Android emulators.

The application was tested with:

```text
Pixel 8
Pixel 9
Pixel 10
```

Example ADB devices:

```text
emulator-5554
emulator-5556
emulator-5558
```

A list was shared between multiple users.

When one user pressed:

```text
Notify members
```

the other users received the push notification.

The notification was confirmed on the Android device.

This confirms the complete local flow:

```text
User 1
  │
  │ Notify members
  ▼
Supabase Edge Function
  │
  ▼
Expo Push Service
  │
  ▼
FCM
  │
  ├── User 2 device
  └── User 3 device
```

The current user does not receive their own notification.

---

# Push Notifications vs Realtime

Push notifications and Realtime have different responsibilities.

## Realtime

Realtime keeps application data synchronized.

For example:

```text
User 1 adds item
      │
      ▼
Supabase
      │
      ▼
Realtime
      │
      ├── User 2
      └── User 3
```

Realtime is used for:

- list changes;
- list item changes;
- membership changes.

## Push Notifications

Push notifications explicitly notify users when requested.

```text
User 1
  │
  │ presses Notify members
  ▼
Edge Function
  │
  ▼
Push Service
  │
  ├── User 2
  └── User 3
```

Push notifications are **not** automatically triggered by:

- adding an item;
- editing an item;
- deleting an item;
- completing an item;
- renaming a list;
- changing the list description.

This separation is intentional.

---

# Database Migrations

Push notification database changes are implemented through migrations.

Current migrations:

```text
20260925173810_create_user_push_tokens.sql
20260925180000_add_register_push_token_rpc.sql
```

Create a new migration with:

```bash
pnpm run db:migration:new <migration_name>
```

Do not manually modify the remote Development or Production database as the normal workflow.

Migrations are applied by GitHub Actions.

---

# Development Database Migration Workflow

After a migration is merged into `develop`:

```text
Feature branch
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
supabase db push
      │
      ▼
Development Supabase
```

The Development workflow uses:

```bash
supabase db push --project-ref ${{ secrets.SUPABASE_DEV_PROJECT_REF }}
```

After the database migration succeeds, the Development APK is built.

---

# Production Database Migration Workflow

Production follows the same model:

```text
develop
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
supabase db push
      │
      ▼
Production Supabase
```

The Production workflow uses:

```bash
supabase db push --project-ref ${{ secrets.SUPABASE_PROD_PROJECT_REF }}
```

The GitHub Actions workflows currently use manual:

```yaml
workflow_dispatch:
```

The workflows are **not automatically triggered on every push**.

A developer manually starts the appropriate workflow from GitHub Actions.

---

# Development Push Notification Setup

The Development application requires the push notification database migrations to exist in the Development Supabase project.

Therefore, after the push notification migrations are merged into `develop`:

1. Start the **Supabase Development** GitHub Actions workflow.
2. Wait for `supabase db push` to complete.
3. Wait for the Development APK build.
4. Install the new Development APK.
5. Sign in.
6. Allow notification permissions.
7. Verify that the Expo push token is registered.
8. Test **Notify members** using another Development user/device.

If the database migrations have not yet been applied, the application may show an error similar to:

```text
PGRST202:
Could not find the function public.register_push_token
```

This means the Development database does not yet contain the RPC.

It does not mean that the client implementation is broken.

---

# Production Push Notification Setup

Production requires the same components:

```text
Production Supabase
        │
        ├── user_push_tokens table
        ├── register_push_token RPC
        └── notify-list-members Edge Function

Firebase
        │
        └── Production Android application

Expo / EAS
        │
        └── FCM V1 credentials
```

Before testing Production push notifications, verify that:

- Production migrations have been applied;
- the Production Firebase Android application exists;
- the Production `google-services.prod.json` is present;
- FCM V1 credentials are configured in EAS for the Production Android package;
- the Edge Function is deployed to the Production Supabase project.

---

# Deploying the Edge Function

The notification logic is implemented in:

```text
supabase/functions/notify-list-members/index.ts
```

The function must be deployed to the target Supabase project before the cloud application can use it.

The Supabase CLI deployment command is:

```bash
supabase functions deploy notify-list-members
```

Deployment credentials must be configured for the appropriate Supabase project.

The service-role key must never be placed in the mobile application.

---

# Security Rules

The following rules must always be maintained:

- Never expose the Supabase service-role key to the client.
- Never commit Firebase Admin SDK private keys.
- Never commit EAS service-account private keys.
- Never commit production credentials.
- Never use Production credentials in Local development.
- Never use Development credentials in Production.
- The Edge Function must validate the authenticated user.
- The Edge Function must verify access to the requested list.
- The current user must be excluded from notification recipients.
- Push tokens must belong to authenticated application users.
- Database access must continue to be protected by Supabase RLS and database permissions.

---

# Push Notification Troubleshooting

## Push token is not registered

Check:

```text
Notification permission
Firebase configuration
Expo projectId
Supabase RPC
Database migrations
```

The client should log successful registration:

```text
Push token successfully registered for user: <user-id>
```

If Supabase returns:

```text
PGRST202
Could not find the function public.register_push_token
```

check whether the push notification migrations have been applied to the current environment.

---

## Notification request succeeds but no notification appears

Check:

1. The recipient has notification permissions enabled.
2. The recipient has a registered push token.
3. The recipient is a member of the list.
4. The current user is not the recipient.
5. The Expo Push Service ticket does not contain an error.
6. Firebase configuration matches the current environment.
7. FCM V1 credentials are configured for the corresponding Android application.
8. The installed APK was built with the correct environment configuration.

Android notification settings should also be checked on the device.

---

## IntelliJ shows Deno errors

IntelliJ may show errors such as:

```text
Cannot find name Deno
Cannot find module jsr:@supabase/...
```

when opening:

```text
supabase/functions/notify-list-members/index.ts
```

This is related to the IDE's Deno/JSR language support.

The Edge Function is Deno code and is executed by Supabase.

Validate the function through Supabase tooling and deployment rather than rewriting working Deno code only to satisfy IntelliJ's TypeScript inspection.

---

# Current Push Notification Status

The following parts have been implemented and locally tested:

- [x] Expo notifications package installed
- [x] Android notification channel configured
- [x] Notification permissions requested
- [x] Expo Push Token obtained
- [x] Push token stored in Supabase
- [x] Push token registration RPC created
- [x] Multiple devices supported
- [x] Shared list members retrieved
- [x] Current user excluded from recipients
- [x] Edge Function created
- [x] Expo Push Service integration implemented
- [x] Notification tap handling implemented
- [x] Firebase Android applications created for Local / Dev / Prod
- [x] FCM V1 service-account credentials configured in EAS for the Local Android application
- [x] Local end-to-end push notification tested on multiple Android emulators
- [ ] Deploy `notify-list-members` Edge Function to Development
- [ ] Deploy `notify-list-members` Edge Function to Production
- [ ] Configure/verify FCM V1 credentials for Development
- [ ] Configure/verify FCM V1 credentials for Production
- [ ] Run Development workflow after push-notification migrations are merged
- [ ] Run Production workflow after push-notification migrations are merged
- [ ] Perform final cloud end-to-end push test

---

# Important Implementation Principle

Push notifications are an explicit user action.

The application should not become noisy by automatically sending a push notification for every database change.

The intended architecture is:

```text
                ┌─────────────────────┐
                │      Supabase       │
                │                     │
                │ PostgreSQL          │
                │ Realtime             │
                │ Edge Functions       │
                └──────────┬──────────┘
                           │
              ┌────────────┴────────────┐
              │                         │
          Realtime                  Push request
              │                         │
              ▼                         ▼
       Live data sync           Expo Push Service
                                        │
                                        ▼
                                  FCM / APNs
                                        │
                                        ▼
                                  User devices
```

Realtime is responsible for **synchronization**.

Push notifications are responsible for **explicit user notifications**.
