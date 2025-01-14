# Portfolio of Daniel Suchan

Personal portfolio website showcasing my work and experience.

## Tech Stack

- **Framework**: [Astro](https://astro.build/) v5.1.6 - A modern static site builder
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) v3.4.17 with `@astrojs/tailwind` integration
- **Development Tools**:
  - [PNPM](https://pnpm.io/) - Fast, disk space efficient package manager
  - [Prettier](https://prettier.io/) v3.4.2 with Astro plugin for code formatting
  - TypeScript for type safety

## Development

1. Install dependencies:

   ```bash
   pnpm install
   ```

2. Start the development server:

   ```bash
   pnpm start
   ```

3. Build for production:

   ```bash
   pnpm build
   ```

4. Preview production build:
   ```bash
   pnpm preview
   ```

## Deployment

- **Hosting**: [Fly.io](https://fly.io/) with auto-scaling configuration
- **Domain**: Registered on Google Domains
- **Container**: Dockerized deployment with custom Dockerfile
- **Region**: Primary deployment in Frankfurt (FRA)

## Code Quality

- Prettier is configured with default settings plus the Astro plugin
- Format code using:
  ```bash
  pnpm format
  ```

## Project Structure

The project follows Astro's recommended structure:

- `src/pages/` - Page components and routes
- `src/components/` - Reusable UI components
- `src/styles/` - Global styles and Tailwind configuration
