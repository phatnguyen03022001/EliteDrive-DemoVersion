"use client";

import React, { createContext, useContext, useMemo, useCallback, useState, useEffect } from "react";
import Cookies from "js-cookie";
import { jwtDecode } from "jwt-decode";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { authService } from "@/features/auth/auth.service";

interface AuthContextType {
  user: any;
  isLoading: boolean;
  isAuthenticated: boolean;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const queryClient = useQueryClient();
  const token = Cookies.get("token");

  const {
    data: userFromApi,
    isLoading,
    isFetching,
  } = useQuery({
    queryKey: ["auth-profile"],
    queryFn: authService.getProfile,
    enabled: !!token,
    retry: 1,
    staleTime: 1000 * 60 * 5,
  });

  const user = useMemo(() => {
    if (userFromApi) return userFromApi;

    if (token) {
      try {
        const decoded: any = jwtDecode(token);
        return {
          id: decoded.sub || decoded.id,
          email: decoded.email,
          role: decoded.role,
          firstName: decoded.firstName || "",
          lastName: decoded.lastName || "",
        };
      } catch {
        return null;
      }
    }

    return null;
  }, [userFromApi, token]);

  const logout = useCallback(() => {
    Cookies.remove("token", { path: "/" });
    queryClient.clear();
    window.location.href = "/login";
  }, [queryClient]);

  const contextValue = useMemo(
    () => ({
      user,
      isLoading: !!token && (isLoading || isFetching),
      isAuthenticated: !!user,
      logout,
    }),
    [user, isLoading, isFetching, token, logout],
  );

  return <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>;
}

export const useAuthContext = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuthContext must be used within AuthProvider");
  }
  return context;
};
