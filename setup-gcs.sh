#!/bin/bash

# Initial setup script for Google Cloud Storage bucket
# Run this once to set up your GCS bucket

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${BLUE}════════════════════════════════════════${NC}"
echo -e "${BLUE}   Google Cloud Storage Setup${NC}"
echo -e "${BLUE}════════════════════════════════════════${NC}"
echo ""

# Check if gcloud is installed
if ! command -v gcloud &> /dev/null; then
    echo -e "${RED}❌ Error: gcloud not found${NC}"
    echo -e "${RED}   Please install Google Cloud SDK: https://cloud.google.com/sdk/docs/install${NC}"
    exit 1
fi

# Get bucket name from user
echo -e "${YELLOW}Enter your bucket name (globally unique):${NC}"
echo -e "${YELLOW}Example: my-awesome-app-frontend${NC}"
read -p "Bucket name: " BUCKET_NAME

if [ -z "$BUCKET_NAME" ]; then
    echo -e "${RED}❌ Bucket name cannot be empty${NC}"
    exit 1
fi

# Get region
echo ""
echo -e "${YELLOW}Select a region:${NC}"
echo "1) us-central1 (Iowa)"
echo "2) us-east1 (South Carolina)"
echo "3) europe-west1 (Belgium)"
echo "4) asia-east1 (Taiwan)"
read -p "Enter choice [1-4]: " REGION_CHOICE

case $REGION_CHOICE in
    1) REGION="us-central1";;
    2) REGION="us-east1";;
    3) REGION="europe-west1";;
    4) REGION="asia-east1";;
    *) echo -e "${RED}Invalid choice, using us-central1${NC}"; REGION="us-central1";;
esac

echo ""
echo -e "${BLUE}Creating bucket: ${BUCKET_NAME} in ${REGION}...${NC}"

# Create bucket
gsutil mb -l ${REGION} gs://${BUCKET_NAME}

if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Failed to create bucket${NC}"
    echo -e "${RED}   The bucket name might already be taken or you may not have permissions${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Bucket created${NC}"
echo ""

# Configure for website hosting
echo -e "${BLUE}Configuring bucket for website hosting...${NC}"
gsutil web set -m index.html -e index.html gs://${BUCKET_NAME}

echo -e "${GREEN}✅ Website hosting configured${NC}"
echo ""

# Make bucket public
echo -e "${BLUE}Making bucket publicly accessible...${NC}"
gsutil iam ch allUsers:objectViewer gs://${BUCKET_NAME}

echo -e "${GREEN}✅ Bucket is now public${NC}"
echo ""

# Set CORS configuration
echo -e "${BLUE}Configuring CORS...${NC}"
if [ -f "cors-config.json" ]; then
    gsutil cors set cors-config.json gs://${BUCKET_NAME}
    echo -e "${GREEN}✅ CORS configured${NC}"
else
    echo -e "${YELLOW}⚠️  cors-config.json not found, skipping CORS configuration${NC}"
fi

echo ""
echo -e "${GREEN}════════════════════════════════════════${NC}"
echo -e "${GREEN}   ✨ Setup Complete! ✨${NC}"
echo -e "${GREEN}════════════════════════════════════════${NC}"
echo ""
echo -e "${BLUE}📝 Next steps:${NC}"
echo -e "   1. Update BUCKET_NAME in deploy.sh to: ${BUCKET_NAME}"
echo -e "   2. Update inventory service URL in .env.production"
echo -e "   3. Run: ./deploy.sh"
echo ""
echo -e "${BLUE}🌐 Your bucket URL will be:${NC}"
echo -e "   https://storage.googleapis.com/${BUCKET_NAME}/index.html"
echo ""

