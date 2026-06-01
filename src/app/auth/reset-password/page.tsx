import type { Metadata } from "next";
import AuthLayout from "@/components/auth/AuthLayout";
import ResetPasswordForm from "@/components/auth/ResetPasswordForm";

export const metadata: Metadata = {
  title: "Reset Password — Makeja Rentals",
};

export default function ResetPasswordPage() {
  return (
    <AuthLayout
      title="Set a new password"
      subtitle="Choose a strong password to secure your account."
    >
      <ResetPasswordForm />
    </AuthLayout>
  );
}
