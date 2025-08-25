# Deployment Guide - GitHub to Live App

## Quick Deployment Options (Easiest to Hardest)

## 1. 🚀 Vercel (Recommended - Free & Fast)

### Steps:
1. Go to [vercel.com](https://vercel.com)
2. Sign up with your GitHub account
3. Click "New Project"
4. Import your repository: `SwayzeCRM/todo`
5. Configure:
   - Framework Preset: Other
   - Root Directory: ./
   - Build Command: (leave empty)
6. Click "Deploy"

**Your app will be live at:** `https://todo-[random].vercel.app`

### Custom Domain:
- Add your domain in Vercel dashboard
- Point DNS to Vercel

---

## 2. 📄 GitHub Pages (Simplest - Free)

### Steps:
1. Go to your repo: https://github.com/SwayzeCRM/todo
2. Click Settings → Pages
3. Source: Deploy from a branch
4. Branch: main / (root)
5. Click Save

**Your app will be live at:** `https://swayzecrm.github.io/todo/`

### Note for GitHub Pages:
Since your app uses clean URLs, add this to handle routing:
```javascript
// Add to top of your HTML files
if (window.location.pathname.endsWith('.html')) {
  window.location.replace(window.location.pathname.replace('.html', ''));
}
```

---

## 3. 🔥 Netlify (Great Alternative - Free)

### Steps:
1. Go to [netlify.com](https://netlify.com)
2. Sign up with GitHub
3. Click "New site from Git"
4. Choose GitHub → Select `SwayzeCRM/todo`
5. Build settings:
   - Build command: (leave empty)
   - Publish directory: ./
6. Click "Deploy site"

**Your app will be live at:** `https://[random-name].netlify.app`

### Clean URLs on Netlify:
Create `_redirects` file:
```
/admin              /admin.html      200
/analytics          /analytics.html   200
/onboarding         /onboarding.html  200
/test              /test.html        200
```

---

## 4. 🏗️ HighLevel Funnel Builder (Your Original Plan)

### Steps:
1. In HighLevel, go to Sites → Funnels & Websites
2. Create new funnel
3. For each page:
   - Add New Step
   - Set path (e.g., `/admin`)
   - Copy HTML from GitHub
   - Paste into HighLevel editor
   - Save

### Keeping in Sync:
When you update GitHub, manually copy changes to HighLevel

---

## 5. 🌐 Render (Free with Limitations)

### Steps:
1. Go to [render.com](https://render.com)
2. Sign up with GitHub
3. New → Static Site
4. Connect GitHub repo
5. Settings:
   - Name: todo-app
   - Build Command: (leave empty)
   - Publish Directory: ./
6. Create Static Site

**Your app will be live at:** `https://todo-app.onrender.com`

---

## 6. 🎯 Surge.sh (Command Line - Free)

### First Time Setup:
```bash
npm install -g surge
```

### Deploy:
```bash
cd /Users/timjames/Documents/Projects/todo
surge

# Choose domain or use suggested
# Email/password if first time
```

**Your app will be live at:** `https://[chosen-name].surge.sh`

---

## 7. 🚁 Railway (Modern Platform)

### Steps:
1. Go to [railway.app](https://railway.app)
2. Sign in with GitHub
3. New Project → Deploy from GitHub repo
4. Select `SwayzeCRM/todo`
5. Railway will auto-deploy

**Your app will be live at:** `https://todo-production.up.railway.app`

---

## Comparison Table

| Platform | Free Tier | Custom Domain | Auto-Deploy | Setup Time | Best For |
|----------|-----------|---------------|-------------|------------|----------|
| Vercel | ✅ Yes | ✅ Yes | ✅ Yes | 2 min | Production apps |
| GitHub Pages | ✅ Yes | ✅ Yes | ✅ Yes | 1 min | Simple hosting |
| Netlify | ✅ Yes | ✅ Yes | ✅ Yes | 3 min | Static sites |
| HighLevel | 💰 Paid | ✅ Yes | ❌ No | 10 min | Marketing funnels |
| Render | ✅ Limited | ✅ Yes | ✅ Yes | 3 min | Full-stack apps |
| Surge | ✅ Yes | ✅ Yes | ❌ No | 1 min | Quick deploys |
| Railway | ✅ Trial | ✅ Yes | ✅ Yes | 2 min | Modern apps |

---

## Environment Variables Setup

For production, create environment variables instead of hardcoding:

### Vercel:
1. Project Settings → Environment Variables
2. Add:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### Netlify:
1. Site Settings → Environment Variables
2. Add same variables

---

## Auto-Deploy from GitHub

Most platforms support auto-deploy:

### Enable Auto-Deploy:
1. **Vercel/Netlify**: Automatic when connected
2. **GitHub Actions**: For custom deployment

### GitHub Actions Example:
```yaml
# .github/workflows/deploy.yml
name: Deploy
on:
  push:
    branches: [main]
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Deploy to production
        run: |
          # Your deploy command
```

---

## Domain Setup

### To use custom domain:
1. Buy domain (Namecheap, GoDaddy, etc.)
2. In deployment platform:
   - Add custom domain
   - Get DNS records
3. In domain provider:
   - Update DNS records
   - Wait for propagation (5-30 min)

### Example DNS:
```
Type: A
Name: @
Value: [Platform IP]

Type: CNAME
Name: www
Value: [Platform URL]
```

---

## Quick Start Recommendations

### For Quick Testing:
```bash
# GitHub Pages (fastest)
# Just enable in repo settings
```

### For Production:
```bash
# Vercel (best free option)
# 1. Sign up with GitHub
# 2. Import repo
# 3. Deploy
```

### For Marketing/Sales:
```bash
# HighLevel (if you have account)
# Copy HTML to funnel builder
```

---

## Monitoring Your App

### Free Monitoring:
- **UptimeRobot**: Monitor uptime
- **Google Analytics**: Track visitors
- **Sentry**: Error tracking

### Add Analytics:
```html
<!-- Add to your HTML -->
<script async src="https://www.googletagmanager.com/gtag/js?id=GA_MEASUREMENT_ID"></script>
```

---

## Updating Your Live App

### Auto-Deploy Platforms (Vercel, Netlify):
```bash
git push  # Automatically deploys
```

### Manual Platforms (Surge, GitHub Pages):
```bash
./push-to-github.sh "Update"  # First push to GitHub
surge  # Then redeploy (for Surge)
```

---

## SSL/HTTPS

✅ All recommended platforms include free SSL certificates

---

## Need Help?

1. **Vercel**: [vercel.com/docs](https://vercel.com/docs)
2. **Netlify**: [docs.netlify.com](https://docs.netlify.com)
3. **GitHub Pages**: [pages.github.com](https://pages.github.com)

---

## Next Steps:
1. Choose platform based on needs
2. Deploy in 2-3 minutes
3. Share your live URL!

Your app is ready to go live! 🚀