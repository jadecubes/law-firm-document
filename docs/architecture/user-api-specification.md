# Law Firm User API - Technical Specification

## 1. Overview

### 1.1 Purpose
The Law Firm User Portal API provides a comprehensive interface for lawyers, paralegals, and staff to manage their daily legal work, including case management, client interactions, document handling, time tracking, and collaboration.

### 1.2 Target Users
- **Lawyers**: Lead attorneys, associates managing cases and clients
- **Paralegals**: Supporting legal professionals assisting with case work
- **Staff**: Administrative personnel (billing admins, receptionists, IT admins)
- **Interns**: Temporary or training staff with limited access

### 1.3 Architecture Principles
- **Multi-tenant**: Firm-level isolation with row-level security
- **RBAC-based**: Logto-integrated role-based access control
- **Event-driven**: Audit trails and event sourcing for compliance
- **RESTful**: Standard HTTP methods with JSON payloads
- **Secure**: JWT bearer authentication, field-level permissions

---

## 2. Authentication & Authorization

### 2.1 Authentication
- **Provider**: Logto (external identity provider)
- **Method**: Bearer token (JWT) in Authorization header
- **Token Format**: `Authorization: Bearer <jwt_token>`
- **Token Claims**:
  ```json
  {
    "sub": "logto_user_abc123",
    "email": "attorney@lawfirm.com",
    "org_id": "org_xyz789",
    "roles": ["LAWYER", "CASE_MANAGER"],
    "firm_id": "firm_001",
    "iat": 1234567890,
    "exp": 1234571490
  }
  ```

### 2.2 Authorization Model
- **Firm Boundary**: Users can only access resources within their law firm
- **Role-Based**: Permissions granted through role assignments
- **Resource-Level**: Fine-grained ACLs on cases, documents, clients
- **Field-Level**: Sensitive fields (SSN, billing) restricted by role

### 2.3 Permission Scopes
| Scope | Description | Example Roles |
|-------|-------------|---------------|
| `case:read` | View case details | LAWYER, PARALEGAL |
| `case:write` | Create/update cases | LAWYER |
| `client:read` | View client information | LAWYER, PARALEGAL, RECEPTIONIST |
| `client:write` | Create/update clients | LAWYER, RECEPTIONIST |
| `document:read` | Access documents | LAWYER, PARALEGAL |
| `document:write` | Upload/modify documents | LAWYER, PARALEGAL |
| `time:write` | Create time entries | LAWYER, PARALEGAL |
| `billing:read` | View invoices | LAWYER, BILLING_ADMIN |

---

## 3. API Modules

### 3.1 User Profile (`/me`)
Manage authenticated user's profile and preferences.

**Endpoints**:
- `GET /me` - Retrieve current user profile
- `PATCH /me` - Update profile settings

**Key Features**:
- Practice areas and specializations
- Notification preferences (email, SMS, push)
- Timezone and language settings
- UI theme preferences

### 3.2 Firm Members (`/firm/members`)
Directory of colleagues within the law firm.

**Endpoints**:
- `GET /firm/members` - List firm members with filters
- `GET /firm/members/{userId}` - Get member details

**Filters**:
- Role (LAWYER, PARALEGAL, etc.)
- Practice area
- Search by name/email
- Active status

**Use Cases**:
- Case team assignment
- Internal referrals
- Contact lookup

### 3.3 Cases (`/cases`)
Core case management functionality.

**Endpoints**:
- `GET /cases` - List accessible cases
- `POST /cases` - Create new case
- `GET /cases/{caseId}` - Get case details
- `PATCH /cases/{caseId}` - Update case
- `GET /cases/{caseId}/members` - List case team
- `POST /cases/{caseId}/members` - Add team member
- `DELETE /cases/{caseId}/members/{userId}` - Remove team member

**Case Lifecycle**:
```
INTAKE → ACTIVE → PENDING → SETTLED → CLOSED → ARCHIVED
```

**Priority Levels**: LOW, MEDIUM, HIGH, URGENT

**Filters**:
- Status, priority, practice area
- Lead attorney, client
- Assigned to current user
- Full-text search (case number, title)

### 3.4 Clients (`/clients`)
Client relationship management.

**Endpoints**:
- `GET /clients` - List accessible clients
- `POST /clients` - Create new client
- `GET /clients/{clientId}` - Get client details
- `PATCH /clients/{clientId}` - Update client

**Client Types**:
- **INDIVIDUAL**: Person with firstName, lastName, DOB, SSN
- **BUSINESS**: Company with companyName, tax ID

**Sensitive Fields** (encrypted/masked):
- Social Security Number (SSN)
- Date of Birth
- Financial information

### 3.5 Documents (`/documents`)
Secure document storage and management.

**Endpoints**:
- `GET /documents` - List accessible documents
- `POST /documents` - Initiate upload (returns presigned URL)
- `GET /documents/{documentId}` - Get document metadata + download URL
- `PATCH /documents/{documentId}` - Update metadata
- `DELETE /documents/{documentId}` - Soft delete

**Categories**:
- PLEADING, MOTION, EVIDENCE
- CONTRACT, CORRESPONDENCE
- INTERNAL, OTHER

**Status Workflow**:
```
DRAFT → REVIEW → FINAL → ARCHIVED
```

**Security**:
- Presigned URLs (S3/GCS) with expiration
- Version tracking
- Access logs

### 3.6 Appointments (`/appointments`)
Calendar and scheduling system.

**Endpoints**:
- `GET /appointments` - List user's appointments
- `POST /appointments` - Create appointment
- `GET /appointments/{appointmentId}` - Get details
- `PATCH /appointments/{appointmentId}` - Update
- `DELETE /appointments/{appointmentId}` - Cancel
- `POST /appointments/{appointmentId}/respond` - RSVP (ACCEPTED/DECLINED/TENTATIVE)

**Types**:
- CONSULTATION, COURT_HEARING, DEPOSITION
- MEETING, PHONE_CALL, DEADLINE, OTHER

**Features**:
- Multi-attendee (internal + external)
- Virtual meeting links
- Reminders (EMAIL, SMS, PUSH)
- Case/client linkage

### 3.7 Time & Billing (`/time-entries`)
Billable hours tracking and submission.

**Endpoints**:
- `GET /time-entries` - List time entries
- `POST /time-entries` - Create entry
- `GET /time-entries/{timeEntryId}` - Get details
- `PATCH /time-entries/{timeEntryId}` - Update (DRAFT only)
- `DELETE /time-entries/{timeEntryId}` - Delete (DRAFT only)
- `POST /time-entries/{timeEntryId}/submit` - Submit for approval

**Status Workflow**:
```
DRAFT → SUBMITTED → APPROVED → INVOICED
```

**Activity Types**:
- RESEARCH, DRAFTING, COURT_APPEARANCE
- CLIENT_MEETING, PHONE_CALL, EMAIL
- REVIEW, TRAVEL, OTHER

**Calculation**:
```
amount = hours × hourlyRate (defaulted from user profile or case)
```

### 3.8 Invoices (`/invoices`)
Read-only invoice access for users.

**Endpoints**:
- `GET /invoices` - List accessible invoices
- `GET /invoices/{invoiceId}` - Get invoice details + PDF

**Access Control**:
- Users see invoices for their assigned cases
- BILLING_ADMIN role sees all firm invoices

**Status**: DRAFT, SENT, PAID, OVERDUE, CANCELLED

### 3.9 Notifications (`/notifications`)
Real-time activity feed.

**Endpoints**:
- `GET /notifications` - List notifications
- `POST /notifications/{notificationId}/mark-read` - Mark single as read
- `POST /notifications/mark-all-read` - Mark all as read

**Types**:
- CASE_ASSIGNED, CASE_UPDATE
- DOCUMENT_SHARED
- APPOINTMENT_REMINDER
- COMMENT_MENTION
- DEADLINE_UPCOMING
- MESSAGE_RECEIVED, SYSTEM

**Priority**: LOW, NORMAL, HIGH

### 3.10 Collaboration (`/comments`)
Unified commenting across resources.

**Endpoints**:
- `GET /comments?resourceType=CASE&resourceId=123` - List comments
- `POST /comments` - Add comment
- `PATCH /comments/{commentId}` - Edit own comment
- `DELETE /comments/{commentId}` - Delete own comment

**Supported Resources**:
- CASE, DOCUMENT, TIME_ENTRY, CLIENT

**Features**:
- @mentions (triggers notifications)
- Attachments (file references)
- Edit history (isEdited flag)

---

## 4. Data Models

### 4.1 Core Entities

#### UserProfile
```json
{
  "id": "user_123",
  "userId": "logto_abc",
  "lawFirmId": "firm_001",
  "displayName": "Jane Attorney",
  "email": "jane@lawfirm.com",
  "jobTitle": "Senior Associate",
  "photoUrl": "https://...",
  "roles": ["LAWYER"],
  "practiceAreas": ["Corporate Law", "M&A"],
  "preferences": {
    "emailNotifications": true,
    "theme": "light"
  }
}
```

#### Case
```json
{
  "id": "case_456",
  "caseNumber": "2024-001",
  "title": "Smith v. Acme Corp",
  "status": "ACTIVE",
  "priority": "HIGH",
  "practiceArea": "Employment Law",
  "clientId": "client_789",
  "clientName": "John Smith",
  "leadAttorneyId": "user_123",
  "assignedMembers": [
    {
      "userId": "user_123",
      "role": "LEAD"
    }
  ],
  "billingInfo": {
    "billingType": "HOURLY",
    "hourlyRate": 350
  },
  "importantDates": {
    "trialDate": "2024-12-15"
  }
}
```

#### Document
```json
{
  "id": "doc_101",
  "name": "Motion to Dismiss.pdf",
  "caseId": "case_456",
  "category": "MOTION",
  "fileType": "application/pdf",
  "fileSize": 524288,
  "storageUrl": "https://signed-url...",
  "version": 2,
  "status": "FINAL",
  "uploadedBy": "user_123",
  "tags": ["urgent", "court-filing"]
}
```

#### TimeEntry
```json
{
  "id": "time_202",
  "caseId": "case_456",
  "userId": "user_123",
  "date": "2024-10-25",
  "hours": 2.5,
  "description": "Research case law on wrongful termination",
  "billable": true,
  "hourlyRate": 350,
  "amount": 875,
  "status": "SUBMITTED",
  "activityType": "RESEARCH"
}
```

---

## 5. Pagination & Filtering

### 5.1 Pagination
Uses JSON:API style query parameters:
```
GET /cases?page[number]=2&page[size]=50
```

**Response**:
```json
{
  "data": [...],
  "meta": {
    "page": 2,
    "size": 50,
    "total": 250
  }
}
```

**Defaults**:
- `page[number]`: 1
- `page[size]`: 50 (max: 200)

### 5.2 Common Filters
- **Search**: Full-text search on key fields
- **Status**: Enum-based status filtering
- **Date Ranges**: `startDate` / `endDate` for temporal queries
- **Sorting**: `sort=field&order=asc|desc`
- **Boolean Flags**: `assignedToMe=true`, `billable=false`

---

## 6. Error Handling

### 6.1 Error Response Format
```json
{
  "code": "PERMISSION_DENIED",
  "message": "You do not have permission to access this resource",
  "details": [
    {
      "field": "caseId",
      "message": "Case not found or access denied"
    }
  ],
  "requestId": "req_456xyz"
}
```

### 6.2 HTTP Status Codes
| Code | Meaning | Use Case |
|------|---------|----------|
| 200 | OK | Successful GET/PATCH/POST |
| 201 | Created | Resource created |
| 204 | No Content | Successful DELETE |
| 400 | Bad Request | Validation error |
| 401 | Unauthorized | Missing/invalid token |
| 403 | Forbidden | No permission |
| 404 | Not Found | Resource doesn't exist |
| 409 | Conflict | Duplicate/version mismatch |
| 422 | Unprocessable Entity | Business rule violation |
| 429 | Too Many Requests | Rate limit exceeded |
| 500 | Internal Server Error | Server-side failure |

### 6.3 Error Codes
- `VALIDATION_ERROR`: Input validation failed
- `PERMISSION_DENIED`: Insufficient permissions
- `RESOURCE_NOT_FOUND`: Requested resource not found
- `DUPLICATE_RESOURCE`: Unique constraint violation
- `BUSINESS_RULE_VIOLATION`: Domain logic error
- `RATE_LIMIT_EXCEEDED`: Too many requests
- `EXTERNAL_SERVICE_ERROR`: Logto/S3/payment gateway failure

---

## 7. Performance & Scalability

### 7.1 Response Times (p95)
- **Simple GET** (single resource): < 100ms
- **List GET** (paginated): < 300ms
- **POST/PATCH** (writes): < 500ms
- **Document upload** (presigned URL): < 200ms
- **Search** (full-text): < 1000ms

### 7.2 Rate Limits
- **Per User**: 1000 requests/hour
- **Per Firm**: 10,000 requests/hour
- **Document Upload**: 100 MB/file, 10 files/hour
- **Burst**: 100 requests/minute

### 7.3 Caching Strategy
- **User Profiles**: 15 minutes (Redis)
- **Firm Members**: 5 minutes
- **Case Lists**: 1 minute (user-specific)
- **Static Data**: 1 hour (practice areas, categories)

### 7.4 Database Optimization
- **Indexes**: All foreign keys, status fields, timestamps
- **Partitioning**: Time entries by year-month
- **Read Replicas**: For reporting and list queries
- **Connection Pooling**: PgBouncer (300 max connections)

---

## 8. Security Considerations

### 8.1 Data Protection
- **Encryption at Rest**: AES-256 for database
- **Encryption in Transit**: TLS 1.3
- **Sensitive Fields**: SSN, DOB encrypted with KMS
- **PII Masking**: Logs never contain SSN/passwords

### 8.2 Access Control
- **Multi-tenant Isolation**: Firm ID in all queries
- **Row-Level Security**: Postgres RLS policies
- **Field-Level Permissions**: Conditional field inclusion
- **Audit Logging**: All mutations logged with user context

### 8.3 Compliance
- **GDPR**: Data export, right to deletion
- **HIPAA**: (if handling medical records) BAA required
- **SOC 2 Type II**: Annual audit
- **ABA Ethics**: Attorney-client privilege protection

---

## 9. Monitoring & Observability

### 9.1 Metrics
- **Request Rate**: Requests/second by endpoint
- **Error Rate**: 4xx/5xx by endpoint
- **Latency**: p50, p95, p99 response times
- **Database**: Query time, connection pool usage
- **Cache Hit Rate**: Redis hit ratio

### 9.2 Logging
- **Structured Logs**: JSON format with correlation IDs
- **Log Levels**: ERROR, WARN, INFO, DEBUG
- **Retention**: 30 days (hot), 1 year (cold archive)

### 9.3 Alerting
- **High Error Rate**: > 5% 5xx errors
- **High Latency**: p95 > 2 seconds
- **Failed Logins**: > 10 failed attempts/user
- **Database Connection Pool**: > 80% utilization

---

## 10. Integration Points

### 10.1 External Services
- **Logto**: Authentication & organization management
- **AWS S3/GCS**: Document storage
- **SendGrid/SES**: Email notifications
- **Twilio**: SMS notifications
- **Stripe**: Payment processing (invoices)
- **Zoom/Teams**: Virtual meeting integration

### 10.2 Webhooks (Inbound)
- **Logto Events**: User created/updated, org membership changed
- **Payment Events**: Invoice paid, payment failed
- **Calendar Events**: Meeting updated, attendee responded

### 10.3 Webhooks (Outbound)
- **Case Events**: Case created, status changed
- **Document Events**: Document uploaded, shared
- **Time Entry Events**: Entry submitted, approved
- **Comment Events**: Comment added with @mention

---

## 11. API Versioning

### 11.1 Strategy
- **URL Versioning**: `/v1/cases`, `/v2/cases`
- **Backwards Compatibility**: 12-month deprecation cycle
- **Version Header**: `API-Version: 2024-10-01`

### 11.2 Change Policy
- **Non-Breaking**: New optional fields, new endpoints
- **Breaking**: Required field changes, endpoint removal
- **Deprecation Notice**: 90 days via API headers + email

---

## 12. Developer Experience

### 12.1 Documentation
- **OpenAPI 3.1**: Machine-readable spec
- **Interactive Docs**: Swagger UI / ReDoc
- **Code Samples**: cURL, JavaScript, Python, Go
- **Postman Collection**: Pre-configured requests

### 12.2 SDKs (Planned)
- JavaScript/TypeScript (Node.js + Browser)
- Python
- Go
- C# (.NET)

### 12.3 Sandbox Environment
- **URL**: `https://api-sandbox.example.com/v1`
- **Test Data**: Pre-seeded demo firm, users, cases
- **Rate Limits**: Relaxed (10x production)

---

## 13. Testing Strategy

### 13.1 Test Types
- **Unit Tests**: Business logic, validation
- **Integration Tests**: Database, external APIs
- **E2E Tests**: Full user flows
- **Load Tests**: 1000 concurrent users

### 13.2 Test Coverage Targets
- **Code Coverage**: > 85%
- **Critical Paths**: 100% (auth, billing, RBAC)

---

## 14. Deployment

### 14.1 Infrastructure
- **Platform**: AWS ECS Fargate / Kubernetes
- **Database**: Amazon RDS Postgres (Multi-AZ)
- **Cache**: Amazon ElastiCache Redis (cluster mode)
- **Load Balancer**: AWS ALB with sticky sessions
- **CDN**: CloudFront for static assets

### 14.2 Deployment Process
- **CI/CD**: GitHub Actions → Docker build → ECS deploy
- **Blue-Green**: Zero-downtime deployments
- **Rollback**: One-click rollback to previous version
- **Database Migrations**: Flyway with automated rollback

### 14.3 Environments
- **Development**: Continuous deployment from `main`
- **Staging**: Mirrors production, manual promotion
- **Production**: Release every 2 weeks (Tuesdays)

---

## 15. Roadmap

### 15.1 Q4 2024
- [ ] Advanced search (Elasticsearch)
- [ ] Real-time collaboration (WebSockets)
- [ ] Mobile push notifications

### 15.2 Q1 2025
- [ ] AI-powered document analysis
- [ ] Automated time entry suggestions
- [ ] Voice-to-text for case notes

### 15.3 Q2 2025
- [ ] Multi-language support (Spanish, French)
- [ ] Advanced analytics dashboard
- [ ] Third-party app marketplace

---

## 16. Appendices

### 16.1 Glossary
- **RBAC**: Role-Based Access Control
- **JWT**: JSON Web Token
- **CRUD**: Create, Read, Update, Delete
- **ACL**: Access Control List
- **RLS**: Row-Level Security

### 16.2 References
- [OpenAPI Specification](../openapi/user-apis.yaml)
- [Database Schema](../database.dbml)
- [Logto Documentation](https://docs.logto.io)
- [C4 Model Diagrams](./c4-user-api-models.md)
