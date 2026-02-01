# SMTP Setup Guide for E-Commerce App

To enable real email sending for the "Forgot Password" functionality, you need to configure an SMTP server (like Gmail).

## 1. Get SMTP Credentials (Gmail example)

If you are using Gmail:
1. Go to your Google Account settings.
2. Search for **"App Passwords"** (You must have 2-Step Verification enabled).
3. Generate a new App Password for "Mail" / "Other".
4. Copy the 16-character password.

## 2. Update Backend Configuration

Open the file:
`backend/appsettings.json`

Locate the `EmailSettings` section and update it:

```json
  "EmailSettings": {
    "Host": "smtp.gmail.com",
    "Port": 587,
    "Username": "YOUR_REAL_EMAIL@gmail.com",
    "Password": "YOUR_APP_PASSWORD_HERE"
  }
```

## 3. Restart Backend

After saving the file, restart the backend server for changes to take effect.

## Testing
- Go to the Login page.
- Click "Forgot Password?".
- Enter your email (must be registered in the system).
- You should receive an email with the OTP.

**Note:** If you leave the username as `your-email@gmail.com`, the system will use **Simulation Mode**, where the OTP is printed to the Backend Terminal (Console) instead of sending an email.
