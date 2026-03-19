import type { PartialUserProfile } from "@/backend";
import { useActor } from "@/hooks/useActor";
import { useInternetIdentity } from "@/hooks/useInternetIdentity";
import {
  type ReactNode,
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";

interface AuthContextType {
  isAuthenticated: boolean;
  profile: PartialUserProfile | null;
  isAdmin: boolean;
  login: () => void;
  logout: () => void;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const { identity, login, clear: logout } = useInternetIdentity();
  const { actor } = useActor();
  const isAuthenticated = !!identity && !identity.getPrincipal().isAnonymous();
  const [profile, setProfile] = useState<PartialUserProfile | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);

  const refreshProfile = async () => {
    if (!isAuthenticated || !actor) return;
    try {
      const p = await actor.getMyProfile();
      setProfile(p);
      const admin = await actor.isCallerAdmin();
      setIsAdmin(admin);
    } catch {
      setProfile(null);
    }
  };

  useEffect(() => {
    if (isAuthenticated && actor) {
      refreshProfile();
    } else {
      setProfile(null);
      setIsAdmin(false);
    }
  }, [isAuthenticated, actor]);

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        profile,
        isAdmin,
        login,
        logout,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
