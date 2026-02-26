#!/bin/bash

# ========================================
# TENANT ONBOARDING API TESTING SCRIPT
# ========================================
# Script này giúp test các API Tenant Onboarding
# Sử dụng: bash tenant_onboarding_test.sh

# Configuration
BASE_URL="http://localhost:8080"
JWT_TOKEN="YOUR_JWT_TOKEN_HERE"
CONTENT_TYPE="Content-Type: application/json"

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}TENANT ONBOARDING API TESTING${NC}"
echo -e "${BLUE}========================================${NC}\n"

# ========================================
# STEP 1: TẠO TENANT
# ========================================
echo -e "${BLUE}[STEP 1] Tạo Tenant Mới${NC}\n"

STEP1_RESPONSE=$(curl -s -X POST "$BASE_URL/api/onboarding/step1" \
  -H "Authorization: Bearer $JWT_TOKEN" \
  -H "$CONTENT_TYPE" \
  -d '{
    "companyName": "Kho Gia Dụng Hùng Phát",
    "businessType": "Retail",
    "phoneNumber": "0123456789",
    "website": "https://hungphat.com",
    "address": "123 Đường Lê Lợi, TP HCM",
    "taxId": "0123456789"
  }')

echo -e "${GREEN}Response:${NC}"
echo "$STEP1_RESPONSE" | jq '.'

# Extract tenantId
TENANT_ID=$(echo "$STEP1_RESPONSE" | jq -r '.data.tenantId')
echo -e "\n${GREEN}Tenant ID: $TENANT_ID${NC}\n"

# ========================================
# STEP 2: THIẾT LẬP MASTER DATA
# ========================================
echo -e "${BLUE}[STEP 2] Thiết lập Master Data${NC}\n"

STEP2_RESPONSE=$(curl -s -X POST "$BASE_URL/api/onboarding/step2/$TENANT_ID" \
  -H "Authorization: Bearer $JWT_TOKEN" \
  -H "$CONTENT_TYPE" \
  -d '{
    "locations": [
      {
        "locationType": "WAREHOUSE",
        "name": "Kho Gia Dụng",
        "code": "WH001",
        "address": "123 Đường Lê Lợi"
      },
      {
        "locationType": "SHELF",
        "name": "Kệ A",
        "code": "SHELF_A"
      },
      {
        "locationType": "SHELF",
        "name": "Kệ B",
        "code": "SHELF_B"
      }
    ],
    "products": [
      {
        "productCode": "GD001",
        "productName": "Chậu gốm 20cm",
        "mainUnit": "Cái",
        "category": "Chậu"
      },
      {
        "productCode": "GD002",
        "productName": "Nước tưới cây 1L",
        "mainUnit": "Lít",
        "category": "Nước"
      }
    ]
  }')

echo -e "${GREEN}Response:${NC}"
echo "$STEP2_RESPONSE" | jq '.'

# Extract product IDs
PRODUCT_ID_1=$(echo "$STEP2_RESPONSE" | jq -r '.data.products[0].id')
echo -e "\n${GREEN}Product ID 1: $PRODUCT_ID_1${NC}\n"

# ========================================
# CẤU HÌNH UNIT CONVERSION
# ========================================
echo -e "${BLUE}[UNIT CONVERSION] Cấu hình Quy đổi đơn vị${NC}\n"

UC_RESPONSE=$(curl -s -X POST "$BASE_URL/api/onboarding/unit-conversion/$TENANT_ID/$PRODUCT_ID_1" \
  -H "Authorization: Bearer $JWT_TOKEN" \
  -H "$CONTENT_TYPE" \
  -d '{
    "fromUnit": "Thùng",
    "toUnit": "Chai",
    "factor": 24
  }')

echo -e "${GREEN}Response:${NC}"
echo "$UC_RESPONSE" | jq '.'
echo ""

# ========================================
# STEP 3: GỬI LỜI MỜI THÀNH VIÊN
# ========================================
echo -e "${BLUE}[STEP 3] Gửi Lời Mời Thành Viên${NC}\n"

STEP3_RESPONSE=$(curl -s -X POST "$BASE_URL/api/onboarding/step3/$TENANT_ID" \
  -H "Authorization: Bearer $JWT_TOKEN" \
  -H "$CONTENT_TYPE" \
  -d '{
    "invitations": [
      {
        "email": "staff@example.com",
        "role": "STAFF"
      },
      {
        "email": "accountant@example.com",
        "role": "ACCOUNTANT"
      },
      {
        "email": "manager@example.com",
        "role": "MANAGER"
      }
    ]
  }')

echo -e "${GREEN}Response:${NC}"
echo "$STEP3_RESPONSE" | jq '.'

# Extract invitation code
INVITATION_CODE=$(echo "$STEP3_RESPONSE" | jq -r '.data.invitations[0].invitationCode')
echo -e "\n${GREEN}Invitation Code: $INVITATION_CODE${NC}\n"

# ========================================
# ACCEPT INVITATION
# ========================================
echo -e "${BLUE}[ACCEPT INVITATION] Chấp nhận Lời Mời${NC}\n"

ACCEPT_RESPONSE=$(curl -s -X POST "$BASE_URL/api/onboarding/accept-invitation" \
  -H "Authorization: Bearer $JWT_TOKEN" \
  -H "$CONTENT_TYPE" \
  -d "{
    \"invitationCode\": \"$INVITATION_CODE\"
  }")

echo -e "${GREEN}Response:${NC}"
echo "$ACCEPT_RESPONSE" | jq '.'

echo -e "\n${GREEN}========================================${NC}"
echo -e "${GREEN}Test hoàn thành!${NC}"
echo -e "${GREEN}========================================${NC}\n"

# ========================================
# ADDITIONAL CURL COMMANDS FOR MANUAL TESTING
# ========================================

cat << 'EOF'

# ========================================
# MANUAL TESTING COMMANDS (cURL)
# ========================================

# 1. Tạo Tenant
curl -X POST http://localhost:8080/api/onboarding/step1 \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "companyName": "Kho Test",
    "businessType": "Retail",
    "phoneNumber": "0123456789",
    "website": "https://test.com",
    "address": "123 Test Street",
    "taxId": "0123456789"
  }' | jq '.'

# 2. Thiết lập Master Data
curl -X POST http://localhost:8080/api/onboarding/step2/TENANT_ID \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "locations": [
      { 
        "locationType": "WAREHOUSE",
        "name": "Kho",
        "code": "WH001"
      }
    ],
    "products": [
      {
        "productCode": "P001",
        "productName": "Product",
        "mainUnit": "Cái"
      }
    ]
  }' | jq '.'

# 3. Unit Conversion
curl -X POST http://localhost:8080/api/onboarding/unit-conversion/TENANT_ID/PRODUCT_ID \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "fromUnit": "Unit1",
    "toUnit": "Unit2",
    "factor": 10
  }' | jq '.'

# 4. Gửi Lời Mời
curl -X POST http://localhost:8080/api/onboarding/step3/TENANT_ID \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "invitations": [
      { "email": "user@example.com", "role": "STAFF" }
    ]
  }' | jq '.'

# 5. Accept Invitation
curl -X POST http://localhost:8080/api/onboarding/accept-invitation \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "invitationCode": "INV-ABC123XYZ"
  }' | jq '.'

EOF
