# Deploying to Render.com

This guide walks you through deploying Oraginal Concepts to Render.com.

---

## Prerequisites

1. A GitHub account with this repository pushed
2. A Render.com account (free tier works)

---

## Step 1: Push to GitHub

If you haven't already, push your code to GitHub:

```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git
git push -u origin main
```

---

## Step 2: Create PostgreSQL Database on Render

1. Log into [Render Dashboard](https://dashboard.render.com)
2. Click **New +** → **PostgreSQL**
3. Configure:
   - **Name**: `oraginal-concepts-db`
   - **Region**: Choose one close to your users
   - **Plan**: Free (or paid for better performance)
4. Click **Create Database**
5. Wait for it to provision, then copy the **External Database URL**

---

## Step 3: Create Web Service

1. Click **New +** → **Web Service**
2. Connect your GitHub repository
3. Configure these settings:

| Setting | Value |
|---------|-------|
| **Name** | `oraginal-concepts` |
| **Region** | Same as your database |
| **Branch** | `main` |
| **Runtime** | Node |
| **Build Command** | `npm install && npm run build` |
| **Start Command** | `npm run start` |
| **Plan** | Free (or paid) |

---

## Step 4: Add Environment Variables

In your Web Service settings, go to **Environment** and add:

| Key | Value |
|-----|-------|
| `NODE_ENV` | `production` |
| `DATABASE_URL` | (paste the External Database URL from Step 2) |
| `ENCRYPTION_KEY` | (generate with `openssl rand -hex 32`) |
| `ADMIN_PASSWORD` | (your admin password) |
| `SESSION_SECRET` | (any random string, or click "Generate") |

---

## Step 5: Deploy

1. Click **Create Web Service**
2. Render will automatically:
   - Clone your repository
   - Install dependencies
   - Build the project
   - Start the server
3. Watch the logs for any errors
4. Once deployed, click your app URL to view your site!

---

## Step 6: Initialize Database

After first deployment, the database tables will be created automatically when the app starts.

If you need to manually push schema changes:
```bash
DATABASE_URL="your-render-database-url" npm run db:push
```

---

## Environment Variables Reference

| Variable | Required | Description |
|----------|----------|-------------|
| `NODE_ENV` | Yes | Set to `production` |
| `DATABASE_URL` | Yes | PostgreSQL connection string |
| `ENCRYPTION_KEY` | Yes | 64-char hex key for encrypting payment credentials |
| `ADMIN_PASSWORD` | Yes | Password for admin panel access |
| `SESSION_SECRET` | Yes | Random string for session security |
| `PORT` | No | Render sets this automatically |

---

## Automatic Deployments

Every push to your `main` branch will trigger an automatic redeploy on Render.

---

## Troubleshooting

**Build fails?**
- Check that all dependencies are in `package.json`
- Review build logs in Render dashboard

**App crashes on startup?**
- Verify all environment variables are set
- Check that DATABASE_URL is correct
- Review logs in Render dashboard

**Database connection errors?**
- Make sure you're using the **External** Database URL
- Verify the database is in the same region as your web service

---

## Custom Domain (Optional)

1. Go to your Web Service → **Settings** → **Custom Domains**
2. Add your domain
3. Update your DNS records as instructed

---

Your Oraginal Concepts site is now live on Render!
