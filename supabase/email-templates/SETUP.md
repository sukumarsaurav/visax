# Supabase Email Templates — Setup Guide

## Step 1: Fix the Site URL (critical)

This is why confirmation links show `localhost:5173` instead of `immizy.in`.

1. Go to **Supabase Dashboard → Authentication → URL Configuration**
2. Set **Site URL** to:
   ```
   https://immizy.in
   ```
3. Under **Redirect URLs**, add all of these (one per line):
   ```
   https://immizy.in/**
   https://immizy.in/claim-profile
   https://immizy.in/auth/callback
   http://localhost:5173/**
   ```
   Keep the localhost entry so local dev still works.

4. Click **Save**.

---

## Step 2: Add the email templates

Go to **Supabase Dashboard → Authentication → Email Templates**.

You will see these template slots — paste the corresponding HTML file into each:

| Supabase slot | File to use |
|---|---|
| **Confirm signup** | `confirm-signup.html` |
| **Magic Link** | `magic-link.html` |
| **Change Email Address** | `confirm-signup.html` (works as-is) |
| **Reset Password** | `reset-password.html` |
| **Invite User** | `invite-user.html` |

For each template:
1. Click the template slot
2. Set **Subject** (see below)
3. Paste the full HTML into the **Body** field
4. Click **Save**

### Recommended subjects

| Template | Subject line |
|---|---|
| Confirm signup | `Confirm your email — Immizy` |
| Magic Link | `Your Immizy profile is waiting — claim it now` |
| Reset Password | `Reset your Immizy password` |
| Invite User | `You've been invited to join Immizy` |

---

## Step 3: Custom SMTP (optional but recommended)

By default Supabase sends from `noreply@mail.supabase.io` which looks unbranded.
To send from `hello@immizy.in`:

1. Go to **Project Settings → Auth → SMTP Settings**
2. Enable custom SMTP
3. Enter your SMTP credentials (Resend, SendGrid, Postmark, etc.)
4. Set **Sender name**: `Immizy`
5. Set **Sender email**: `hello@immizy.in`

Recommended: **Resend** (resend.com) — free tier 3,000 emails/month, dead simple setup, excellent deliverability for India.

---

## Template variables (Supabase injects these automatically)

| Variable | What it contains |
|---|---|
| `{{ .ConfirmationURL }}` | The full magic/confirmation link |
| `{{ .Token }}` | Raw OTP token |
| `{{ .TokenHash }}` | Hashed token |
| `{{ .SiteURL }}` | Your configured Site URL |
| `{{ .Email }}` | Recipient's email address |
