# CollegeMatch — Supabase Email Templates

Dark/gold branded HTML email templates for Supabase Auth.

## How to apply

1. Go to **Supabase Dashboard → Authentication → Email Templates**
2. For each template, select the type, paste the HTML, and save the subject line.

## Templates

| File | Supabase Template | Subject |
|---|---|---|
| `confirm-signup.html` | Confirm signup | `Confirm your CollegeMatch account` |
| `reset-password.html` | Reset password | `Reset your CollegeMatch password` |
| `magic-link.html` | Magic Link | `Your CollegeMatch sign-in link` |
| `invite-user.html` | Invite user | `You've been invited to CollegeMatch` |

## Supabase template variables used

| Variable | Used in |
|---|---|
| `{{ .ConfirmationURL }}` | All four templates (the action link) |
| `{{ .Email }}` | `reset-password.html` (shows the account email) |
