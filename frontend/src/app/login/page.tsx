import type { Metadata } from "next";
import { LoginForm } from "@/components/auth/LoginForm";

export const metadata: Metadata = {
  title: "Sign In — BookRoom",
  description: "Sign in to your BookRoom reading library.",
};

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-stone-50 flex items-center justify-center p-4">
      <LoginForm />
    </div>
  );
}
