import { createRootRoute, Outlet, useRouterState } from "@tanstack/react-router";
import { Layout } from "@/components/layout/layout";

function RootComponent() {
  const router = useRouterState();
  const isAuthPage =
    router.location.pathname === "/login" || router.location.pathname === "/register";

  if (isAuthPage) {
    return <Outlet />;
  }

  return (
    <Layout>
      <Outlet />
    </Layout>
  );
}

export const Route = createRootRoute({
  component: RootComponent,
});
