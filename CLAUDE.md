# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Documentation Development Commands

### Core Development
- `mintlify dev` - Start local development server for documentation (requires Mintlify CLI: `npm i -g mintlify`)
- `mintlify install` - Re-install dependencies if dev server isn't working

### Content Updates
- `wget -O openapi.json https://moderationapi.com/api/v1/openapi.json` - Update OpenAPI spec
- `npx @mintlify/scraping@latest openapi-file openapi.json` - Generate API reference pages from OpenAPI

## Architecture Overview

This is a **Mintlify documentation site** for the Moderation API platform. The documentation is automatically deployed via GitHub integration.

### Documentation Structure

#### Content Organization (`docs/`)
- **Getting Started**: `get-started/` - Introduction and concepts
- **Quickstart Guides**: `quickstart/` - Language-specific implementation examples (Node.js, Python, Ruby, PHP, Go, Java)  
- **API Reference**: `api-reference/` - Auto-generated from OpenAPI spec
- **Learn Sections**:
  - `account/` - Account management (quota, upgrading, team members)
  - `content-moderation/` - Core moderation features and setup
  - `model-studio/` - AI agents, pre-built models, custom models
  - `review-queues/` - Human-in-the-loop moderation workflows
  - `wordlists/` - Custom wordlist management
- **Resources**: `resources/` - SDKs and integrations
- **Guides**: `guides/` - Use case specific tutorials

#### Configuration Files
- **`mint.json`** - Mintlify configuration with navigation, branding, and OpenAPI integration
- **`openapi.json`** - API specification sourced from production API
- **Static Assets**: `images/`, `logo/`, `_snippets/` - Documentation media and reusable content

#### Key Features
- **OpenAPI Integration**: API reference auto-generated from live API spec
- **Multi-language Support**: Code examples in 6+ programming languages  
- **Interactive API Playground**: Bearer token authentication
- **Analytics**: Mixpanel integration for usage tracking
- **Feedback System**: Thumbs up/down rating on pages

### Content Management

#### Navigation Structure (mint.json)
The site uses a hierarchical navigation defined in `mint.json`:
- **Top-level groups**: Documentation, Quickstart, Learn, Resources, API
- **Nested groups**: Organized by feature area (Account, Content Moderation, Actions, etc.)
- **Enterprise features**: Separate sections for Wordlist, Authors, Review Queue

#### Branding & Styling  
- **Colors**: Blue theme (`#2563EB` primary)
- **White-labeled**: Custom branding without Mintlify attribution
- **Responsive logos**: Separate dark/light mode assets
- **Custom favicon**: `/favicon.svg`

#### Content Types
- **`.mdx` files**: Documentation pages with React component support
- **Code snippets**: Language-specific examples in `_snippets/`
- **Images**: Screenshots and illustrations in `images/`
- **API schemas**: Auto-generated from OpenAPI specification

### Development Workflow

#### Local Development
1. Install Mintlify CLI globally
2. Run `mintlify dev` from docs directory (where `mint.json` exists)
3. Changes auto-reload in browser

#### Content Updates
- **Manual content**: Edit `.mdx` files directly
- **API documentation**: Update via OpenAPI spec refresh
- **Navigation**: Modify `mint.json` structure
- **Assets**: Add to appropriate directories (`images/`, `logo/`, etc.)

#### Deployment
- **Automatic**: GitHub integration deploys changes on push to main branch
- **Production URL**: Connected to custom domain
- **Environment**: Hosted on Mintlify infrastructure

### External Dependencies
- **Main API**: `https://moderationapi.com/api/v1/openapi.json` - Source for API documentation
- **Dashboard**: `https://moderationapi.com/app` - User dashboard links
- **Blog/Changelog**: `https://moderationapi.com/blog/tag/updates/` - External changelog
- **Support**: `mailto:support@moderationapi.com` - Contact integration