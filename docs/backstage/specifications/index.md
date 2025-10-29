---
sidebar_position: 1
sidebar_label: Overview
---

# Specifications Overview

This section contains technical specifications and documentation for the **Law Firm Backstage API System** - a unified backend comprising Admin API (provisioning) and User API (portal operations).

## 📋 Documentation Structure

### **[Backstage API Technical Specification](./backstage-api-specification.md)** ⭐ **START HERE**

Complete unified technical specification for the **Backstage API System** - covering all internal law firm operations:

- **Admin API** (37 endpoints) - Firm provisioning, user management, access grants, support access
- **User API** (41 endpoints) - Cases, clients, documents, time tracking, invoices, notifications
- Authentication & Authorization (Logto OIDC/OAuth 2.0)
- Data models & schemas (100+ tables across 23 slices)
- Error handling & performance targets
- Security & compliance (GDPR, SOC 2, HIPAA)
- Deployment & monitoring strategy

### API Reference (OpenAPI Documentation)

Interactive API documentation with try-it-out functionality:
- **[Admin API](/docs/backstage/apis/admin/law-firm-admin-provisioning-api-logto-managed-rbac)** - 37 administrative endpoints
- **[User API](/docs/backstage/apis/user/law-firm-user-portal-api)** - 41 user-facing endpoints

## 🔗 Related Documentation

### Architecture Documentation
- [Backstage API C4 Models](/docs/backstage/c4-models/backstage-api-architecture) - Complete C4 architecture documentation
  - System Context, Container, Component, and Code levels
  - Deployment architecture (AWS multi-AZ)
  - Security architecture (defense in depth)
  - Monitoring & observability stack

### Data & Schema
- [Database Schema](/docs/architecture/database-schema) - Complete ERD with 23 slices and 100+ tables

### Getting Started
- [Introduction](/docs/intro) - System overview
- [C4 Architecture Models](/docs/backstage/c4-models/) - Architecture documentation
