import Link from "next/link";
import { ChevronLeft  } from 'lucide-react';
import LoginForm from "@/components/auth/loginForm";
export default function LoginPage() {
  return (
    <div className="card p-6">
      <Link
        href="/"
        className="mb-6 flex items-center gap-1 text-sm text-muted-foreground hover:text-primary"
      >
        <ChevronLeft className="size-4" />
        Back to Home
      </Link>

      <h1 className="text-2xl font-bold">Sign In</h1>
      <p className="text-muted-foreground">
        Sign in to access your account
      </p>

      <div className="mt-6">
        <LoginForm />
      </div>

      <p className="mt-6 text-center text-sm">
        Don't have an account?{" "}
        <Link href="/register" className="font-medium text-primary">
          Create an account
        </Link>
      </p>
    </div>
    
  );
}