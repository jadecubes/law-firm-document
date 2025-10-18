# Quickstart: Resource Access Management

**Feature**: 005-resource-access-management
**Date**: 2025-10-16
**Status**: Phase 1 Complete

## Test Scenarios

This document provides concrete test scenarios mapped to user stories for independent validation of feature implementation.

---

## Scenario 1: Define and Retrieve Resource Types (User Story 1)

**Goal**: Verify resource type registry is correctly configured and retrievable.

**Prerequisites**: System initialized with seed data

**Steps**:
1. GET `/admin/resource-types`
2. Verify response contains standard resource types:
   - CASE (scopeType=CASE, idFormat=int64)
   - CLIENT (scopeType=FIRM, idFormat=uuid)
   - INVOICE (scopeType=FIRM, idFormat=int64)
   - ARTICLE (scopeType=GLOBAL, idFormat=uuid)
   - APPOINTMENT (scopeType=FIRM, idFormat=int64)
3. Verify all returned types have `is_active=true`
4. Verify all required fields are present (id, code, name, scope_type, id_format, created_at, updated_at)

**Expected Result**: HTTP 200 with array of 5 resource types

**Success Criteria**:
- ✅ All 5 standard types returned
- ✅ Response time &lt; 100ms
- ✅ All fields present and correctly formatted

---

## Scenario 2: Define and Retrieve Resource Subtypes (User Story 2)

**Goal**: Verify subtype registry and parent-child relationships.

**Prerequisites**: System initialized with seed data

**Steps**:
1. GET `/admin/resource-types/CASE/subtypes`
2. Verify response contains CASE subtypes:
   - NOTE (idFormat=int64)
   - DOCUMENT (idFormat=uuid)
   - ATTACHMENT (idFormat=uuid)
3. GET `/admin/resource-types/INVOICE/subtypes`
4. Verify response contains INVOICE subtype:
   - LINE_ITEM (idFormat=int64)
5. GET `/admin/resource-types/CLIENT/subtypes`
6. Verify response is empty array (no subtypes defined)
7. GET `/admin/resource-types/INVALID/subtypes`
8. Verify HTTP 404 Not Found

**Expected Result**: Correct subtypes returned for each resource type

**Success Criteria**:
- ✅ CASE has 3 subtypes
- ✅ INVOICE has 1 subtype
- ✅ CLIENT has 0 subtypes (empty array)
- ✅ Invalid resource type returns 404
- ✅ Response time &lt; 100ms

---

## Scenario 3: Create Resource Access Grant (User Story 3)

**Goal**: Verify manual grant creation with validation.

**Prerequisites**:
- Law firm "firm_abc" exists
- User "user_123" exists in firm_abc
- Resource type CASE exists in registry

**Steps**:
1. POST `/admin/resources/CASE/456/access-grants`
   ```json
   {
     "auth_user_id": "user_123",
     "access_level": "EDIT",
     "starts_at": "2025-10-16T00:00:00Z",
     "ends_at": "2025-11-16T00:00:00Z"
   }
   ```
2. Verify HTTP 201 Created with grant details
3. Verify response includes:
   - `grant_source=MANUAL`
   - `law_firm_id=firm_abc`
   - All provided fields
4. Attempt to create duplicate grant (same user, resource, access level)
5. Verify HTTP 409 Conflict

**Expected Result**: Grant created successfully, duplicate rejected

**Success Criteria**:
- ✅ Grant creation completes in &lt; 300ms
- ✅ Grant is immediately queryable
- ✅ Duplicate prevention works (409 Conflict)
- ✅ Grant has correct grant_source=MANUAL

---

## Scenario 4: Create Subresource Grant (User Story 3)

**Goal**: Verify fine-grained subresource access grants.

**Prerequisites**:
- Law firm "firm_abc" exists
- User "user_123" exists
- Resource CASE/456 and subresource NOTE/789 exist

**Steps**:
1. POST `/admin/resources/CASE/456/NOTE/789/access-grants`
   ```json
   {
     "auth_user_id": "user_123",
     "access_level": "VIEW",
     "starts_at": "2025-10-16T00:00:00Z"
   }
   ```
2. Verify HTTP 201 with:
   - `resource_type=CASE`
   - `resource_id=456`
   - `subresource_type=NOTE`
   - `subresource_id=789`
   - `access_level=VIEW`
3. Verify grant is independent of parent resource grants

**Expected Result**: Subresource grant created successfully

**Success Criteria**:
- ✅ Subresource grant stored with correct hierarchy
- ✅ Grant does not affect parent resource permissions
- ✅ Grant creation &lt; 300ms

---

## Scenario 5: Search Access Grants with Filters (User Story 4)

**Goal**: Verify grant search with multiple filter combinations.

**Prerequisites**:
- 20 grants exist across multiple resources, users, and access levels
  - 10 grants for CASE resources
  - 5 grants for user_123
  - 3 grants with ADMIN level
  - 8 grants in firm_abc

**Steps**:
1. GET `/admin/resource-access-grants?resourceType=CASE`
   - Verify 10 grants returned
2. GET `/admin/resource-access-grants?authUserId=user_123`
   - Verify 5 grants returned
3. GET `/admin/resource-access-grants?accessLevel=ADMIN`
   - Verify 3 grants returned
4. GET `/admin/resource-access-grants?lawFirmId=firm_abc`
   - Verify 8 grants returned
5. GET `/admin/resource-access-grants?resourceType=CASE&resourceId=456`
   - Verify only grants for CASE/456 returned
6. GET `/admin/resource-access-grants?page[number]=1&page[size]=10`
   - Verify pagination metadata: `{page: 1, size: 10, total: 20}`

**Expected Result**: Filters correctly narrow results, pagination works

**Success Criteria**:
- ✅ Each filter returns correct subset
- ✅ Combined filters work (AND logic)
- ✅ Pagination metadata is accurate
- ✅ Query completes in &lt; 500ms

---

## Scenario 6: List Grants for Specific Resource (User Story 5)

**Goal**: Verify resource-scoped grant listing.

**Prerequisites**:
- CASE/456 has 5 grants:
  - user_1 → VIEW
  - user_2 → EDIT
  - user_3 → ADMIN
  - user_4 → VIEW
  - user_5 → UPLOAD

**Steps**:
1. GET `/admin/resources/CASE/456/access-grants`
2. Verify response contains all 5 grants
3. Verify grants have different `grant_source` values (MANUAL, ROLE, CASE_MEMBER)
4. GET `/admin/resources/CLIENT/999/access-grants` (no grants)
5. Verify empty array returned

**Expected Result**: All grants for resource returned correctly

**Success Criteria**:
- ✅ All 5 grants returned for CASE/456
- ✅ Empty array for resource with no grants
- ✅ Response includes grant_source field
- ✅ Query completes in &lt; 200ms

---

## Scenario 7: Revoke Resource Access Grant (User Story 6)

**Goal**: Verify grant revocation and immediate effect.

**Prerequisites**:
- Grant exists: user_123 → EDIT on CASE/456

**Steps**:
1. GET `/admin/resources/CASE/456/access-grants`
   - Verify user_123 EDIT grant exists
2. DELETE `/admin/resources/CASE/456/access-grants/user_123/EDIT`
3. Verify HTTP 204 No Content
4. GET `/admin/resources/CASE/456/access-grants`
   - Verify user_123 EDIT grant no longer exists
5. Attempt to delete again (same grant)
6. Verify HTTP 404 Not Found

**Expected Result**: Grant revoked successfully and immediately

**Success Criteria**:
- ✅ Revocation completes in &lt; 200ms
- ✅ Grant immediately removed from queries
- ✅ Deleting non-existent grant returns 404
- ✅ Only specified grant removed (other grants unaffected)

---

## Scenario 8: Grant Lifecycle and Expiration (FR-057 to FR-061)

**Goal**: Verify time-bound grant behavior.

**Prerequisites**: Current time = 2025-10-16T12:00:00Z

**Steps**:
1. Create grant with:
   - `starts_at = 2025-10-16T10:00:00Z` (past)
   - `ends_at = 2025-10-16T14:00:00Z` (future)
2. GET `/admin/resource-access-grants?authUserId=user_123`
   - Verify grant is included (status=active)
3. Create grant with:
   - `starts_at = 2025-10-16T15:00:00Z` (future)
4. GET `/admin/resource-access-grants?authUserId=user_123`
   - Verify future grant is excluded (status=pending)
5. Wait until after ends_at (or mock current time to 2025-10-16T15:00:00Z)
6. GET `/admin/resource-access-grants?authUserId=user_123`
   - Verify first grant is excluded (status=expired)

**Expected Result**: Grant visibility respects time bounds

**Success Criteria**:
- ✅ Active grants (starts_at &lt;= now &lt; ends_at) returned
- ✅ Pending grants (starts_at &gt; now) excluded
- ✅ Expired grants (ends_at &lt;= now) excluded
- ✅ Grants without ends_at never expire

---

## Scenario 9: Retrieve Effective Field Policies (User Story 7)

**Goal**: Verify field-level policy computation and merging.

**Prerequisites**:
- User "user_lawyer" has LAWYER role with policy:
  ```json
  {
    "CASE": {
      "read": { "field_mode": "ALL" },
      "update": { "field_mode": "ALL" }
    }
  }
  ```
- User "user_paralegal" has PARALEGAL role with policy:
  ```json
  {
    "CASE": {
      "read": { "field_mode": "ALL" },
      "update": { "field_mode": "EXCEPT", "fields": ["budget.*", "settlement_terms"] }
    }
  }
  ```

**Steps**:
1. GET `/admin/law-firms/firm_abc/users/user_lawyer/resource-policies`
2. Verify response shows ALL mode for CASE.read and CASE.update
3. GET `/admin/law-firms/firm_abc/users/user_paralegal/resource-policies`
4. Verify response shows:
   - `CASE.read: {field_mode: ALL}`
   - `CASE.update: {field_mode: EXCEPT, fields: ["budget.*", "settlement_terms"]}`

**Expected Result**: Policies correctly reflect role-based field restrictions

**Success Criteria**:
- ✅ Lawyer has unrestricted access (ALL mode)
- ✅ Paralegal has budget field restrictions (EXCEPT mode)
- ✅ Query completes in &lt; 400ms

---

## Scenario 10: Retrieve User Capabilities Aggregate (User Story 8)

**Goal**: Verify capabilities aggregation with all three sections.

**Prerequisites**:
- User "user_123" in firm_abc has:
  - Logto scopes: ["cases:read", "cases:write", "invoices:read"]
  - PARALEGAL role with field policies (CASE fields except budget)
  - Grants: VIEW on cases [101, 102], EDIT on case [123], ADMIN on case [123]

**Steps**:
1. GET `/admin/law-firms/firm_abc/users/user_123/capabilities`
2. Verify response contains:
   ```json
   {
     "scopes": ["cases:read", "cases:write", "invoices:read"],
     "resources": {
       "CASE": {
         "read": { "field_mode": "ALL" },
         "update": { "field_mode": "EXCEPT", "fields": ["budget.*"] }
       }
     },
     "caseIds": {
       "view": [101, 102, 123],
       "edit": [123],
       "admin": [123]
     }
   }
   ```
3. GET `/admin/law-firms/firm_abc/users/user_123/capabilities?include=scopes,caseIds`
4. Verify response only contains `scopes` and `caseIds` (resources omitted)

**Expected Result**: All three sections aggregated correctly

**Success Criteria**:
- ✅ Scopes fetched from Logto
- ✅ Resources computed from roles
- ✅ Case IDs computed from grants (hierarchical: ADMIN includes EDIT, EDIT includes VIEW)
- ✅ Optional `include` parameter filters sections
- ✅ Query completes in &lt; 600ms

---

## Scenario 11: Multi-Tenant Isolation

**Goal**: Verify tenant-scoped queries prevent cross-tenant leaks.

**Prerequisites**:
- firm_abc has 10 grants
- firm_xyz has 5 grants

**Steps**:
1. GET `/admin/resource-access-grants?lawFirmId=firm_abc`
   - Verify exactly 10 grants returned (all from firm_abc)
2. GET `/admin/resource-access-grants?lawFirmId=firm_xyz`
   - Verify exactly 5 grants returned (all from firm_xyz)
3. GET `/admin/resource-access-grants` (no lawFirmId filter)
   - Verify 15 total grants returned (platform admin view)

**Expected Result**: Tenant isolation enforced correctly

**Success Criteria**:
- ✅ lawFirmId filter correctly isolates data
- ✅ No cross-tenant leaks
- ✅ Platform admins can query across tenants (no filter)

---

## Scenario 12: Idempotency

**Goal**: Verify idempotency key prevents duplicate grant creation.

**Prerequisites**: None

**Steps**:
1. POST `/admin/resources/CASE/456/access-grants` with:
   - Header: `Idempotency-Key: unique-key-12345`
   - Body: `{auth_user_id: "user_123", access_level: "VIEW", starts_at: "2025-10-16T00:00:00Z"}`
2. Verify HTTP 201 Created with grant ID (e.g., "grant-abc")
3. Retry exact same request (same idempotency key and body)
4. Verify HTTP 201 with same grant ID "grant-abc" (cached response)
5. POST with same idempotency key but different body
6. Verify HTTP 409 Conflict (idempotency key mismatch)

**Expected Result**: Idempotency prevents duplicate grants

**Success Criteria**:
- ✅ First request creates grant
- ✅ Retry returns cached response (no duplicate)
- ✅ Different body with same key returns 409

---

## Environment Setup

### Database Seed Data

**Resource Types**:
```sql
INSERT INTO resource_types (id, code, name, scope_type, id_format, is_active) VALUES
  ('rt-001', 'CASE', 'Legal Case', 'CASE', 'int64', true),
  ('rt-002', 'CLIENT', 'Client', 'FIRM', 'uuid', true),
  ('rt-003', 'INVOICE', 'Invoice', 'FIRM', 'int64', true),
  ('rt-004', 'ARTICLE', 'Article', 'GLOBAL', 'uuid', true),
  ('rt-005', 'APPOINTMENT', 'Appointment', 'FIRM', 'int64', true);
```

**Resource Subtypes**:
```sql
INSERT INTO resource_subtypes (id, resource_type_code, code, name, id_format, is_active) VALUES
  ('rst-001', 'CASE', 'NOTE', 'Case Note', 'int64', true),
  ('rst-002', 'CASE', 'DOCUMENT', 'Case Document', 'uuid', true),
  ('rst-003', 'CASE', 'ATTACHMENT', 'Case Attachment', 'uuid', true),
  ('rst-004', 'INVOICE', 'LINE_ITEM', 'Invoice Line Item', 'int64', true);
```

### Test Users

```json
{
  "user_123": { "id": "user_123", "name": "Test User", "law_firm_id": "firm_abc" },
  "user_lawyer": { "id": "user_lawyer", "roles": ["LAWYER"], "law_firm_id": "firm_abc" },
  "user_paralegal": { "id": "user_paralegal", "roles": ["PARALEGAL"], "law_firm_id": "firm_abc" }
}
```

### Test Law Firms

```json
{
  "firm_abc": { "id": "firm_abc", "name": "ABC Law Firm" },
  "firm_xyz": { "id": "firm_xyz", "name": "XYZ Law Firm" }
}
```

---

## Running Tests

```bash
# Run all contract tests
npm run test:contract

# Run specific scenario
npm run test:contract -- --grep "Scenario 3"

# Run integration tests
npm run test:integration

# Run with coverage
npm run test:coverage
```

---

## Performance Benchmarks

| Operation | Target | Acceptable |
|-----------|--------|------------|
| List resource types | &lt; 100ms | &lt; 200ms |
| List subtypes | &lt; 100ms | &lt; 200ms |
| Create grant | &lt; 300ms | &lt; 500ms |
| Search grants (100k records) | &lt; 500ms | &lt; 1000ms |
| List resource grants | &lt; 200ms | &lt; 400ms |
| Revoke grant | &lt; 200ms | &lt; 400ms |
| Get field policies | &lt; 400ms | &lt; 800ms |
| Get capabilities | &lt; 600ms | &lt; 1200ms |
