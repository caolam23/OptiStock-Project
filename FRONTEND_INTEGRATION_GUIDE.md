# Quick Reference: Tenant Onboarding V2 Integration

## 🚀 Frontend Integration (5 Minutes)

### Before (Multi-Step - ❌ DEPRECATED)
```javascript
// 3 separate API calls
POST /api/onboarding/step1  → Create Tenant
POST /api/onboarding/step2  → Setup Master Data
POST /api/onboarding/step3  → Send Invites
```

### After (One-Shot - ✅ NEW)
```javascript
// 1 unified API call
POST /api/v1/onboarding/tenant → Everything in one payload
```

---

## 📋 Frontend Code Example (React)

```javascript
// File: pages/TenantOnboarding/Complete.jsx

import { useState } from 'react';
import { tenantApi } from '../../api/tenantApi'; // Create this file

const OnboardingComplete = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (formData) => {
    setLoading(true);
    setError(null);

    try {
      // Aggregate all form data into single payload
      const request = {
        tenantName: formData.companyName,
        industryCode: formData.industry, // 'electronics', 'fmcg', etc.
        locations: formData.locations.map(loc => ({
          name: loc.name,
          type: loc.type,
          capacity: parseInt(loc.capacity)
        })),
        tenantSettings: {
          requireSerialTracking: formData.settings.requireSerial,
          requireExpiryDate: formData.settings.requireExpiry,
          enableBom: formData.settings.enableBom,
          // ... other flags
        },
        invites: formData.invitations.map(inv => ({
          email: inv.email,
          role: inv.role
        })),
        phoneNumber: formData.phone,
        address: formData.address
      };

      // Single API call
      const response = await tenantApi.onboardTenant(request);

      console.log('✓ Tenant created:', response.data.tenantId);
      console.log('✓ Locations:', response.data.locationsCreated);
      console.log('✓ Invitations sent:', response.data.invitationsSent);

      // Redirect to success page
      navigate('/success', { 
        state: { 
          tenantId: response.data.tenantId,
          tenantName: response.data.tenantName
        }
      });

    } catch (err) {
      setError(err.response?.data?.message || 'Lỗi khởi tạo Tenant');
      console.error('Onboarding error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={(e) => {
      e.preventDefault();
      handleSubmit(getFormData());
    }}>
      {/* Your form fields */}
      <button type="submit" disabled={loading}>
        {loading ? 'Đang khởi tạo...' : 'Hoàn tất khởi tạo'}
      </button>
    </form>
  );
};

export default OnboardingComplete;
```

### Create API Client: `api/tenantApi.js`

```javascript
import axiosClient from './axiosClient';

const tenantApi = {
  onboardTenant: (request) => {
    return axiosClient.post('/v1/onboarding/tenant', request);
  }
};

export default tenantApi;
```

---

## 📝 Industry Code Reference

| Industry | Code | Use Case | Key Settings |
|----------|------|----------|--------------|
| Electronics | `electronics` | Phones, laptops, electronics | requireSerialTracking, enableBom |
| FMCG | `fmcg` | Beverages, snacks, fast-moving | requireExpiryDate, enableAutoReorder |
| Fashion | `fashion` | Clothing, accessories | enablePriceAdjustment |
| Pharmacy | `pharmacy` | Medicines, drugs | requireSerialTracking, requireExpiryDate |
| Food & Beverage | `fnb` | Restaurants, cafes | enableBom, requireExpiryDate |

---

## 🎯 Backend Endpoint

```
URL: POST /api/v1/onboarding/tenant
Authorization: Bearer <JWT_TOKEN>
Content-Type: application/json

Response Status:
  201 → Success (created)
  400 → Validation error
  401 → Unauthorized (missing JWT)
  409 → Conflict (duplicate tenant name)
  500 → Server error
```

---

## 📊 Response Structure

```json
{
  "status": "SUCCESS",
  "data": {
    "tenantId": "kho-dien-thoai-hung-phat",
    "tenantCode": "kho-dien-thoai-hung-phat",
    "tenantName": "Kho Điện Thoại Hùng Phát",
    "industryCode": "electronics",
    "locationsCreated": 2,
    "invitationsSent": 2,
    "locations": [
      { "id": "...", "name": "Tủ Trưng Bày", "type": "DISPLAY", "capacity": 100 }
    ],
    "invitations": [
      { "id": "...", "email": "user@gmail.com", "role": "WAREHOUSE_STAFF", "status": "PENDING" }
    ]
  }
}
```

---

## ✅ Form Data to Send

```javascript
{
  tenantName: string,           // Required: 'Kho Điện Thoại XYZ'
  industryCode: string,         // Required: 'electronics'|'fmcg'|'fashion'|'pharmacy'|'fnb'
  locations: [                  // Required: Array of location objects
    { 
      name: string,            // 'Tủ Trưng Bày'
      type: string,            // 'DISPLAY', 'STORAGE', 'REPAIR', etc.
      capacity: integer         // 100, 500, etc.
    }
  ],
  tenantSettings: {            // Optional: Use template defaults if not provided
    requireSerialTracking: boolean,
    requireExpiryDate: boolean,
    enableBom: boolean,
    // ... more flags
  },
  invites: [                    // Optional: Empty array if no invites
    {
      email: string,           // 'user@gmail.com'
      role: string             // 'WAREHOUSE_STAFF', 'ACCOUNTANT', 'MANAGER'
    }
  ],
  phoneNumber: string,          // Optional
  address: string               // Optional
}
```

---

## 🔧 Backend Configuration

No changes needed! Already configured in:
- ✅ `SecurityConfig.java` - Route added
- ✅ `TenantOnboardingServiceV2.java` - Service ready
- ✅ `TenantOnboardingControllerV2.java` - Endpoint ready

Just run:
```bash
cd backend
.\mvnw.cmd spring-boot:run
```

---

## 🧪 Test with cURL

```bash
curl -X POST http://localhost:8080/api/v1/onboarding/tenant \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "tenantName": "Test Tenant",
    "industryCode": "electronics",
    "locations": [
      {"name": "Storage", "type": "STORAGE", "capacity": 500}
    ],
    "invites": []
  }'
```

---

## ⚠️ Common Mistakes

❌ **DON'T**: Send 3 separate API calls
✅ **DO**: Aggregate all data into 1 POST request

❌ **DON'T**: Use `/api/onboarding/step1` endpoints (deprecated)
✅ **DO**: Use `/api/v1/onboarding/tenant` (new)

❌ **DON'T**: Forget JWT token in Authorization header
✅ **DO**: Include `Authorization: Bearer <token>`

❌ **DON'T**: Use invalid industryCode
✅ **DO**: Use one of: electronics, fmcg, fashion, pharmacy, fnb

❌ **DON'T**: Send empty locations array
✅ **DO**: Send at least 1 location or let template defaults apply

---

## 🎓 Template Auto-Configuration

If you send **empty** `locations` array, backend will use template defaults:

```javascript
// Example: Don't provide custom locations
const request = {
  tenantName: "My FNB",
  industryCode: "fnb",
  locations: [],  // ← Empty array
  tenantSettings: {},
  invites: []
};

// Backend will automatically create 4 FNB template locations:
// - STORAGE-cold (500)
// - STORAGE (300)
// - STAGING (50)
// - DISPLAY (100)
```

---

## 📱 Response Handling

```javascript
const response = await tenantApi.onboardTenant(request);

// Success case
if (response.status === 201 || response.data.status === 'SUCCESS') {
  const { tenantId, tenantName, locationsCreated, invitationsSent } = response.data.data;
  
  // Store tenantId in local storage or context
  localStorage.setItem('tenantId', tenantId);
  
  // Show success message
  showNotification(`✓ Tenant "${tenantName}" created! ${locationsCreated} locations, ${invitationsSent} invites sent`);
  
  // Redirect
  navigate('/dashboard');
}

// Error case
if (response.data.status === 'VALIDATION_ERROR') {
  showError(response.data.message); // e.g., "Tên Tenant không được để trống"
}
```

---

## 🚀 Deployment Checklist

Frontend:
- [ ] Update API call to post to `/api/v1/onboarding/tenant`
- [ ] Aggregate form data into single payload
- [ ] Remove old 3-step API calls
- [ ] Test with local backend
- [ ] Deploy to staging/production

Backend:
- [ ] Already deployed (no additional changes needed)
- [ ] Verify MongoDB connection
- [ ] Verify email service configured
- [ ] Check JWT secret in config

---

## 📞 Support

**Issue**: Getting 400 validation error
**Solution**: Check industryCode is valid (electronics, fmcg, fashion, pharmacy, fnb)

**Issue**: Getting 401 unauthorized
**Solution**: Verify JWT token is in Authorization header: `Bearer <token>`

**Issue**: Tenant created but no emails sent
**Solution**: Check EmailService configuration and SMTP settings

**Issue**: MongoDB connection error
**Solution**: Verify MongoDB is running: `mongod` and connection string in application.properties

---

## 📚 Full Documentation

See: `TENANT_ONBOARDING_V2_API.md` for complete API specification

---

**Ready to integrate? Start with the code example above and follow the checklist!** ✨

