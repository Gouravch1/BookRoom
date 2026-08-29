import type { Metadata } from "next";
import { RegisterForm } from "@/components/auth/RegisterForm";

export const metadata: Metadata = {
  title: "Create Account — BookRoom",
  description: "Create your BookRoom reading library account.",
};

export default function RegisterPage() {
  return (
    <div className="min-h-screen bg-stone-50 flex items-center justify-center p-4">
      <RegisterForm />
    </div>
  );
}
