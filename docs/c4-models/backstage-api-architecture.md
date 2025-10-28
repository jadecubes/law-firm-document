---
sidebar_position: 2
sidebar_label: Backstage API Architecture
---

# Backstage API Architecture (C4 Model)

Complete C4 architecture documentation for the Law Firm **Backstage API System**, which encompasses both **Admin API** (provisioning & management) and **User API** (lawyer/staff portal).

## 🎯 Overview

The **Backstage API** is the unified backend system that powers the law firm's internal operations. It consists of two major API surfaces:

- **Admin API**: Administrative operations, provisioning, access control, and system management
- **User API**: Day-to-day operations for lawyers, paralegals, and staff (cases, clients, documents, time tracking, etc.)

Both APIs share:
- Authentication infrastructure (Logto)
- Database layer (PostgreSQL + Redis)
- Common security model (RBAC + field-level permissions)
- Unified audit logging
- Shared infrastructure and deployment

---

## Level 1: System Context

### Backstage System in the Larger Ecosystem

```mermaid
graph TB
    %% Users
    Admin[("👤 Admin User<br/>(System Admin)")]
    Lawyer[("👤 Lawyer<br/>(Attorney)")]
    Paralegal[("👤 Paralegal<br/>(Legal Assistant)")]
    Staff[("👤 Staff<br/>(Billing, Records)")]
    Client[("👤 Client<br/>(External)")]

    %% Core System
    subgraph Backstage["🏢 Backstage API System"]
        AdminAPI["Admin API<br/>(Provisioning)"]
        UserAPI["User API<br/>(Portal)"]
    end

    %% Frontend Apps
    WebApp["💻 Web Application<br/>(React)"]
    MobileApp["📱 Mobile App<br/>(React Native)"]
    AdminPortal["🛠️ Admin Portal<br/>(React)"]

    %% External Systems
    Logto["🔐 Logto<br/>(Identity Provider)"]
    S3["☁️ AWS S3<br/>(Document Storage)"]
    Email["📧 SendGrid<br/>(Email Service)"]
    SMS["📱 Twilio<br/>(SMS Service)"]
    Payment["💳 Stripe<br/>(Payment Gateway)"]
    ERP["📊 QuickBooks<br/>(Accounting ERP)"]

    %% User Connections
    Admin --> AdminPortal
    Lawyer --> WebApp
    Lawyer --> MobileApp
    Paralegal --> WebApp
    Staff --> WebApp
    Client -.-> WebApp

    %% Frontend to Backend
    AdminPortal --> AdminAPI
    WebApp --> UserAPI
    WebApp -.-> AdminAPI
    MobileApp --> UserAPI

    %% Backend to External
    AdminAPI --> Logto
    UserAPI --> Logto
    UserAPI --> S3
    UserAPI --> Email
    UserAPI --> SMS
    AdminAPI --> Email
    UserAPI --> Payment
    UserAPI --> ERP

    style Backstage fill:#e1f5ff,stroke:#01579b,stroke-width:3px
    style AdminAPI fill:#fff3e0,stroke:#e65100,stroke-width:2px
    style UserAPI fill:#f3e5f5,stroke:#4a148c,stroke-width:2px
```

### Key Actors

| Actor | Role | Primary API | Description |
|-------|------|-------------|-------------|
| **Admin User** | System Administrator | Admin API | Provisions firms, users, manages access grants, support access |
| **Lawyer** | Attorney | User API | Manages cases, clients, documents, time entries |
| **Paralegal** | Legal Assistant | User API | Assists with case work, document management, scheduling |
| **Staff** | Support Staff | User API | Billing, records management, administrative tasks |
| **Client** | External User | (Future Client API) | Views case status, uploads documents (limited access) |

### External System Integration

| System | Purpose | Used By | Communication |
|--------|---------|---------|---------------|
| **Logto** | Authentication & Identity | Both APIs | OAuth 2.0 / OIDC |
| **AWS S3** | Document Storage | User API | AWS SDK |
| **SendGrid** | Email Notifications | Both APIs | REST API |
| **Twilio** | SMS Notifications | User API | REST API |
| **Stripe** | Payment Processing | User API | REST API |
| **QuickBooks** | Accounting Integration | User API | REST API |

---

## Level 2: Container Diagram

### Backstage API Containers and Data Stores

```mermaid
graph TB
    subgraph Frontend["Frontend Applications"]
        WebApp["Web Application<br/>(React + TypeScript)"]
        MobileApp["Mobile App<br/>(React Native)"]
        AdminPortal["Admin Portal<br/>(React + TypeScript)"]
    end

    subgraph APIGateway["API Layer"]
        Gateway["API Gateway<br/>(Kong / AWS ALB)"]
    end

    subgraph BackstageAPIs["🏢 Backstage API System"]
        AdminAPI["Admin API<br/>(NestJS / Node.js)<br/>Provisioning, Access Control"]
        UserAPI["User API<br/>(NestJS / Node.js)<br/>Cases, Clients, Documents"]
        AuthService["Auth Service<br/>(Node.js)<br/>JWT Validation, RBAC"]
        NotificationService["Notification Service<br/>(Node.js)<br/>Email, SMS, Push"]
        DocumentService["Document Service<br/>(Node.js)<br/>Upload, Storage, Retrieval"]
        BillingService["Billing Service<br/>(Node.js)<br/>Time Tracking, Invoicing"]
    end

    subgraph DataLayer["Data & Cache Layer"]
        PostgreSQL["PostgreSQL<br/>(Multi-tenant DB)<br/>Cases, Clients, Users"]
        Redis["Redis<br/>(Cache + Sessions)<br/>Sub-second queries"]
        Elasticsearch["Elasticsearch<br/>(Search Engine)<br/>Full-text search"]
    end

    subgraph MessageQueue["Async Processing"]
        SQS["AWS SQS<br/>(Message Queue)<br/>Background jobs"]
    end

    subgraph ExternalSystems["External Systems"]
        Logto["Logto<br/>(Identity)"]
        S3["AWS S3<br/>(Storage)"]
        SendGrid["SendGrid<br/>(Email)"]
        Twilio["Twilio<br/>(SMS)"]
        Stripe["Stripe<br/>(Payments)"]
    end

    %% Frontend to Gateway
    WebApp --> Gateway
    MobileApp --> Gateway
    AdminPortal --> Gateway

    %% Gateway to APIs
    Gateway --> AdminAPI
    Gateway --> UserAPI

    %% APIs to Services
    AdminAPI --> AuthService
    UserAPI --> AuthService
    UserAPI --> NotificationService
    UserAPI --> DocumentService
    UserAPI --> BillingService
    AdminAPI --> NotificationService

    %% APIs to Data
    AdminAPI --> PostgreSQL
    UserAPI --> PostgreSQL
    AdminAPI --> Redis
    UserAPI --> Redis
    UserAPI --> Elasticsearch

    %% Services to Data
    AuthService --> Redis
    DocumentService --> S3
    NotificationService --> SQS
    BillingService --> PostgreSQL

    %% Async Jobs
    NotificationService --> SendGrid
    NotificationService --> Twilio
    UserAPI --> SQS
    BillingService --> Stripe

    %% External Auth
    AuthService --> Logto

    style BackstageAPIs fill:#e1f5ff,stroke:#01579b,stroke-width:3px
    style AdminAPI fill:#fff3e0,stroke:#e65100,stroke-width:2px
    style UserAPI fill:#f3e5f5,stroke:#4a148c,stroke-width:2px
```

### Container Descriptions

#### Frontend Layer

| Container | Technology | Purpose |
|-----------|-----------|---------|
| **Web Application** | React 18, TypeScript, Material-UI | Primary interface for lawyers and staff |
| **Mobile App** | React Native, TypeScript | iOS/Android app for mobile access |
| **Admin Portal** | React 18, TypeScript, Ant Design | Administrative interface for system admins |

#### API Layer

| Container | Technology | Purpose | Port |
|-----------|-----------|---------|------|
| **API Gateway** | Kong / AWS ALB | Request routing, rate limiting, authentication | 443 |
| **Admin API** | NestJS, TypeScript, Node.js 20 | Provisioning, user management, access grants | 3001 |
| **User API** | NestJS, TypeScript, Node.js 20 | Cases, clients, documents, time tracking | 3002 |
| **Auth Service** | Node.js, Express | JWT validation, RBAC resolution, permission checks | 3010 |
| **Notification Service** | Node.js, Bull Queue | Email, SMS, push notifications | 3020 |
| **Document Service** | Node.js, Multer, Sharp | File upload, processing, storage | 3030 |
| **Billing Service** | Node.js | Time entry aggregation, invoice generation | 3040 |

#### Data Layer

| Container | Technology | Purpose | Access Pattern |
|-----------|-----------|---------|----------------|
| **PostgreSQL** | PostgreSQL 15, Multi-tenant | Primary data store | Row-level security per firm |
| **Redis** | Redis 7, Cluster mode | Cache, sessions, rate limits | TTL-based expiration |
| **Elasticsearch** | Elasticsearch 8 | Full-text search across documents | Async index updates |

#### Message Queue

| Container | Technology | Purpose |
|-----------|-----------|---------|
| **AWS SQS** | Amazon SQS, FIFO queues | Async job processing, event-driven workflows |

---

## Level 3: Component Diagram

### Admin API Internal Structure

```mermaid
graph TB
    subgraph AdminAPI["Admin API (NestJS)"]
        subgraph Middleware["Middleware Layer"]
            AuthMW["JWT Auth<br/>Middleware"]
            RBACAdminMW["Admin RBAC<br/>Middleware"]
            ValidationMW["Request<br/>Validation"]
        end

        subgraph Controllers["Controllers (REST Endpoints)"]
            FirmCtrl["Firm<br/>Controller<br/>(3 endpoints)"]
            UserCtrl["User<br/>Controller<br/>(9 endpoints)"]
            LogtoCtrl["Logto Bridge<br/>Controller<br/>(8 endpoints)"]
            GrantCtrl["Access Grant<br/>Controller<br/>(9 endpoints)"]
            CapCtrl["Capability<br/>Controller<br/>(2 endpoints)"]
            SupportCtrl["Support Access<br/>Controller<br/>(6 endpoints)"]
        end

        subgraph Services["Business Logic"]
            FirmService["Firm<br/>Service"]
            UserService["User<br/>Service"]
            LogtoService["Logto Bridge<br/>Service"]
            GrantService["Access Grant<br/>Service"]
            CapService["Capability<br/>Service"]
            SupportService["Support Access<br/>Service"]
        end

        subgraph Repositories["Data Access"]
            FirmRepo["Firm<br/>Repository"]
            UserRepo["User<br/>Repository"]
            GrantRepo["Access Grant<br/>Repository"]
        end

        subgraph Infrastructure["Infrastructure"]
            PermResolver["Permission<br/>Resolver"]
            EventPub["Event<br/>Publisher"]
            AuditLog["Audit<br/>Logger"]
        end
    end

    %% Flow
    AuthMW --> RBACAdminMW
    RBACAdminMW --> ValidationMW
    ValidationMW --> FirmCtrl
    ValidationMW --> UserCtrl
    ValidationMW --> LogtoCtrl
    ValidationMW --> GrantCtrl
    ValidationMW --> CapCtrl
    ValidationMW --> SupportCtrl

    FirmCtrl --> FirmService
    UserCtrl --> UserService
    LogtoCtrl --> LogtoService
    GrantCtrl --> GrantService
    CapCtrl --> CapService
    SupportCtrl --> SupportService

    FirmService --> FirmRepo
    UserService --> UserRepo
    GrantService --> GrantRepo
    UserService --> LogtoService
    GrantService --> PermResolver

    FirmService --> EventPub
    UserService --> EventPub
    GrantService --> EventPub

    FirmService --> AuditLog
    UserService --> AuditLog
    GrantService --> AuditLog

    style AdminAPI fill:#fff3e0,stroke:#e65100,stroke-width:3px
```

### User API Internal Structure

```mermaid
graph TB
    subgraph UserAPI["User API (NestJS)"]
        subgraph MiddlewareUser["Middleware Layer"]
            AuthMWU["JWT Auth<br/>Middleware"]
            RBACMW["RBAC<br/>Middleware"]
            ValidationMWU["Request<br/>Validation"]
            FieldPolicyMW["Field Policy<br/>Middleware"]
        end

        subgraph ControllersUser["Controllers (REST Endpoints)"]
            ProfileCtrl["Profile<br/>Controller<br/>(2 endpoints)"]
            CaseCtrl["Case<br/>Controller<br/>(7 endpoints)"]
            ClientCtrl["Client<br/>Controller<br/>(4 endpoints)"]
            DocumentCtrl["Document<br/>Controller<br/>(5 endpoints)"]
            ApptCtrl["Appointment<br/>Controller<br/>(6 endpoints)"]
            TimeCtrl["Time Entry<br/>Controller<br/>(6 endpoints)"]
            InvoiceCtrl["Invoice<br/>Controller<br/>(2 endpoints)"]
            NotifCtrl["Notification<br/>Controller<br/>(3 endpoints)"]
            CommentCtrl["Comment<br/>Controller<br/>(4 endpoints)"]
        end

        subgraph ServicesUser["Business Logic"]
            ProfileService["Profile<br/>Service"]
            CaseService["Case<br/>Service"]
            ClientService["Client<br/>Service"]
            DocumentServiceU["Document<br/>Service"]
            ApptService["Appointment<br/>Service"]
            TimeService["Time Entry<br/>Service"]
            InvoiceService["Invoice<br/>Service"]
            NotifService["Notification<br/>Service"]
            CommentService["Comment<br/>Service"]
        end

        subgraph RepositoriesUser["Data Access"]
            ProfileRepo["Profile<br/>Repository"]
            CaseRepo["Case<br/>Repository"]
            ClientRepo["Client<br/>Repository"]
            DocumentRepo["Document<br/>Repository"]
            TimeRepo["Time Entry<br/>Repository"]
        end

        subgraph InfraUser["Infrastructure"]
            PermResolverU["Permission<br/>Resolver"]
            EventPubU["Event<br/>Publisher"]
            AuditLogU["Audit<br/>Logger"]
        end
    end

    %% Flow
    AuthMWU --> RBACMW
    RBACMW --> ValidationMWU
    ValidationMWU --> FieldPolicyMW
    FieldPolicyMW --> ProfileCtrl
    FieldPolicyMW --> CaseCtrl
    FieldPolicyMW --> ClientCtrl
    FieldPolicyMW --> DocumentCtrl
    FieldPolicyMW --> ApptCtrl
    FieldPolicyMW --> TimeCtrl
    FieldPolicyMW --> InvoiceCtrl
    FieldPolicyMW --> NotifCtrl
    FieldPolicyMW --> CommentCtrl

    CaseCtrl --> CaseService
    ClientCtrl --> ClientService
    DocumentCtrl --> DocumentServiceU
    TimeCtrl --> TimeService

    CaseService --> CaseRepo
    ClientService --> ClientRepo
    DocumentServiceU --> DocumentRepo
    TimeService --> TimeRepo

    CaseService --> PermResolverU
    ClientService --> PermResolverU
    DocumentServiceU --> PermResolverU

    CaseService --> EventPubU
    ClientService --> EventPubU
    DocumentServiceU --> EventPubU

    CaseService --> AuditLogU
    ClientService --> AuditLogU

    style UserAPI fill:#f3e5f5,stroke:#4a148c,stroke-width:3px
```

---

## Level 4: Code Examples

### 4.1 Admin API - Provision a User (TypeScript)

```typescript
// admin-api/src/users/users.service.ts
import { Injectable, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { LogtoService } from '../logto/logto.service';
import { EventPublisher } from '../events/event-publisher';
import { AuditLogger } from '../audit/audit-logger';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private userRepo: Repository<User>,
    private logtoService: LogtoService,
    private eventPublisher: EventPublisher,
    private auditLogger: AuditLogger,
  ) {}

  async provisionUser(dto: ProvisionUserDto, adminUserId: string): Promise<User> {
    // 1. Check if user already exists
    const existing = await this.userRepo.findOne({
      where: { email: dto.email, firmId: dto.firmId },
    });
    if (existing) {
      throw new ConflictException('User already exists in this firm');
    }

    // 2. Create Logto identity (if inviting)
    let logtoUserId: string | null = null;
    if (dto.invite) {
      logtoUserId = await this.logtoService.inviteUser({
        email: dto.email,
        name: dto.fullName,
        orgId: dto.logtoOrgId,
      });
    }

    // 3. Create local user profile
    const user = this.userRepo.create({
      firmId: dto.firmId,
      logtoUserId,
      email: dto.email,
      fullName: dto.fullName,
      role: dto.role,
      isLawyer: dto.credentials?.length > 0,
      createdBy: adminUserId,
    });
    await this.userRepo.save(user);

    // 4. Add professional credentials (if lawyer)
    if (dto.credentials?.length > 0) {
      await this.addCredentials(user.id, dto.credentials);
    }

    // 5. Publish user.created event
    await this.eventPublisher.publish('user.created', {
      userId: user.id,
      firmId: user.firmId,
      role: user.role,
      createdBy: adminUserId,
    });

    // 6. Audit log
    await this.auditLogger.log({
      action: 'USER_PROVISIONED',
      actorId: adminUserId,
      resourceType: 'USER',
      resourceId: user.id,
      metadata: { email: user.email, role: user.role },
    });

    return user;
  }
}
```

### 4.2 User API - Create a Case (TypeScript)

```typescript
// user-api/src/cases/cases.service.ts
import { Injectable, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PermissionResolver } from '../auth/permission-resolver';
import { EventPublisher } from '../events/event-publisher';

@Injectable()
export class CasesService {
  constructor(
    @InjectRepository(Case)
    private caseRepo: Repository<Case>,
    @InjectRepository(CaseAssignment)
    private assignmentRepo: Repository<CaseAssignment>,
    private permissionResolver: PermissionResolver,
    private eventPublisher: EventPublisher,
  ) {}

  async createCase(dto: CreateCaseDto, userId: string): Promise<Case> {
    // 1. Check permission: cases:create
    const hasPermission = await this.permissionResolver.check({
      userId,
      action: 'cases:create',
      firmId: dto.firmId,
    });
    if (!hasPermission) {
      throw new ForbiddenException('User lacks cases:create permission');
    }

    // 2. Create case
    const caseEntity = this.caseRepo.create({
      firmId: dto.firmId,
      clientId: dto.clientId,
      caseNumber: await this.generateCaseNumber(dto.firmId),
      title: dto.title,
      description: dto.description,
      caseType: dto.caseType,
      status: 'OPEN',
      practiceArea: dto.practiceArea,
      createdBy: userId,
    });
    await this.caseRepo.save(caseEntity);

    // 3. Assign creator as lead attorney
    const assignment = this.assignmentRepo.create({
      caseId: caseEntity.id,
      userId,
      role: 'LEAD_ATTORNEY',
      assignedBy: userId,
    });
    await this.assignmentRepo.save(assignment);

    // 4. Publish case.created event
    await this.eventPublisher.publish('case.created', {
      caseId: caseEntity.id,
      firmId: caseEntity.firmId,
      clientId: caseEntity.clientId,
      createdBy: userId,
    });

    return caseEntity;
  }

  private async generateCaseNumber(firmId: string): Promise<string> {
    const year = new Date().getFullYear();
    const count = await this.caseRepo.count({
      where: { firmId, createdAt: Between(new Date(year, 0, 1), new Date(year, 11, 31)) },
    });
    return `${year}-${String(count + 1).padStart(5, '0')}`;
  }
}
```

### 4.3 Permission Resolver (Shared Infrastructure)

```typescript
// shared/auth/permission-resolver.ts
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RedisService } from '../cache/redis.service';

@Injectable()
export class PermissionResolver {
  constructor(
    @InjectRepository(AccessGrant)
    private grantRepo: Repository<AccessGrant>,
    @InjectRepository(RolePermission)
    private rolePermRepo: Repository<RolePermission>,
    private redis: RedisService,
  ) {}

  async check(params: CheckPermissionParams): Promise<boolean> {
    const { userId, action, resourceType, resourceId, firmId } = params;

    // 1. Check cache first
    const cacheKey = `perm:${userId}:${action}:${resourceType}:${resourceId || 'any'}`;
    const cached = await this.redis.get(cacheKey);
    if (cached !== null) return cached === 'true';

    // 2. Get user's role-based permissions
    const rolePerms = await this.rolePermRepo.find({
      where: { userId, firmId },
    });
    const hasRolePermission = rolePerms.some(rp =>
      this.matchesScope(rp.scope, action)
    );

    // 3. Check manual access grants (if resource-specific)
    let hasAccessGrant = false;
    if (resourceId) {
      const grants = await this.grantRepo.findOne({
        where: {
          userId,
          resourceType,
          resourceId,
          action,
          revokedAt: IsNull(),
        },
      });
      hasAccessGrant = !!grants;
    }

    const hasPermission = hasRolePermission || hasAccessGrant;

    // 4. Cache result (5 minutes TTL)
    await this.redis.set(cacheKey, String(hasPermission), 300);

    return hasPermission;
  }

  private matchesScope(scope: string, action: string): boolean {
    // Check if scope pattern matches action
    // e.g., "cases:*" matches "cases:create"
    if (scope === action) return true;
    if (scope.endsWith(':*')) {
      const prefix = scope.slice(0, -2);
      return action.startsWith(prefix);
    }
    return false;
  }
}
```

---

## Data Flow Diagrams

### Sequence: User Creates a Case

```mermaid
sequenceDiagram
    participant U as User (Lawyer)
    participant W as Web App
    participant G as API Gateway
    participant API as User API
    participant A as Auth Service
    participant P as Permission Resolver
    participant DB as PostgreSQL
    participant Q as SQS Queue
    participant N as Notification Service

    U->>W: Fill case form & submit
    W->>G: POST /api/cases<br/>{title, clientId, ...}
    G->>API: Forward with JWT token
    API->>A: Validate JWT token
    A-->>API: Token valid, userId extracted
    API->>P: Check permission: cases:create
    P->>DB: Query user roles & grants
    DB-->>P: Permissions data
    P-->>API: Permission granted
    API->>DB: INSERT INTO cases
    API->>DB: INSERT INTO case_assignments
    DB-->>API: Case created, ID returned
    API->>Q: Publish case.created event
    API-->>G: 201 Created {case}
    G-->>W: Case data
    W-->>U: Show success + navigate to case
    Q->>N: Process case.created event
    N->>DB: Get stakeholders
    N->>SendGrid: Send notifications
```

### Sequence: Admin Provisions a User

```mermaid
sequenceDiagram
    participant A as Admin User
    participant AP as Admin Portal
    participant G as API Gateway
    participant API as Admin API
    participant L as Logto Service
    participant DB as PostgreSQL
    participant Q as SQS Queue
    participant E as Email Service

    A->>AP: Enter user details & submit
    AP->>G: POST /admin/users<br/>{email, role, invite: true}
    G->>API: Forward with admin JWT
    API->>DB: Check if user exists
    DB-->>API: User not found
    API->>L: POST /api/users<br/>Create Logto identity
    L-->>API: logtoUserId created
    API->>L: POST /api/organizations/{orgId}/members<br/>Add to org
    L-->>API: Membership created
    API->>DB: INSERT INTO users
    API->>DB: INSERT INTO user_profiles
    DB-->>API: User provisioned
    API->>Q: Publish user.created event
    API-->>G: 201 Created {user}
    G-->>AP: User data
    AP-->>A: Show success
    Q->>E: Process user.created event
    E->>Logto: Trigger invitation email
```

---

## Deployment Architecture

### AWS Infrastructure (Multi-AZ)

```mermaid
graph TB
    subgraph Internet["Internet"]
        Users["Users<br/>(Browsers/Mobile)"]
    end

    subgraph AWS["AWS Cloud"]
        subgraph Edge["Edge Layer"]
            CloudFront["CloudFront<br/>(CDN)"]
            WAF["AWS WAF<br/>(Firewall)"]
        end

        subgraph LoadBalancing["Load Balancing"]
            ALB["Application Load Balancer<br/>(ALB)"]
        end

        subgraph AZ1["Availability Zone 1"]
            ECS1["ECS Fargate<br/>Admin API + User API"]
            RDS1["RDS Primary<br/>(PostgreSQL)"]
            Redis1["ElastiCache<br/>(Redis Primary)"]
        end

        subgraph AZ2["Availability Zone 2"]
            ECS2["ECS Fargate<br/>Admin API + User API"]
            RDS2["RDS Standby<br/>(PostgreSQL)"]
            Redis2["ElastiCache<br/>(Redis Replica)"]
        end

        subgraph Services["Managed Services"]
            S3["S3<br/>(Documents)"]
            SQS["SQS<br/>(Message Queue)"]
            ES["Elasticsearch<br/>Service"]
            Secrets["Secrets Manager"]
            CloudWatch["CloudWatch<br/>(Monitoring)"]
        end
    end

    subgraph External["External Services"]
        Logto["Logto Cloud"]
        SendGrid["SendGrid"]
        Twilio["Twilio"]
        Stripe["Stripe"]
    end

    Users --> CloudFront
    CloudFront --> WAF
    WAF --> ALB
    ALB --> ECS1
    ALB --> ECS2
    ECS1 --> RDS1
    ECS2 --> RDS1
    RDS1 -.Replication.-> RDS2
    ECS1 --> Redis1
    ECS2 --> Redis2
    Redis1 -.Replication.-> Redis2
    ECS1 --> S3
    ECS2 --> S3
    ECS1 --> SQS
    ECS2 --> SQS
    ECS1 --> ES
    ECS2 --> ES
    ECS1 --> Secrets
    ECS2 --> Secrets
    ECS1 --> CloudWatch
    ECS2 --> CloudWatch
    ECS1 --> Logto
    ECS2 --> Logto
    SQS --> SendGrid
    SQS --> Twilio
    ECS1 --> Stripe
```

### Deployment Configuration

| Component | Instance Type | Auto-Scaling | Availability |
|-----------|---------------|--------------|--------------|
| **Admin API** | ECS Fargate (2 vCPU, 4 GB) | 2-10 tasks | Multi-AZ |
| **User API** | ECS Fargate (4 vCPU, 8 GB) | 4-20 tasks | Multi-AZ |
| **PostgreSQL** | RDS r6g.xlarge | Primary + Standby | Multi-AZ |
| **Redis** | ElastiCache cache.r6g.large | Primary + 2 replicas | Multi-AZ |
| **Elasticsearch** | ES r6g.large.search | 3-node cluster | Multi-AZ |

---

## Security Architecture

### Multi-Layer Security Model

```mermaid
graph TB
    subgraph SecurityLayers["Security Layers (Defense in Depth)"]
        Layer1["1. Edge Security<br/>CloudFront + WAF<br/>DDoS protection, Rate limiting"]
        Layer2["2. Network Security<br/>VPC, Security Groups<br/>Private subnets, NACLs"]
        Layer3["3. Application Security<br/>API Gateway Auth<br/>JWT validation, CORS"]
        Layer4["4. API Security<br/>RBAC + Field Policies<br/>Fine-grained permissions"]
        Layer5["5. Data Security<br/>Encryption at rest/transit<br/>AES-256, TLS 1.3"]
    end

    Layer1 --> Layer2
    Layer2 --> Layer3
    Layer3 --> Layer4
    Layer4 --> Layer5

    subgraph Encryption["Encryption"]
        TLS["TLS 1.3<br/>(In Transit)"]
        AES["AES-256<br/>(At Rest)"]
        KMS["AWS KMS<br/>(Key Management)"]
        FieldLevel["Field-Level<br/>(PII Data)"]
    end

    subgraph Auth["Authentication & Authorization"]
        Logto2["Logto<br/>(Identity Provider)"]
        JWT["JWT Tokens<br/>(Bearer Auth)"]
        RBAC["RBAC<br/>(Role-based)"]
        FieldPolicy["Field Policies<br/>(Column-level)"]
        RLS["Row-Level Security<br/>(PostgreSQL RLS)"]
    end

    subgraph Audit["Audit & Compliance"]
        AuditLogs["Audit Logs<br/>(All API calls)"]
        CloudTrail["AWS CloudTrail<br/>(Infrastructure changes)"]
        GDPR["GDPR Compliance<br/>(Data protection)"]
        SOC2["SOC 2 Type II<br/>(Security controls)"]
    end

    Layer5 --> Encryption
    Layer4 --> Auth
    Layer5 --> Audit
```

### Security Features

| Feature | Implementation | Purpose |
|---------|---------------|---------|
| **Authentication** | Logto OAuth 2.0 / OIDC | Identity verification |
| **Authorization** | RBAC + Access Grants | Permission enforcement |
| **Encryption (Transit)** | TLS 1.3 | Protect data in transit |
| **Encryption (Rest)** | AES-256 (RDS, S3) | Protect data at rest |
| **Field-Level Encryption** | Application-level | Protect PII (SSN, credit cards) |
| **Row-Level Security** | PostgreSQL RLS | Multi-tenant data isolation |
| **Rate Limiting** | API Gateway + Redis | Prevent abuse |
| **Audit Logging** | CloudWatch Logs | Compliance & forensics |
| **Secret Management** | AWS Secrets Manager | Secure credential storage |
| **DDoS Protection** | CloudFront + AWS Shield | Availability protection |

---

## Monitoring & Observability

### Observability Stack

```mermaid
graph TB
    subgraph Apps["Applications"]
        AdminAPI2["Admin API"]
        UserAPI2["User API"]
        Services["Microservices"]
    end

    subgraph Metrics["Metrics Collection"]
        CloudWatch2["CloudWatch<br/>Metrics"]
        Prometheus["Prometheus<br/>(Custom Metrics)"]
    end

    subgraph Logs["Log Aggregation"]
        CWLogs["CloudWatch Logs"]
        ES2["Elasticsearch"]
    end

    subgraph Traces["Distributed Tracing"]
        XRay["AWS X-Ray"]
        Jaeger["Jaeger<br/>(Optional)"]
    end

    subgraph Alerting["Alerting & Dashboards"]
        SNS["AWS SNS<br/>(Alerts)"]
        PagerDuty["PagerDuty<br/>(On-call)"]
        Slack["Slack<br/>(Notifications)"]
        Grafana["Grafana<br/>(Dashboards)"]
        Kibana["Kibana<br/>(Log Search)"]
    end

    AdminAPI2 --> CloudWatch2
    UserAPI2 --> CloudWatch2
    Services --> CloudWatch2
    AdminAPI2 --> Prometheus
    UserAPI2 --> Prometheus

    AdminAPI2 --> CWLogs
    UserAPI2 --> CWLogs
    Services --> CWLogs
    CWLogs --> ES2

    AdminAPI2 --> XRay
    UserAPI2 --> XRay
    Services --> XRay

    CloudWatch2 --> SNS
    SNS --> PagerDuty
    SNS --> Slack
    Prometheus --> Grafana
    ES2 --> Kibana
```

### Key Metrics

| Metric Category | Metrics | Alerting Threshold |
|----------------|---------|-------------------|
| **API Performance** | Response time (p50, p95, p99), Error rate | p99 > 1s, Error rate > 1% |
| **Database** | Query time, Connection pool usage, Replication lag | Query > 500ms, Pool > 80%, Lag > 10s |
| **Cache** | Hit rate, Eviction rate, Memory usage | Hit rate < 80%, Memory > 90% |
| **Infrastructure** | CPU, Memory, Disk I/O, Network | CPU > 80%, Memory > 85% |
| **Business** | Case creation rate, Document uploads, API calls/min | Anomaly detection |

---

## API Comparison: Admin vs User

### Feature Matrix

| Feature | Admin API | User API | Shared |
|---------|-----------|----------|--------|
| **Authentication** | Logto (admin roles) | Logto (user roles) | ✅ |
| **Database** | PostgreSQL (admin schema) | PostgreSQL (user schema) | ✅ |
| **Cache** | Redis | Redis | ✅ |
| **Audit Logging** | ✅ All operations | ✅ Critical operations | ✅ |
| **Rate Limiting** | Higher limits | Standard limits | ✅ |
| **Multi-tenancy** | Cross-firm access | Single-firm scoped | ✅ |

### Access Patterns

| Operation | Admin API | User API |
|-----------|-----------|----------|
| **Create Law Firm** | ✅ | ❌ |
| **Provision Users** | ✅ | ❌ |
| **Manage Access Grants** | ✅ | ❌ |
| **Support Access (Act-as)** | ✅ | ❌ |
| **Create/Manage Cases** | ❌ | ✅ |
| **Upload Documents** | ❌ | ✅ |
| **Track Time** | ❌ | ✅ |
| **View Invoices** | Read-only | ✅ |

---

## Performance & Scalability

### Performance Targets

| Metric | Target | Current |
|--------|--------|---------|
| **API Response Time (p95)** | < 200ms | ~150ms |
| **API Response Time (p99)** | < 500ms | ~400ms |
| **Database Query Time (p95)** | < 100ms | ~80ms |
| **Cache Hit Rate** | > 80% | ~85% |
| **Throughput** | 5,000 req/sec | ~3,500 req/sec |
| **Concurrent Users** | 10,000+ | ~8,000 |

### Scaling Strategy

| Component | Scaling Method | Trigger |
|-----------|----------------|---------|
| **APIs** | Horizontal (ECS tasks) | CPU > 70% or Latency > 300ms |
| **Database** | Vertical (instance size) + Read replicas | CPU > 75% or Connections > 80% |
| **Cache** | Horizontal (add nodes) | Memory > 80% or Hit rate < 70% |
| **Search** | Horizontal (add nodes) | CPU > 70% or Query latency > 200ms |

---

## Technology Stack Summary

### Backend (Admin API + User API)

| Layer | Technology | Version |
|-------|-----------|---------|
| **Runtime** | Node.js | 20 LTS |
| **Framework** | NestJS | 10.x |
| **Language** | TypeScript | 5.x |
| **Validation** | class-validator, class-transformer | Latest |
| **ORM** | TypeORM | 0.3.x |
| **API Docs** | OpenAPI 3.1 (Swagger) | Latest |

### Data Layer

| Component | Technology | Version |
|-----------|-----------|---------|
| **Database** | PostgreSQL | 15.x |
| **Cache** | Redis | 7.x |
| **Search** | Elasticsearch | 8.x |
| **Message Queue** | AWS SQS | - |
| **Object Storage** | AWS S3 | - |

### Infrastructure

| Component | Technology |
|-----------|-----------|
| **Container Orchestration** | AWS ECS (Fargate) |
| **Load Balancer** | AWS Application Load Balancer |
| **CDN** | AWS CloudFront |
| **DNS** | AWS Route 53 |
| **Secrets** | AWS Secrets Manager |
| **Monitoring** | CloudWatch, Prometheus, Grafana |
| **Logging** | CloudWatch Logs, Elasticsearch, Kibana |
| **Tracing** | AWS X-Ray |

---

## Related Documentation

### API Documentation
- [Admin API Reference](/docs/admin-api/law-firm-admin-provisioning-api-logto-managed-rbac) - All 34 admin endpoints
- [User API Reference](/docs/user-api/law-firm-user-portal-api) - All 37 user endpoints

### Technical Specifications
- [User API Technical Specification](/docs/specifications/user-api-specification) - Complete technical spec
- [Database Schema](/docs/architecture/database-schema) - Complete ERD with 23 slices

### Architecture Documentation
- [System Context](/docs/c4-models/system-context) - Overall system landscape
- [Container Diagram](/docs/c4-models/container-diagram) - Platform container structure

### Getting Started
- [Introduction](/docs/intro) - System overview
- [Backstage Specifications](/docs/specifications/) - Technical specifications

---

**Last Updated**: October 26, 2024
**Maintained By**: Platform Engineering Team
**Version**: 1.0.0
