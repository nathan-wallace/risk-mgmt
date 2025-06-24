# System Instructions for Octo-Presso

This repository contains a SvelteKit project that builds a static site. Follow these guidelines when developing or updating the codebase.

## Development
- Install dependencies with `npm install`.
- Use `npm run dev` to start the local development server.
- Scaffold new pages with `node scripts/create-page.js <slug> <template-id>`.

## Checks and Builds
- Always run `npm run check` after making changes. This performs `svelte-check` and ensures TypeScript and Svelte files compile.
- Build the site with `npm run build`. The static output is written to the `docs/` directory. Do not edit files in `docs/` manually.

## Deployment
- Deployments are triggered when changes are pushed to the `main` branch. The site is served from `/octo-presso` when `NODE_ENV=production`.
- Ensure a `.nojekyll` file exists in `docs/` so GitHub Pages does not ignore folders that start with an underscore.

## Content Guidelines
- Write plain language and keep content concise.
- Ensure pages meet accessibility standards (Section 508/WCAG).
- Keep information accurate and up to date.
- Use https://picsum.photos/images for placeholder images.

## Maintenance
- Use `node scripts/reset-project.js` to clean build artifacts, reinstall dependencies, build, and run checks.
- Keep the index page's list of landing pages up to date when pages are added or removed.


