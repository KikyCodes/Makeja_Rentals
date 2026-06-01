import { Suspense } from "react";
import type { Metadata } from "next";
import AuthLayout from "@/components/auth/AuthLayout";
import LoginForm from "@/components/auth/LoginForm";

export const metadata: Metadata = {
  title: "Sign In — Makeja Rentals",
  description: "Sign in to your Makeja Rentals account to find and manage properties in Machakos.",
};

export default function LoginPage() {
  return (
    <AuthLayout
      title="Welcome back"
      subtitle="Sign in to access your account and saved properties."
    >
      <Suspense>
        <LoginForm />
      </Suspense>
    </AuthLayout>
  );
}
