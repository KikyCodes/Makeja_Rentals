import type { Metadata } from "next";
import AuthLayout from "@/components/auth/AuthLayout";
import StudentVerifyForm from "@/components/auth/StudentVerifyForm";

export const metadata: Metadata = {
  title: "Student Verification — Makeja Rentals",
  description: "Verify your student status to unlock exclusive discounts and landlord trust.",
};

export default function StudentVerifyPage() {
  return (
    <AuthLayout
      title="Verify student status"
      subtitle="Upload your student ID to unlock discounted listings and boost your trust score."
    >
      <StudentVerifyForm />
    </AuthLayout>
  );
}
