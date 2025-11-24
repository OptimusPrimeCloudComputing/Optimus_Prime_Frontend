#!/bin/bash

# Deployment script for Google Cloud Storage
# Usage: ./deploy.sh

# Configuration
BUCKET_NAME="cloud-project-frontend-vv2418"  # ⚠️ UPDATE THIS with your bucket name
BUILD_DIR="dist"

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}════════════════════════════════════════${NC}"
echo -e "${BLUE}   Deploying to Google Cloud Storage   ${NC}"
echo -e "${BLUE}════════════════════════════════════════${NC}"
echo ""

# Check if bucket name was updated
if [ "$BUCKET_NAME" = "your-app-name-frontend" ]; then
    echo -e "${RED}❌ Error: Please update BUCKET_NAME in deploy.sh${NC}"
    echo -e "${RED}   Edit this file and set your GCS bucket name${NC}"
    exit 1
fi

# Check if gcloud is installed
if ! command -v gsutil &> /dev/null; then
    echo -e "${RED}❌ Error: gsutil not found${NC}"
    echo -e "${RED}   Please install Google Cloud SDK: https://cloud.google.com/sdk/docs/install${NC}"
    exit 1
fi

# Build production bundle
echo -e "${BLUE}🏗️  Building production bundle...${NC}"
npm run build

if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Build failed${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Build successful${NC}"
echo ""

# Check if build directory exists
if [ ! -d "$BUILD_DIR" ]; then
    echo -e "${RED}❌ Error: Build directory '$BUILD_DIR' not found${NC}"
    exit 1
fi

# Upload to GCS
echo -e "${BLUE}📦 Uploading to Google Cloud Storage...${NC}"
gsutil -m rsync -r -d ${BUILD_DIR}/ gs://${BUCKET_NAME}

if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Upload failed${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Upload successful${NC}"
echo ""

# Set cache control for assets
echo -e "${BLUE}⚡ Setting cache control headers...${NC}"

# Long cache for assets (they have hash in filename)
gsutil -m setmeta -h "Cache-Control:public, max-age=31536000, immutable" \
  "gs://${BUCKET_NAME}/assets/**" 2>/dev/null

# Short cache for index.html
gsutil setmeta -h "Cache-Control:no-cache, max-age=0, must-revalidate" \
  "gs://${BUCKET_NAME}/index.html"

echo -e "${GREEN}✅ Cache control set${NC}"
echo ""

# Display deployment info
echo -e "${GREEN}════════════════════════════════════════${NC}"
echo -e "${GREEN}   ✨ Deployment Complete! ✨${NC}"
echo -e "${GREEN}════════════════════════════════════════${NC}"
echo ""
echo -e "${BLUE}🌐 Your app is live at:${NC}"
echo -e "   https://storage.googleapis.com/${BUCKET_NAME}/index.html"
echo ""
echo -e "${BLUE}📊 Bucket info:${NC}"
gsutil du -sh gs://${BUCKET_NAME}
echo ""

