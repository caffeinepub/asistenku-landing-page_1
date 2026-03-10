import { useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useActor } from "./useActor";
import { useInternetIdentity } from "./useInternetIdentity";

type RoleKey =
  | "admin"
  | "operasional"
  | "asistenmu"
  | "client"
  | "partner"
  | "investor"
  | null;

function roleToDashboardPath(role: RoleKey): string {
  switch (role) {
    case "admin":
      return "/dashboard-admin";
    case "operasional":
      return "/dashboard-operasional";
    case "asistenmu":
      return "/dashboard-asistenmu";
    case "client":
      return "/dashboard-client";
    case "partner":
      return "/dashboard-partner";
    case "investor":
      return "/dashboard-investor";
    default:
      return "/";
  }
}

export function useRoleGuard(expectedRole: string): { isChecking: boolean } {
  const navigate = useNavigate();
  const { identity, isInitializing } = useInternetIdentity();
  const { actor, isFetching: isActorFetching } = useActor();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    // Wait for identity to be initialized
    if (isInitializing) return;

    // If no identity after initialization, redirect to landing page
    if (!identity) {
      setIsChecking(false);
      void navigate({ to: "/" });
      return;
    }

    // Wait for actor to be ready
    if (isActorFetching || !actor) return;

    // Check role
    void (async () => {
      try {
        const roleObj = await actor.getMyRole();
        // roleObj is either null or an enum value like Role.admin = "admin"
        let roleKey: RoleKey = null;

        if (roleObj !== null && roleObj !== undefined) {
          // The role from backend.d.ts is typed as Role enum (string values)
          // but over the wire it comes as a Motoko variant { admin: null } etc.
          // Handle both cases
          if (typeof roleObj === "string") {
            roleKey = roleObj as RoleKey;
          } else if (typeof roleObj === "object") {
            const keys = Object.keys(roleObj as Record<string, unknown>);
            if (keys.length > 0) {
              roleKey = keys[0] as RoleKey;
            }
          }
        }

        const correctPath = roleToDashboardPath(roleKey);

        if (roleKey !== expectedRole) {
          void navigate({ to: correctPath });
        } else {
          setIsChecking(false);
        }
      } catch {
        // On error, let through (don't block the user)
        setIsChecking(false);
      }
    })();
  }, [
    isInitializing,
    identity,
    actor,
    isActorFetching,
    expectedRole,
    navigate,
  ]);

  return { isChecking };
}
