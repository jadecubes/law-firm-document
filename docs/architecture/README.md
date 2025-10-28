# Law Firm Management System - Architecture Documentation

Welcome to the architecture documentation for the Law Firm Management System. This directory contains comprehensive technical specifications, database schemas, and architectural diagrams.

## 📚 Documentation Index

### 1. Database Design
- **[Database Schema (DBML)](/database.dbml)** - Complete entity-relationship diagram with 23 slices covering all system entities
  - Multi-tenant law firm management
  - Logto-integrated authentication & RBAC
  - Case & client management
  - Time tracking & billing
  - Document management
  - Appointments & collaboration
  - Partner firms & cooperation
  - Performance reviews & bonuses
  - ERP integration

### 2. API Specifications
- **[User API Specification](./user-api-specification.md)** - Comprehensive technical specification for the User Portal API
  - Authentication & Authorization
  - All 10 API modules (Profile, Cases, Clients, Documents, etc.)
  - Data models & schemas
  - Error handling & status codes
  - Performance & scalability
  - Security considerations
  - Deployment & monitoring

- **[User API OpenAPI Spec](/openapi/user-apis.yaml)** - Machine-readable OpenAPI 3.1 specification
  - 40+ endpoints
  - Request/response schemas
  - Authentication flows
  - Interactive documentation (Swagger UI / ReDoc)

- **[Admin API OpenAPI Spec](/openapi/admin-api.yaml)** - Administrative operations API
  - Firm provisioning
  - User management
  - System configuration
  - Support access sessions

### 3. Architecture Models
- **[C4 Architecture Models](./c4-user-api-models.md)** - Multi-level architecture diagrams
  - **Level 1: System Context** - Users, external systems, boundaries
  - **Level 2: Container Diagram** - Technology stack, services, databases
  - **Level 3: Component Diagram** - Internal structure of User API
  - **Level 4: Code Examples** - Implementation patterns
  - Deployment architecture
  - Security architecture
  - Monitoring & observability

## 🏗️ System Overview

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        Users                                 │
│  (Lawyers, Paralegals, Staff, Clients, Partners)           │
└─────────────────────┬───────────────────────────────────────┘
                      │ HTTPS/JSON
                      ▼
┌─────────────────────────────────────────────────────────────┐
│                   API Gateway                                │
│  (Authentication, Rate Limiting, Routing)                   │
└─────────┬───────────────────────────────────────────────────┘
          │
   ┌──────┴──────┐
   │             │
   ▼             ▼
┌──────────┐  ┌──────────┐
│ User API │  │Admin API │
│  (Core)  │  │(Platform)│
└────┬─────┘  └────┬─────┘
     │             │
     └──────┬──────┘
            │
    ┌───────┴────────┐
    │                │
    ▼                ▼
┌──────────┐    ┌─────────┐
│PostgreSQL│    │  Redis  │
│(Primary) │    │ (Cache) │
└──────────┘    └─────────┘
```

### Key Architectural Principles

1. **Multi-Tenant by Design**
   - Firm-level isolation (row-level security)
   - Shared infrastructure, isolated data
   - Per-firm customization support

2. **Logto-Integrated Authentication**
   - External identity provider (Logto)
   - OAuth 2.0 / OIDC flows
   - JWT bearer tokens
   - Organization-based access

3. **Fine-Grained RBAC**
   - Role-based permissions (PERMISSIONS, ROLES)
   - User role assignments (scoped by firm/case/org unit)
   - Resource access grants (polymorphic ACLs)
   - Field-level permissions

4. **Event-Driven Architecture**
   - Domain events published to message queue
   - Asynchronous processing (notifications, integrations)
   - Audit trail for compliance
   - Eventual consistency

5. **Microservices (Modular Monolith)**
   - Clear service boundaries
   - Shared database (transitioning to separate DBs)
   - RESTful APIs with JSON
   - gRPC for inter-service communication

## 🔐 Security & Compliance

### Authentication Flow

```
User → Login Request → Logto (IdP)
                         │
                         ▼
                    JWT Token
                         │
                         ▼
User API ← Validate Token ← Auth Service
    │
    ▼
Permission Check (RBAC)
    │
    ▼
Business Logic
```

### Compliance Standards
- **GDPR**: Data export, right to erasure
- **SOC 2 Type II**: Annual audit
- **ABA Model Rules**: Attorney-client privilege protection
- **PCI DSS**: (if storing payment cards) Tokenization via Stripe

### Security Features
- TLS 1.3 encryption in transit
- AES-256 encryption at rest
- Field-level encryption (SSN, DOB)
- Audit logging (immutable)
- Rate limiting (per user/firm)
- CSRF protection
- SQL injection prevention (ORM)
- XSS protection (CSP headers)

## 📊 Database Schema Highlights

### Core Tables (23 Slices)

| Slice | Tables | Purpose |
|-------|--------|---------|
| 0 | LAW_FIRMS | Tenant boundary |
| 1 | AUTH_USERS, LOGTO_*, FIRM_USER_PROFILES | Authentication & user management |
| 2 | ORG_UNITS, POSITIONS, REPORTING_LINES | Organizational structure |
| 3 | ARTICLES, SPECIALTIES | Content & expertise |
| 4 | PERFORMANCE_REVIEWS, BONUS_AWARDS | HR & compensation |
| 5 | CLIENTS, CLIENT_CONTACTS, CLIENT_USERS | Client management |
| 5A | CASES, CASE_BUDGETS | Core case management |
| 6 | PARTNER_FIRMS, PARTNER_ATTORNEYS | Partner network |
| 7 | CASE_*_ROLE_TYPES | Role catalogs |
| 8 | CASE_ATTORNEYS, CASE_CLIENTS | Case assignments |
| 9 | PARTNER_ATTORNEY_USERS | Partner portal logins |
| 10 | PERMISSIONS, ROLES, USER_ROLE_ASSIGNMENTS | RBAC system |
| 11 | BILLING_ACTIVITY_CODES, EXPENSE_CATEGORIES | Billing catalogs |
| 12 | LAWYER_RATE_PLANS, CASE_RATE_PLAN_SELECTIONS | Pricing engine |
| 13 | LAWYER_TIME_ENTRIES, EXPENSE_ENTRIES | Time & expense tracking |
| 14 | INVOICES, PAYMENTS, CREDIT_NOTES | Accounts receivable |
| 16 | PARTNER_BILLS | Partner accounts payable |
| 17 | ERP_EXPORT_QUEUE, ERP_ACCOUNT_MAPPINGS | ERP integration |
| 18 | VENDORS, FIRM_OPEX | Firm operating expenses |
| 19 | APPOINTMENTS, APPOINTMENT_ATTENDEES | Scheduling |
| 20 | SUPPORT_ACCESS_SESSIONS, ADMIN_RESOURCE_LOCKS | Admin tools |
| 21 | DOCUMENTS | Document management |
| 22 | NOTIFICATIONS | Real-time notifications |
| 23 | COMMENTS | Collaboration |

### Key Relationships

```
LAW_FIRMS (1) ──── (*) FIRM_USER_PROFILES
                         │
                         └── (*) CASES
                               │
                               ├── (*) DOCUMENTS
                               ├── (*) LAWYER_TIME_ENTRIES
                               └── (*) INVOICES

AUTH_USERS (1) ──── (*) FIRM_USER_PROFILES
    │
    ├── (*) USER_ROLE_ASSIGNMENTS ──── (*) ROLES ──── (*) PERMISSIONS
    │
    └── (*) RESOURCE_ACCESS_GRANTS
```

## 🚀 API Endpoints Summary

### User Portal API (`/v1`)

| Module | Endpoints | Description |
|--------|-----------|-------------|
| **Profile** | `GET/PATCH /me` | User profile management |
| **Members** | `GET /firm/members` | Colleague directory |
| **Cases** | `GET/POST /cases`, `GET/PATCH /cases/:id` | Case CRUD, team management |
| **Clients** | `GET/POST /clients`, `GET/PATCH /clients/:id` | Client management |
| **Documents** | `GET/POST /documents`, `GET/PATCH/DELETE /documents/:id` | Document upload/download |
| **Appointments** | `GET/POST /appointments`, `GET/PATCH/DELETE /appointments/:id` | Scheduling |
| **Time Entries** | `GET/POST /time-entries`, `POST /time-entries/:id/submit` | Time tracking |
| **Invoices** | `GET /invoices`, `GET /invoices/:id` | Invoice viewing (read-only) |
| **Notifications** | `GET /notifications`, `POST /notifications/:id/mark-read` | Activity feed |
| **Comments** | `GET/POST /comments`, `PATCH/DELETE /comments/:id` | Collaboration |

**Total**: 40+ endpoints

### Admin API (`/admin/v1`)

| Module | Endpoints | Description |
|--------|-----------|-------------|
| **Firms** | `GET/POST /firms` | Firm provisioning |
| **Users** | `POST /users`, `POST /users/:id/roles` | User management |
| **Access** | `POST /support-access-sessions` | Admin impersonation |
| **Sync** | `POST /sync/logto` | Logto synchronization |

**Total**: 30+ endpoints

## 📈 Performance Targets

| Metric | Target (p95) |
|--------|--------------|
| Simple GET (single resource) | < 100ms |
| List GET (paginated) | < 300ms |
| POST/PATCH (writes) | < 500ms |
| Search (full-text) | < 1000ms |
| Document upload (presigned URL) | < 200ms |

### Scalability
- **Concurrent Users**: 10,000+
- **Database Size**: 1TB+ (with partitioning)
- **Document Storage**: 10TB+ (S3)
- **Request Rate**: 10,000 req/sec (peak)

## 🛠️ Technology Stack

### Backend
- **Runtime**: Node.js 20 LTS
- **Framework**: NestJS (TypeScript)
- **ORM**: TypeORM / Prisma
- **API Docs**: OpenAPI 3.1 / Swagger

### Data Layer
- **Primary DB**: PostgreSQL 15 (RDS Multi-AZ)
- **Cache**: Redis 7 (ElastiCache cluster mode)
- **Search**: Elasticsearch 8
- **Queue**: AWS SQS / RabbitMQ

### Frontend
- **Web**: React 18 + TypeScript
- **Mobile**: React Native
- **State**: Redux Toolkit / Zustand
- **UI**: Material-UI / Tailwind CSS

### Infrastructure
- **Cloud**: AWS
- **Containers**: Docker + ECS Fargate / Kubernetes
- **CDN**: CloudFront
- **Storage**: S3
- **Auth**: Logto (external SaaS)

### DevOps
- **CI/CD**: GitHub Actions
- **IaC**: Terraform / CloudFormation
- **Monitoring**: CloudWatch + Prometheus + Grafana
- **Logging**: CloudWatch Logs + Elasticsearch + Kibana
- **Tracing**: AWS X-Ray + Jaeger
- **Alerting**: PagerDuty + Slack

## 🧪 Testing Strategy

### Test Coverage
- **Unit Tests**: 85%+ (Jest)
- **Integration Tests**: Key flows (Supertest)
- **E2E Tests**: Critical paths (Playwright)
- **Load Tests**: 1000 concurrent users (k6)
- **Security Tests**: OWASP ZAP, Snyk

### Test Environments
- **Development**: Auto-deployed from `main`
- **Staging**: Production mirror
- **Production**: Blue-green deployments

## 📖 Getting Started

### For Developers

1. **Read the API Specification**
   - [User API Specification](./user-api-specification.md)
   - [OpenAPI Spec](/openapi/user-apis.yaml)

2. **Understand the Architecture**
   - [C4 Models](./c4-user-api-models.md)
   - [Database Schema](/database.dbml)

3. **Set Up Local Environment**
   ```bash
   # Clone repository
   git clone https://github.com/your-org/law-firm-api

   # Install dependencies
   npm install

   # Set up database
   docker-compose up -d postgres redis
   npm run migration:run

   # Start development server
   npm run start:dev
   ```

4. **Explore Interactive Docs**
   - User API: http://localhost:3000/api/docs
   - Admin API: http://localhost:3001/admin/docs

### For Architects

1. Review [C4 Architecture Models](./c4-user-api-models.md)
2. Examine [Database Schema](/database.dbml) - visualize at https://dbdiagram.io
3. Study authentication flow in [User API Spec](./user-api-specification.md#2-authentication--authorization)
4. Understand RBAC system in [Database Schema - Slice 10](/database.dbml)

### For Product Managers

1. Browse [User API Endpoints](./user-api-specification.md#3-api-modules)
2. Review user flows in [C4 Models - Data Flow Diagrams](./c4-user-api-models.md#data-flow-diagrams)
3. Understand permissions in [API Spec - Authorization](./user-api-specification.md#22-authorization-model)

## 🤝 Contributing

### Documentation Updates
- Update OpenAPI specs when adding/modifying endpoints
- Regenerate docs: `npm run openapi:generate`
- Update C4 diagrams when architecture changes
- Keep database.dbml in sync with migrations

### Code Standards
- TypeScript strict mode
- ESLint + Prettier
- Conventional Commits
- Code review required (2 approvals)

## 📞 Support

- **Documentation Issues**: Open GitHub issue with `docs` label
- **API Questions**: #api-development Slack channel
- **Architecture Discussion**: #architecture Slack channel
- **On-Call**: PagerDuty escalation for production issues

## 📄 License

Proprietary - All Rights Reserved © 2024 Your Law Firm

---

**Last Updated**: 2024-10-26
**Maintained By**: Platform Engineering Team
**Version**: 1.0.0
