"use client";

import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useMemo,
} from "react";
import useSWR, { useSWRConfig } from "swr";
import {
  type AccessRole,
  clampModelSlug,
  defaultModelForRole,
  isAccessRole,
} from "@/lib/ai2/access-role";

type SessionPayload = { role: AccessRole };

async function fetchSession(url: string): Promise<SessionPayload> {
  const res = await fetch(url, { credentials: "same-origin" });
  if (!res.ok) {
    return { role: "free" };
  }
  const data = (await res.json()) as { role?: unknown };
  return { role: isAccessRole(data.role) ? data.role : "free" };
}

type AccessRoleContextValue = {
  role: AccessRole;
  isLoading: boolean;
  enterAsFree: () => Promise<AccessRole>;
  enterAsValidator: (passkey: string) => Promise<AccessRole>;
  /** Clamp a model slug for the current role */
  clampSlug: (slug: string | undefined) => string;
  defaultSlug: string;
};

const AccessRoleContext = createContext<AccessRoleContextValue | null>(null);

export function AccessRoleProvider({ children }: { children: ReactNode }) {
  const { mutate: globalMutate } = useSWRConfig();
  const { data, isLoading, mutate } = useSWR(
    "/api/access/session",
    fetchSession,
    {
      revalidateOnFocus: false,
      fallbackData: { role: "free" },
    }
  );

  const role: AccessRole = data?.role ?? "free";

  const refresh = useCallback(
    async (next: AccessRole) => {
      await mutate({ role: next }, { revalidate: false });
      await globalMutate("/api/access/session");
      return next;
    },
    [globalMutate, mutate]
  );

  const enterAsFree = useCallback(async () => {
    const res = await fetch("/api/access/free", {
      method: "POST",
      credentials: "same-origin",
    });
    const body = (await res.json()) as { ok?: boolean; role?: AccessRole; error?: string };
    if (!res.ok || !body.ok) {
      throw new Error(body.error || "Could not enter as free user");
    }
    return refresh("free");
  }, [refresh]);

  const enterAsValidator = useCallback(
    async (passkey: string) => {
      const res = await fetch("/api/access/validator", {
        method: "POST",
        credentials: "same-origin",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ passkey }),
      });
      const body = (await res.json()) as {
        ok?: boolean;
        role?: AccessRole;
        error?: string;
      };
      if (!res.ok || !body.ok) {
        throw new Error(body.error || "Invalid pass-key");
      }
      return refresh("validator");
    },
    [refresh]
  );

  const value = useMemo<AccessRoleContextValue>(
    () => ({
      role,
      isLoading,
      enterAsFree,
      enterAsValidator,
      clampSlug: (slug) => clampModelSlug(role, slug),
      defaultSlug: defaultModelForRole(role),
    }),
    [role, isLoading, enterAsFree, enterAsValidator]
  );

  return (
    <AccessRoleContext.Provider value={value}>
      {children}
    </AccessRoleContext.Provider>
  );
}

export function useAccessRole(): AccessRoleContextValue {
  const ctx = useContext(AccessRoleContext);
  if (!ctx) {
    throw new Error("useAccessRole must be used within AccessRoleProvider");
  }
  return ctx;
}

/** Safe for components that may render outside the provider (fallback free). */
export function useAccessRoleOptional(): AccessRoleContextValue {
  const ctx = useContext(AccessRoleContext);
  return (
    ctx ?? {
      role: "free",
      isLoading: false,
      enterAsFree: async () => "free",
      enterAsValidator: async () => {
        throw new Error("Access provider unavailable");
      },
      clampSlug: (slug) => clampModelSlug("free", slug),
      defaultSlug: defaultModelForRole("free"),
    }
  );
}
