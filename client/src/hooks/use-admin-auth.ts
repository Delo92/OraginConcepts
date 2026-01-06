import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

interface AdminSession {
  isAdmin: boolean;
}

async function fetchAdminSession(): Promise<AdminSession> {
  const response = await fetch("/api/admin/session", {
    credentials: "include",
  });

  if (!response.ok) {
    return { isAdmin: false };
  }

  return response.json();
}

export function useAdminAuth() {
  const queryClient = useQueryClient();

  const { data: session, isLoading } = useQuery<AdminSession>({
    queryKey: ["/api/admin/session"],
    queryFn: fetchAdminSession,
    retry: false,
    staleTime: 1000 * 60 * 5,
  });

  const logoutMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("POST", "/api/admin/logout");
    },
    onSuccess: () => {
      queryClient.setQueryData(["/api/admin/session"], { isAdmin: false });
    },
  });

  return {
    isAdmin: session?.isAdmin || false,
    isLoading,
    logout: logoutMutation.mutate,
    isLoggingOut: logoutMutation.isPending,
  };
}
