"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

import {
    Field,
    FieldGroup,
    FieldLabel,
    FieldSet,
} from "@/components/ui/field";

import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

export default function RegisterForm() {
    const router = useRouter();

    const [loading, setLoading] = useState(false);

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();

        const formData = new FormData(e.currentTarget);

        const data = {
            name: String(formData.get("name")),
            email: String(formData.get("email")),
            tel: String(formData.get("tel")),
            password: String(formData.get("password")),
            role: "member", 
        };

        setLoading(true);

        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/auth/register`,
                {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(data),
                }
            );

            if (!response.ok) {     
                console.log(response);
                toast.error("Registration failed");
                return;
            }

            toast.success("Account created successfully!");
            router.push("/login");
        } catch {
            toast.error("Something went wrong.");
        } finally {
            setLoading(false);
        }
    }

  return (
    <form onSubmit={handleSubmit}>
      <FieldSet>
        <FieldGroup>
          <Field>
            <FieldLabel htmlFor="name">Full Name</FieldLabel>
            <Input
              id="name"
              name="name"
              placeholder="Enter your full name"
              required
            />
          </Field>

          <Field>
            <FieldLabel htmlFor="email">Email</FieldLabel>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="example@email.com"
              required
            />
          </Field>

          <Field>
            <FieldLabel htmlFor="tel">Telephone</FieldLabel>
            <Input
              id="tel"
              name="tel"
              type="tel"
              placeholder="0812345678"
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
              required
              minLength={6}
            />
          </Field>

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Creating account..." : "Create Account"}
          </Button>
        </FieldGroup>
      </FieldSet>
    </form>
  );
}