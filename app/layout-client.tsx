"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";

const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            staleTime: 1000 * 60,
            retry: 1,
            refetchOnWindowFocus: false,
        },
    },
});

export function RootLayoutClient({ children }: { children: React.ReactNode }) {
    return (
        <QueryClientProvider client={queryClient}>
            <TooltipProvider>
                <Toaster richColors closeButton />
                <div className="page-container flex flex-col min-h-screen">
                    <Header />
                    <main className="flex-1">{children}</main>
                    <Footer />
                </div>
            </TooltipProvider>
        </QueryClientProvider>
    );
}
