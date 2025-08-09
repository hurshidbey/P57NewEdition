import { QueryClient, QueryFunction } from "@tanstack/react-query";
import { supabase } from './supabase';

// Development vs Production detection
const isDevelopment = import.meta.env.DEV;

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    const text = (await res.text()) || res.statusText;
    throw new Error(`${res.status}: ${text}`);
  }
}

export async function apiRequest(
  method: string,
  url: string,
  data?: unknown | undefined,
): Promise<Response> {
  const headers: HeadersInit = data ? { "Content-Type": "application/json" } : {};
  
  // Only add auth token for protected routes
  const protectedPaths = ['/api/admin', '/api/user', '/api/progress', '/api/prompts'];
  const isProtectedRoute = protectedPaths.some(path => url.includes(path));
  
  if (isProtectedRoute) {
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.access_token) {
      headers['Authorization'] = `Bearer ${session.access_token}`;
    }
  }
  
  // Add cache busting headers in development
  if (isDevelopment) {
    headers['Cache-Control'] = 'no-cache, no-store, must-revalidate';
    headers['Pragma'] = 'no-cache';
    headers['Expires'] = '0';
  }
  
  const res = await fetch(url, {
    method,
    headers,
    body: data ? JSON.stringify(data) : undefined,
    credentials: "include",
  });

  await throwIfResNotOk(res);
  return res;
}

type UnauthorizedBehavior = "returnNull" | "throw";
export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
}) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior }) =>
  async ({ queryKey }) => {
    let url = queryKey[0] as string;
    
    // Handle query parameters if they exist
    if (queryKey[1] && typeof queryKey[1] === 'object') {
      const params = new URLSearchParams();
      const queryParams = queryKey[1] as Record<string, any>;
      
      Object.entries(queryParams).forEach(([key, value]) => {
        if (value !== null && value !== undefined) {
          params.append(key, String(value));
        }
      });
      
      if (params.toString()) {
        url += `?${params.toString()}`;
      }
    }

    // Add cache busting headers in development
    const headers: HeadersInit = {};
    
    // Only add auth token for protected routes
    const protectedPaths = ['/api/admin', '/api/user', '/api/progress', '/api/prompts'];
    const isProtectedRoute = protectedPaths.some(path => url.includes(path));
    
    if (isProtectedRoute) {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.access_token) {
        headers['Authorization'] = `Bearer ${session.access_token}`;
      }
    }
    
    if (isDevelopment) {
      headers['Cache-Control'] = 'no-cache, no-store, must-revalidate';
      headers['Pragma'] = 'no-cache';
      headers['Expires'] = '0';
    }
    
    const res = await fetch(url, {
      credentials: "include",
      headers,
    });

    if (unauthorizedBehavior === "returnNull" && res.status === 401) {
      return null;
    }

    await throwIfResNotOk(res);
    return await res.json();
  };

// Development vs Production caching strategy
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: "throw" }),
      refetchInterval: false,
      refetchOnWindowFocus: false, // Disable in both dev and prod to prevent excessive requests
      staleTime: isDevelopment ? 30 * 1000 : 5 * 60 * 1000, // 30s in dev, 5min in prod
      gcTime: isDevelopment ? 60 * 1000 : 5 * 60 * 1000, // 60s in dev, 5min in prod
      retry: false,
    },
    mutations: {
      retry: false,
    },
  },
});
