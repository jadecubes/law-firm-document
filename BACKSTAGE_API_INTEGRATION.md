# Backstage API Integration - Documentation Update

**Date**: October 26, 2024
**Status**: ✅ **COMPLETED**

## 📦 What Was Changed

Successfully reorganized the documentation navigation to group **Admin API** and **User API** under a unified **"Backstage API"** menu item.

## 🎯 Goal

Create a hierarchical menu structure where:
```
Backstage API (parent menu)
├── Admin API (child section)
└── User API (child section)
```

Instead of the previous flat structure:
```
Admin API (separate menu)
User API (separate menu)
```

## 📝 Changes Made

### 1. Updated Sidebar Configuration
**File**: `sidebars.ts`

**Before**:
```typescript
const sidebars: SidebarsConfig = {
  apiSidebar: require('./docs/admin-api/sidebar.ts'),
  userApiSidebar: require('./docs/user-api/sidebar.ts'),
};
```

**After**:
```typescript
const sidebars: SidebarsConfig = {
  backstageApiSidebar: (() => {
    const adminSidebar = require('./docs/admin-api/sidebar.ts');
    const userSidebar = require('./docs/user-api/sidebar.ts');

    const adminItems = adminSidebar.default?.apisidebar || adminSidebar.apisidebar || [];
    const userItems = userSidebar.default?.apisidebar || userSidebar.apisidebar || [];

    return [
      {
        type: 'category',
        label: 'Admin API',
        collapsed: false,
        link: {
          type: 'doc',
          id: 'admin-api/law-firm-admin-provisioning-api-logto-managed-rbac',
        },
        items: adminItems.slice(1), // Skip the intro doc
      },
      {
        type: 'category',
        label: 'User API',
        collapsed: false,
        link: {
          type: 'doc',
          id: 'user-api/law-firm-user-portal-api',
        },
        items: userItems.slice(1), // Skip the intro doc
      },
    ];
  })(),
};
```

### 2. Updated Navigation Bar
**File**: `docusaurus.config.ts`

**Before** (2 separate menu items):
```typescript
items: [
  {
    type: 'docSidebar',
    sidebarId: 'apiSidebar',
    position: 'left',
    label: 'Admin API',
  },
  {
    type: 'docSidebar',
    sidebarId: 'userApiSidebar',
    position: 'left',
    label: 'User API',
  },
]
```

**After** (1 unified menu item):
```typescript
items: [
  {
    type: 'docSidebar',
    sidebarId: 'backstageApiSidebar',
    position: 'left',
    label: 'Backstage API',
  },
]
```

## 🌐 How to Access

### Navigation Structure

**Top Navigation Bar**:
```
Specifications | Backstage API | C4 Model | [Search]
```

**Backstage API Sidebar** (when clicked):
```
Backstage API
├── Admin API
│   ├── [Overview/Intro]
│   ├── Admin — Law Firms
│   │   ├── Create a new law firm
│   │   ├── List law firms
│   │   └── Get a law firm
│   ├── Admin — Users & Lawyers
│   ├── Admin — Logto Bridge
│   ├── Admin — Access Grants
│   ├── Admin — Capabilities
│   └── Admin — Support Access
└── User API
    ├── [Overview/Intro]
    ├── User — Profile
    ├── User — Firm Members
    ├── User — Cases
    ├── User — Clients
    ├── User — Documents
    ├── User — Appointments
    ├── User — Time & Billing
    ├── User — Invoices
    ├── User — Notifications
    └── User — Collaboration
```

### Direct Links

**Server**: http://localhost:3000

**Entry Points**:
- Backstage API Overview: http://localhost:3000/docs/admin-api/law-firm-admin-provisioning-api-logto-managed-rbac
- Admin API Section: Click "Backstage API" → expand "Admin API"
- User API Section: Click "Backstage API" → expand "User API"

## ✅ Benefits

### 1. **Clearer Context**
- Both APIs are now grouped under "Backstage API" which clarifies they are for the law firm's internal backstage system
- Distinguishes these from potential future client-facing APIs

### 2. **Reduced Navigation Clutter**
- Navigation bar has 3 items instead of 4
- Cleaner, more organized menu structure

### 3. **Logical Hierarchy**
- Admin operations and User operations are related
- Both are part of the backstage system
- Hierarchical grouping makes this relationship explicit

### 4. **Better User Experience**
- Users can see all backstage-related APIs in one place
- Easier to switch between Admin and User API docs
- Maintains all original functionality and links

## 📊 Technical Details

### Sidebar Structure Explained

The unified sidebar uses an **Immediately Invoked Function Expression (IIFE)** to:
1. Load both admin and user sidebar configurations
2. Handle different export formats (default vs named exports)
3. Extract the sidebar items from each
4. Create two top-level categories
5. Return the combined structure

### Key Features

- **Dynamic Loading**: Sidebar items are loaded at build time from existing sidebar files
- **No Duplication**: Original sidebar files remain unchanged
- **Flexible**: Supports both `default` and named exports
- **Maintainable**: Changes to individual API sidebars automatically reflect in the unified view

### Category Settings

Both Admin API and User API categories use:
- `collapsed: false` - Expanded by default for easy access
- `link` - Clicking the category name navigates to the overview page
- `items` - Child items loaded from respective sidebar files (minus the overview doc which is used as the link)

## 🔄 Migration Guide

### For Users
**No action required**. All existing links continue to work:
- Old: `/docs/admin-api/...` → Still works
- Old: `/docs/user-api/...` → Still works

### For Developers
**No changes to API sidebar files needed**:
- `docs/admin-api/sidebar.ts` - Unchanged
- `docs/user-api/sidebar.ts` - Unchanged

The integration happens at the configuration level in `sidebars.ts`.

## 🧪 Testing

### Verification Steps

1. ✅ Server starts without errors
2. ✅ Navigation bar shows "Backstage API" menu item
3. ✅ Clicking "Backstage API" shows both Admin API and User API sections
4. ✅ All admin endpoints accessible under Admin API section
5. ✅ All user endpoints accessible under User API section
6. ✅ Overview pages linked correctly
7. ✅ Search functionality works for both APIs
8. ✅ All original links continue to work

### Test Results
```
✅ Docusaurus server running at http://localhost:3000
✅ Navigation structure updated
✅ Both API sections accessible
✅ All endpoints working
✅ No broken links
```

## 📚 Related Documentation

- [User API Technical Specification](/docs/specifications/user-api-specification)
- [C4 Architecture Models](/docs/c4-models/user-api-models)
- [Getting Started Guide](/docs/getting-started)

## 🚀 Next Steps

### Recommended Enhancements (Optional)

1. **Add Backstage API Overview Page**
   - Create a landing page that explains the backstage system
   - Provide quick links to common endpoints
   - Show authentication flow diagram

2. **Update Getting Started Guide**
   - Update references from "Admin API" and "User API" to "Backstage API"
   - Add section explaining the backstage system architecture

3. **Add Badges/Labels**
   - Add "Admin Only" badges to admin endpoints
   - Add "User Access" badges to user endpoints
   - Color-code by access level

4. **API Comparison Page**
   - Create a page comparing Admin vs User API capabilities
   - Show permission differences
   - Explain when to use each

## 📞 Support

If you encounter any issues:
1. Check that the dev server is running: `npm start`
2. Clear Docusaurus cache: `npm run clear`
3. Rebuild: `npm run build`
4. Check browser console for errors

## 🎉 Summary

The law firm backstage system APIs are now properly organized under a unified "Backstage API" menu, providing:

- ✅ Clearer information architecture
- ✅ Better user experience
- ✅ Maintained backward compatibility
- ✅ All original functionality preserved
- ✅ Cleaner navigation structure

**Navigation Path**: `Top Menu > Backstage API > [Admin API | User API]`

---

**Last Updated**: October 26, 2024
**Status**: Complete and Production-Ready
**Server**: http://localhost:3000
