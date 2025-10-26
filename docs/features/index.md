---
sidebar_position: 1
---

# Feature Specifications

Detailed API specifications for the Law Firm Admin Provisioning API system.

## Overview

These specifications are organized by API domain and feature area. Each specification corresponds to a specific API endpoint and includes:

- **User Stories**: Clear description of the feature's purpose
- **Scenarios**: Concrete examples with acceptance criteria
- **Request/Response Specs**: API contract details in tables
- **Requirements Mapping**: Traceability to functional requirements

## Directory Structure

### 📁 [firms/](./firms/create-law-firm)
Law firm tenant management

- [Create Law Firm](./firms/create-law-firm) - `POST /admin/law-firms`
- [List Law Firms](./firms/list-law-firms) - `GET /admin/law-firms`
- [Get Law Firm](./firms/get-law-firm) - `GET /admin/law-firms/{lawFirmId}`

### 📁 [users/](./users/provision-user)
User and lawyer provisioning

- [Provision User](./users/provision-user) - `POST /admin/law-firms/\{lawFirmId\}/users`
- [Add Credential](./users/add-credential) - `POST .../users/\{userId\}/credentials`
- [List Credentials](./users/list-credentials) - `GET .../users/\{userId\}/credentials`
- [Remove Credential](./users/remove-credential) - `DELETE .../users/\{userId\}/credentials/\{credentialId\}`
- [List Profiles](./users/list-profiles) - `GET /admin/law-firms/\{lawFirmId\}/profiles`
- [Lookup Auth Users](./users/lookup-auth-users) - `GET /admin/auth-users`

### 📁 [logto-bridge/](./logto-bridge/list-org-members)
Logto organization member management

- [List Org Members](./logto-bridge/list-org-members) - `GET /admin/logto/orgs/\{lawFirmId\}/members`
- [Add Org Member](./logto-bridge/add-org-member) - `POST .../members`
- [Get Org Member](./logto-bridge/get-org-member) - `GET .../members/\{userId\}`
- [Remove Org Member](./logto-bridge/remove-org-member) - `DELETE .../members/\{userId\}`
- [Update Member Roles](./logto-bridge/update-member-roles) - `PUT .../members/\{userId\}/roles`
- [List Org Roles](./logto-bridge/list-org-roles) - `GET /admin/logto/org-roles`

**Note**: Logto organizations are automatically created when law firms are created, and automatically deleted when law firms are deleted. No manual binding or sync is required.

### 📁 [access-grants/](./access-grants/list-resource-types)
Resource access control

- [List Resource Types](./access-grants/list-resource-types) - `GET /admin/resource-types`
- [List Resource Subtypes](./access-grants/list-resource-subtypes) - `GET /admin/resource-types/\{type\}/subtypes`
- [Search Grants](./access-grants/search-grants) - `GET /admin/resource-access-grants`
- [List Grants for Resource](./access-grants/list-grants-for-resource) - `GET /admin/resources/\{type\}/\{id\}/access-grants`
- [Create Grant](./access-grants/create-grant) - `POST /admin/resources/\{type\}/\{id\}/access-grants`
- [Revoke Grant](./access-grants/revoke-grant) - `DELETE /admin/resources/\{type\}/\{id\}/access-grants/\{userId\}/\{level\}`
- [List Subresource Grants](./access-grants/list-subresource-grants) - `GET .../subresources/\{subtype\}/\{subid\}/access-grants`
- [Create Subresource Grant](./access-grants/create-subresource-grant) - `POST .../subresources/\{subtype\}/\{subid\}/access-grants`
- [Revoke Subresource Grant](./access-grants/revoke-subresource-grant) - `DELETE .../subresources/\{subtype\}/\{subid\}/access-grants/\{userId\}/\{level\}`

### 📁 [capabilities/](./capabilities/get-resource-policies)
User capabilities and policies

- [Get Resource Policies](./capabilities/get-resource-policies) - `GET .../users/\{userId\}/resource-policies`
- [Get User Capabilities](./capabilities/get-user-capabilities) - `GET .../users/\{userId\}/capabilities`

### 📁 [support-access/](./support-access/start-support-session)
Support impersonation (act-as)

- [Start Support Session](./support-access/start-support-session) - `POST /admin/support-access/requests`
- [List Support Sessions](./support-access/list-support-sessions) - `GET /admin/support-access/sessions`
- [Get Support Session](./support-access/get-support-session) - `GET /admin/support-access/sessions/\{id\}`
- [Revoke Support Session](./support-access/revoke-support-session) - `DELETE /admin/support-access/sessions/\{id\}`
- [Acquire Resource Lock](./support-access/acquire-resource-lock) - `POST /admin/resource-locks`
- [Release Resource Lock](./support-access/release-resource-lock) - `DELETE /admin/resource-locks/\{id\}`

### 📁 shared/
Common test fixtures and steps

- [Background Steps](./shared/background) - Reusable Given steps
- [API Simplifications](./shared/api-simplifications) - Logto org management changes
- Data Fixtures - Test data setup
- Common Schemas - Shared data structures

## Specification Format

All specifications follow this structure:

```markdown
# Feature Name

**API Endpoint**: `METHOD /path`
**Priority**: P1/P2/P3
**User Story**: As an admin, I want to...

## Overview
Brief description of the feature

## Scenarios

### Scenario 1: Success case

**Given**:
- Preconditions (state, auth, data)

**When**:
- Action (API request with payload)

**Then**:
- Expected outcome (status, response, side effects)
- Tables for structured data validation

### Scenario 2: Error case
...

## Request Specification
Tables showing all parameters

## Response Specification
Example responses with explanations

## Requirements Mapping
FR-001, FR-002, etc.
```

## Key Benefits

✅ **Testable**: Each scenario can be automated
✅ **Clear**: Structured format with concrete examples
✅ **Complete**: Tables provide comprehensive API details
✅ **Traceable**: Requirements mapped to scenarios
✅ **Maintainable**: One file per endpoint, easy to update

## API Coverage

| Domain | Endpoints | Features | Status |
|--------|-----------|----------|--------|
| Firms | 3 | 3 | ✅ Complete |
| Users | 6 | 6 | ✅ Complete |
| Logto Bridge | 6 | 6 | ✅ Complete |
| Access Grants | 9 | 9 | ✅ Complete |
| Capabilities | 2 | 2 | ✅ Complete |
| Support Access | 6 | 6 | ✅ Complete |
| **Total** | **32** | **32** | **100% Complete** |

## How to Use

### For Developers
1. Read the user story to understand the goal
2. Review scenarios for behavior examples
3. Check request/response specs for API contract
4. Implement to satisfy all scenarios

### For QA Engineers
1. Convert scenarios to automated tests
2. Use scenario steps as test cases
3. Reference data fixtures in `shared/`
4. Generate test reports mapped to requirements

### For Product Managers
1. Review user stories for feature clarity
2. Validate scenarios cover all cases
3. Check priorities align with roadmap
4. Use as communication tool with stakeholders

## Contributing

When adding new features:

1. Create new `.md` file in appropriate directory
2. Follow the specification format template
3. Include comprehensive scenarios (success + errors)
4. Use tables for complex data
5. Map to requirements (FR-XXX)
6. Add to this index under correct domain
