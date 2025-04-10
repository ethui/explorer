import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import type React from "react";
import type { ComponentProps } from "react";

export function SmoothScrollLink({
  to,
  hash,
  children,
  ...rest
}: ComponentProps<typeof Link>) {
  const routerState = useRouterState();
  const navigate = useNavigate();

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();

    if (hash && (!to || routerState.location.pathname === to)) {
      const targetElement = document.getElementById(hash.toString());

      if (targetElement) {
        targetElement.scrollIntoView({ behavior: "smooth" });
      }
    } else {
      navigate({ to, hash, ...rest });
    }
  };

  return (
    <Link to={to} onClick={handleClick} {...rest}>
      {children}
    </Link>
  );
}
