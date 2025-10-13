# @jewel998/state-machine Documentation

This directory contains the documentation website for the @jewel998/state-machine library, built
with [Docusaurus](https://docusaurus.io/) and [TypeDoc](https://typedoc.org/).

## Features

- **Docusaurus 2.4.3** - Modern documentation framework
- **TypeDoc Integration** - Automatic API documentation generation from TypeScript source
- **Responsive Design** - Mobile-friendly documentation
- **Search Support** - Built-in search functionality
- **GitHub Pages Ready** - Automatic deployment via GitHub Actions

## Development

### Prerequisites

- Node.js >= 18.0.0
- npm or pnpm

### Setup

```bash
# Install dependencies
npm install

# Generate API documentation from source
npm run generate:api

# Start development server
npm run dev
# or
npm start
```

The documentation will be available at `http://localhost:3000/state-machine/`

### Available Scripts

- `npm run dev` - Generate API docs and start development server
- `npm start` - Start development server only
- `npm run build` - Build production documentation
- `npm run serve` - Serve production build locally
- `npm run generate:api` - Generate API documentation from TypeScript source
- `npm run clean` - Clean build artifacts

### Project Structure

```
docs/
├── docs/                    # Documentation content
│   ├── getting-started/     # Getting started guides
│   ├── guides/             # Feature guides
│   └── api/                # Auto-generated API docs (TypeDoc)
├── src/                    # Docusaurus theme customizations
│   └── css/               # Custom styles
├── static/                 # Static assets
│   └── img/               # Images and icons
├── docusaurus.config.js    # Docusaurus configuration
├── sidebars.js            # Sidebar navigation
├── typedoc.json           # TypeDoc configuration
└── package.json           # Dependencies and scripts
```

## API Documentation

API documentation is automatically generated from the TypeScript source code using TypeDoc. The
generated markdown files are placed in `docs/api/` and integrated into the Docusaurus site.

### Regenerating API Docs

```bash
npm run generate:api
```

This command:

1. Analyzes the TypeScript source in `../src/`
2. Generates markdown documentation
3. Places files in `docs/api/`
4. Updates the documentation site

## Deployment

The documentation is automatically deployed to GitHub Pages via GitHub Actions when changes are
pushed to the main branch.

### Manual Deployment

```bash
# Build and deploy to GitHub Pages
npm run build
npm run deploy
```

## Configuration

### Docusaurus Config

Main configuration is in `docusaurus.config.js`:

- Site metadata and URLs
- Navigation and footer
- Theme configuration
- Plugin settings

### TypeDoc Config

API documentation generation is configured in `typedoc.json`:

- Entry points and file patterns
- Output format and styling
- Exclusion rules
- Link generation

## Customization

### Styling

Custom CSS is in `src/css/custom.css`:

- Color scheme and branding
- Component styling
- Responsive design
- API documentation styling

### Content

Documentation content is in markdown files under `docs/`:

- Use standard markdown syntax
- Support for MDX components
- Code syntax highlighting
- Mermaid diagrams (when enabled)

## Troubleshooting

### Common Issues

1. **Build Errors**: Check for broken links in markdown files
2. **API Generation Fails**: Ensure TypeScript source compiles correctly
3. **Styling Issues**: Check CSS syntax and Docusaurus theme compatibility

### Debug Mode

```bash
# Enable debug logging
DEBUG=1 npm run build
```

## Contributing

1. Make changes to documentation files
2. Test locally with `npm run dev`
3. Ensure build passes with `npm run build`
4. Submit pull request

The documentation follows the same contribution guidelines as the main project.
