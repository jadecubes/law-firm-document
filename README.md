# Law Firm Documentation Site

A comprehensive documentation site built with Docusaurus featuring C4 architecture models, specifications, and interactive API documentation.

## Features

### 1. C4 Architecture Models with Mermaid
- System Context diagrams
- Container diagrams
- Component diagrams
- Rendered directly from Markdown using Mermaid

### 2. Manual Specifications Documentation
- Functional requirements
- Non-functional requirements
- State diagrams
- Entity-relationship diagrams
- Test scenarios

### 3. Admin API Documentation
- Auto-generated from OpenAPI 3.1 specs
- Interactive API playground for admin endpoints
- Complete RBAC and provisioning API
- Authentication examples

## Prerequisites

- Node.js >= 20.0
- npm or yarn
- Python 3.11+ (for SpecKit)
- uv tool (for SpecKit installation)

## Installation

```bash
npm install
```

## Development

Start the development server:

```bash
npm start
```

The site will open at `http://localhost:3000`.

## Building for Production

```bash
npm run build
```

The static files will be generated in the `build` directory.

## Project Structure

```
law-firm-doc/
├── docs/                          # Documentation content
│   ├── intro.md                   # Introduction page
│   ├── getting-started.md         # Getting started guide
│   ├── c4-models/                 # C4 architecture diagrams
│   │   ├── system-context.md      # System context diagram
│   │   ├── container-diagram.md   # Container diagram
│   │   └── component-diagram.md   # Component diagram
│   ├── specifications/            # Feature specifications
│   │   └── case-management-spec.md
│   └── api/                       # Auto-generated API docs
│       └── *.api.mdx              # Generated from OpenAPI spec
├── examples/                      # Example files
│   └── openapi.yaml              # OpenAPI specification
├── src/                          # Custom React components
├── static/                       # Static assets
├── docusaurus.config.ts          # Docusaurus configuration
├── sidebars.ts                   # Sidebar configuration
└── package.json
```

## Working with Different Documentation Types

### Adding C4 Architecture Diagrams

1. Create a new `.md` file in `docs/c4-models/`
2. Add Mermaid code blocks with C4 syntax:

```markdown
\`\`\`mermaid
C4Context
    title My System Context
    Person(user, "User", "Description")
    System(system, "System", "Description")
    Rel(user, system, "Uses")
\`\`\`
```

Supported C4 diagram types:
- `C4Context` - System context
- `C4Container` - Container view
- `C4Component` - Component view

### Adding Specifications

Create files in `docs/specifications/` with:
- Functional requirements
- Non-functional requirements
- Mermaid diagrams (state, ER, sequence, etc.)
- Test scenarios
- References to API docs

### Creating SpecKit Specifications

SpecKit allows you to create specifications with AI assistance:

1. **Use slash commands** in Claude Code:
   ```
   /speckit.constitution  # Establish project principles
   /speckit.specify       # Create a specification
   /speckit.plan          # Create implementation plan
   /speckit.tasks         # Generate task list
   /speckit.implement     # Execute implementation
   ```

2. **Specs are automatically visible** in Docusaurus under "SpecKit Specifications"

3. **Specs are stored** in `.specify/specs/[feature-name]/`

For detailed instructions, see the [SpecKit Guide](docs/speckit-guide.md) in the documentation.

### Updating Admin API Documentation

1. Edit the OpenAPI spec: `examples/admin-api.yaml`
2. Regenerate API docs:
   ```bash
   npm run docusaurus gen-api-docs adminApi
   ```
3. The docs in `docs/admin-api/` will be automatically updated

## Available NPM Scripts

- `npm start` - Start development server
- `npm run build` - Build for production
- `npm run serve` - Serve production build locally
- `npm run clear` - Clear Docusaurus cache
- `npm run docusaurus gen-api-docs all` - Regenerate API docs
- `npm run typecheck` - Run TypeScript type checking

## Plugins and Themes

### Installed Packages

- `@docusaurus/core` - Core Docusaurus framework
- `@docusaurus/preset-classic` - Classic theme preset
- `@docusaurus/theme-mermaid` - Mermaid diagram support
- `docusaurus-plugin-openapi-docs` - OpenAPI docs generator
- `docusaurus-theme-openapi-docs` - OpenAPI docs theme

## Troubleshooting

### Mermaid diagrams not rendering
- Clear cache: `npm run clear`
- Check Mermaid syntax is correct
- Ensure proper indentation

### API docs not updating
- Run: `npm run docusaurus gen-api-docs all`
- Check OpenAPI spec is valid
- Clear cache and rebuild

### Build errors
- Check Node.js version (>= 20.0)
- Clear cache: `npm run clear`
- Delete `node_modules` and reinstall

## Deployment

Using GitHub Pages:

```bash
npm run deploy
```

Or build and deploy to any static hosting service:

```bash
npm run build
# Deploy the 'build' directory
```

## Resources

- [Docusaurus Documentation](https://docusaurus.io/)
- [Mermaid Documentation](https://mermaid.js.org/)
- [C4 Model](https://c4model.com/)
- [OpenAPI Specification](https://swagger.io/specification/)
- [OpenAPI Docusaurus Plugin](https://github.com/PaloAltoNetworks/docusaurus-openapi-docs)
