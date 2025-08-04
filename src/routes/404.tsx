import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/404")({
  component: NotFound,
  head: () => ({
    meta: [
      {
        title: "Not Found",
      },
    ],
  }),
});

function NotFound() {
  return (
    <div className="grid place-items-center min-h-screen">
      <h1 className="text-center">404 😿</h1>
    </div>
  );
}
