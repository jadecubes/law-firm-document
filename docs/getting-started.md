---
sidebar_position: 2
---

# Getting Started Guide

Welcome to the Law Firm Management System documentation. This guide will help you understand the different types of documentation available and how to navigate them.

## Documentation Structure

This documentation site includes four main types of documentation:

### 1. Architecture Documentation (C4 Models)

C4 models provide a hierarchical way to visualize the architecture using **Context**, **Container**, **Component**, and **Code** diagrams.

**Available Diagrams:**
- **[System Context](/docs/c4-models/system-context)**: High-level view showing how the system fits into the broader environment
- **[Container Diagram](/docs/c4-models/container-diagram)**: Shows the major technology choices and how containers communicate
- **[Component Diagram](/docs/c4-models/component-diagram)**: Details the components within a container

**When to use:**
- Understanding system architecture
- Onboarding new team members
- Planning architectural changes
- System design discussions

### 2. Specifications Documentation

Detailed functional and non-functional requirements for each module.

**Available Specs:**
- See the **[Specifications Overview](/docs/specifications/)** for all available feature specifications

**What you'll find:**
- Functional requirements with priorities
- Non-functional requirements (performance, security, etc.)
- Data models and entity relationships
- State machines and workflows
- Test scenarios
- API endpoint references

**When to use:**
- Understanding feature requirements
- Writing tests
- Planning new features
- Validating implementation

### 3. SpecKit Specifications (AI-Generated)

**NEW!** Specifications created using GitHub SpecKit with AI assistance.

**Features:**
- AI-driven specification refinement
- Automated implementation planning
- Task generation
- Specification-to-code workflow

**Learn more**: [SpecKit Guide](/docs/speckit-guide)

**When to use:**
- Creating new features with AI assistance
- Iterative requirement refinement
- Structured planning process
- Keeping specs in sync with code

### 4. Admin API Documentation

Interactive OpenAPI/Swagger documentation for admin provisioning endpoints.

**Features:**
- Interactive API playground (Try it out!)
- Request/response schemas
- Authentication requirements
- Example requests and responses
- Error codes and handling

**Browse by category:**
- [Law Firms](/docs/admin-api/create-a-new-law-firm-tenant-and-optionally-its-logto-organization) - Create and manage law firm tenants
- [Users & Lawyers](/docs/admin-api/provision-a-lawyer-logto-identity-local-profile-licenses-optional-invite-org-roles) - Provision lawyers with Logto identity
- [Logto Bridge](/docs/admin-api/list-logto-orgs-known-to-the-app) - Manage organization memberships and roles
- [Access Grants](/docs/admin-api/search-resource-access-grants) - Fine-grained resource access control
- [Capabilities](/docs/admin-api/get-user-capabilities-scopes-field-policies-case-id-sets) - User capabilities and permissions
- [Support Access](/docs/admin-api/start-a-support-access-session-act-as-target-user) - Admin support sessions (act-as)

**When to use:**
- Provisioning new law firms and users
- Managing organization roles and permissions
- Implementing admin dashboards
- Debugging access control issues

## Quick Links

### For Developers
1. Start with the [System Context](/docs/c4-models/system-context) to understand the big picture
2. Review [Container Diagram](/docs/c4-models/container-diagram) to see technology choices
3. Dive into [Admin API Documentation](/docs/admin-api/law-firm-admin-provisioning-api-logto-managed-rbac) for implementation details

### For Product Managers
1. Read [Specifications](/docs/specifications/) for feature requirements
2. Review state diagrams and workflows
3. Check priority levels and implementation status

### For QA Engineers
1. Review [Specifications](/docs/specifications/) for test scenarios
2. Use [Admin API Documentation](/docs/admin-api/law-firm-admin-provisioning-api-logto-managed-rbac) for endpoint testing
3. Reference data models for validation rules

## Understanding the Diagrams

### Mermaid Diagrams

This documentation uses Mermaid for creating diagrams directly in Markdown. Mermaid supports:

- **C4 Diagrams**: Architecture visualization
- **State Diagrams**: Workflow and status transitions
- **Entity Relationship Diagrams**: Database schemas
- **Sequence Diagrams**: Interaction flows
- **Timeline Diagrams**: Event chronology
- **Pie Charts**: Data distribution

### Interactive Features

All diagrams are interactive:
- Zoom in/out for details
- Pan to view large diagrams
- Click elements for more information (where applicable)

## Tools Used

### Mermaid + C4 Models
Mermaid with C4 plugin allows us to create architecture diagrams as code:

\`\`\`mermaid
C4Context
    title Example System Context
    Person(user, "User", "A system user")
    System(system, "System", "Does something")
    Rel(user, system, "Uses")
\`\`\`

### OpenAPI/Swagger
API documentation is generated from OpenAPI 3.0 specifications:

- Located in: `examples/openapi.yaml`
- Auto-generates interactive docs
- Keeps API docs in sync with code
- Supports request validation

## Contributing to Documentation

### Updating C4 Models
Edit the Markdown files in `docs/c4-models/`:
- Modify Mermaid code blocks
- Update descriptions
- Add new diagram pages

### Updating Specifications
Edit files in `docs/specifications/`:
- Use Markdown formatting
- Include Mermaid diagrams for visualizations
- Update status indicators (✅, 🔄, ❌)

### Updating API Documentation
1. Edit `examples/openapi.yaml`
2. Run: `npm run docusaurus gen-api-docs all`
3. API docs will be regenerated automatically

## Next Steps

Choose your path:

- **Learn the architecture**: Start with [System Context](/docs/c4-models/system-context)
- **Understand features**: Read [Specifications](/docs/specifications/)
- **Use the API**: Explore [Admin API Documentation](/docs/admin-api/law-firm-admin-provisioning-api-logto-managed-rbac)
