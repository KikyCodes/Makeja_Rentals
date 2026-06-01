import type { Metadata } from "next";
import UsersClient from "@/components/admin/UsersClient";

export const metadata: Metadata = { title: "Admin — User Management" };

export default function AdminUsersPage() {
  return <UsersClient />;
}
