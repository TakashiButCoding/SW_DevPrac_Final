"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { signIn, getSession, useSession } from "next-auth/react";
import { toast } from "sonner";
import { LoaderCircle, LogIn } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Field,
  FieldGroup,
  FieldLabel,
  FieldSet,
} from "@/components/ui/field";

export default function LoginForm() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [loading, setLoading] = useState(false);

  const getDestination = (role?: string) =>
    role === "admin" ? "/admin/equipment" : "/equipment";

  // Redirect users who are already logged in
  useEffect(() => {
    if (status === "authenticated") {
      router.replace(getDestination(session?.user?.role));
    }
  }, [status, session, router]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);

    const email = String(formData.get("email"));
    const password = String(formData.get("password"));

    let loginSucceeded = false;

    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (!result?.ok || result.error) {
        toast.error("Invalid email or password");
        return;
      }

      const userSession = await getSession();

      if (!userSession) {
        toast.error("Unable to retrieve session");
        return;
      }

      loginSucceeded = true;
      toast.success("Login successful!");

      router.replace(getDestination(userSession.user?.role));
      router.refresh();
    } catch (error) {
      console.error("Login error:", error);
      toast.error("Something went wrong. Please try again.");
    } finally {
      if (!loginSucceeded) {
        setLoading(false);
      }
    }
  }

  // Checking existing session or redirecting
  if (status === "loading" || status === "authenticated") {
    return (
      <div className="flex flex-col items-center justify-center gap-3 py-10">
        <LoaderCircle className="size-8 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground">
          {status === "loading"
            ? "Checking session..."
            : "Redirecting..."}
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit}>
      <FieldSet disabled={loading}>
        <FieldGroup>
          <Field>
            <FieldLabel htmlFor="email">Email</FieldLabel>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="Enter your email"
              autoComplete="email"
              required
            />
          </Field>

          <Field>
            <FieldLabel htmlFor="password">Password</FieldLabel>
            <Input
              id="password"
              name="password"
              type="password"
              placeholder="Enter your password"
              autoComplete="current-password"
              required
            />
          </Field>

          <Button
            type="submit"
            className="w-full"
            disabled={loading}
          >
            {loading ? (
              <>
                <LoaderCircle className="size-4 animate-spin" />
                Signing in...
              </>
            ) : (
              <>
                <LogIn className="size-4" />
                Sign In
              </>
            )}
          </Button>
        </FieldGroup>
      </FieldSet>
    </form>
  );
}