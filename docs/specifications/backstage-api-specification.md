---
sidebar_position: 2
sidebar_label: Backstage API Technical Spec
---

# Backstage API Technical Specification

**Version**: 1.0.0
**Last Updated**: October 26, 2024
**Status**: Production

## Executive Summary

The **Backstage API** is a unified backend system that powers all internal law firm operations. It consists of two integrated API surfaces working together to provide comprehensive legal practice management functionality:

- **Admin API** (34 endpoints) - Provisioning, user management, access control, and system administration
- **User API** (37 endpoints) - Day-to-day operations for lawyers, paralegals, and staff

**Total**: 71 endpoints serving 10,000+ concurrent users across multiple law firms.

---

## Table of Contents

1. [Overview](#1-overview)
2. [Admin API](#2-admin-api)
3. [User API](#3-user-api)
4. [Authentication & Authorization](#4-authentication--authorization)
5. [Data Models](#5-data-models)
6. [Error Handling](#6-error-handling)
7. [Performance & Scalability](#7-performance--scalability)
8. [Security & Compliance](#8-security--compliance)
9. [Monitoring & Observability](#9-monitoring--observability)
10. [Deployment](#10-deployment)

---

## 1. Overview

### 1.1 Purpose

The Backstage API provides:
- **For Admins**: Complete control over firm provisioning, user management, and access control
- **For Lawyers**: Full case lifecycle management, client relationship management, document management
- **For Staff**: Time tracking, billing support, appointment scheduling, notifications

### 1.2 Target Users

| User Type | Primary API | Use Cases |
|-----------|-------------|-----------|
| **System Admin** | Admin API | Provision firms, manage users, configure access grants, support access |
| **Lawyer** | User API | Manage cases, clients, documents, track time, view invoices |
| **Paralegal** | User API | Assist with cases, manage documents, schedule appointments |
| **Staff** | User API | Time tracking, billing support, records management |

### 1.3 Architecture Principles

- **Multi-tenant**: Row-level security ensures firm-level data isolation
- **Fine-grained RBAC**: Role-based + manual access grants + field-level policies
- **API-first**: RESTful design, OpenAPI 3.1 specifications
- **Microservices-ready**: Modular design allowing future service extraction
- **Event-driven**: Async processing via SQS for notifications and workflows
- **Cloud-native**: Deployed on AWS with auto-scaling and multi-AZ redundancy

### 1.4 Technology Stack

| Layer | Technology |
|-------|-----------|
| **Runtime** | Node.js 20 LTS |
| **Framework** | NestJS 10.x |
| **Language** | TypeScript 5.x |
| **Database** | PostgreSQL 15 (Multi-tenant) |
| **Cache** | Redis 7 (Cluster mode) |
| **Search** | Elasticsearch 8 |
| **Message Queue** | AWS SQS |
| **Storage** | AWS S3 |
| **Identity** | Logto (OAuth 2.0 / OIDC) |

---

## 2. Admin API

### 2.1 Overview

The **Admin API** provides system administration capabilities for provisioning firms, managing users, configuring access control, and providing support access.

**Base URL**: `https://api.lawfirm.com/admin`
**Total Endpoints**: 34
**Authentication**: JWT (admin roles required)

### 2.2 API Modules

#### 2.2.1 Law Firms (3 endpoints)

Manage law firm tenants and their configurations.

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/firms` | Create a new law firm tenant |
| GET | `/firms` | List all law firms (paginated) |
| GET | `/firms/{firmId}` | Get law firm details |

**Key Features**:
- Multi-tenant firm creation with isolated data
- Logto organization provisioning (optional)
- Firm-level configuration (billing settings, branding, features)

**Example**: Create a new firm
```http
POST /admin/firms
Authorization: Bearer <admin-jwt>
Content-Type: application/json

{
  "name": "Smith & Associates LLP",
  "slug": "smith-associates",
  "contactEmail": "admin@smithlaw.com",
  "billingPlan": "enterprise",
  "createLogtoOrg": true,
  "features": {
    "timeTracking": true,
    "documentManagement": true,
    "clientPortal": false
  }
}
```

#### 2.2.2 Users & Lawyers (9 endpoints)

Provision and manage user accounts, including professional credentials for lawyers.

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/users/search` | Search auth users (by email, name, Logto ID) |
| POST | `/firms/{firmId}/users` | Provision a user (identity + profile + roles) |
| GET | `/firms/{firmId}/users` | List user profiles in a firm |
| GET | `/users/{userId}/credentials` | List professional credentials |
| POST | `/users/{userId}/credentials` | Add a professional credential (bar license, etc.) |
| DELETE | `/users/{userId}/credentials/{credId}` | Remove a credential |

**Key Features**:
- Logto identity creation with invitation emails
- Role assignment (lawyer, paralegal, staff, admin)
- Professional credential management (bar numbers, jurisdictions)
- Multi-step provisioning with rollback on failure

**Example**: Provision a lawyer
```http
POST /admin/firms/123/users
Authorization: Bearer <admin-jwt>
Content-Type: application/json

{
  "email": "john.doe@smithlaw.com",
  "fullName": "John Doe",
  "role": "LAWYER",
  "invite": true,
  "logtoOrgId": "org_abc123",
  "credentials": [
    {
      "type": "BAR_LICENSE",
      "jurisdiction": "CA",
      "licenseNumber": "12345",
      "issuedDate": "2015-06-01",
      "expiresAt": "2025-12-31"
    }
  ]
}
```

#### 2.2.3 Logto Bridge (8 endpoints)

Sync and manage Logto organizations and memberships.

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/logto/orgs` | List Logto organizations known to the app |
| POST | `/firms/{firmId}/logto/sync` | Sync Logto org and memberships |
| GET | `/firms/{firmId}/logto/members` | List org members (locally cached) |
| POST | `/firms/{firmId}/logto/members` | Add/invite a member to Logto org |
| GET | `/firms/{firmId}/logto/members/{memberId}` | Get a specific member |
| DELETE | `/firms/{firmId}/logto/members/{memberId}` | Remove a member from Logto org |
| PUT | `/firms/{firmId}/logto/members/{memberId}/roles` | Replace member's org roles |
| GET | `/logto/roles` | List available Logto org roles |

**Key Features**:
- Bidirectional sync between Logto and local DB
- Cached membership data for performance
- Role management (org-level roles in Logto)
- Invitation workflow integration

#### 2.2.4 Access Grants (9 endpoints)

Manage manual access grants for resources and subresources.

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/access-control/resource-types` | List allowed resource types |
| GET | `/access-control/resource-types/{type}/subresources` | List allowed subresource types |
| GET | `/access-grants/search` | Search access grants (by user, resource, etc.) |
| GET | `/resources/{resourceType}/{resourceId}/grants` | List grants for a resource |
| POST | `/resources/{resourceType}/{resourceId}/grants` | Create manual access grant |
| DELETE | `/resources/{resourceType}/{resourceId}/grants/{grantId}` | Revoke access grant |
| GET | `/resources/{resourceType}/{resourceId}/{subType}/{subId}/grants` | List grants for subresource |
| POST | `/resources/{resourceType}/{resourceId}/{subType}/{subId}/grants` | Create subresource grant |
| DELETE | `/resources/{resourceType}/{resourceId}/{subType}/{subId}/grants/{grantId}` | Revoke subresource grant |

**Key Features**:
- Fine-grained resource access control
- Support for hierarchical resources (case → documents, case → time entries)
- Grant types: READ, WRITE, DELETE
- Audit trail for all grant operations

#### 2.2.5 Capabilities (2 endpoints)

Aggregate and resolve user capabilities.

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/firms/{firmId}/users/{userId}/field-policies` | Get effective field policies for a user |
| GET | `/firms/{firmId}/users/{userId}/capabilities` | Get user capabilities (scopes + policies + case sets) |

**Key Features**:
- Aggregates permissions from roles + manual grants
- Field-level access policies (e.g., hide client SSN from paralegals)
- Case ID sets (which cases user has access to)
- Cached for performance

#### 2.2.6 Support Access (6 endpoints)

Act-as functionality for customer support.

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/support-access/sessions` | Start a support access session (act as user) |
| GET | `/support-access/sessions` | List support access sessions |
| GET | `/support-access/sessions/{sessionId}` | Get a support access session |
| DELETE | `/support-access/sessions/{sessionId}` | Revoke a support access session |
| POST | `/support-access/locks` | Acquire exclusive admin lock on resource |
| DELETE | `/support-access/locks/{lockId}` | Release a lock |

**Key Features**:
- Time-limited sessions (default: 1 hour)
- Audit logging of all actions performed as target user
- Exclusive locks prevent concurrent admin access
- Automatic session expiration

### 2.3 Admin API Summary

| Category | Endpoints | Purpose |
|----------|-----------|---------|
| **Law Firms** | 3 | Firm provisioning and management |
| **Users & Lawyers** | 9 | User lifecycle management |
| **Logto Bridge** | 8 | Identity provider sync |
| **Access Grants** | 9 | Fine-grained access control |
| **Capabilities** | 2 | Permission aggregation |
| **Support Access** | 6 | Act-as and admin tools |
| **Total** | **34** | - |

---

## 3. User API

### 3.1 Overview

The **User API** provides day-to-day operations for lawyers, paralegals, and staff. It covers the full lifecycle of legal practice management.

**Base URL**: `https://api.lawfirm.com/api`
**Total Endpoints**: 37
**Authentication**: JWT (user roles)

### 3.2 API Modules

#### 3.2.1 User Profile (2 endpoints)

Manage the current user's profile.

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/me` | Get current user's profile |
| PATCH | `/me` | Update current user's profile |

#### 3.2.2 Firm Members (2 endpoints)

View firm members and their profiles.

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/firm/members` | List members in user's firm |
| GET | `/firm/members/{userId}` | Get a specific member's profile |

#### 3.2.3 Cases (7 endpoints)

Full case lifecycle management.

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/cases` | List cases accessible to current user |
| POST | `/cases` | Create a new case |
| GET | `/cases/{caseId}` | Get case details |
| PATCH | `/cases/{caseId}` | Update case details |
| GET | `/cases/{caseId}/members` | List members assigned to a case |
| POST | `/cases/{caseId}/members` | Add a member to a case |
| DELETE | `/cases/{caseId}/members/{userId}` | Remove a member from a case |

**Key Features**:
- Case number auto-generation
- Status workflow (OPEN → IN_PROGRESS → CLOSED → ARCHIVED)
- Practice area categorization
- Team assignment with roles (lead attorney, associate, paralegal)

#### 3.2.4 Clients (4 endpoints)

Client relationship management (CRM).

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/clients` | List clients accessible to current user |
| POST | `/clients` | Create a new client |
| GET | `/clients/{clientId}` | Get client details |
| PATCH | `/clients/{clientId}` | Update client details |

**Key Features**:
- Contact information management
- Client type (individual, corporation, government)
- Relationship tracking (primary contact, billing contact)
- Client portal access configuration

#### 3.2.5 Documents (5 endpoints)

Secure document management with S3 storage.

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/documents` | List documents accessible to current user |
| POST | `/documents` | Upload a new document |
| GET | `/documents/{docId}` | Get document metadata and download URL |
| PATCH | `/documents/{docId}` | Update document metadata |
| DELETE | `/documents/{docId}` | Delete a document (soft delete) |

**Key Features**:
- Secure upload via presigned S3 URLs
- Version tracking
- Document categorization (pleading, contract, correspondence, etc.)
- Full-text search (OCR integration)
- Access control inheritance from parent resource

#### 3.2.6 Appointments (6 endpoints)

Calendar and scheduling management.

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/appointments` | List appointments for current user |
| POST | `/appointments` | Create a new appointment |
| GET | `/appointments/{apptId}` | Get appointment details |
| PATCH | `/appointments/{apptId}` | Update appointment |
| DELETE | `/appointments/{apptId}` | Cancel appointment |
| POST | `/appointments/{apptId}/responses` | Respond to appointment invitation |

**Key Features**:
- Calendar integration (Google Calendar, Outlook)
- Appointment types (consultation, hearing, meeting, deadline)
- Attendee management with RSVP
- Reminders (email, SMS, push notifications)

#### 3.2.7 Time & Billing (6 endpoints)

Billable hours tracking and time entry management.

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/time-entries` | List time entries for current user |
| POST | `/time-entries` | Create a new time entry |
| GET | `/time-entries/{entryId}` | Get time entry details |
| PATCH | `/time-entries/{entryId}` | Update time entry |
| DELETE | `/time-entries/{entryId}` | Delete time entry |
| POST | `/time-entries/{entryId}/submit` | Submit time entry for approval |

**Key Features**:
- Timer functionality (start/stop/pause)
- Activity code tracking
- Billable vs. non-billable classification
- Approval workflow
- Rate calculation based on user's billing rate

#### 3.2.8 Invoices (2 endpoints)

View invoices (read-only for non-admin users).

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/invoices` | List invoices accessible to current user |
| GET | `/invoices/{invoiceId}` | Get invoice details |

**Key Features**:
- Invoice line items (time entries, expenses)
- Payment status tracking
- PDF generation
- Integration with accounting systems (QuickBooks)

#### 3.2.9 Notifications (3 endpoints)

In-app notification center.

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/notifications` | List notifications for current user |
| POST | `/notifications/{notifId}/read` | Mark notification as read |
| POST | `/notifications/mark-all-read` | Mark all notifications as read |

**Key Features**:
- Real-time notifications via WebSocket
- Notification types (case update, document upload, appointment reminder, etc.)
- Unread count badge
- Notification preferences

#### 3.2.10 Collaboration (4 endpoints)

Unified commenting system across all resources.

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/{resourceType}/{resourceId}/comments` | List comments on a resource |
| POST | `/{resourceType}/{resourceId}/comments` | Add a comment to a resource |
| PATCH | `/comments/{commentId}` | Edit a comment |
| DELETE | `/comments/{commentId}` | Delete a comment |

**Key Features**:
- Comments on cases, documents, clients, appointments, time entries
- @mentions for tagging team members
- Rich text formatting (Markdown)
- File attachments

### 3.3 User API Summary

| Module | Endpoints | Purpose |
|--------|-----------|---------|
| **Profile** | 2 | User profile management |
| **Firm Members** | 2 | View team members |
| **Cases** | 7 | Case lifecycle management |
| **Clients** | 4 | CRM functionality |
| **Documents** | 5 | Document management |
| **Appointments** | 6 | Scheduling |
| **Time & Billing** | 6 | Billable hours tracking |
| **Invoices** | 2 | Invoice viewing |
| **Notifications** | 3 | Activity feed |
| **Collaboration** | 4 | Commenting system |
| **Total** | **37** | - |

---

## 4. Authentication & Authorization

### 4.1 Authentication (Logto Integration)

**Identity Provider**: Logto (OAuth 2.0 / OIDC)

#### Authentication Flow

```
1. User initiates login in web/mobile app
2. App redirects to Logto authorization endpoint
3. User authenticates (email/password, SSO, MFA)
4. Logto issues authorization code
5. App exchanges code for tokens (access token + refresh token)
6. App includes access token in API requests: Authorization: Bearer <jwt>
7. API validates JWT signature and claims
8. API resolves user permissions and processes request
```

#### JWT Token Structure

```json
{
  "iss": "https://lawfirm.logto.app",
  "sub": "logto_user_abc123",
  "aud": "https://api.lawfirm.com",
  "exp": 1698765432,
  "iat": 1698761832,
  "scope": "openid profile email",
  "client_id": "app_client_xyz",
  "email": "john.doe@smithlaw.com",
  "email_verified": true
}
```

#### Token Validation

All API requests must include a valid JWT token. The API validates:
1. **Signature**: RSA256 signature verification using Logto's public keys (JWKS)
2. **Expiration**: `exp` claim must be in the future
3. **Audience**: `aud` claim must match API audience
4. **Issuer**: `iss` claim must match Logto issuer URL

### 4.2 Authorization (RBAC + Access Grants)

#### 4.2.1 Role-Based Access Control (RBAC)

| Role | Admin API | User API | Description |
|------|-----------|----------|-------------|
| **SYSTEM_ADMIN** | ✅ Full access | ✅ Read-only | Platform administrators |
| **LAWYER** | ❌ | ✅ Full access | Attorneys with case ownership |
| **PARALEGAL** | ❌ | ✅ Limited access | Legal assistants (no billing access) |
| **STAFF** | ❌ | ✅ Limited access | Support staff (billing, records) |
| **CLIENT** | ❌ | ❌ (Future) | External clients (portal access only) |

#### 4.2.2 Permission Scopes

**Admin API Scopes**:
- `firms:create`, `firms:read`, `firms:update`
- `users:create`, `users:read`, `users:update`, `users:delete`
- `access-grants:create`, `access-grants:read`, `access-grants:revoke`
- `support-access:create`, `support-access:read`, `support-access:revoke`

**User API Scopes**:
- `cases:create`, `cases:read`, `cases:update`, `cases:delete`
- `clients:create`, `clients:read`, `clients:update`, `clients:delete`
- `documents:create`, `documents:read`, `documents:update`, `documents:delete`
- `time-entries:create`, `time-entries:read`, `time-entries:update`, `time-entries:submit`
- `invoices:read`

#### 4.2.3 Access Grant Model

In addition to role-based permissions, users can be granted explicit access to specific resources:

```typescript
interface AccessGrant {
  id: string;
  userId: string;
  firmId: string;
  resourceType: 'CASE' | 'CLIENT' | 'DOCUMENT' | 'TIME_ENTRY';
  resourceId: string;
  action: 'READ' | 'WRITE' | 'DELETE';
  grantedBy: string;
  grantedAt: Date;
  expiresAt: Date | null;
  revokedAt: Date | null;
}
```

**Example**: Grant a paralegal read access to a specific case:
```http
POST /admin/resources/CASE/case_123/grants
Content-Type: application/json

{
  "userId": "user_456",
  "action": "READ",
  "expiresAt": "2024-12-31T23:59:59Z"
}
```

#### 4.2.4 Field-Level Policies

Control which fields are visible/editable per role:

```typescript
interface FieldPolicy {
  resourceType: string;
  field: string;
  role: string;
  read: boolean;
  write: boolean;
}
```

**Example**: Hide client SSN from paralegals
```json
{
  "resourceType": "CLIENT",
  "field": "ssn",
  "role": "PARALEGAL",
  "read": false,
  "write": false
}
```

### 4.3 Multi-Tenancy

All data is scoped to a `firmId`. Row-level security (RLS) in PostgreSQL ensures:
- Users can only access data within their firm
- Cross-firm queries are blocked at the database level
- Firm IDs are automatically injected into all queries

---

## 5. Data Models

### 5.1 Core Entities

#### 5.1.1 Law Firm

```typescript
interface LawFirm {
  id: string;                    // UUID
  name: string;                  // "Smith & Associates LLP"
  slug: string;                  // "smith-associates" (unique)
  logtoOrgId: string | null;     // Logto organization ID
  contactEmail: string;
  billingPlan: 'starter' | 'professional' | 'enterprise';
  features: {
    timeTracking: boolean;
    documentManagement: boolean;
    clientPortal: boolean;
    advancedReporting: boolean;
  };
  createdAt: Date;
  updatedAt: Date;
}
```

#### 5.1.2 User

```typescript
interface User {
  id: string;                    // UUID
  firmId: string;                // Foreign key to LawFirm
  logtoUserId: string | null;    // Logto user ID
  email: string;                 // Unique within firm
  fullName: string;
  role: 'SYSTEM_ADMIN' | 'LAWYER' | 'PARALEGAL' | 'STAFF';
  isLawyer: boolean;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}
```

#### 5.1.3 Case

```typescript
interface Case {
  id: string;                    // UUID
  firmId: string;
  clientId: string;
  caseNumber: string;            // Auto-generated: "2024-00123"
  title: string;                 // "Smith v. Johnson - Personal Injury"
  description: string;
  caseType: 'CIVIL' | 'CRIMINAL' | 'FAMILY' | 'CORPORATE' | 'IMMIGRATION' | 'OTHER';
  status: 'OPEN' | 'IN_PROGRESS' | 'CLOSED' | 'ARCHIVED';
  practiceArea: string;          // "Personal Injury", "Employment Law", etc.
  openedAt: Date;
  closedAt: Date | null;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}
```

#### 5.1.4 Client

```typescript
interface Client {
  id: string;                    // UUID
  firmId: string;
  type: 'INDIVIDUAL' | 'CORPORATION' | 'GOVERNMENT' | 'NON_PROFIT';
  fullName: string;              // For individuals
  companyName: string | null;    // For organizations
  email: string;
  phone: string;
  address: {
    street: string;
    city: string;
    state: string;
    zip: string;
    country: string;
  };
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}
```

#### 5.1.5 Document

```typescript
interface Document {
  id: string;                    // UUID
  firmId: string;
  resourceType: 'CASE' | 'CLIENT' | 'GENERAL';
  resourceId: string | null;     // case_123, client_456, or null for general docs
  fileName: string;
  fileSize: number;              // Bytes
  mimeType: string;
  s3Key: string;                 // S3 object key
  s3Bucket: string;
  category: 'PLEADING' | 'CONTRACT' | 'CORRESPONDENCE' | 'EVIDENCE' | 'OTHER';
  version: number;               // Version tracking
  uploadedBy: string;
  uploadedAt: Date;
  deletedAt: Date | null;        // Soft delete
}
```

#### 5.1.6 Time Entry

```typescript
interface TimeEntry {
  id: string;                    // UUID
  firmId: string;
  userId: string;
  caseId: string;
  activityCode: string;          // "RESEARCH", "DRAFTING", "COURT_APPEARANCE", etc.
  description: string;
  durationMinutes: number;
  isBillable: boolean;
  billingRate: number;           // USD per hour
  totalAmount: number;           // Calculated: (durationMinutes / 60) * billingRate
  status: 'DRAFT' | 'SUBMITTED' | 'APPROVED' | 'REJECTED' | 'INVOICED';
  workDate: Date;
  submittedAt: Date | null;
  approvedBy: string | null;
  approvedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}
```

### 5.2 Database Schema Reference

**Complete ERD**: See [database.dbml](/database.dbml) for full schema with 23 slices and 100+ tables.

Key schema slices:
- **AUTH**: Users, roles, sessions
- **FIRMS**: Law firms, settings
- **CASES**: Cases, case assignments, case status history
- **CLIENTS**: Clients, contacts
- **DOCUMENTS**: Documents, document versions
- **APPOINTMENTS**: Appointments, attendees, reminders
- **TIME_TRACKING**: Time entries, billing rates, activity codes
- **INVOICES**: Invoices, line items, payments
- **NOTIFICATIONS**: Notifications, notification preferences
- **COMMENTS**: Comments (polymorphic association)
- **ACCESS_CONTROL**: Access grants, field policies
- **AUDIT_LOGS**: Audit trails

---

## 6. Error Handling

### 6.1 Error Response Format

All API errors follow this structure:

```json
{
  "error": {
    "code": "RESOURCE_NOT_FOUND",
    "message": "The requested case could not be found",
    "details": {
      "resourceType": "Case",
      "resourceId": "case_123"
    },
    "timestamp": "2024-10-26T10:30:00Z",
    "requestId": "req_abc123"
  }
}
```

### 6.2 HTTP Status Codes

| Status Code | Meaning | Usage |
|-------------|---------|-------|
| **200 OK** | Success | Successful GET, PATCH, DELETE |
| **201 Created** | Created | Successful POST |
| **204 No Content** | Success (no body) | Successful DELETE with no response body |
| **400 Bad Request** | Client error | Invalid request body, missing required fields |
| **401 Unauthorized** | Authentication failure | Missing or invalid JWT token |
| **403 Forbidden** | Authorization failure | User lacks required permissions |
| **404 Not Found** | Resource not found | Requested resource doesn't exist |
| **409 Conflict** | Conflict | Resource already exists, concurrent modification |
| **422 Unprocessable Entity** | Validation error | Request body fails validation rules |
| **429 Too Many Requests** | Rate limit exceeded | Too many requests from client |
| **500 Internal Server Error** | Server error | Unexpected server-side error |
| **503 Service Unavailable** | Service down | Temporary service unavailability |

### 6.3 Error Codes Catalog

#### Authentication & Authorization

| Code | HTTP Status | Description |
|------|-------------|-------------|
| `AUTH_TOKEN_MISSING` | 401 | No Authorization header provided |
| `AUTH_TOKEN_INVALID` | 401 | JWT token is malformed or invalid |
| `AUTH_TOKEN_EXPIRED` | 401 | JWT token has expired |
| `PERMISSION_DENIED` | 403 | User lacks required permission |
| `FIRM_ACCESS_DENIED` | 403 | User cannot access this firm's data |

#### Validation

| Code | HTTP Status | Description |
|------|-------------|-------------|
| `VALIDATION_ERROR` | 422 | Request body validation failed |
| `REQUIRED_FIELD_MISSING` | 400 | Required field is missing |
| `INVALID_FIELD_FORMAT` | 400 | Field format is invalid |
| `INVALID_ENUM_VALUE` | 400 | Enum value is not recognized |

#### Resources

| Code | HTTP Status | Description |
|------|-------------|-------------|
| `RESOURCE_NOT_FOUND` | 404 | Requested resource doesn't exist |
| `RESOURCE_ALREADY_EXISTS` | 409 | Resource with this identifier already exists |
| `RESOURCE_CONFLICT` | 409 | Concurrent modification detected |

#### Business Logic

| Code | HTTP Status | Description |
|------|-------------|-------------|
| `CASE_ALREADY_CLOSED` | 400 | Cannot modify a closed case |
| `TIME_ENTRY_ALREADY_INVOICED` | 400 | Cannot edit invoiced time entry |
| `DOCUMENT_UPLOAD_FAILED` | 500 | S3 upload failed |
| `LOGTO_SYNC_FAILED` | 502 | Logto API call failed |

#### Rate Limiting

| Code | HTTP Status | Description |
|------|-------------|-------------|
| `RATE_LIMIT_EXCEEDED` | 429 | Too many requests from this client |

---

## 7. Performance & Scalability

### 7.1 Performance Targets

| Metric | Target | Current |
|--------|--------|---------|
| **API Response Time (p50)** | < 100ms | ~80ms |
| **API Response Time (p95)** | < 200ms | ~150ms |
| **API Response Time (p99)** | < 500ms | ~400ms |
| **Database Query Time (p95)** | < 100ms | ~80ms |
| **Cache Hit Rate** | > 80% | ~85% |
| **Throughput** | 5,000 req/sec | ~3,500 req/sec |
| **Concurrent Users** | 10,000+ | ~8,000 |

### 7.2 Caching Strategy

#### Redis Cache Layers

| Layer | TTL | Keys |
|-------|-----|------|
| **User permissions** | 5 min | `perm:{userId}:{action}:{resourceType}:{resourceId}` |
| **User profile** | 15 min | `user:{userId}` |
| **Case details** | 10 min | `case:{caseId}` |
| **Client details** | 10 min | `client:{clientId}` |
| **Firm settings** | 30 min | `firm:{firmId}:settings` |
| **Session data** | 24 hrs | `session:{sessionId}` |

#### Cache Invalidation

- **Write-through**: Updates invalidate cache immediately
- **Event-driven**: SQS events trigger cache invalidation across instances
- **TTL-based**: All cache entries have expiration

### 7.3 Pagination

All list endpoints support cursor-based pagination:

```http
GET /api/cases?cursor=eyJpZCI6ImNhc2VfMTIzIn0&limit=20
```

**Response**:
```json
{
  "data": [...],
  "pagination": {
    "nextCursor": "eyJpZCI6ImNhc2VfMTQzIn0",
    "hasMore": true,
    "total": 156
  }
}
```

**Parameters**:
- `cursor`: Opaque cursor for next page (base64-encoded JSON)
- `limit`: Items per page (default: 20, max: 100)

### 7.4 Rate Limiting

| Client Type | Rate Limit | Burst |
|-------------|-----------|-------|
| **Web App** | 1,000 req/min | 1,200 req/min |
| **Mobile App** | 500 req/min | 600 req/min |
| **Admin Portal** | 2,000 req/min | 2,400 req/min |

**Rate Limit Headers**:
```
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 843
X-RateLimit-Reset: 1698765432
```

### 7.5 Scaling Strategy

| Component | Scaling Method | Trigger |
|-----------|----------------|---------|
| **Admin API** | Horizontal (ECS tasks) | CPU > 70% or Latency > 300ms |
| **User API** | Horizontal (ECS tasks) | CPU > 70% or Latency > 300ms |
| **PostgreSQL** | Vertical + Read replicas | CPU > 75% or Connections > 80% |
| **Redis** | Horizontal (cluster nodes) | Memory > 80% or Hit rate < 70% |
| **Elasticsearch** | Horizontal (data nodes) | CPU > 70% or Query latency > 200ms |

---

## 8. Security & Compliance

### 8.1 Security Features

| Feature | Implementation |
|---------|---------------|
| **Authentication** | OAuth 2.0 / OIDC via Logto |
| **Authorization** | RBAC + Access Grants + Field Policies |
| **Encryption (Transit)** | TLS 1.3 |
| **Encryption (Rest)** | AES-256 (RDS, S3) |
| **Field-Level Encryption** | Application-level (PII fields) |
| **Row-Level Security** | PostgreSQL RLS (multi-tenant isolation) |
| **Audit Logging** | All API calls logged to CloudWatch |
| **Rate Limiting** | API Gateway + Redis |
| **CSRF Protection** | SameSite cookies + CSRF tokens |
| **XSS Protection** | Content Security Policy (CSP) headers |

### 8.2 Compliance

#### 8.2.1 GDPR (General Data Protection Regulation)

- **Right to Access**: GET /me endpoint provides user data export
- **Right to Erasure**: DELETE /users/{userId} (soft delete with retention policy)
- **Right to Portability**: Data export in JSON format
- **Data Minimization**: Only collect necessary fields
- **Consent Management**: Cookie consent banner, email preferences

#### 8.2.2 SOC 2 Type II

- **Security**: Encryption, access controls, audit logging
- **Availability**: Multi-AZ deployment, auto-scaling, 99.9% SLA
- **Processing Integrity**: Input validation, error handling
- **Confidentiality**: Data classification, encryption at rest
- **Privacy**: GDPR compliance, privacy policy

#### 8.2.3 HIPAA (Health Insurance Portability and Accountability Act)

For law firms handling health-related cases:
- **PHI Encryption**: Application-level encryption for health data
- **Audit Trails**: Comprehensive logging of PHI access
- **Access Controls**: Role-based access to health information
- **Business Associate Agreements (BAA)**: Required for third-party services

#### 8.2.4 ABA Model Rules of Professional Conduct

- **Confidentiality** (Rule 1.6): Client data encryption, access controls
- **Competence** (Rule 1.1): Secure technology implementation
- **Safeguarding Property** (Rule 1.15): Secure document storage

### 8.3 Data Retention

| Data Type | Retention Period | Deletion Method |
|-----------|------------------|-----------------|
| **Active cases** | Duration + 7 years | Soft delete → Hard delete |
| **Closed cases** | 10 years after closure | Soft delete → Archive → Hard delete |
| **User accounts** | Duration + 30 days after termination | Soft delete → Anonymization |
| **Audit logs** | 7 years | Archive to S3 Glacier |
| **Time entries** | Linked to case retention | Archive with case data |
| **Documents** | Linked to case retention | S3 Glacier → Delete |

---

## 9. Monitoring & Observability

### 9.1 Metrics

| Metric | Tool | Alert Threshold |
|--------|------|-----------------|
| **API Latency (p95)** | CloudWatch | > 500ms |
| **Error Rate** | CloudWatch | > 1% |
| **Database CPU** | CloudWatch | > 80% |
| **Database Connections** | CloudWatch | > 80% of max |
| **Cache Hit Rate** | Redis | < 70% |
| **Queue Depth** | SQS | > 1,000 messages |
| **Disk I/O** | CloudWatch | > 90% utilization |

### 9.2 Logging

**Log Levels**:
- `ERROR`: Application errors, exceptions
- `WARN`: Validation failures, deprecated API usage
- `INFO`: API requests, business events
- `DEBUG`: Detailed execution flow (dev/staging only)

**Log Structure**:
```json
{
  "timestamp": "2024-10-26T10:30:00Z",
  "level": "INFO",
  "message": "Case created successfully",
  "context": {
    "userId": "user_123",
    "firmId": "firm_456",
    "caseId": "case_789",
    "requestId": "req_abc123"
  }
}
```

**Log Destinations**:
- **CloudWatch Logs**: Real-time logging, 30-day retention
- **Elasticsearch**: Long-term storage, full-text search
- **S3**: Archive for compliance (7-year retention)

### 9.3 Distributed Tracing

**AWS X-Ray** integration:
- Trace ID propagation across services
- Service maps showing dependencies
- Latency breakdown by operation
- Error rate tracking

### 9.4 Alerting

| Alert | Trigger | Channel |
|-------|---------|---------|
| **High Error Rate** | Error rate > 1% for 5 min | PagerDuty + Slack |
| **High Latency** | p95 > 500ms for 10 min | Slack |
| **Database Issues** | CPU > 80% or Connections > 80% | PagerDuty |
| **Service Down** | Health check fails 3 times | PagerDuty (immediate) |
| **Queue Backlog** | SQS depth > 1,000 for 15 min | Slack |

---

## 10. Deployment

### 10.1 Infrastructure

**Cloud Provider**: AWS
**Deployment Method**: ECS Fargate (Containerized)
**Multi-AZ**: Yes (2 availability zones)

| Component | Service | Configuration |
|-----------|---------|---------------|
| **Load Balancer** | AWS ALB | HTTPS only, TLS 1.3 |
| **Admin API** | ECS Fargate | 2-10 tasks, 2 vCPU, 4 GB RAM |
| **User API** | ECS Fargate | 4-20 tasks, 4 vCPU, 8 GB RAM |
| **PostgreSQL** | RDS | r6g.xlarge, Multi-AZ, Automated backups |
| **Redis** | ElastiCache | cache.r6g.large, Cluster mode, 2 replicas |
| **Elasticsearch** | Amazon ES | r6g.large.search, 3-node cluster |
| **Object Storage** | S3 | Standard storage class, versioning enabled |
| **Message Queue** | SQS | FIFO queues for ordered processing |
| **CDN** | CloudFront | Edge caching, WAF integration |

### 10.2 Environments

| Environment | URL | Purpose | Auto-Scaling |
|-------------|-----|---------|--------------|
| **Production** | api.lawfirm.com | Live traffic | Yes (4-20 tasks) |
| **Staging** | api-staging.lawfirm.com | Pre-production testing | Limited (2-4 tasks) |
| **Development** | api-dev.lawfirm.com | Feature development | No (2 tasks) |

### 10.3 CI/CD Pipeline

**Tools**: GitHub Actions, AWS CodePipeline, AWS CodeDeploy

**Pipeline Stages**:
1. **Build**: Compile TypeScript, run linters
2. **Test**: Unit tests, integration tests (Jest)
3. **Security Scan**: Dependency scanning (Snyk), SAST (SonarQube)
4. **Build Docker Image**: Multi-stage Docker build
5. **Push to ECR**: AWS Elastic Container Registry
6. **Deploy to Staging**: Blue/green deployment
7. **Run E2E Tests**: Automated end-to-end tests
8. **Deploy to Production**: Blue/green deployment with traffic shifting

**Deployment Strategy**: Blue/green with gradual traffic shifting (10% → 50% → 100% over 30 minutes)

### 10.4 Disaster Recovery

| Metric | Target |
|--------|--------|
| **RTO (Recovery Time Objective)** | 2 hours |
| **RPO (Recovery Point Objective)** | 15 minutes |

**Backup Strategy**:
- **Database**: Automated daily backups, 30-day retention, point-in-time recovery
- **S3 Documents**: Versioning enabled, cross-region replication
- **Secrets**: AWS Secrets Manager with automatic rotation

**Disaster Recovery Plan**:
1. Multi-AZ deployment ensures automatic failover
2. Database snapshots stored across regions
3. Infrastructure as Code (Terraform) for rapid environment recreation
4. Runbook for manual failover procedures

---

## Related Documentation

### API Documentation
- [Admin API OpenAPI Reference](/docs/admin-api/law-firm-admin-provisioning-api-logto-managed-rbac) - All 34 admin endpoints
- [User API OpenAPI Reference](/docs/user-api/law-firm-user-portal-api) - All 37 user endpoints

### Architecture Documentation
- [Backstage API C4 Models](/docs/c4-models/backstage-api-architecture) - Complete architecture diagrams
- [System Context](/docs/c4-models/system-context) - High-level system landscape
- [Deployment Architecture](/docs/c4-models/backstage-api-architecture#deployment-architecture) - AWS infrastructure

### Data & Schema
- [Database Schema](/database.dbml) - Complete ERD with 23 slices and 100+ tables
- [API Spec Mapping](/docs/specifications/api-spec-mapping) - Feature to endpoint mapping

### Getting Started
- [Introduction](/docs/intro) - System overview
- [C4 Architecture Models](/docs/c4-models/) - Architecture documentation

---

**Document Version**: 1.0.0
**Last Updated**: October 26, 2024
**Maintained By**: Platform Engineering Team
**Next Review**: January 2025
