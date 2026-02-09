import { createRootRoute, Outlet } from "@tanstack/react-router";
import { motion, useScroll, useSpring } from "framer-motion";
import { Footer } from "../components/Footer";
import { Navigation } from "../components/Navigation";

export const Route = createRootRoute({
  component: RootLayout,
});

function RootLayout() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001,
  });

  return (
    <div className="flex h-dvh flex-col overflow-hidden">
      <motion.div className="scroll-progress" style={{ scaleX }} />
      <Navigation />
      <div className="flex flex-1 flex-col overflow-y-auto">
        <Outlet />
        <Footer />
      </div>
    </div>
  );
}
