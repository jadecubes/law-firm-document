---
sidebar_position: 4
sidebar_label: User API Architecture
---

# C4 Model: Law Firm User API

This document presents the architecture of the Law Firm User Portal API using the C4 model (Context, Container, Component, Code).

## Table of Contents
1. [Level 1: System Context](#level-1-system-context)
2. [Level 2: Container Diagram](#level-2-container-diagram)
3. [Level 3: Component Diagram](#level-3-component-diagram)
4. [Level 4: Code Examples](#level-4-code-examples)

---

## Level 1: System Context

Shows the Law Firm Management System and how users and external systems interact with it.

```mermaid
C4Context
    title System Context Diagram - Law Firm Management System

    Person(lawyer, "Lawyer", "Manages cases, clients, documents, and time entries")
    Person(paralegal, "Paralegal", "Assists with case work, document management")
    Person(staff, "Staff Member", "Administrative tasks, billing")
    Person(client, "Client", "Views case updates, documents (portal)")

    System(lawFirmSystem, "Law Firm Management System", "Provides case management, time tracking, billing, and collaboration tools")

    System_Ext(logto, "Logto", "Identity Provider - Authentication & Organization Management")
    System_Ext(storage, "Cloud Storage", "Document storage (AWS S3 / Google Cloud Storage)")
    System_Ext(email, "Email Service", "Email notifications (SendGrid / AWS SES)")
    System_Ext(sms, "SMS Service", "SMS notifications (Twilio)")
    System_Ext(payment, "Payment Gateway", "Invoice payments (Stripe)")
    System_Ext(erp, "ERP System", "Financial accounting and GL integration")

    Rel(lawyer, lawFirmSystem, "Manages cases, clients, documents", "HTTPS/JSON")
    Rel(paralegal, lawFirmSystem, "Assists with case work", "HTTPS/JSON")
    Rel(staff, lawFirmSystem, "Handles billing, admin tasks", "HTTPS/JSON")
    Rel(client, lawFirmSystem, "Views case updates", "HTTPS/JSON")

    Rel(lawFirmSystem, logto, "Authenticates users, syncs organizations", "OAuth 2.0 / OIDC")
    Rel(lawFirmSystem, storage, "Stores/retrieves documents", "S3 API")
    Rel(lawFirmSystem, email, "Sends email notifications", "SMTP/API")
    Rel(lawFirmSystem, sms, "Sends SMS alerts", "REST API")
    Rel(lawFirmSystem, payment, "Processes payments", "REST API")
    Rel(lawFirmSystem, erp, "Exports financial data", "REST API / File Transfer")

    UpdateRelStyle(lawyer, lawFirmSystem, $offsetX="-50", $offsetY="-30")
    UpdateRelStyle(lawFirmSystem, logto, $offsetX="-20", $offsetY="10")
```

### Context Description

**Users:**
- **Lawyers**: Create and manage cases, track time, review invoices
- **Paralegals**: Support case work, upload documents, manage appointments
- **Staff**: Handle administrative tasks, billing operations
- **Clients**: (Future) Portal access to view case status and documents

**External Systems:**
- **Logto**: Centralized identity management, SSO, organization memberships
- **Cloud Storage**: Secure document storage with versioning
- **Email/SMS Services**: Multi-channel notifications
- **Payment Gateway**: Client invoice payments
- **ERP System**: Financial data synchronization for accounting

---

## Level 2: Container Diagram

Shows the high-level technology components that make up the Law Firm Management System.

```mermaid
C4Container
    title Container Diagram - Law Firm Management System

    Person(user, "Law Firm User", "Lawyer, Paralegal, or Staff")

    System_Boundary(lawFirmSystem, "Law Firm Management System") {
        Container(webApp, "Web Application", "React + TypeScript", "Provides UI for case management, time tracking, and collaboration")
        Container(mobileApp, "Mobile App", "React Native", "Mobile access to cases, time entries, and appointments")
        Container(apiGateway, "API Gateway", "AWS API Gateway / Kong", "Routes requests, rate limiting, auth validation")
        Container(userApi, "User Portal API", "Node.js / NestJS", "Handles user-facing operations: cases, clients, documents, time entries")
        Container(adminApi, "Admin API", "Node.js / NestJS", "Admin operations: firm provisioning, user management, system config")
        Container(authService, "Auth Service", "Node.js", "Token validation, session management, permission checks")
        Container(notificationService, "Notification Service", "Node.js", "Sends email, SMS, push notifications")
        Container(documentService, "Document Service", "Node.js", "Document upload, versioning, access control")
        Container(billingService, "Billing Service", "Node.js", "Invoice generation, payment processing")

        ContainerDb(database, "Primary Database", "PostgreSQL", "Stores users, cases, clients, time entries, invoices")
        ContainerDb(cache, "Cache", "Redis", "Session data, rate limits, temporary data")
        ContainerQueue(queue, "Message Queue", "AWS SQS / RabbitMQ", "Async job processing, event distribution")
        Container(searchEngine, "Search Engine", "Elasticsearch", "Full-text search for cases, documents, clients")
    }

    System_Ext(logto, "Logto", "Identity Provider")
    System_Ext(storage, "S3 / GCS", "Document Storage")
    System_Ext(email, "SendGrid", "Email Service")
    System_Ext(sms, "Twilio", "SMS Service")

    Rel(user, webApp, "Uses", "HTTPS")
    Rel(user, mobileApp, "Uses", "HTTPS")

    Rel(webApp, apiGateway, "Makes API calls", "HTTPS/JSON")
    Rel(mobileApp, apiGateway, "Makes API calls", "HTTPS/JSON")

    Rel(apiGateway, userApi, "Routes user requests", "HTTP/JSON")
    Rel(apiGateway, adminApi, "Routes admin requests", "HTTP/JSON")

    Rel(userApi, authService, "Validates tokens, checks permissions", "gRPC")
    Rel(userApi, database, "Reads/writes data", "PostgreSQL protocol")
    Rel(userApi, cache, "Caches data", "Redis protocol")
    Rel(userApi, documentService, "Manages documents", "HTTP/JSON")
    Rel(userApi, notificationService, "Triggers notifications", "Message Queue")
    Rel(userApi, billingService, "Accesses billing data", "HTTP/JSON")
    Rel(userApi, searchEngine, "Searches data", "HTTP/JSON")

    Rel(authService, logto, "Validates tokens", "OAuth 2.0")
    Rel(authService, cache, "Caches tokens", "Redis protocol")

    Rel(documentService, storage, "Stores/retrieves files", "S3 API")

    Rel(notificationService, email, "Sends emails", "SMTP/API")
    Rel(notificationService, sms, "Sends SMS", "REST API")
    Rel(notificationService, queue, "Consumes events", "AMQP")

    Rel(billingService, database, "Reads/writes billing data", "PostgreSQL")
    Rel(billingService, queue, "Publishes events", "AMQP")

    UpdateRelStyle(user, webApp, $offsetX="-50", $offsetY="0")
    UpdateRelStyle(apiGateway, userApi, $offsetX="0", $offsetY="-10")
```

### Container Descriptions

**Frontend Containers:**
- **Web Application**: React-based SPA with TypeScript, responsive UI, real-time updates via WebSockets
- **Mobile App**: React Native for iOS/Android, offline support for time entries and case notes

**Backend Containers:**
- **API Gateway**: Request routing, rate limiting, authentication validation, request logging
- **User Portal API**: Core business logic for user-facing operations (cases, clients, documents, time tracking)
- **Admin API**: Administrative operations (firm management, user provisioning, system configuration)
- **Auth Service**: Token validation, session management, permission resolution via Logto
- **Notification Service**: Multi-channel notifications (email, SMS, push), template management
- **Document Service**: Document upload/download, versioning, access control, virus scanning
- **Billing Service**: Invoice generation, payment processing, financial calculations

**Data Containers:**
- **Primary Database**: PostgreSQL with multi-tenant isolation, row-level security, read replicas
- **Cache**: Redis for session data, rate limits, frequently accessed data
- **Message Queue**: Asynchronous job processing, event-driven architecture
- **Search Engine**: Elasticsearch for full-text search across cases, documents, clients

---

## Level 3: Component Diagram

Shows the internal components of the User Portal API container.

```mermaid
C4Component
    title Component Diagram - User Portal API

    Container_Boundary(userApi, "User Portal API") {
        Component(authMiddleware, "Authentication Middleware", "Express Middleware", "Validates JWT tokens, extracts user context")
        Component(rbacMiddleware, "RBAC Middleware", "Express Middleware", "Checks permissions based on user roles")
        Component(validationMiddleware, "Validation Middleware", "Express Middleware", "Validates request schemas using Joi/Zod")

        Component(profileController, "Profile Controller", "NestJS Controller", "Handles /me endpoints (get/update profile)")
        Component(caseController, "Case Controller", "NestJS Controller", "Handles /cases endpoints (CRUD operations)")
        Component(clientController, "Client Controller", "NestJS Controller", "Handles /clients endpoints")
        Component(documentController, "Document Controller", "NestJS Controller", "Handles /documents endpoints")
        Component(appointmentController, "Appointment Controller", "NestJS Controller", "Handles /appointments endpoints")
        Component(timeEntryController, "Time Entry Controller", "NestJS Controller", "Handles /time-entries endpoints")
        Component(invoiceController, "Invoice Controller", "NestJS Controller", "Handles /invoices endpoints (read-only)")
        Component(notificationController, "Notification Controller", "NestJS Controller", "Handles /notifications endpoints")
        Component(commentController, "Comment Controller", "NestJS Controller", "Handles /comments endpoints")

        Component(profileService, "Profile Service", "Service", "Business logic for user profiles")
        Component(caseService, "Case Service", "Service", "Business logic for case management")
        Component(clientService, "Client Service", "Service", "Business logic for client management")
        Component(timeEntryService, "Time Entry Service", "Service", "Business logic for time tracking")
        Component(commentService, "Comment Service", "Service", "Business logic for collaboration")

        Component(caseRepository, "Case Repository", "TypeORM Repository", "Data access for CASES table")
        Component(clientRepository, "Client Repository", "TypeORM Repository", "Data access for CLIENTS table")
        Component(timeEntryRepository, "Time Entry Repository", "TypeORM Repository", "Data access for LAWYER_TIME_ENTRIES table")
        Component(commentRepository, "Comment Repository", "TypeORM Repository", "Data access for COMMENTS table")

        Component(permissionResolver, "Permission Resolver", "Service", "Resolves user permissions based on roles and grants")
        Component(eventPublisher, "Event Publisher", "Service", "Publishes domain events to message queue")
        Component(auditLogger, "Audit Logger", "Service", "Logs all mutations for compliance")
    }

    ContainerDb(database, "PostgreSQL Database", "Database")
    ContainerDb(cache, "Redis Cache", "Cache")
    ContainerQueue(queue, "Message Queue", "Queue")
    Container(authService, "Auth Service", "External Service")
    Container(documentService, "Document Service", "External Service")

    Rel(profileController, authMiddleware, "Validates token")
    Rel(profileController, rbacMiddleware, "Checks permissions")
    Rel(profileController, profileService, "Uses")

    Rel(caseController, authMiddleware, "Validates token")
    Rel(caseController, rbacMiddleware, "Checks permissions")
    Rel(caseController, validationMiddleware, "Validates request")
    Rel(caseController, caseService, "Uses")

    Rel(clientController, clientService, "Uses")
    Rel(documentController, documentService, "Delegates to")
    Rel(timeEntryController, timeEntryService, "Uses")
    Rel(commentController, commentService, "Uses")

    Rel(caseService, caseRepository, "Persists data")
    Rel(caseService, permissionResolver, "Checks access")
    Rel(caseService, eventPublisher, "Publishes events")
    Rel(caseService, auditLogger, "Logs changes")

    Rel(clientService, clientRepository, "Persists data")
    Rel(timeEntryService, timeEntryRepository, "Persists data")
    Rel(commentService, commentRepository, "Persists data")
    Rel(commentService, eventPublisher, "Publishes @mention events")

    Rel(caseRepository, database, "Queries")
    Rel(clientRepository, database, "Queries")
    Rel(timeEntryRepository, database, "Queries")
    Rel(commentRepository, database, "Queries")

    Rel(permissionResolver, authService, "Fetches user roles")
    Rel(permissionResolver, cache, "Caches permissions")

    Rel(eventPublisher, queue, "Publishes")
    Rel(auditLogger, database, "Writes audit logs")
```

### Component Descriptions

**Middleware Components:**
- **Authentication Middleware**: Validates JWT tokens from Logto, extracts user context (userId, firmId, roles)
- **RBAC Middleware**: Checks if user has required permissions for the endpoint
- **Validation Middleware**: Validates request body/query parameters against schemas

**Controller Components:**
- **Profile Controller**: User profile management (/me)
- **Case Controller**: Case CRUD operations, team management
- **Client Controller**: Client CRUD operations
- **Document Controller**: Document metadata management (delegates storage to Document Service)
- **Appointment Controller**: Appointment scheduling and RSVP
- **Time Entry Controller**: Time tracking and submission
- **Invoice Controller**: Read-only invoice access
- **Notification Controller**: Notification management
- **Comment Controller**: Collaboration and commenting

**Service Components:**
- **Profile Service**: User profile business logic, preference management
- **Case Service**: Case lifecycle management, team assignments, status transitions
- **Client Service**: Client management, contact information
- **Time Entry Service**: Time entry calculation, status workflow (DRAFT → SUBMITTED → APPROVED)
- **Comment Service**: Comment creation, @mentions, threading

**Repository Components:**
- **Case Repository**: CASES table data access, complex queries with JOINs
- **Client Repository**: CLIENTS table data access
- **Time Entry Repository**: LAWYER_TIME_ENTRIES table data access
- **Comment Repository**: COMMENTS table data access, polymorphic resource queries

**Infrastructure Components:**
- **Permission Resolver**: Resolves user permissions from ROLES, PERMISSIONS, USER_ROLE_ASSIGNMENTS, RESOURCE_ACCESS_GRANTS
- **Event Publisher**: Publishes domain events (CaseCreated, DocumentShared, CommentAdded) to message queue
- **Audit Logger**: Immutable audit trail for compliance (who, what, when, where)

---

## Level 4: Code Examples

Shows implementation details for key components.

### 4.1 Case Service - Create Case Flow

```typescript
// src/services/case.service.ts

import { Injectable, ForbiddenException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Case } from '../entities/case.entity';
import { CreateCaseDto } from '../dto/create-case.dto';
import { PermissionResolver } from '../auth/permission-resolver.service';
import { EventPublisher } from '../events/event-publisher.service';
import { AuditLogger } from '../audit/audit-logger.service';

@Injectable()
export class CaseService {
  constructor(
    @InjectRepository(Case)
    private caseRepository: Repository<Case>,
    private permissionResolver: PermissionResolver,
    private eventPublisher: EventPublisher,
    private auditLogger: AuditLogger,
  ) {}

  async createCase(userId: string, firmId: string, dto: CreateCaseDto): Promise<Case> {
    // 1. Check permissions
    const canCreate = await this.permissionResolver.checkPermission(
      userId,
      firmId,
      'CASE.CREATE',
    );
    if (!canCreate) {
      throw new ForbiddenException('You do not have permission to create cases');
    }

    // 2. Validate business rules
    const clientExists = await this.validateClient(dto.clientId, firmId);
    if (!clientExists) {
      throw new BadRequestException('Client not found');
    }

    // 3. Generate case number
    const caseNumber = await this.generateCaseNumber(firmId);

    // 4. Create case entity
    const caseEntity = this.caseRepository.create({
      ...dto,
      caseNumber,
      lawFirmId: firmId,
      leadAttorneyId: dto.leadAttorneyId || userId, // Default to current user
      createdBy: userId,
      status: dto.status || 'INTAKE',
      priority: dto.priority || 'MEDIUM',
    });

    // 5. Save to database
    const savedCase = await this.caseRepository.save(caseEntity);

    // 6. Create case team assignments
    if (dto.assignedMembers?.length > 0) {
      await this.assignTeamMembers(savedCase.id, dto.assignedMembers);
    }

    // 7. Publish domain event
    await this.eventPublisher.publish({
      type: 'CASE_CREATED',
      aggregateId: savedCase.id,
      aggregateType: 'CASE',
      payload: {
        caseId: savedCase.id,
        caseNumber: savedCase.caseNumber,
        title: savedCase.title,
        clientId: savedCase.clientId,
        leadAttorneyId: savedCase.leadAttorneyId,
      },
      userId,
      firmId,
      timestamp: new Date(),
    });

    // 8. Audit log
    await this.auditLogger.log({
      action: 'CASE_CREATE',
      resourceType: 'CASE',
      resourceId: savedCase.id,
      userId,
      firmId,
      changes: { new: savedCase },
      timestamp: new Date(),
    });

    return savedCase;
  }

  private async validateClient(clientId: string, firmId: string): Promise<boolean> {
    // Check if client exists and belongs to the firm
    const count = await this.caseRepository
      .createQueryBuilder()
      .select('1')
      .from('clients', 'c')
      .where('c.id = :clientId', { clientId })
      .andWhere('c.law_firm_id = :firmId', { firmId })
      .getCount();

    return count > 0;
  }

  private async generateCaseNumber(firmId: string): Promise<string> {
    // Generate sequential case number: YYYY-NNN
    const year = new Date().getFullYear();
    const count = await this.caseRepository
      .createQueryBuilder('c')
      .where('c.law_firm_id = :firmId', { firmId })
      .andWhere('EXTRACT(YEAR FROM c.created_at) = :year', { year })
      .getCount();

    const nextNumber = (count + 1).toString().padStart(3, '0');
    return `${year}-${nextNumber}`;
  }

  private async assignTeamMembers(
    caseId: string,
    members: Array<{ userId: string; role: string }>,
  ): Promise<void> {
    // Insert into CASE_ATTORNEYS junction table
    const values = members.map(m => ({
      case_id: caseId,
      firm_user_profile_id: m.userId,
      assignment_role: m.role,
      starts_at: new Date(),
    }));

    await this.caseRepository.query(
      `INSERT INTO case_attorneys (case_id, firm_user_profile_id, assignment_role, starts_at)
       VALUES ${values.map(() => '(?, ?, ?, ?)').join(', ')}`,
      values.flatMap(v => Object.values(v)),
    );
  }
}
```

### 4.2 Permission Resolver - Check Access

```typescript
// src/auth/permission-resolver.service.ts

import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RedisService } from '../cache/redis.service';

interface PermissionCheck {
  userId: string;
  firmId: string;
  permission: string;
  resourceType?: string;
  resourceId?: string;
}

@Injectable()
export class PermissionResolver {
  constructor(
    @InjectRepository(UserRoleAssignment)
    private roleAssignmentRepo: Repository<UserRoleAssignment>,
    @InjectRepository(ResourceAccessGrant)
    private accessGrantRepo: Repository<ResourceAccessGrant>,
    private redis: RedisService,
  ) {}

  async checkPermission(
    userId: string,
    firmId: string,
    permission: string,
    resourceType?: string,
    resourceId?: string,
  ): Promise<boolean> {
    // 1. Check cache
    const cacheKey = `perm:${userId}:${firmId}:${permission}:${resourceType}:${resourceId}`;
    const cached = await this.redis.get(cacheKey);
    if (cached !== null) {
      return cached === 'true';
    }

    // 2. Resolve user's roles in this firm
    const roles = await this.getUserRoles(userId, firmId);

    // 3. Check if any role grants this permission
    const hasPermission = await this.roleHasPermission(roles, permission);

    if (!hasPermission) {
      await this.redis.setex(cacheKey, 300, 'false'); // Cache for 5 minutes
      return false;
    }

    // 4. If checking resource-level access, verify resource grant
    if (resourceType && resourceId) {
      const hasResourceAccess = await this.checkResourceAccess(
        userId,
        firmId,
        resourceType,
        resourceId,
      );

      await this.redis.setex(cacheKey, 300, hasResourceAccess ? 'true' : 'false');
      return hasResourceAccess;
    }

    await this.redis.setex(cacheKey, 300, 'true');
    return true;
  }

  private async getUserRoles(userId: string, firmId: string): Promise<string[]> {
    const assignments = await this.roleAssignmentRepo.find({
      where: {
        authUserId: userId,
        lawFirmId: firmId,
        // Only active assignments (ends_at is null or in future)
      },
      relations: ['role'],
    });

    return assignments.map(a => a.role.code);
  }

  private async roleHasPermission(roles: string[], permission: string): Promise<boolean> {
    // Query ROLE_PERMISSIONS table
    const count = await this.roleAssignmentRepo
      .createQueryBuilder()
      .select('1')
      .from('role_permissions', 'rp')
      .innerJoin('roles', 'r', 'r.id = rp.role_id')
      .innerJoin('permissions', 'p', 'p.id = rp.permission_id')
      .where('r.code IN (:...roles)', { roles })
      .andWhere('p.code = :permission', { permission })
      .getCount();

    return count > 0;
  }

  private async checkResourceAccess(
    userId: string,
    firmId: string,
    resourceType: string,
    resourceId: string,
  ): Promise<boolean> {
    // Check RESOURCE_ACCESS_GRANTS table
    const grant = await this.accessGrantRepo.findOne({
      where: {
        authUserId: userId,
        lawFirmId: firmId,
        resourceType,
        resourceId,
        // Check temporal validity (starts_at <= now, ends_at >= now or null)
      },
    });

    return !!grant;
  }
}
```

### 4.3 RBAC Middleware - Route Protection

```typescript
// src/middleware/rbac.middleware.ts

import { Injectable, NestMiddleware, ForbiddenException } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { PermissionResolver } from '../auth/permission-resolver.service';

// Extend Express Request to include user context from auth middleware
interface AuthenticatedRequest extends Request {
  user: {
    id: string;
    firmId: string;
    roles: string[];
  };
}

@Injectable()
export class RBACMiddleware implements NestMiddleware {
  constructor(private permissionResolver: PermissionResolver) {}

  use(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    // Extract required permission from route metadata
    const permission = this.extractPermission(req);

    if (!permission) {
      // No permission requirement, allow
      return next();
    }

    // Check if user has permission
    const hasPermission = await this.permissionResolver.checkPermission(
      req.user.id,
      req.user.firmId,
      permission,
    );

    if (!hasPermission) {
      throw new ForbiddenException(
        `You do not have permission: ${permission}`,
      );
    }

    next();
  }

  private extractPermission(req: AuthenticatedRequest): string | null {
    // Map route + method to permission
    const routePermissionMap: Record<string, string> = {
      'POST /cases': 'CASE.CREATE',
      'GET /cases/:id': 'CASE.READ',
      'PATCH /cases/:id': 'CASE.UPDATE',
      'DELETE /cases/:id': 'CASE.DELETE',
      'POST /clients': 'CLIENT.CREATE',
      'GET /clients/:id': 'CLIENT.READ',
      'PATCH /clients/:id': 'CLIENT.UPDATE',
      'POST /time-entries': 'TIME_ENTRY.CREATE',
      'PATCH /time-entries/:id': 'TIME_ENTRY.UPDATE',
      'POST /time-entries/:id/submit': 'TIME_ENTRY.SUBMIT',
      // ... more mappings
    };

    const key = `${req.method} ${req.route.path}`;
    return routePermissionMap[key] || null;
  }
}
```

### 4.4 Event Publisher - Domain Events

```typescript
// src/events/event-publisher.service.ts

import { Injectable } from '@nestjs/common';
import { SQS } from 'aws-sdk';

interface DomainEvent {
  type: string;
  aggregateId: string;
  aggregateType: string;
  payload: any;
  userId: string;
  firmId: string;
  timestamp: Date;
}

@Injectable()
export class EventPublisher {
  private sqs: SQS;
  private queueUrl: string;

  constructor() {
    this.sqs = new SQS({ region: process.env.AWS_REGION });
    this.queueUrl = process.env.SQS_QUEUE_URL!;
  }

  async publish(event: DomainEvent): Promise<void> {
    try {
      await this.sqs.sendMessage({
        QueueUrl: this.queueUrl,
        MessageBody: JSON.stringify(event),
        MessageAttributes: {
          eventType: {
            DataType: 'String',
            StringValue: event.type,
          },
          firmId: {
            DataType: 'String',
            StringValue: event.firmId,
          },
        },
      }).promise();

      console.log(`Published event: ${event.type} for ${event.aggregateType}:${event.aggregateId}`);
    } catch (error) {
      console.error('Failed to publish event:', error);
      // Consider dead-letter queue or retry logic
    }
  }
}
```

---

## Data Flow Diagrams

### User Creates a Case

```mermaid
sequenceDiagram
    participant User
    participant WebApp
    participant APIGateway
    participant UserAPI
    participant AuthService
    participant PermissionResolver
    participant CaseService
    participant Database
    participant EventPublisher
    participant Queue

    User->>WebApp: Fill case form and submit
    WebApp->>APIGateway: POST /v1/cases<br/>(JWT token in header)
    APIGateway->>UserAPI: Forward request

    UserAPI->>AuthService: Validate JWT token
    AuthService-->>UserAPI: User context (userId, firmId, roles)

    UserAPI->>PermissionResolver: Check permission CASE.CREATE
    PermissionResolver->>Database: Query USER_ROLE_ASSIGNMENTS<br/>& ROLE_PERMISSIONS
    Database-->>PermissionResolver: Permission result
    PermissionResolver-->>UserAPI: Allowed

    UserAPI->>CaseService: createCase(dto)

    CaseService->>Database: Validate client exists
    Database-->>CaseService: Client found

    CaseService->>Database: Generate case number<br/>(query max case number)
    Database-->>CaseService: 2024-042

    CaseService->>Database: INSERT INTO cases
    Database-->>CaseService: Case created (id: case_123)

    CaseService->>Database: INSERT INTO case_attorneys<br/>(assign team members)
    Database-->>CaseService: Team assigned

    CaseService->>EventPublisher: Publish CASE_CREATED event
    EventPublisher->>Queue: Send message
    Queue-->>EventPublisher: Acknowledged

    CaseService-->>UserAPI: Case object
    UserAPI-->>APIGateway: 201 Created + JSON response
    APIGateway-->>WebApp: Response
    WebApp-->>User: Show success message<br/>Redirect to case details
```

### User Submits Time Entry

```mermaid
sequenceDiagram
    participant User
    participant WebApp
    participant APIGateway
    participant UserAPI
    participant TimeEntryService
    participant Database
    participant EventPublisher
    participant NotificationService

    User->>WebApp: Submit time entry form<br/>(case, hours, description)
    WebApp->>APIGateway: POST /v1/time-entries
    APIGateway->>UserAPI: Forward request

    Note over UserAPI: Auth & RBAC middleware<br/>validates token and permissions

    UserAPI->>TimeEntryService: createTimeEntry(dto)

    TimeEntryService->>Database: Validate case exists<br/>and user has access
    Database-->>TimeEntryService: Case found

    TimeEntryService->>Database: Get user's default rate<br/>from LAWYER_RATE_PLANS
    Database-->>TimeEntryService: $350/hour

    TimeEntryService->>TimeEntryService: Calculate amount<br/>2.5 hours × $350 = $875

    TimeEntryService->>Database: INSERT INTO lawyer_time_entries<br/>(status = DRAFT)
    Database-->>TimeEntryService: Entry created

    TimeEntryService-->>UserAPI: TimeEntry object
    UserAPI-->>WebApp: 201 Created

    Note over User,WebApp: User clicks "Submit"

    WebApp->>APIGateway: POST /v1/time-entries/{id}/submit
    APIGateway->>UserAPI: Forward request

    UserAPI->>TimeEntryService: submitTimeEntry(id)

    TimeEntryService->>Database: UPDATE status = SUBMITTED
    Database-->>TimeEntryService: Updated

    TimeEntryService->>EventPublisher: Publish TIME_ENTRY_SUBMITTED
    EventPublisher->>NotificationService: Notify approvers
    NotificationService-->>NotificationService: Send email to billing admin

    TimeEntryService-->>UserAPI: Updated entry
    UserAPI-->>WebApp: 200 OK
    WebApp-->>User: "Time entry submitted for approval"
```

---

## Deployment Architecture

```mermaid
graph TB
    subgraph "AWS Cloud"
        subgraph "Public Subnets"
            ALB[Application Load Balancer]
            NAT[NAT Gateway]
        end

        subgraph "Private Subnets - API Tier"
            API1[User API Instance 1]
            API2[User API Instance 2]
            API3[User API Instance 3]
        end

        subgraph "Private Subnets - Data Tier"
            RDS_Primary[(RDS Primary<br/>PostgreSQL)]
            RDS_Replica[(RDS Read Replica)]
            ElastiCache[(ElastiCache<br/>Redis Cluster)]
        end

        subgraph "Messaging"
            SQS[SQS Queue]
            SNS[SNS Topics]
        end

        S3[S3 Bucket<br/>Documents]
    end

    subgraph "External Services"
        Logto[Logto IdP]
        SendGrid[SendGrid]
        Twilio[Twilio]
    end

    Users[Users] -->|HTTPS| ALB
    ALB --> API1
    ALB --> API2
    ALB --> API3

    API1 --> RDS_Primary
    API2 --> RDS_Primary
    API3 --> RDS_Replica

    API1 --> ElastiCache
    API2 --> ElastiCache
    API3 --> ElastiCache

    API1 --> SQS
    API2 --> SQS
    API3 --> SQS

    API1 --> S3
    API2 --> S3
    API3 --> S3

    API1 -->|Validate Tokens| Logto
    SQS --> SNS
    SNS -->|Email| SendGrid
    SNS -->|SMS| Twilio

    style ALB fill:#ff9900
    style RDS_Primary fill:#3b48cc
    style ElastiCache fill:#c925d1
    style S3 fill:#569a31
```

---

## Security Architecture

```mermaid
graph LR
    subgraph "Client"
        Browser[Web Browser]
    end

    subgraph "Edge"
        CloudFront[CloudFront CDN]
        WAF[AWS WAF]
    end

    subgraph "API Layer"
        ALB[Load Balancer]
        APIGateway[API Gateway]
        AuthMiddleware[Auth Middleware]
        RateLimiter[Rate Limiter]
    end

    subgraph "Application"
        UserAPI[User API]
        PermissionResolver[Permission Resolver]
    end

    subgraph "Data"
        EncryptedDB[(Encrypted DB<br/>AES-256)]
        Redis[(Redis<br/>TLS)]
    end

    subgraph "External"
        Logto[Logto<br/>OAuth 2.0 / OIDC]
        KMS[AWS KMS<br/>Key Management]
    end

    Browser -->|HTTPS/TLS 1.3| CloudFront
    CloudFront --> WAF
    WAF -->|DDoS Protection<br/>SQL Injection Filter| ALB
    ALB --> APIGateway
    APIGateway --> RateLimiter
    RateLimiter --> AuthMiddleware
    AuthMiddleware -->|Validate JWT| Logto
    AuthMiddleware --> UserAPI
    UserAPI --> PermissionResolver
    PermissionResolver --> Redis
    UserAPI --> EncryptedDB
    EncryptedDB -->|Encryption Keys| KMS

    style WAF fill:#ff4444
    style AuthMiddleware fill:#44ff44
    style EncryptedDB fill:#4444ff
    style KMS fill:#ffaa44
```

---

## Monitoring & Observability

```mermaid
graph TB
    subgraph "Application"
        API[User API Instances]
    end

    subgraph "Metrics"
        CloudWatch[CloudWatch Metrics]
        Prometheus[Prometheus]
    end

    subgraph "Logs"
        CloudWatchLogs[CloudWatch Logs]
        Elasticsearch[Elasticsearch]
    end

    subgraph "Tracing"
        XRay[AWS X-Ray]
        Jaeger[Jaeger]
    end

    subgraph "Alerting"
        SNS[SNS]
        PagerDuty[PagerDuty]
        Slack[Slack]
    end

    subgraph "Dashboards"
        Grafana[Grafana]
        Kibana[Kibana]
    end

    API -->|Metrics| CloudWatch
    API -->|Metrics| Prometheus
    API -->|Logs| CloudWatchLogs
    CloudWatchLogs --> Elasticsearch
    API -->|Traces| XRay
    XRay --> Jaeger

    CloudWatch -->|Alarms| SNS
    SNS --> PagerDuty
    SNS --> Slack

    Prometheus --> Grafana
    Elasticsearch --> Kibana

    style API fill:#4a90e2
    style CloudWatch fill:#ff9900
    style PagerDuty fill:#06ac38
    style Grafana fill:#f46800
```

---

## Summary

This C4 model provides a comprehensive view of the Law Firm User API architecture across multiple levels:

1. **System Context**: Shows how users and external systems interact with the platform
2. **Container Diagram**: Illustrates the high-level technology components (APIs, databases, queues)
3. **Component Diagram**: Details the internal structure of the User API (controllers, services, repositories)
4. **Code Examples**: Provides implementation details for critical flows

The architecture follows modern best practices:
- **Microservices**: Separate services for user API, admin API, notifications, documents
- **Event-Driven**: Asynchronous processing via message queues
- **Multi-Tenant**: Firm-level isolation with row-level security
- **Scalable**: Horizontal scaling of API instances, read replicas for database
- **Secure**: JWT authentication, RBAC, encryption at rest and in transit
- **Observable**: Comprehensive logging, metrics, and tracing

This design ensures the system can handle the complex requirements of a law firm management platform while maintaining security, compliance, and performance.
