# Portfolio of Daniel Suchan

Personal portfolio website showcasing my work and experience.

## Tech Stack

- **Framework**: [React](https://react.dev/) v18.3.1 with [TanStack Router](https://tanstack.com/router) v1.127.3 - Type-safe file-based routing
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) v3.4.17 with PostCSS and Autoprefixer
- **Build Tool**: [Vite](https://vitejs.dev/) v5.4.19 - Modern build tool and dev server
- **Development Tools**:
  - [NPM](https://www.npmjs.com/) - Node Package Manager
  - [Prettier](https://prettier.io/) v3.4.2 for code formatting
  - TypeScript for type safety

## Development

1. Install dependencies:

   ```bash
   npm install
   ```

2. Start the development server:

   ```bash
   npm run dev
   ```

3. Build for production:

   ```bash
   npm run build
   ```

4. Preview production build:
   ```bash
   npm run preview
   ```

## Deployment

- **Hosting**: [Fly.io](https://fly.io/) with auto-scaling configuration
- **Domain**: Registered on Google Domains
- **Container**: Dockerized deployment with custom Dockerfile
- **Region**: Primary deployment in Frankfurt (FRA)

## Code Quality

- Prettier is configured with default settings
- Format code using:
  ```bash
  npm run format
  ```

## Project Structure

The project follows TanStack Router's file-based routing structure:

- `src/routes/` - Route components and configurations
- `src/main.tsx` - Application entry point
- `src/index.css` - Global styles and Tailwind directives
