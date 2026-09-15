import { createFileRoute, redirect, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";

import { RegistrationPage } from "./Registration";

export const Route = createFileRoute("/")({
  beforeLoad: () => {
    throw redirect({ to: "/Registration" });
  },
  loader: () => {
    throw redirect({ to: "/Registration" });
  },
  component: IndexRedirect,
});

function IndexRedirect() {
  const navigate = useNavigate();

  useEffect(() => {
    void navigate({ to: "/Registration", replace: true });
  }, [navigate]);

  return <RegistrationPage />;
}
