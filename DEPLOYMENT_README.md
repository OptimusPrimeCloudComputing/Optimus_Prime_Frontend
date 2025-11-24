# Deployment Guide - Google Cloud Storage

## 📚 Documentation Overview

You now have everything you need to deploy your React app to Google Cloud Storage!

---

## 📄 Documents Created

### 1. **DEPLOY_QUICKSTART.md** ⚡
**Start here!** - 5-minute quick deployment guide
- Fastest way to get your app live
- Step-by-step instructions
- Minimal configuration needed

### 2. **DEPLOYMENT_GCS.md** 📖
Complete deployment documentation
- Detailed setup instructions
- Custom domain configuration
- HTTPS with Load Balancer
- CI/CD integration
- Troubleshooting guide
- Cost estimates

### 3. **DEPLOYMENT_CHECKLIST.md** ✅
Task-by-task checklist
- Pre-deployment checks
- Setup verification
- Testing checklist
- Post-deployment tasks

---

## 🛠️ Scripts Created

### 1. **setup-gcs.sh** 🏗️
```bash
./setup-gcs.sh
```
One-time setup script to create and configure your GCS bucket
- Creates bucket
- Enables website hosting
- Makes bucket public
- Configures CORS

### 2. **deploy.sh** 🚀
```bash
./deploy.sh
```
Deployment script for uploading your app
- Builds production bundle
- Uploads to GCS
- Sets cache headers
- Shows deployment URL

### 3. **cors-config.json** 🔧
CORS configuration for your bucket
- Allows API calls from your app
- Applied during setup

---

## ⚡ Quick Start

### For First-Time Deployment:

```bash
# 1. Update inventory service URL
# Edit: src/services/inventoryService.js
# Change: "https://your-inventory-service-url.run.app"
# To your actual URL

# 2. Authenticate with Google Cloud
gcloud auth login
gcloud config set project YOUR_PROJECT_ID

# 3. Run setup (one time only)
./setup-gcs.sh

# 4. Update bucket name in deploy.sh
# Edit: deploy.sh
# Change: BUCKET_NAME="your-app-name-frontend"

# 5. Deploy!
./deploy.sh
```

### For Subsequent Deployments:

```bash
./deploy.sh
```

That's it! 🎉

---

## 📋 Pre-Deployment Checklist

Before deploying, make sure:

- [ ] **Inventory service URL** updated in `src/services/inventoryService.js`
- [ ] **gcloud CLI** installed and authenticated
- [ ] **GCS bucket** created (run `./setup-gcs.sh`)
- [ ] **Bucket name** updated in `deploy.sh`
- [ ] **App builds** successfully (`npm run build`)

---

## 🧪 Test Before Deploying

```bash
# Build production version
npm run build

# Test locally
npm run preview

# Open: http://localhost:4173
```

Verify:
- ✅ App loads without errors
- ✅ All pages accessible
- ✅ Console is clean (no errors)

---

## 📊 Files & Structure

### Updated Files:
```
src/services/inventoryService.js  ✅ Updated with production URL placeholder
```

### New Files:
```
deploy.sh                    ✅ Deployment script
setup-gcs.sh                 ✅ Initial setup script
cors-config.json             ✅ CORS configuration
DEPLOY_QUICKSTART.md         ✅ Quick start guide
DEPLOYMENT_GCS.md            ✅ Complete documentation
DEPLOYMENT_CHECKLIST.md      ✅ Deployment checklist
DEPLOYMENT_README.md         ✅ This file
```

---

## 🌐 Your Production URLs

### Current Microservices:
- **Payment**: `https://payment-microservice-rpvtfzgvpa-uc.a.run.app`
- **Customer**: `https://customermicroservice-453095374298.europe-west1.run.app`
- **Inventory**: ⚠️ **UPDATE THIS** when deployed

### Your Frontend (after deployment):
```
https://storage.googleapis.com/YOUR-BUCKET-NAME/index.html
```

---

## 🔄 Deployment Workflow

### First Time Setup:
```
Update URLs → Authenticate → Setup Bucket → Deploy
```

### Regular Updates:
```
Make Changes → Test Locally → Run deploy.sh → Done!
```

---

## 💰 Cost Estimate

**Monthly Cost for Small App:**
- Storage (1GB): ~$0.02
- Bandwidth (10GB): ~$1.20
- Operations: ~$0.05
- **Total: ~$1.27/month**

Very affordable! 💵

---

## 🎯 Deployment Targets

Your app integrates with:
1. ✅ **Payment Microservice** - Already deployed on Cloud Run
2. ✅ **Customer Microservice** - Already deployed on Cloud Run
3. ⚠️ **Inventory Microservice** - Running locally (deploy to production)
4. 🚀 **Frontend** - Ready to deploy to GCS

---

## 📞 Getting Help

### Quick Issues:

**CORS Errors:**
```bash
gsutil cors set cors-config.json gs://YOUR-BUCKET-NAME
```

**Build Errors:**
```bash
npm install
npm run build
```

**Upload Errors:**
```bash
gcloud auth login
```

### Detailed Help:
- See `DEPLOYMENT_GCS.md` for comprehensive troubleshooting
- Check `DEPLOYMENT_CHECKLIST.md` for verification steps

---

## 🚀 Next Steps After Deployment

1. **Test everything** on the live site
2. **Monitor performance** with Chrome DevTools
3. **Set up custom domain** (optional)
4. **Enable HTTPS** with Load Balancer (optional)
5. **Configure CI/CD** for automatic deployments (optional)
6. **Add monitoring** with Google Cloud Monitoring

---

## ⚙️ Advanced Features

See `DEPLOYMENT_GCS.md` for:
- Custom domain setup
- HTTPS with SSL certificate
- Load balancer configuration
- CDN integration
- CI/CD with GitHub Actions
- Monitoring and logging
- Performance optimization

---

## 📦 What Gets Deployed

When you run `./deploy.sh`:

```
dist/
├── index.html              → Main HTML file
├── assets/
│   ├── index-[hash].js    → JavaScript bundle
│   ├── index-[hash].css   → CSS bundle
│   └── ...                → Other assets
└── vite.svg               → Favicon
```

All files uploaded to:
```
gs://YOUR-BUCKET-NAME/
```

Accessible at:
```
https://storage.googleapis.com/YOUR-BUCKET-NAME/index.html
```

---

## ✅ Success Criteria

Your deployment is successful when:
- ✅ App is accessible via GCS URL
- ✅ All pages load correctly
- ✅ Products display from inventory API
- ✅ Customer profile works
- ✅ Payments process successfully
- ✅ No console errors
- ✅ All API calls succeed

---

## 🎉 Ready to Deploy!

You're all set! Follow the **DEPLOY_QUICKSTART.md** guide to get started.

**Estimated Time:** 5-10 minutes for first deployment
**Difficulty:** Beginner-friendly
**Prerequisites:** Covered above

---

**Good luck with your deployment! 🚀**

For questions or issues, refer to:
1. `DEPLOY_QUICKSTART.md` - Quick start
2. `DEPLOYMENT_GCS.md` - Detailed guide
3. `DEPLOYMENT_CHECKLIST.md` - Verification steps

---

Last Updated: November 23, 2025

