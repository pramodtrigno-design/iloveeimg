"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Lock, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function LoginPage() {
    const router = useRouter();
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setIsLoading(true);

        try {
            const res = await fetch("/api/auth/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ password }),
            });

            if (res.ok) {
                router.push("/blog");
                router.refresh();
            } else {
                const data = await res.json();
                setError(data.error || "Login failed");
            }
        } catch {
            setError("Something went wrong");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="content-container py-24 max-w-md mx-auto px-4">
            <div className="bg-card border border-border rounded-3xl p-8 shadow-tool">
                <div className="text-center mb-8">
                    <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                        <Lock className="w-6 h-6 text-primary" />
                    </div>
                    <h1 className="text-2xl font-bold">Admin Login</h1>
                    <p className="text-sm text-muted-foreground mt-2">
                        Enter your administrative password to continue
                    </p>
                </div>

                <form onSubmit={handleLogin} className="space-y-6">
                    <div className="space-y-2">
                        <Label htmlFor="password">Password</Label>
                        <Input
                            id="password"
                            type="password"
                            required
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                    </div>

                    {error && (
                        <div className="p-3 text-sm text-destructive bg-destructive/10 rounded-lg">
                            {error}
                        </div>
                    )}

                    <Button type="submit" disabled={isLoading} className="w-full btn-tool">
                        {isLoading ? (
                            <>
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                Verifying...
                            </>
                        ) : (
                            "Log In"
                        )}
                    </Button>
                </form>
            </div>
        </div>
    );
}
