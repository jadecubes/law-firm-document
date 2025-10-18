---
sidebar_position: 3
---

# Using GitHub SpecKit

This guide explains how to use GitHub SpecKit to create specification-driven documentation that automatically appears in this Docusaurus site.

## What is SpecKit?

SpecKit is GitHub's open-source toolkit for **Spec-Driven Development**. It helps you:
- Define clear specifications before coding
- Use AI agents (like Claude Code) to refine requirements
- Generate implementation plans and tasks
- Keep documentation in sync with development

## SpecKit Integration

This project is configured to automatically display SpecKit specifications in Docusaurus:

- **SpecKit files location**: `.specify/specs/`
- **Displayed in Docusaurus**: Under "SpecKit Specifications" section
- **Automatic updates**: Changes to spec files are immediately reflected

## Creating Your First Spec

### Step 1: Define Project Constitution

The constitution establishes project principles and governance:

```bash
/speckit.constitution
```

This creates `.specify/memory/constitution.md` with:
- Project vision and goals
- Core principles
- Governance guidelines
- Quality standards

### Step 2: Create a Specification

To create a new specification:

```bash
/speckit.specify
```

When prompted, describe your feature. For example:
> "I want to create a client notification system that sends email and SMS alerts when case status changes"

SpecKit will:
1. Ask clarifying questions
2. Generate a detailed specification
3. Create `.specify/specs/[number]-[feature-name]/spec.md`
4. The spec will **automatically appear** in Docusaurus

### Step 3: Create Implementation Plan

Once you have a spec, create the technical plan:

```bash
/speckit.plan
```

This generates:
- `.specify/specs/[feature]/plan.md`
- Technology stack decisions
- Architecture approach
- Implementation steps

### Step 4: Generate Tasks

Convert the plan into actionable tasks:

```bash
/speckit.tasks
```

Creates:
- `.specify/specs/[feature]/tasks.md`
- Prioritized task list
- Dependencies
- Acceptance criteria

### Step 5: Implement

Execute the implementation with AI assistance:

```bash
/speckit.implement
```

The AI agent will:
- Follow the plan
- Complete tasks in order
- Update documentation
- Run tests

## SpecKit Workflow Diagram

```mermaid
graph TD
    A[Start] --> B[/speckit.constitution]
    B --> C[Define Project Principles]
    C --> D[/speckit.specify]
    D --> E[Create Feature Spec]
    E --> F{Need Clarification?}
    F -->|Yes| G[/speckit.clarify]
    G --> E
    F -->|No| H[/speckit.plan]
    H --> I[Create Technical Plan]
    I --> J{Validate Quality?}
    J -->|Yes| K[/speckit.checklist]
    K --> L[/speckit.tasks]
    J -->|No| L
    L --> M[Generate Task List]
    M --> N{Analyze Consistency?}
    N -->|Yes| O[/speckit.analyze]
    O --> P[/speckit.implement]
    N -->|No| P
    P --> Q[Execute Implementation]
    Q --> R[End]

    style B fill:#e1f5ff
    style D fill:#e1f5ff
    style H fill:#e1f5ff
    style L fill:#e1f5ff
    style P fill:#e1f5ff
    style G fill:#fff3cd
    style K fill:#fff3cd
    style O fill:#fff3cd
```

## Optional Enhancement Commands

### Clarify Requirements

Before planning, de-risk ambiguous areas:

```bash
/speckit.clarify
```

Use when:
- Requirements are unclear
- Multiple interpretations possible
- Need stakeholder input

### Quality Checklist

Generate validation checklists:

```bash
/speckit.checklist
```

Validates:
- Requirements completeness
- Clarity and consistency
- Testability

### Consistency Analysis

Check alignment across artifacts:

```bash
/speckit.analyze
```

Analyzes:
- Spec vs Plan alignment
- Plan vs Tasks consistency
- Missing requirements
- Conflicting information

## File Structure

After creating specs, your project structure looks like:

```
.specify/
├── memory/
│   └── constitution.md          # Project principles
├── specs/
│   └── 001-client-notifications/
│       ├── spec.md              # Feature specification
│       ├── plan.md              # Technical implementation plan
│       ├── tasks.md             # Actionable task list
│       ├── data-model.md        # Data structures
│       ├── contracts/           # API/protocol specs
│       │   ├── api-spec.json
│       │   └── signalr-spec.md
│       └── research.md          # Technology research
├── scripts/                     # Utility scripts
└── templates/                   # Markdown templates
```

## Viewing Specs in Docusaurus

Once you create specs using SpecKit slash commands:

1. Specs are created in `.specify/specs/[feature-name]/`
2. They're automatically available in Docusaurus via symlink
3. Navigate to **"SpecKit Specifications"** in the sidebar
4. Each feature appears as a separate section

## Example Spec Structure

A SpecKit specification typically includes:

### spec.md
- Feature overview
- User stories
- Functional requirements
- Non-functional requirements
- Success criteria
- Out of scope items

### plan.md
- Technology choices
- Architecture decisions
- Implementation approach
- Risk assessment
- Testing strategy

### tasks.md
- Task breakdown
- Priority levels
- Dependencies
- Time estimates
- Acceptance criteria

## Best Practices

### 1. Start with Constitution
Define project principles before creating specs. This ensures consistency.

### 2. One Feature Per Spec
Keep specs focused on a single feature or capability.

### 3. Iterate with AI
Use the clarify command to refine requirements before planning.

### 4. Validate Quality
Run checklist command after planning to ensure completeness.

### 5. Check Consistency
Use analyze command before implementation to catch issues early.

### 6. Keep Specs Updated
As implementation evolves, update the specs to reflect reality.

## Integration with Other Documentation

SpecKit works alongside other documentation types:

### With C4 Models
- Use C4 diagrams for system architecture
- Use SpecKit specs for feature details
- Reference architecture in specs

### With API Documentation
- SpecKit can generate API contracts
- Place in `contracts/` directory
- Reference in OpenAPI specs

### With Manual Specifications
- Use both approaches
- SpecKit for new features
- Manual specs for existing features
- Cross-reference as needed

## Troubleshooting

### Specs not appearing in Docusaurus

1. Check symlink exists: `ls -la docs/speckit-specs`
2. Verify specs exist: `ls -la .specify/specs/`
3. Rebuild: `npm run clear && npm start`

### SpecKit commands not working

1. Check installation: `specify --version`
2. Verify .claude/commands/ exists
3. Restart your AI agent

### Git conflicts with .claude/

The `.claude/` directory is in `.gitignore` for security. This is intentional as it may contain credentials.

## Advanced Usage

### Custom Templates

Edit templates in `.specify/templates/` to customize output:
- `spec-template.md` - Specification structure
- `plan-template.md` - Planning format
- `tasks-template.md` - Task format

### Integration with CI/CD

You can automate spec validation:

```bash
# Check specs exist before deployment
if [ -d ".specify/specs" ]; then
  echo "Specs found, proceeding..."
fi
```

### Spec Versioning

SpecKit specs are in git. Use branches for:
- Feature specifications
- Version-specific plans
- Historical reference

## Resources

- [SpecKit GitHub Repository](https://github.com/github/spec-kit)
- [SpecKit Documentation](https://github.com/github/spec-kit#readme)
- [Spec-Driven Development Guide](https://github.com/github/spec-kit/blob/main/docs/GUIDE.md)

## Generated Specifications

The following specifications have been created for the Admin Provisioning API system:

### Core Specifications

1. **[Complete Admin Provisioning API System](/docs/specs/complete-admin-provisioning/spec)**
   - Comprehensive admin system for law firms, users, RBAC, and support access
   - 81 functional requirements
   - Status: ✅ Ready for Planning

2. **[Law Firm Tenant Management](/docs/specs/law-firm-tenant/spec)**
   - Law firm creation with Logto organization provisioning
   - 54 functional requirements
   - Status: ✅ Ready for Planning

3. **[Generic User Provisioning System](/docs/specs/generic-user-provisioning/spec)**
   - Role-based user provisioning with credentials management
   - 82 functional requirements
   - Status: ✅ Ready for Planning

4. **[Support Access (Act-As) Feature](/docs/specs/support-access-act/spec)**
   - Temporary user impersonation for support staff
   - 65 functional requirements
   - Status: ✅ Ready for Planning

5. **[Resource Access Management](/docs/specs/resource-access-management/spec)**
   - Fine-grained access control with policies
   - Status: 🔄 In Progress

6. **[Professional Credentials Management](/docs/specs/professional-credentials/spec)**
   - Bar licenses, certifications, and credential tracking
   - Status: 📋 Pending

### Specification Files by Feature

Each specification directory contains:
- `spec.md` - Feature requirements and user scenarios
- `checklists/requirements.md` - Quality validation checklist
- `plan.md` - Technical implementation plan (generated with `/speckit.plan`)
- `tasks.md` - Actionable task breakdown (generated with `/speckit.tasks`)

## Next Steps

1. Run `/speckit.constitution` to establish project principles
2. Create your first spec with `/speckit.specify`
3. Review the [generated specifications](#generated-specifications) above
4. Continue through the workflow to implementation

The specs you create will be automatically visible in this documentation site, keeping your specifications and documentation in perfect sync!
