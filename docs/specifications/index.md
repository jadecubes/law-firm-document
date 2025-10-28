---
sidebar_position: 1
sidebar_label: Overview
---

# Specifications Overview

This section contains technical specifications and documentation for the **Law Firm Backstage API System** - a unified backend comprising Admin API (provisioning) and User API (portal operations).

## 📋 Documentation Structure

### Backstage API System

The **Backstage API** powers all internal law firm operations through two integrated API surfaces:

#### **[Backstage API Technical Specification](./backstage-api-specification.md)** ⭐ **START HERE**
Complete unified technical specification covering:
- **Admin API** (34 endpoints) - Firm provisioning, user management, access grants, support access
- **User API** (37 endpoints) - Cases, clients, documents, time tracking, invoices, notifications
- Authentication & Authorization (Logto OIDC/OAuth 2.0)
- Data models & schemas (100+ tables across 23 slices)
- Error handling & performance targets
- Security & compliance (GDPR, SOC 2, HIPAA)
- Deployment & monitoring strategy

### Individual API Specifications

Deep-dive specifications for each API surface:

#### User API Technical Specification
- **[User API Technical Specification](./user-api-specification.md)** - Complete technical spec for user-facing operations:
  - 10 API modules (Profile, Cases, Clients, Documents, Appointments, Time & Billing, Invoices, Notifications, Collaboration, Firm Members)
  - JSON data models with examples
  - Pagination, filtering, and search patterns
  - Rate limiting and caching strategies
  - Integration points (Logto, S3, SendGrid, Twilio, Stripe, QuickBooks)

### BDD Features

Detailed behavior-driven development (BDD) specifications for Admin API endpoints. Each feature includes:
- API endpoint definitions
- User stories and scenarios
- Given/When/Then acceptance criteria
- Request/response examples

Browse the [BDD Features](/docs/features/) section for detailed API specifications organized by feature area:
- **Access Grants** - Resource access management (9 endpoints)
- **Capabilities** - User capability aggregation (2 endpoints)
- **Firms** - Law firm management (3 endpoints)
- **Logto Bridge** - Identity provider integration (8 endpoints)
- **Shared** - Common utilities
- **Support Access** - Act-as functionality (6 endpoints)
- **Users** - User provisioning and management (9 endpoints)

### API Reference

Complete OpenAPI documentation for all Backstage API endpoints:
- **[Backstage API Reference](/docs/admin-api/law-firm-admin-provisioning-api-logto-managed-rbac)** - Unified documentation
  - [Admin API](/docs/admin-api/law-firm-admin-provisioning-api-logto-managed-rbac) - 34 administrative endpoints
  - [User API](/docs/user-api/law-firm-user-portal-api) - 37 user-facing endpoints

## 🔗 Related Documentation

### Architecture Documentation
- [Backstage API C4 Models](/docs/c4-models/backstage-api-architecture) - Complete C4 architecture documentation
  - System Context, Container, Component, and Code levels
  - Deployment architecture (AWS multi-AZ)
  - Security architecture (defense in depth)
  - Monitoring & observability stack

### Data & Schema
- [Database Schema](/docs/architecture/database-schema) - Complete ERD with 23 slices and 100+ tables
- [API Spec Mapping](./api-spec-mapping.md) - Feature to endpoint mapping

### Getting Started
- [Introduction](/docs/intro) - System overview
- [C4 Architecture Models](/docs/c4-models/) - Architecture documentation

---

## 🎯 Quick Links by Role

### For Backend Developers
- [Backstage API Technical Specification](./backstage-api-specification.md) - **Complete unified spec**
- [User API Technical Specification](./user-api-specification.md) - User API deep-dive
- [Database Schema](/docs/architecture/database-schema) - Data models

### For Frontend Developers
- [Admin API Reference](/docs/admin-api/law-firm-admin-provisioning-api-logto-managed-rbac) - Admin endpoints with examples
- [User API Reference](/docs/user-api/law-firm-user-portal-api) - User endpoints with examples
- [User API Technical Specification](./user-api-specification.md) - Data models & error handling

### For QA Engineers
- [BDD Features](/docs/features/) - Acceptance criteria for Admin API
- [User API Technical Specification](./user-api-specification.md) - Test scenarios
- [Backstage API Technical Specification](./backstage-api-specification.md) - Error codes & validation rules

### For Product Managers
- [Backstage API Technical Specification](./backstage-api-specification.md) - Feature overview
- [API Spec Mapping](./api-spec-mapping.md) - Feature to endpoint mapping

---

## 🔗 External References

- [Logto Documentation](https://docs.logto.io/) - Identity provider
- [OpenAPI Specification](https://swagger.io/specification/) - API spec format
- [PostgreSQL Documentation](https://www.postgresql.org/docs/) - Database
- [Redis Documentation](https://redis.io/docs/) - Caching layer
