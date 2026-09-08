# Supabase Free and Netlify Free setup

This build supports two modes:

- **Local mode:** If the Supabase environment variables are missing, the game works without an account and stores progress in the current browser. Clearing site data can erase local progress.
- **Cloud mode:** If Supabase is configured and the player signs in, profile progression is loaded and saved to the authenticated Supabase account.

The username is converted into an internal non-deliverable email address because Supabase password authentication requires an email-shaped identifier. No email is sent or verified by the game.

## 1. Create the Supabase project

1. Open [supabase.com](https://supabase.com/) and create a free project.
2. Choose a strong database password and save it somewhere secure.
3. Open **Project Settings > API**.
4. Copy the **Project URL** and the public **anon key**.
5. Never put the `service_role` key in this repository, Vite environment variables, Netlify, or browser code.

## 2. Configure authentication

1. Open **Authentication > Providers > Email**.
2. Enable email/password authentication.
3. Disable **Confirm email** for this family game, since usernames are intentionally not verified emails.
4. Leave password recovery disabled unless you later add a recovery flow. Lost passwords cannot be recovered by this username-only design.

## 3. Create the database tables and RPC

1. Open **SQL Editor** in Supabase.
2. Create a new query.
3. Paste the complete contents of `supabase/migrations/001_initial_cloud_profiles.sql`.
4. Run the query.
5. In **Table Editor**, confirm that `player_profiles` exists and has RLS enabled.
6. In **Authentication > Policies**, confirm the generated policies only allow a user to access rows where `user_id = auth.uid()`.

The client can create and update its own profile snapshot, but it cannot access another account's rows. The migration also creates `record_progression_event`, a restricted RPC boundary for server-validated progression events. Expand that function as game calculations are moved out of `App.jsx`; do not expose arbitrary level or XP writes.

## 4. Configure local development

1. Copy `.env.example` to `.env.local`.
2. Replace the placeholder values with the Supabase Project URL and anon key.
3. Start the app with `npm run dev`.
4. Create a test username and password from the in-game **Sign in to save online** button.
5. Reload the page and confirm the account remains signed in.
6. Switch profiles, play a short battle, reload, and confirm the cloud profile reloads.
7. Test local mode separately by temporarily removing the two environment variables.

## 5. Configure Netlify Free

1. Open the Netlify site connected to this repository.
2. Go to **Site configuration > Environment variables**.
3. Add:
   - `VITE_SUPABASE_URL` = the Supabase Project URL
   - `VITE_SUPABASE_ANON_KEY` = the public anon key
4. Apply the variables to the deploy contexts you use, normally **Production** and **Deploy previews**.
5. Trigger a new deploy. Vite embeds these public values into the browser bundle; that is expected.
6. Do not add `SUPABASE_SERVICE_ROLE_KEY` to Netlify for this client-only build.
7. Open the published site, create a test account, reload, and verify the cloud-save indicator appears.

## 6. Verify the free-tier behavior

1. In Supabase **Table Editor**, confirm a `player_profiles` row appears after the first authenticated save.
2. Confirm the row's `user_id` matches the authenticated user.
3. Sign out and confirm the game returns to local mode.
4. Sign in from a second browser or device and confirm the same profile data appears.
5. Attempt to access another user's profile through the browser console; RLS should return no data.
6. Check **Project Settings > Usage** and **Reports** periodically. Free-tier limits and inactivity rules can change.

## Important limitations

- Local play remains available without an account, but local progress is device/browser-specific and can be lost when site data is cleared.
- Username-only accounts have no email recovery. A forgotten password means the account cannot be recovered through the current UI.
- The anon key is safe to expose only because RLS is enabled. Never weaken the policies or ship the service-role key.
- The current cloud layer persists profile snapshots. Server-authoritative XP, achievements, and rewards should be completed by expanding the RPC and changing combat actions to submit events rather than arbitrary state.
