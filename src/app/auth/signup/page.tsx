import { Suspense } from "react";
import type { Metadata } from "next";
import AuthLayout from "@/components/auth/AuthLayout";
import SignupForm from "@/components/auth/SignupForm";

export const metadata: Metadata = {
  title: "Create Account — Makeja Rentals",
  description: "Join thousands of students and landlords on Makeja Rentals — Machakos's #1 rental platform.",
};

export default function SignupPage() {
  return (
    <AuthLayout
      title="Create your account"
      subtitle="Join Makeja Rentals for free — find your ideal home in minutes."
    >
      <Suspense>
        <SignupForm />
      </Suspense>
    </AuthLayout>
  );
}
