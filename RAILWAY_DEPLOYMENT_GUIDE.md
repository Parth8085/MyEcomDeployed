# 🚂 Deployment Guide: Railway.app (No AWS/Azure Required)

Since you want to avoid AWS/Azure, **Railway** is the best alternative. It is "developer friendly" and handles all the networking/firewalls automatically. You won't have to run PowerShell commands or configure NSGs.

## ✅ Prerequisites
1.  **GitHub Account**: Your code must be pushed to GitHub.
2.  **Railway Account**: Sign up at [railway.app](https://railway.app).

---

## 🚀 Step 1: Deploy the Database (MySQL)
Railway makes this incredibly easy.

1.  Log in to Railway and click **"New Project"** -> **"Provision MySQL"**.
2.  It will take 10 seconds to create.
3.  Click on the new **MySQL** card.
4.  Go to the **Variables** tab.
5.  Copy the `DATABASE_URL` (or `MYSQL_URL`). You will need this for the backend.

---

## 🚀 Step 2: Deploy the Backend
1.  In the same project, click **"New"** -> **"GitHub Repo"**.
2.  Select your repository (`electronic-ecommerce`).
3.  Click on the new card (it might fail initially, that's normal).
4.  **Settings** -> **General** -> **Root Directory**: Set this to `/backend`.
5.  **Variables**: Add these variables:
    *   `ConnectionStrings__DefaultConnection`: Paste the `DATABASE_URL` from Step 1.
        *   *Note: Ensure the format is converted if needed, but usually Railway's standard works. If not, construct it:* `Server=${MYSQLHOST};Port=${MYSQLPORT};Database=${MYSQLDATABASE};User=${MYSQLUSER};Password=${MYSQLPASSWORD};`
    *   `Jwt__Key`: Generate a random strong string (e.g., `MySuperSecretKey123456789!`).
    *   `Jwt__Issuer`: `https://<YOUR_BACKEND_URL>.up.railway.app/`
    *   `Jwt__Audience`: `https://<YOUR_BACKEND_URL>.up.railway.app/`
    *   `PORT`: `8080` (or `80`).
6.  **Settings** -> **Networking**:
    *   Click **"Generate Domain"**. This gives you a public URL (e.g., `backend-production.up.railway.app`).
    *   **Copy this URL**.

---

## 🚀 Step 3: Deploy the Frontend
1.  Click **"New"** -> **"GitHub Repo"** (Select the same repo again).
2.  Click on the new card.
3.  **Settings** -> **General** -> **Root Directory**: Set this to `/frontend`.
4.  **Variables**:
    *   `VITE_API_BASE_URL`: Paste the **Backend URL** from Step 2 (e.g., `https://backend-production.up.railway.app`).
5.  **Settings** -> **Networking**:
    *   Click **"Generate Domain"**. This is your website link!

---

## 🔁 Final Steps
1.  **Restart Backend**: Sometimes the backend needs a restart to pick up the database variables.
2.  **Visit your Frontend URL**: Everything should work connected together.

## ❓ Why Railway?
- **Automatic Networking**: The backend can talk to the database automatically.
- **No Firewalls**: No `New-NetFirewallRule` or NSG headaches.
- **Visual Dashboard**: You see your entire stack in one view.
