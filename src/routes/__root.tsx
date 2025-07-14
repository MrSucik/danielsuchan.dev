import { createRootRoute, Outlet } from '@tanstack/react-router'

export const Route = createRootRoute({
  component: () => (
    <html className="dark" lang="en">
      <body className="dark:bg-dark-bg">
        <Outlet />
      </body>
    </html>
  ),
})