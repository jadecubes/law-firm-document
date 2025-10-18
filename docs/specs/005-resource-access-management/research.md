# Research: Resource Access Management

**Feature**: 005-resource-access-management
**Date**: 2025-10-16
**Status**: Phase 0 Complete

## Technical Decisions

### 1. Backend Framework Choice

**Decision**: NestJS

**Rationale**:
- TypeScript-native with excellent decorator-based routing
- Built-in dependency injection for service layer
- Native OpenAPI/Swagger documentation generation
- Strong validation with class-validator
- Modular architecture aligns with domain-driven design
- Excellent testing support with Jest integration

**Alternatives Considered**:
- **Express.js**: Too minimal, requires manual setup for validation, DI, and documentation
- **Fastify**: Better performance but less mature ecosystem for enterprise features

**Best Practices**:
- Use `@nestjs/swagger` for automatic OpenAPI documentation
- Use `class-validator` for DTO validation
- Use `@nestjs/typeorm` for database integration
- Follow NestJS module structure (module, controller, service, entity)

---

### 2. Database ORM Choice

**Decision**: TypeORM

**Rationale**:
- Native TypeScript support with decorators
- Excellent migration system for schema versioning
- Query builder for complex filters (needed for grant search)
- Repository pattern for data access
- Strong NestJS integration via `@nestjs/typeorm`
- Supports PostgreSQL multi-tenant patterns

**Alternatives Considered**:
- **Prisma**: Better DX but limited query flexibility for complex joins
- **Sequelize**: JavaScript-first, weaker TypeScript support

**Best Practices**:
- Use decorators for entity definition
- Create migrations for all schema changes
- Use repository pattern for data access
- Implement soft deletes for audit trail
- Use indexes for tenant isolation (`lawFirmId`)

---

### 3. Multi-Tenant Isolation Strategy

**Decision**: Tenant-scoped middleware + query-level filtering

**Rationale**:
- `lawFirmId` is optional in many endpoints (platform admin can query across tenants)
- Middleware extracts tenant context from JWT or query params
- Services apply tenant filtering when `lawFirmId` is provided
- Explicit NULL checks prevent accidental cross-tenant leaks

**Best Practices**:
- Create `@TenantScoped()` decorator for automatic filtering
- Middleware extracts `lawFirmId` from JWT claims or request params
- Services validate tenant ownership before mutations
- Index all tables on `lawFirmId` for query performance

---

### 4. Access Level Hierarchy

**Decision**: Enum with implicit hierarchy (VIEW < EDIT < UPLOAD < ADMIN)

**Rationale**:
- API spec defines 4 distinct levels
- Higher levels imply lower permissions (ADMIN includes EDIT, VIEW, etc.)
- Service layer enforces hierarchy when checking permissions
- Database stores explicit level (no inheritance)

**Implementation**:
```typescript
enum AccessLevel {
  VIEW = 'VIEW',
  EDIT = 'EDIT',
  UPLOAD = 'UPLOAD',
  ADMIN = 'ADMIN'
}

const LEVEL_HIERARCHY = {
  VIEW: [AccessLevel.VIEW],
  EDIT: [AccessLevel.VIEW, AccessLevel.EDIT],
  UPLOAD: [AccessLevel.VIEW, AccessLevel.EDIT, AccessLevel.UPLOAD],
  ADMIN: [AccessLevel.VIEW, AccessLevel.EDIT, AccessLevel.UPLOAD, AccessLevel.ADMIN]
};
```

---

### 5. Field Policy Evaluation

**Decision**: Runtime policy merger with most-restrictive wins

**Rationale**:
- Users can have multiple roles with different field policies
- Conflict resolution: EXCEPT mode takes precedence over ALL
- Policy computation happens at request time (not pre-computed)
- Cache effective policies per user/resource/action for performance

**Algorithm**:
1. Fetch all roles for user
2. Extract field policies for requested resource and action
3. Merge policies:
   - If ANY role has EXCEPT mode → use most restrictive EXCEPT
   - If NO except, but ONLY modes exist → use intersection of ONLY fields
   - If ALL modes only → return ALL
4. Cache result with TTL

---

### 6. Grant Expiration Strategy

**Decision**: Lazy expiration with database-level filtering

**Rationale**:
- No background job needed for expiration
- Query filters: `WHERE (endsAt IS NULL OR endsAt > NOW())`
- `startsAt` also filtered: `WHERE startsAt <= NOW()`
- Index on `(endsAt, startsAt)` for performance

**Best Practices**:
- Use `TIMESTAMP WITH TIME ZONE` for all date fields
- Always filter on `endsAt` and `startsAt` in queries
- Include grant status in API responses (active, pending, expired)

---

### 7. Audit Logging Approach

**Decision**: Decorator-based audit with structured logging

**Rationale**:
- `@Audit()` decorator on controllers captures actor, action, context
- Structured logs to stdout (JSON format)
- Include: `X-Request-Id`, `actorUserId`, `lawFirmId`, `action`, `resourceType`, `resourceId`
- Log retention handled by infrastructure (CloudWatch, Datadog, etc.)

**Implementation**:
```typescript
@Audit({ action: 'grant.create', resource: 'access-grant' })
@Post('resources/:resourceType/:resourceId/access-grants')
async createGrant(...) { ... }
```

---

### 8. Idempotency Implementation

**Decision**: Idempotency-Key header with Redis/database cache

**Rationale**:
- Required by API spec for POST operations
- Store `Idempotency-Key → response` mapping for 24 hours
- Return cached response if key matches
- Prevents duplicate grant creation on retry

**Best Practices**:
- Middleware intercepts `Idempotency-Key` header
- Store key in Redis with 24h TTL
- Return 409 Conflict if key exists with different request body

---

### 9. Pagination Strategy

**Decision**: Offset-based pagination with page[number] and page[size]

**Rationale**:
- API spec defines `page[number]` and `page[size]` parameters
- Default: page 1, size 50
- Max size: 200
- Return metadata: `{ page, size, total }`

**Implementation**:
```typescript
const skip = (page - 1) * size;
const [data, total] = await repository.findAndCount({
  skip,
  take: size,
  where: filters
});
return { data, meta: { page, size, total } };
```

---

### 10. Capabilities Aggregation Performance

**Decision**: Parallel query execution with Promise.all

**Rationale**:
- Capabilities endpoint aggregates 3 data sources:
  1. Scopes from Logto (external API call)
  2. Field policies (database query with role joins)
  3. Case IDs (database query with grant filters)
- Execute all 3 queries in parallel
- Optional `include` parameter to skip sections

**Implementation**:
```typescript
const [scopes, policies, caseIds] = await Promise.all([
  this.logtoService.getUserScopes(userId, lawFirmId),
  this.policyService.getEffectivePolicies(userId, lawFirmId),
  this.grantService.getAccessibleCaseIds(userId, lawFirmId)
]);
```

---

## Open Questions

None - all technical unknowns resolved.

## References

- [NestJS Documentation](https://docs.nestjs.com)
- [TypeORM Documentation](https://typeorm.io)
- [Multi-Tenant Patterns in PostgreSQL](https://www.citusdata.com/blog/2016/10/03/designing-your-saas-database-for-high-scalability/)
- [API Idempotency Best Practices](https://stripe.com/docs/api/idempotent_requests)
