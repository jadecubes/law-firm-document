# Data Model: Resource Access Management

**Feature**: 005-resource-access-management
**Date**: 2025-10-16
**Status**: Phase 1 Complete

## Entity Relationship Diagram

```
┌─────────────────────┐
│  RESOURCE_TYPES     │
│──────────────────── │
│  id (PK)            │
│  code (UK)          │──┐
│  name               │  │
│  scope_type         │  │
│  id_format          │  │
│  is_active          │  │
│  created_at         │  │
│  updated_at         │  │
└─────────────────────┘  │
                         │
                         │ 1:N
                         │
┌─────────────────────┐  │
│ RESOURCE_SUBTYPES   │  │
│──────────────────── │  │
│  id (PK)            │  │
│  resource_type_code │──┘ (FK)
│  code               │
│  name               │
│  id_format          │
│  is_active          │
│  created_at         │
│  updated_at         │
│  UNIQUE(resource_type_code, code)
└─────────────────────┘


┌──────────────────────────┐
│ RESOURCE_ACCESS_GRANTS   │
│────────────────────────── │
│  id (PK)                  │
│  resource_type            │ (domain code, not FK - resources may not exist in DB)
│  resource_id              │
│  subresource_type         │ (nullable)
│  subresource_id           │ (nullable)
│  auth_user_id             │ (FK → AUTH_USERS.id)
│  access_level             │ (VIEW, EDIT, UPLOAD, ADMIN)
│  grant_source             │ (MANUAL, ROLE, CASE_MEMBER, PARTNER_MEMBER, SYSTEM)
│  starts_at                │
│  ends_at                  │ (nullable)
│  law_firm_id              │ (FK → LAW_FIRMS.id, nullable for platform-level)
│  created_at               │
│  updated_at               │
│  UNIQUE(resource_type, resource_id, subresource_type, subresource_id, auth_user_id, access_level)
│  INDEX(resource_type, resource_id)
│  INDEX(auth_user_id)
│  INDEX(law_firm_id)
│  INDEX(ends_at, starts_at)
└──────────────────────────┘
```

## Entities

### 1. ResourceType

**Purpose**: Registry of domain-level resource types that can be protected with access grants.

**Fields**:
- `id`: UUID (primary key)
- `code`: String (unique, uppercase, pattern: ^[A-Z][A-Z0-9_]*$)
  - Examples: "CASE", "CLIENT", "INVOICE", "ARTICLE", "APPOINTMENT"
- `name`: String (human-readable name)
- `scope_type`: Enum (GLOBAL, FIRM, ORG_UNIT, CASE)
  - Defines the boundary scope for this resource type
- `id_format`: Enum (int64, uuid, string)
  - Defines the expected format for resource IDs
- `is_active`: Boolean (default: true)
  - Inactive types are hidden from API responses
- `created_at`: Timestamp with timezone
- `updated_at`: Timestamp with timezone

**Validation Rules** (from FR-001 to FR-008):
- `code` must match pattern ^[A-Z][A-Z0-9_]*$
- `code` must be unique
- `scope_type` must be one of: GLOBAL, FIRM, ORG_UNIT, CASE
- `id_format` must be one of: int64, uuid, string

**Indexes**:
- PRIMARY KEY on `id`
- UNIQUE KEY on `code`
- INDEX on `is_active` (for active-only queries)

**Example Records**:
```json
{
  "id": "rt-001",
  "code": "CASE",
  "name": "Legal Case",
  "scope_type": "CASE",
  "id_format": "int64",
  "is_active": true
}
```

---

### 2. ResourceSubtype

**Purpose**: Fine-grained subresource types within parent resource types for granular access control.

**Fields**:
- `id`: UUID (primary key)
- `resource_type_code`: String (foreign key → RESOURCE_TYPES.code)
- `code`: String (uppercase, pattern: ^[A-Z][A-Z0-9_]*$)
  - Examples: "NOTE", "DOCUMENT", "LINE_ITEM", "TRANSLATION"
- `name`: String (human-readable name)
- `id_format`: Enum (int64, uuid, string)
- `is_active`: Boolean (default: true)
- `created_at`: Timestamp with timezone
- `updated_at`: Timestamp with timezone

**Validation Rules** (from FR-009 to FR-014):
- `code` must match pattern ^[A-Z][A-Z0-9_]*$
- `(resource_type_code, code)` must be unique
- `resource_type_code` must reference existing RESOURCE_TYPES.code

**Indexes**:
- PRIMARY KEY on `id`
- FOREIGN KEY on `resource_type_code` → RESOURCE_TYPES.code
- UNIQUE KEY on `(resource_type_code, code)`
- INDEX on `is_active`

**Example Records**:
```json
{
  "id": "rst-001",
  "resource_type_code": "CASE",
  "code": "NOTE",
  "name": "Case Note",
  "id_format": "int64",
  "is_active": true
}
```

---

### 3. ResourceAccessGrant

**Purpose**: Explicit permission assignment for users to access specific resources with defined access levels and optional time bounds.

**Fields**:
- `id`: UUID (primary key)
- `resource_type`: String (domain code, not foreign key)
  - Not a foreign key because resources may not exist in this database
  - Examples: "CASE", "CLIENT", "INVOICE"
- `resource_id`: String (polymorphic ID)
  - Can be int64, uuid, or string depending on resource type
- `subresource_type`: String (nullable)
  - Only populated for subresource grants
- `subresource_id`: String (nullable)
  - Only populated for subresource grants
- `auth_user_id`: UUID (foreign key → AUTH_USERS.id)
- `access_level`: Enum (VIEW, EDIT, UPLOAD, ADMIN)
- `grant_source`: Enum (MANUAL, ROLE, CASE_MEMBER, PARTNER_MEMBER, SYSTEM)
  - Indicates how the grant was created
- `starts_at`: Timestamp with timezone
  - Grant becomes active at this time
- `ends_at`: Timestamp with timezone (nullable)
  - Grant expires at this time (NULL = no expiration)
- `law_firm_id`: UUID (foreign key → LAW_FIRMS.id, nullable)
  - NULL for platform-level grants
- `created_at`: Timestamp with timezone
- `updated_at`: Timestamp with timezone

**Validation Rules** (from FR-015 to FR-029):
- `resource_type` must exist in RESOURCE_TYPES registry
- `auth_user_id` must exist in AUTH_USERS table
- `access_level` must be one of: VIEW, EDIT, UPLOAD, ADMIN
- `grant_source` must be one of: MANUAL, ROLE, CASE_MEMBER, PARTNER_MEMBER, SYSTEM
- `starts_at` is required
- `ends_at` must be > `starts_at` if provided
- Unique constraint: `(resource_type, resource_id, subresource_type, subresource_id, auth_user_id, access_level)`

**Indexes**:
- PRIMARY KEY on `id`
- FOREIGN KEY on `auth_user_id` → AUTH_USERS.id
- FOREIGN KEY on `law_firm_id` → LAW_FIRMS.id
- UNIQUE KEY on `(resource_type, resource_id, subresource_type, subresource_id, auth_user_id, access_level)`
- INDEX on `(resource_type, resource_id)` for resource-scoped queries
- INDEX on `auth_user_id` for user-scoped queries
- INDEX on `law_firm_id` for tenant-scoped queries
- INDEX on `(ends_at, starts_at)` for active grant filtering
- INDEX on `grant_source` for filtering by source

**State Transitions**:
1. **Pending** → `starts_at` &gt; current time
2. **Active** → `starts_at` &lt;= current time AND (`ends_at` IS NULL OR `ends_at` &gt; current time)
3. **Expired** → `ends_at` &lt;= current time

**Example Records**:
```json
{
  "id": "grant-001",
  "resource_type": "CASE",
  "resource_id": "456",
  "subresource_type": null,
  "subresource_id": null,
  "auth_user_id": "user-123",
  "access_level": "EDIT",
  "grant_source": "MANUAL",
  "starts_at": "2025-10-16T00:00:00Z",
  "ends_at": "2025-11-16T00:00:00Z",
  "law_firm_id": "firm-abc",
  "created_at": "2025-10-16T08:30:00Z",
  "updated_at": "2025-10-16T08:30:00Z"
}
```

---

## Relationships

### ResourceType ↔ ResourceSubtype
- **Type**: One-to-Many
- **Cardinality**: One ResourceType can have 0..N ResourceSubtypes
- **Foreign Key**: ResourceSubtype.resource_type_code → ResourceType.code
- **Cascade**: ON DELETE CASCADE (if resource type deleted, subtypes also deleted)

### ResourceAccessGrant ↔ AUTH_USERS
- **Type**: Many-to-One
- **Cardinality**: Many grants can belong to one user
- **Foreign Key**: ResourceAccessGrant.auth_user_id → AUTH_USERS.id
- **Cascade**: ON DELETE CASCADE (if user deleted, their grants are also deleted)

### ResourceAccessGrant ↔ LAW_FIRMS
- **Type**: Many-to-One (optional)
- **Cardinality**: Many grants can belong to one law firm (or none for platform-level)
- **Foreign Key**: ResourceAccessGrant.law_firm_id → LAW_FIRMS.id (nullable)
- **Cascade**: ON DELETE CASCADE (if law firm deleted, their grants are also deleted)

---

## Notes on Field Policies

Field-level policies (FR-062 to FR-069) are **NOT** stored as separate entities. They are:
- Defined in the ROLES table as JSON blobs
- Computed at request time by the `FieldPolicyService`
- Merged when a user has multiple roles
- Cached with TTL for performance

**Policy JSON Structure**:
```json
{
  "resource_policies": {
    "CASE": {
      "read": { "field_mode": "ALL" },
      "update": { "field_mode": "EXCEPT", "fields": ["budget.*", "settlement_terms"] }
    },
    "INVOICE": {
      "read": { "field_mode": "ONLY", "fields": ["amount", "date", "status"] }
    }
  }
}
```

---

## Migration Strategy

**File**: `backend/src/database/migrations/005-resource-access-management.sql`

**Steps**:
1. Create `RESOURCE_TYPES` table with indexes
2. Create `RESOURCE_SUBTYPES` table with foreign key
3. Create `RESOURCE_ACCESS_GRANTS` table with indexes
4. Seed `RESOURCE_TYPES` with standard types:
   - CASE (CASE scope, int64)
   - CLIENT (FIRM scope, uuid)
   - INVOICE (FIRM scope, int64)
   - ARTICLE (GLOBAL scope, uuid)
   - APPOINTMENT (FIRM scope, int64)
5. Seed `RESOURCE_SUBTYPES` for extensibility:
   - CASE → NOTE, DOCUMENT, ATTACHMENT
   - INVOICE → LINE_ITEM

**Rollback**: DROP tables in reverse order (grants, subtypes, types)
