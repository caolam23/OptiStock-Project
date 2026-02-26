# Workspace API Implementation - Complete Guide

## Overview

This document describes the complete implementation of the **GET /api/v1/workspaces/my-workspaces** endpoint that allows users to retrieve all workspaces (tenants) they are members of.

---

## Architecture Components

### 1. **TenantMember Model** (`TenantMember.java`)
A new model class that represents a member of a workspace with their role and access tracking.

**Fields:**
- `userId`: MongoDB User ID
- `email`: User email (for reference)
- `role`: User's role in the workspace (OWNER, MANAGER, STAFF)
- `joinedAt`: When user joined the workspace
- `lastAccessed`: Last access timestamp

---

### 2. **Updated Tenant Model** (`Tenant.java`)
Enhanced the Tenant model with a new `members` field:

```java
@Builder.Default
private List<TenantMember> members = new ArrayList<>();
```

This allows tracking all workspace members and their roles/access times.

---

### 3. **WorkspaceResponseDTO** (`WorkspaceResponseDTO.java`)
DTO matching the exact frontend requirement structure:

```json
{
  "id": "tenant_123",
  "name": "Kho Gia Dụng Hùng Phát",
  "industryCode": "fmcg",
  "role": "MANAGER",
  "lastAccessed": "2026-02-25T14:30:00Z"
}
```

**Fields:**
- `id`: Tenant MongoDB ID
- `name`: Workspace/Tenant name
- `industryCode`: Industry code (fmcg, electronics, etc.)
- `role`: User's specific role in this workspace
- `lastAccessed`: Last time user accessed this workspace (ISO 8601 format)

---

### 4. **TenantRepository** (Updated)
Added custom MongoDB query method:

```java
@Query("{ 'members.userId': ?0 }")
List<Tenant> findAllByMembersUserId(String userId);
```

This efficiently queries all tenants where a user is a member.

---

### 5. **WorkspaceService** (`WorkspaceService.java`)
Core business logic service with two main methods:

#### `getUserWorkspaces(String userId)`
- **Purpose**: Get all workspaces for a user
- **Process**:
  1. Query MongoDB for all tenants where user is a member
  2. Convert each Tenant to WorkspaceResponseDTO
  3. Extract user's specific role from the members list
  4. Sort by `lastAccessed` (most recent first)
  5. Return sorted list

#### `updateUserLastAccess(String tenantId, String userId)`
- **Purpose**: Update user's last access time when they access a workspace
- **Process**:
  1. Find the tenant by ID
  2. Locate the user in members list
  3. Update the `lastAccessed` timestamp
  4. Save back to MongoDB

---

### 6. **WorkspaceController** (`WorkspaceController.java`)
REST API endpoints:

#### `GET /api/v1/workspaces/my-workspaces`
**Description**: Get all workspaces for the authenticated user

**Parameters**:
- `Authorization` header: JWT token (Bearer <token>)

**Response** (200 OK):
```json
[
  {
    "id": "tenant_123",
    "name": "Kho Gia Dụng Hùng Phát",
    "industryCode": "fmcg",
    "role": "MANAGER",
    "lastAccessed": "2026-02-25T14:30:00Z"
  },
  {
    "id": "tenant_456",
    "name": "Cửa Hàng Điện Tử",
    "industryCode": "electronics",
    "role": "STAFF",
    "lastAccessed": "2026-02-24T10:15:00Z"
  }
]
```

**Error Responses**:
- `401 Unauthorized`: User not authenticated
- `500 Internal Server Error`: Server error

#### `GET /api/v1/workspaces/{tenantId}`
**Description**: Get a specific workspace (if user is member)

**Parameters**:
- `tenantId`: MongoDB ID of the workspace
- `Authorization` header: JWT token

**Response** (200 OK):
```json
{
  "id": "tenant_123",
  "name": "Kho Gia Dụng Hùng Phát",
  "industryCode": "fmcg",
  "role": "MANAGER",
  "lastAccessed": "2026-02-25T14:30:00Z"
}
```

**Error Responses**:
- `401 Unauthorized`: User not authenticated
- `403 Forbidden`: User is not a member of this workspace
- `500 Internal Server Error`: Server error

---

### 7. **SecurityConfig** (Updated)
Added workspace endpoints to the security configuration:

```java
.requestMatchers("/api/v1/workspaces/**").authenticated()
```

This ensures workspace endpoints require authentication but are not restricted to admin roles.

---

### 8. **TenantOnboardingServiceV2** (Updated)
Modified `onboardNewTenant()` to automatically add the owner as an OWNER member:

```java
TenantMember ownerMember = new TenantMember(
    userId,
    email,
    "OWNER",
    LocalDateTime.now(),
    LocalDateTime.now()
);
members.add(ownerMember);
```

This ensures that when a new workspace is created, the creator is automatically added as a member.

---

## Database Schema

**MongoDB Collections Structure**:

### tenants Collection
```javascript
{
  "_id": ObjectId,
  "tenantId": "hungphat-stock",
  "name": "Kho Gia Dụng Hùng Phát",
  "industryCode": "fmcg",
  "ownerEmail": "owner@example.com",
  "members": [
    {
      "userId": "user_456",
      "email": "user@example.com",
      "role": "MANAGER",
      "joinedAt": ISODate("2026-02-20T10:00:00Z"),
      "lastAccessed": ISODate("2026-02-25T14:30:00Z")
    },
    {
      "userId": "user_789",
      "email": "staff@example.com",
      "role": "STAFF",
      "joinedAt": ISODate("2026-02-21T09:00:00Z"),
      "lastAccessed": ISODate("2026-02-22T11:00:00Z")
    }
  ],
  "createdAt": ISODate("2026-02-20T10:00:00Z"),
  "updatedAt": ISODate("2026-02-25T14:30:00Z")
}
```

---

## API Usage Flow

### 1. Frontend calls the endpoint:
```javascript
// With JWT in Authorization header
const response = await fetch('/api/v1/workspaces/my-workspaces', {
  headers: {
    'Authorization': `Bearer ${jwtToken}`
  }
});
```

### 2. Backend flow:
1. **JwtAuthenticationFilter**: Extracts JWT token, validates, stores email in SecurityContext
2. **WorkspaceController**: Receives request, extracts userId from JWT or context
3. **WorkspaceService**: 
   - Queries MongoDB: `find({ "members.userId": userId })`
   - Converts results to DTOs
   - Extracts each user's specific role from members list
   - Sorts by lastAccessed DESC
4. **Returns**: Sorted list of WorkspaceResponseDTO to frontend

### 3. Frontend displays workspaces:
```javascript
const workspaces = await response.json();
console.log(workspaces);
// [
//   {
//     id: "tenant_123",
//     name: "Kho Gia Dụng Hùng Phát",
//     industryCode: "fmcg",
//     role: "MANAGER",
//     lastAccessed: "2026-02-25T14:30:00Z"
//   }
// ]
```

---

## Key Features

✅ **User-specific access**: Only returns workspaces user is member of
✅ **Role tracking**: Each workspace shows user's specific role
✅ **Sorted by access**: Most recently accessed workspace appears first
✅ **Robust error handling**: Returns friendly error messages
✅ **Security**: Requires JWT authentication
✅ **Efficient queries**: Uses MongoDB indexed query on members.userId

---

## Integration with Frontend

### In `Dashboard.jsx`:
```javascript
useEffect(() => {
  const fetchWorkspaces = async () => {
    const response = await fetch('/api/v1/workspaces/my-workspaces', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    const workspaces = await response.json();
    setWorkspaces(workspaces);
  };
  
  if (token) {
    fetchWorkspaces();
  }
}, [token]);
```

---

## Multi-Tenancy Support

This implementation fully supports multi-tenancy:
- **One user can be member of multiple workspaces**
- **Each workspace tracks its own members**
- **User can have different roles in different workspaces**
- **Last access time is tracked per user-per workspace**

---

## Future Enhancements

1. **Add member management endpoints**:
   - POST `/api/v1/workspaces/{tenantId}/members` - Invite members
   - DELETE `/api/v1/workspaces/{tenantId}/members/{userId}` - Remove members

2. **Add pagination support**:
   - Support `?page=1&limit=10` for large workspace lists

3. **Add filtering**:
   - Filter by industry code, status, subscription plan

4. **Add search**:
   - Search workspaces by name

5. **Add workspace settings**:
   - GET/PUT endpoints for workspace configuration

---

## Testing

### Test Case 1: Get user's workspaces
```bash
curl -H "Authorization: Bearer {jwt_token}" \
  http://localhost:8080/api/v1/workspaces/my-workspaces
```

Expected: Array of workspace objects sorted by lastAccessed

### Test Case 2: Get specific workspace
```bash
curl -H "Authorization: Bearer {jwt_token}" \
  http://localhost:8080/api/v1/workspaces/tenant_123
```

Expected: Single workspace object if user is member, 403 if not

### Test Case 3: Unauthorized access
```bash
curl http://localhost:8080/api/v1/workspaces/my-workspaces
```

Expected: 401 Unauthorized, empty array

---

## Files Created/Modified

### Created:
1. `TenantMember.java` - Member model
2. `WorkspaceResponseDTO.java` - Response DTO
3. `WorkspaceService.java` - Business logic
4. `WorkspaceController.java` - REST endpoints

### Modified:
1. `Tenant.java` - Added members field
2. `TenantRepository.java` - Added custom query
3. `SecurityConfig.java` - Added endpoint authorization
4. `TenantOnboardingServiceV2.java` - Add owner as member on creation

---

## Summary

The workspace API is now fully implemented with:
- ✅ Endpoint: GET /api/v1/workspaces/my-workspaces
- ✅ User authentication via JWT
- ✅ Multi-workspace support with role tracking
- ✅ Sorting by last access time
- ✅ Proper DTO structure for frontend
- ✅ MongoDB queries for efficiency
- ✅ Security configuration
- ✅ Error handling

The system is ready for frontend integration and supports full multi-tenancy requirements.
