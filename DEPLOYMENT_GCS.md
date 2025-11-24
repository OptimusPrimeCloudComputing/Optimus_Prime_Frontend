# Deploying React App to Google Cloud Storage

## Overview
This guide walks through deploying your React application to Google Cloud Storage (GCS) as a static website.

---

## Prerequisites

1. **Google Cloud Project** - Active GCP project with billing enabled
2. **gcloud CLI** - Installed and authenticated
3. **Node.js & npm** - For building the production app

---

## Step 1: Update Production Configuration

### 1.1 Update API Endpoints for Production

Before building, you need to update the API base URLs in your service files to point to your production microservices.

**Files to Update:**

#### `src/services/paymentService.js`
```javascript
const PAYMENT_API_BASE = import.meta.env.DEV 
  ? "/api"
  : "https://payment-microservice-rpvtfzgvpa-uc.a.run.app";  // ✅ Already correct
```

#### `src/services/customerService.js`
```javascript
const CUSTOMER_API_BASE = import.meta.env.DEV 
  ? "/api"
  : "https://customermicroservice-453095374298.europe-west1.run.app";  // ✅ Already correct
```

#### `src/services/inventoryService.js` (⚠️ NEEDS UPDATE)
```javascript
const INVENTORY_API_BASE = import.meta.env.DEV 
  ? "/api"
  : "YOUR_PRODUCTION_INVENTORY_URL";  // ⚠️ Update this with your deployed inventory service URL
```

---

## Step 2: Build Production Application

### 2.1 Install Dependencies (if not already done)
```bash
npm install
```

### 2.2 Build the Production Bundle
```bash
npm run build
```

This creates an optimized production build in the `dist/` directory.

**Expected Output:**
```
dist/
├── index.html
├── assets/
│   ├── index-[hash].js
│   ├── index-[hash].css
│   └── ...
└── vite.svg
```

### 2.3 Test the Build Locally (Optional)
```bash
npm run preview
```

---

## Step 3: Configure Google Cloud

### 3.1 Install Google Cloud SDK

**macOS (using Homebrew):**
```bash
brew install google-cloud-sdk
```

**Or download from:** https://cloud.google.com/sdk/docs/install

### 3.2 Authenticate with Google Cloud
```bash
gcloud auth login
```

### 3.3 Set Your Project
```bash
# List your projects
gcloud projects list

# Set your project
gcloud config set project YOUR_PROJECT_ID
```

---

## Step 4: Create and Configure Storage Bucket

### 4.1 Create a Bucket
```bash
# Choose a globally unique bucket name
# Recommendation: use your domain name or project-name-web
export BUCKET_NAME="your-app-name-frontend"

# Create bucket (choose appropriate region)
gsutil mb -l us-central1 gs://${BUCKET_NAME}
```

**Region Options:**
- `us-central1` - Iowa, USA
- `us-east1` - South Carolina, USA
- `europe-west1` - Belgium, Europe
- `asia-east1` - Taiwan, Asia

### 4.2 Configure Bucket for Website Hosting
```bash
# Set main page and error page
gsutil web set -m index.html -e index.html gs://${BUCKET_NAME}
```

### 4.3 Make Bucket Public
```bash
# Make all objects in bucket publicly readable
gsutil iam ch allUsers:objectViewer gs://${BUCKET_NAME}
```

### 4.4 Configure CORS (Important for API calls)

Create a CORS configuration file:

**Create `cors-config.json`:**
```json
[
  {
    "origin": ["*"],
    "method": ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    "responseHeader": ["Content-Type", "Authorization"],
    "maxAgeSeconds": 3600
  }
]
```

Apply CORS configuration:
```bash
gsutil cors set cors-config.json gs://${BUCKET_NAME}
```

---

## Step 5: Upload Built Files

### 5.1 Upload All Files
```bash
# Upload all files from dist/ to bucket
gsutil -m rsync -r -d dist/ gs://${BUCKET_NAME}
```

**Flags:**
- `-m` - Parallel uploads (faster)
- `-r` - Recursive
- `-d` - Delete files in bucket not in source

### 5.2 Set Cache Control for Assets
```bash
# Set long cache for assets (they have hash in filename)
gsutil -m setmeta -h "Cache-Control:public, max-age=31536000" \
  "gs://${BUCKET_NAME}/assets/**"

# Set short cache for index.html (no hash in filename)
gsutil setmeta -h "Cache-Control:no-cache, max-age=0" \
  "gs://${BUCKET_NAME}/index.html"
```

---

## Step 6: Access Your Deployed App

### 6.1 Get the Public URL
```bash
echo "https://storage.googleapis.com/${BUCKET_NAME}/index.html"
```

**Example:**
```
https://storage.googleapis.com/your-app-name-frontend/index.html
```

### 6.2 Test the Deployment
Open the URL in your browser and verify:
- ✅ App loads correctly
- ✅ All pages are accessible
- ✅ API calls work (check browser console)
- ✅ Products load from inventory service
- ✅ Customer profile works
- ✅ Payment processing works

---

## Step 7: Set Up Custom Domain (Optional)

### 7.1 Verify Domain Ownership
```bash
# Add your domain
gcloud domains verify YOUR_DOMAIN.com
```

### 7.2 Create Bucket with Domain Name
```bash
# Bucket name must match your domain
gsutil mb gs://www.YOUR_DOMAIN.com
```

### 7.3 Upload Files to Domain Bucket
```bash
gsutil -m rsync -r -d dist/ gs://www.YOUR_DOMAIN.com
```

### 7.4 Configure DNS
Add a CNAME record in your DNS provider:
```
CNAME: www
Value: c.storage.googleapis.com
```

### 7.5 Access via Custom Domain
```
https://www.YOUR_DOMAIN.com
```

---

## Step 8: Set Up Load Balancer with HTTPS (Recommended)

For production, use a Load Balancer with SSL certificate:

### 8.1 Reserve Static IP
```bash
gcloud compute addresses create web-app-ip --global
```

### 8.2 Create Backend Bucket
```bash
gcloud compute backend-buckets create web-app-backend \
  --gcs-bucket-name=${BUCKET_NAME} \
  --enable-cdn
```

### 8.3 Create URL Map
```bash
gcloud compute url-maps create web-app-url-map \
  --default-backend-bucket=web-app-backend
```

### 8.4 Create SSL Certificate
```bash
# Using Google-managed certificate
gcloud compute ssl-certificates create web-app-ssl \
  --domains=YOUR_DOMAIN.com,www.YOUR_DOMAIN.com
```

### 8.5 Create HTTPS Proxy
```bash
gcloud compute target-https-proxies create web-app-https-proxy \
  --url-map=web-app-url-map \
  --ssl-certificates=web-app-ssl
```

### 8.6 Create Forwarding Rule
```bash
gcloud compute forwarding-rules create web-app-https-rule \
  --address=web-app-ip \
  --global \
  --target-https-proxy=web-app-https-proxy \
  --ports=443
```

---

## Deployment Script

Create a deployment script for easy updates:

**Create `deploy.sh`:**
```bash
#!/bin/bash

# Configuration
BUCKET_NAME="your-app-name-frontend"
BUILD_DIR="dist"

echo "🏗️  Building production bundle..."
npm run build

echo "📦 Uploading to Google Cloud Storage..."
gsutil -m rsync -r -d ${BUILD_DIR}/ gs://${BUCKET_NAME}

echo "⚡ Setting cache control..."
gsutil -m setmeta -h "Cache-Control:public, max-age=31536000" \
  "gs://${BUCKET_NAME}/assets/**"

gsutil setmeta -h "Cache-Control:no-cache, max-age=0" \
  "gs://${BUCKET_NAME}/index.html"

echo "✅ Deployment complete!"
echo "🌐 URL: https://storage.googleapis.com/${BUCKET_NAME}/index.html"
```

**Make it executable:**
```bash
chmod +x deploy.sh
```

**Use it:**
```bash
./deploy.sh
```

---

## Environment Variables (Optional)

### Using .env files

**Create `.env.production`:**
```env
VITE_PAYMENT_API_URL=https://payment-microservice-rpvtfzgvpa-uc.a.run.app
VITE_CUSTOMER_API_URL=https://customermicroservice-453095374298.europe-west1.run.app
VITE_INVENTORY_API_URL=https://your-inventory-service-url.run.app
```

**Update service files to use env variables:**

```javascript
const PAYMENT_API_BASE = import.meta.env.DEV 
  ? "/api"
  : import.meta.env.VITE_PAYMENT_API_URL || "https://payment-microservice-rpvtfzgvpa-uc.a.run.app";
```

---

## Troubleshooting

### Issue: 404 on Page Refresh

**Problem:** Refreshing pages other than home returns 404.

**Solution:** Configure URL rewriting in Load Balancer or use hash routing:

**Option 1 - Hash Router (Quick Fix):**
```javascript
// In main.jsx, use HashRouter instead of BrowserRouter
import { HashRouter } from 'react-router-dom'

// URLs will be like: example.com/#/products
```

**Option 2 - URL Rewrite with Load Balancer:**
```bash
# Create URL map that redirects all paths to index.html
gcloud compute url-maps import web-app-url-map \
  --source=url-map-config.yaml
```

### Issue: CORS Errors

**Solution:** Ensure CORS is configured on both:
1. Storage bucket (see Step 4.4)
2. Your microservices (backend)

### Issue: Assets Not Loading

**Solution:** Check asset paths in built files
```bash
# Should use relative paths, not absolute
cat dist/index.html | grep "assets/"
```

### Issue: API Calls Failing

**Solution:** 
1. Check browser console for actual error
2. Verify production API URLs are correct
3. Test API endpoints directly with curl
4. Check microservice CORS configuration

---

## Cost Estimation

**Google Cloud Storage Pricing (as of 2024):**

- **Storage:** ~$0.020 per GB/month (Standard)
- **Network Egress:** ~$0.12 per GB (first 1 TB)
- **Operations:** Class A (writes): $0.05 per 10,000 operations

**Example Monthly Cost:**
- 1 GB website: ~$0.02/month storage
- 10 GB bandwidth: ~$1.20/month
- **Total: ~$1.22/month** (very affordable!)

**With Load Balancer (optional):**
- Additional ~$18-25/month for load balancer
- Includes CDN and SSL

---

## Monitoring and Logs

### View Bucket Usage
```bash
gsutil du -sh gs://${BUCKET_NAME}
```

### View Bucket Metadata
```bash
gsutil ls -L gs://${BUCKET_NAME}
```

### Enable Logging
```bash
# Create logging bucket
gsutil mb gs://${BUCKET_NAME}-logs

# Enable logging
gsutil logging set on -b gs://${BUCKET_NAME}-logs gs://${BUCKET_NAME}
```

---

## CI/CD Integration (GitHub Actions)

**Create `.github/workflows/deploy.yml`:**
```yaml
name: Deploy to GCS

on:
  push:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'
    
    - name: Install dependencies
      run: npm ci
    
    - name: Build
      run: npm run build
    
    - name: Authenticate to Google Cloud
      uses: google-github-actions/auth@v1
      with:
        credentials_json: ${{ secrets.GCP_SA_KEY }}
    
    - name: Deploy to GCS
      run: |
        gsutil -m rsync -r -d dist/ gs://${{ secrets.BUCKET_NAME }}
        gsutil -m setmeta -h "Cache-Control:public, max-age=31536000" \
          "gs://${{ secrets.BUCKET_NAME }}/assets/**"
        gsutil setmeta -h "Cache-Control:no-cache, max-age=0" \
          "gs://${{ secrets.BUCKET_NAME }}/index.html"
```

---

## Security Checklist

- [ ] API endpoints use HTTPS
- [ ] Sensitive data not in frontend code
- [ ] CORS properly configured on all services
- [ ] Bucket permissions are least-privilege
- [ ] SSL/TLS enabled (if using custom domain)
- [ ] Content Security Policy headers set
- [ ] API keys (if any) are in environment variables
- [ ] Regular security updates for dependencies

---

## Quick Reference Commands

```bash
# Build
npm run build

# Deploy to GCS
gsutil -m rsync -r -d dist/ gs://BUCKET_NAME

# View live site
gcloud storage ls gs://BUCKET_NAME --long

# Update CORS
gsutil cors set cors-config.json gs://BUCKET_NAME

# Make public
gsutil iam ch allUsers:objectViewer gs://BUCKET_NAME

# Delete bucket (careful!)
gsutil rm -r gs://BUCKET_NAME
```

---

## Next Steps After Deployment

1. **Test all functionality** in production
2. **Update inventory service** production URL
3. **Set up monitoring** (Cloud Monitoring)
4. **Configure custom domain** (optional)
5. **Set up CI/CD** for automatic deployments
6. **Add analytics** (Google Analytics)
7. **Performance testing** (Lighthouse)
8. **Set up error tracking** (Sentry)

---

**Deployment Status:** Ready to Deploy  
**Estimated Time:** 15-30 minutes  
**Difficulty:** Beginner to Intermediate  

Last Updated: November 23, 2025

