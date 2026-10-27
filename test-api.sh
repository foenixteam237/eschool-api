#!/bin/bash

# 🧪 eSchool API Test Suite
# Test tous les endpoints de l'API

API_URL="http://localhost:3001/api/v1"
ADMIN_EMAIL="admin@eschool.com"
ADMIN_PASSWORD="admin123"

GREEN='\033[0;32m'
RED='\033[0;31m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo ""
echo -e "${BLUE}╔════════════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║          eSchool API Test Suite                                ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════════════════════╝${NC}"
echo ""

# Function to test endpoint
test_endpoint() {
    local method=$1
    local endpoint=$2
    local data=$3
    local token=$4
    local description=$5
    
    echo -e "${YELLOW}Testing: $description${NC}"
    echo -e "Request: ${method} ${API_URL}${endpoint}"
    
    if [ -z "$data" ]; then
        response=$(curl -s -X ${method} \
            -H "Authorization: Bearer ${token}" \
            -H "Content-Type: application/json" \
            "${API_URL}${endpoint}")
    else
        response=$(curl -s -X ${method} \
            -H "Authorization: Bearer ${token}" \
            -H "Content-Type: application/json" \
            -d "${data}" \
            "${API_URL}${endpoint}")
    fi
    
    echo -e "Response: ${response}"
    echo ""
}

# 1. Test Login (get token)
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}1. AUTHENTICATION${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

LOGIN_DATA='{"email":"'${ADMIN_EMAIL}'","password":"'${ADMIN_PASSWORD}'"}'
echo -e "${YELLOW}Testing: Admin Login${NC}"
echo "POST ${API_URL}/auth/login"
echo "Data: {\"email\":\"${ADMIN_EMAIL}\",\"password\":\"${ADMIN_PASSWORD}\"}"
echo ""

LOGIN_RESPONSE=$(curl -s -X POST \
    -H "Content-Type: application/json" \
    -d "${LOGIN_DATA}" \
    "${API_URL}/auth/login")

echo "Response:"
echo "${LOGIN_RESPONSE}" | jq '.' 2>/dev/null || echo "${LOGIN_RESPONSE}"
echo ""

# Extract token
TOKEN=$(echo "${LOGIN_RESPONSE}" | jq -r '.data.token' 2>/dev/null)

if [ -z "$TOKEN" ] || [ "$TOKEN" == "null" ]; then
    echo -e "${RED}❌ Failed to get authentication token${NC}"
    echo "Make sure the backend server is running: npm run start:dev"
    exit 1
fi

echo -e "${GREEN}✅ Authentication successful${NC}"
echo -e "Token: ${TOKEN:0:50}..."
echo ""

# 2. Test Profile endpoint
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}2. GET PROFILE${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

test_endpoint "GET" "/auth/profile" "" "${TOKEN}" "Get Admin Profile"

# 3. Test Students endpoints
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}3. STUDENTS MANAGEMENT${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

test_endpoint "GET" "/students" "" "${TOKEN}" "List all students"

# 4. Test Teachers endpoints
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}4. TEACHERS MANAGEMENT${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

test_endpoint "GET" "/teachers" "" "${TOKEN}" "List all teachers"

# 5. Test Grades endpoints
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}5. GRADES MANAGEMENT${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

test_endpoint "GET" "/grades" "" "${TOKEN}" "List all grades"

# 6. Test Attendance endpoints
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}6. ATTENDANCE MANAGEMENT${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

test_endpoint "GET" "/attendance" "" "${TOKEN}" "List attendance records"

# 7. Test Payments endpoints
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}7. PAYMENTS MANAGEMENT${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

test_endpoint "GET" "/payments" "" "${TOKEN}" "List all payments"

# 8. Test Classes endpoints
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}8. CLASSES MANAGEMENT${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

test_endpoint "GET" "/classes" "" "${TOKEN}" "List all classes"

# Summary
echo ""
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}✅ API Testing Complete!${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo -e "${YELLOW}📚 API Documentation:${NC}"
echo "   🔗 Swagger UI: http://localhost:3001/api/docs"
echo "   📖 README: /home/ramseys/Documents/DEV/web/eschool-api/README.md"
echo ""
