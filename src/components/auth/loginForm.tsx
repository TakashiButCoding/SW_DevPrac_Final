"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn, getSession } from "next-auth/react";
import { toast } from "sonner";
import { LogIn } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Field,
  FieldGroup,
  FieldLabel,
  FieldSet,
} from "@/components/ui/field";

export default function LoginForm() {
  const router = useRouter();

  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);

    const email = String(formData.get("email"));
    const password = String(formData.get("password"));

    try {
      const result = await signIn("credentials", {
            email,
            password,
            redirect: false
        });

        if (!result?.ok || result.error) {
            toast.error("Invalid email or password");
            return;
        }

        toast.success("Login successful!");

        // Get session to determine user role
        const session = await getSession();

        if (session?.user?.role === "admin") {
            router.push("/admin/equipment");
        } else {
            router.push("/");
        }

        router.refresh();
        } catch {
        toast.error("Something went wrong. Please try again.");
        } finally {
        setLoading(false);
        }
    }

  return (
    <form onSubmit={handleSubmit}>
      <FieldSet disabled={loading}>
        <FieldGroup>
          {/* Email */}
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

          {/* Password */}
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

          {/* Submit */}
          <Button type="submit" className="w-full" disabled={loading}>
            <LogIn className="size-4" />
            {loading ? "Signing in..." : "Sign In"}
          </Button>
        </FieldGroup>
      </FieldSet>
    </form>
  );
}