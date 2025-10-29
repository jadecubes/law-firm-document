---
sidebar_position: 1
sidebar_label: Overview
---

# C4 Architecture Models

This section contains comprehensive architecture documentation using the C4 model approach, providing multiple levels of abstraction for understanding the Law Firm **Backstage API System**.

## 📐 What is C4?

The C4 model provides a way to visualize software architecture at different levels of detail:
- **Level 1: System Context** - The big picture
- **Level 2: Container** - High-level technology choices
- **Level 3: Component** - Internal structure of containers
- **Level 4: Code** - Implementation details

## 🏗️ Architecture Documentation

### Backstage API System

The **Backstage API** is the unified backend system powering the law firm's internal operations, consisting of two major API surfaces:

- **[Complete Backstage API Architecture](./backstage-api-architecture.md)** ⭐ **START HERE** - Comprehensive C4 documentation including:
  - **Admin API** (34 endpoints) - Provisioning, user management, access control
  - **User API** (37 endpoints) - Cases, clients, documents, time tracking
  - **Level 1: System Context** - All actors and external systems
  - **Level 2: Container Diagram** - APIs, databases, caches, queues
  - **Level 3: Component Diagram** - Internal structure of both APIs
  - **Level 4: Code Examples** - TypeScript implementation patterns
  - **Data Flow Diagrams** - Key user journeys (case creation, user provisioning)
  - **Deployment Architecture** - AWS multi-AZ infrastructure
  - **Security Architecture** - Multi-layer defense-in-depth
  - **Monitoring & Observability** - Metrics, logs, traces, alerting

### Detailed API Architecture

Individual deep-dives for each API surface:

#### Admin API Architecture

Administrative/provisioning API documentation:

- [Admin API System Context](./admin-api-system-context.md) - Admin operations in the system landscape
- [Admin API Container Diagram](./admin-api-container.md) - Admin API technology components
- [Admin API Component Diagram](./admin-api-component.md) - Internal structure of Admin API

#### User API Architecture

User-facing API (lawyers, paralegals, staff) documentation:

- [User API Complete Architecture](./user-api-models.md) - Full C4 documentation with all levels

### General System Architecture

Platform-wide overview diagrams:

- [System Context](./system-context.md) - Overall system landscape
- [Container Diagram](./container-diagram.md) - Platform container structure
- [Component Diagram](./component-diagram.md) - System component organization

## 🎯 Quick Navigation

### By User Type

**For Developers:**
- Start with [Backstage API Architecture](./backstage-api-architecture.md) - Complete overview
- Review [Component Structure](./backstage-api-architecture.md#level-3-component-diagram) - Admin & User API internals
- Study [Code Examples](./backstage-api-architecture.md#level-4-code-examples) - TypeScript implementations

**For Architects:**
- Begin with [Backstage API System Context](./backstage-api-architecture.md#level-1-system-context) - Big picture
- Examine [Container Diagram](./backstage-api-architecture.md#level-2-container-diagram) - Technology stack
- Review [Deployment Architecture](./backstage-api-architecture.md#deployment-architecture) - AWS infrastructure

**For Product Managers:**
- View [Backstage System Context](./backstage-api-architecture.md#level-1-system-context) - All actors and features
- Explore [Data Flow Diagrams](./backstage-api-architecture.md#data-flow-diagrams) - Key user journeys
- Review [API Comparison](./backstage-api-architecture.md#api-comparison-admin-vs-user) - Feature matrix

**For Security/Compliance:**
- Review [Security Architecture](./backstage-api-architecture.md#security-architecture) - Defense in depth
- Examine [Authentication & Authorization](./backstage-api-architecture.md#level-1-system-context) - Logto integration
- Study [Security Features](./backstage-api-architecture.md#security-architecture) - Compliance (GDPR, SOC 2)

### By Concern

**Backstage API Overview:**
- [Backstage API Architecture](./backstage-api-architecture.md) - **Complete unified documentation** ⭐
- [Admin API vs User API](./backstage-api-architecture.md#api-comparison-admin-vs-user) - Feature comparison

**Authentication & Authorization:**
- [System Context](./backstage-api-architecture.md#level-1-system-context) - Logto integration
- [Security Architecture](./backstage-api-architecture.md#security-architecture) - Multi-layer security
- [Permission Resolver](./backstage-api-architecture.md#43-permission-resolver-shared-infrastructure) - RBAC code

**Data Management:**
- [Container Diagram](./backstage-api-architecture.md#level-2-container-diagram) - PostgreSQL, Redis, Elasticsearch
- [Component Diagram](./backstage-api-architecture.md#level-3-component-diagram) - Repository pattern

**Scalability & Performance:**
- [Deployment Architecture](./backstage-api-architecture.md#deployment-architecture) - Multi-AZ, auto-scaling
- [Performance Targets](./backstage-api-architecture.md#performance--scalability) - SLAs and metrics
- [Monitoring](./backstage-api-architecture.md#monitoring--observability) - Observability stack

**Integration Points:**
- [System Context](./backstage-api-architecture.md#level-1-system-context) - External systems (Logto, S3, SendGrid, etc.)
- [Container Diagram](./backstage-api-architecture.md#level-2-container-diagram) - Service boundaries

## 🔗 Related Documentation

### API Documentation
- [Backstage API Reference](/docs/backstage/apis/admin/law-firm-admin-provisioning-api-logto-managed-rbac) - Unified Admin + User API docs
  - [Admin API](/docs/backstage/apis/admin/law-firm-admin-provisioning-api-logto-managed-rbac) - 34 administrative endpoints
  - [User API](/docs/backstage/apis/user/law-firm-user-portal-api) - 37 user-facing endpoints

### Technical Specifications
- [Backstage API Technical Specification](/docs/backstage/specifications/backstage-api-specification) - Complete unified spec

### Data & Schema
- [Database Schema](/docs/architecture/database-schema) - Complete ERD with 23 slices, 100+ tables

### Getting Started
- [Introduction](/docs/intro) - Overview and getting started

## 📝 Diagram Format

All diagrams in this section use [Mermaid](https://mermaid.js.org/) syntax and can be rendered:
- In GitHub (native support)
- In VS Code (with Mermaid extension)
- In this documentation (Docusaurus with Mermaid plugin)
- At [Mermaid Live Editor](https://mermaid.live)

---

**Need to update these diagrams?** Edit the Markdown files in the `docs/c4-models/` directory to update Mermaid diagrams and descriptions.
