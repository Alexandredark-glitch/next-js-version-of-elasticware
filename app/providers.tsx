"use client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { useState } from "react";
import { type ReactNode } from "react";
import { ErrorProvider } from "@/hooks/useGlobalError";
import { ErrorToast } from "@/features/error/ErrorToast";
import {NavigationProgress} from "@/features/navigation/NavigationProgress";

function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 60 * 1000,
        refetchOnWindowFocus: false,
      },
    },
  });
}

export default function Providers({ children }: { children: ReactNode }) {
  const [queryClient] = useState(() => makeQueryClient());

  return (
    <QueryClientProvider client={queryClient}>
      <ErrorProvider>
        <ErrorToast />
        <NavigationProgress>
          {children}
        </NavigationProgress>

        <ReactQueryDevtools initialIsOpen={false} />
      </ErrorProvider>
    </QueryClientProvider>
  );
}