import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import RegisterForm from "@/components/auth/registerForm";

export default function RegisterPage() {
  return (
    <div className="card p-6">
      <Link
        href="/"
        className="mb-6 flex items-center gap-1 text-sm text-muted-foreground hover:text-primary"
      >
        <ChevronLeft className="size-4" />
        Back to Home
      </Link>

      <h1 className="text-2xl font-bold">Create an Account</h1>

      <p className="text-muted-foreground">
        Register to start renting equipment
      </p>

      <div className="mt-6">
        <RegisterForm />
      </div>

      <p className="mt-6 text-center text-sm">
        Already have an account?{" "}
        <Link href="/login" className="font-medium text-primary">
          Sign in
        </Link>
      </p>
    </div>
  );
}