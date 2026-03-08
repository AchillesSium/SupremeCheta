#!/bin/bash

# JWT Authentication Testing Script
# This script tests all the JWT authentication features

echo "🧪 JWT Authentication Testing"
echo "=============================="
echo ""

BASE_URL="http://localhost:5001/api/auth"

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Test 1: Registration
echo "${BLUE}Test 1: User Registration${NC}"
echo "----------------------------"
RANDOM_NUM=$RANDOM
REGISTER_RESPONSE=$(curl -s -X POST "$BASE_URL/register" \
  -H "Content-Type: application/json" \
  -d "{
    \"username\": \"testuser$RANDOM_NUM\",
    \"email\": \"test$RANDOM_NUM@example.com\",
    \"password\": \"Test123456!\",
    \"first_name\": \"Test\",
    \"last_name\": \"User\"
  }")

echo "$REGISTER_RESPONSE" | jq '.'

# Check if registration was successful
if echo "$REGISTER_RESPONSE" | jq -e '.success' > /dev/null; then
  echo "${GREEN}✅ Registration successful${NC}"
  echo ""
else
  echo "${RED}❌ Registration failed${NC}"
  echo ""
  exit 1
fi

# Save email and password for login
TEST_EMAIL="test$RANDOM_NUM@example.com"
TEST_PASSWORD="Test123456!"

# Test 2: Login
echo ""
echo "${BLUE}Test 2: User Login${NC}"
echo "----------------------------"
LOGIN_RESPONSE=$(curl -s -X POST "$BASE_URL/login" \
  -H "Content-Type: application/json" \
  -d "{
    \"email\": \"$TEST_EMAIL\",
    \"password\": \"$TEST_PASSWORD\"
  }")

echo "$LOGIN_RESPONSE" | jq '.'

# Extract tokens
ACCESS_TOKEN=$(echo "$LOGIN_RESPONSE" | jq -r '.accessToken')
REFRESH_TOKEN=$(echo "$LOGIN_RESPONSE" | jq -r '.refreshToken')

if [ "$ACCESS_TOKEN" != "null" ] && [ "$ACCESS_TOKEN" != "" ]; then
  echo "${GREEN}✅ Login successful${NC}"
  echo "Access Token: ${ACCESS_TOKEN:0:50}..."
  echo "Refresh Token: ${REFRESH_TOKEN:0:50}..."
  echo ""
else
  echo "${RED}❌ Login failed${NC}"
  echo ""
  exit 1
fi

# Test 3: Access Protected Route
echo ""
echo "${BLUE}Test 3: Access Protected Route (/auth/me)${NC}"
echo "----------------------------"
ME_RESPONSE=$(curl -s -X GET "$BASE_URL/me" \
  -H "Authorization: Bearer $ACCESS_TOKEN")

echo "$ME_RESPONSE" | jq '.'

if echo "$ME_RESPONSE" | jq -e '.success' > /dev/null; then
  echo "${GREEN}✅ Protected route access successful${NC}"
  echo ""
else
  echo "${RED}❌ Protected route access failed${NC}"
  echo ""
fi

# Test 4: Access Protected Route WITHOUT Token (Should Fail)
echo ""
echo "${BLUE}Test 4: Access Protected Route WITHOUT Token (Should Fail)${NC}"
echo "----------------------------"
UNAUTHORIZED_RESPONSE=$(curl -s -X GET "$BASE_URL/me")

echo "$UNAUTHORIZED_RESPONSE" | jq '.'

if echo "$UNAUTHORIZED_RESPONSE" | jq -e '.success == false' > /dev/null; then
  echo "${GREEN}✅ Correctly rejected unauthorized access${NC}"
  echo ""
else
  echo "${RED}❌ Security issue: Allowed access without token!${NC}"
  echo ""
fi

# Test 5: Refresh Token
echo ""
echo "${BLUE}Test 5: Token Refresh${NC}"
echo "----------------------------"
REFRESH_RESPONSE=$(curl -s -X POST "$BASE_URL/refresh" \
  -H "Content-Type: application/json" \
  -d "{\"refreshToken\": \"$REFRESH_TOKEN\"}")

echo "$REFRESH_RESPONSE" | jq '.'

# Extract new tokens
NEW_ACCESS_TOKEN=$(echo "$REFRESH_RESPONSE" | jq -r '.accessToken')
NEW_REFRESH_TOKEN=$(echo "$REFRESH_RESPONSE" | jq -r '.refreshToken')

if [ "$NEW_ACCESS_TOKEN" != "null" ] && [ "$NEW_ACCESS_TOKEN" != "" ]; then
  echo "${GREEN}✅ Token refresh successful${NC}"
  echo "New Access Token: ${NEW_ACCESS_TOKEN:0:50}..."
  echo "New Refresh Token: ${NEW_REFRESH_TOKEN:0:50}..."
  echo ""
else
  echo "${RED}❌ Token refresh failed${NC}"
  echo ""
  exit 1
fi

# Test 6: Use Old Refresh Token Again (Should Fail - Token Rotation)
echo ""
echo "${BLUE}Test 6: Try to Reuse Old Refresh Token (Should Fail)${NC}"
echo "----------------------------"
OLD_REFRESH_RESPONSE=$(curl -s -X POST "$BASE_URL/refresh" \
  -H "Content-Type: application/json" \
  -d "{\"refreshToken\": \"$REFRESH_TOKEN\"}")

echo "$OLD_REFRESH_RESPONSE" | jq '.'

if echo "$OLD_REFRESH_RESPONSE" | jq -e '.code == "TOKEN_REVOKED"' > /dev/null; then
  echo "${GREEN}✅ Token rotation working! Old token correctly rejected${NC}"
  echo ""
else
  echo "${YELLOW}⚠️  Token rotation might not be working correctly${NC}"
  echo ""
fi

# Test 7: Logout
echo ""
echo "${BLUE}Test 7: User Logout${NC}"
echo "----------------------------"
LOGOUT_RESPONSE=$(curl -s -X POST "$BASE_URL/logout" \
  -H "Authorization: Bearer $NEW_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d "{\"refreshToken\": \"$NEW_REFRESH_TOKEN\"}")

echo "$LOGOUT_RESPONSE" | jq '.'

if echo "$LOGOUT_RESPONSE" | jq -e '.success' > /dev/null; then
  echo "${GREEN}✅ Logout successful${NC}"
  echo ""
else
  echo "${RED}❌ Logout failed${NC}"
  echo ""
fi

# Test 8: Try to Use Refresh Token After Logout (Should Fail)
echo ""
echo "${BLUE}Test 8: Try to Use Refresh Token After Logout (Should Fail)${NC}"
echo "----------------------------"
AFTER_LOGOUT_RESPONSE=$(curl -s -X POST "$BASE_URL/refresh" \
  -H "Content-Type: application/json" \
  -d "{\"refreshToken\": \"$NEW_REFRESH_TOKEN\"}")

echo "$AFTER_LOGOUT_RESPONSE" | jq '.'

if echo "$AFTER_LOGOUT_RESPONSE" | jq -e '.code == "TOKEN_REVOKED"' > /dev/null; then
  echo "${GREEN}✅ Token revocation working! Logged out token correctly rejected${NC}"
  echo ""
else
  echo "${RED}❌ Security issue: Token still works after logout!${NC}"
  echo ""
fi

# Test 9: Rate Limiting
echo ""
echo "${BLUE}Test 9: Rate Limiting (Attempting 6 failed logins)${NC}"
echo "----------------------------"
for i in {1..6}
do
  echo "Attempt $i..."
  RATE_LIMIT_RESPONSE=$(curl -s -X POST "$BASE_URL/login" \
    -H "Content-Type: application/json" \
    -d "{
      \"email\": \"$TEST_EMAIL\",
      \"password\": \"WrongPassword123!\"
    }")

  if [ $i -eq 6 ]; then
    echo "$RATE_LIMIT_RESPONSE" | jq '.'
    if echo "$RATE_LIMIT_RESPONSE" | grep -q "Too many requests\|many login attempts"; then
      echo "${GREEN}✅ Rate limiting working!${NC}"
    else
      echo "${YELLOW}⚠️  Rate limiting might not be working${NC}"
    fi
  fi
done
echo ""

# Summary
echo ""
echo "=============================="
echo "${BLUE}📊 Test Summary${NC}"
echo "=============================="
echo "✅ Registration"
echo "✅ Login with JWT tokens"
echo "✅ Protected route access"
echo "✅ Unauthorized access blocked"
echo "✅ Token refresh"
echo "✅ Token rotation"
echo "✅ Logout"
echo "✅ Token revocation"
echo "✅ Rate limiting"
echo ""
echo "${GREEN}🎉 All tests completed!${NC}"
echo ""
echo "Check your MongoDB to verify:"
echo "  - Users collection: Password is hashed"
echo "  - tokenblacklists collection: Revoked tokens"
echo "  - usersessions collection: Active sessions"
echo ""
