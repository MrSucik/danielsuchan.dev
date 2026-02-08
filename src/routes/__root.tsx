import { createRootRoute, Outlet } from "@tanstack/react-router";
import { Footer } from "../components/Footer";
import { Navigation } from "../components/Navigation";

export const Route = createRootRoute({
  component: () => (
    <div className="dark min-h-screen bg-[#191919] text-white">
      <Navigation />
      <Outlet />
      <Footer />
    </div>
  ),
});
