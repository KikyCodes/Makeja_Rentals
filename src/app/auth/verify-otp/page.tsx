import { Suspense } from "react";
import type { Metadata } from "next";
import AuthLayout from "@/components/auth/AuthLayout";
import OTPForm from "@/components/auth/OTPForm";

export const metadata: Metadata = {
  title: "Verify Code — Makeja Rentals",
};

export default function VerifyOTPPage() {
  return (
    <AuthLayout
      title="Enter your code"
      subtitle="Enter the 6-digit code we sent to your email."
    >
      <Suspense>
        <OTPForm />
      </Suspense>
    </AuthLayout>
  );
}
