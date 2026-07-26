import { useState } from "react";
import { useSearchParams, useNavigate, Link } from "react-router-dom";
import { toast } from "sonner";

import { Button } from "../components/ui/button";
import { Card, CardContent } from "../components/ui/card";
import { Field, FieldGroup, FieldLabel } from "../components/ui/field";
import { Input } from "../components/ui/input";
import { useResetPassword } from "../hooks/useAuth";

function ResetPassword() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get("token");

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const { mutate: resetMutate, isPending } = useResetPassword();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!token) {
      toast.error("Missing reset token. Please use the link from your email.");
      return;
    }

    if (!newPassword) {
      toast.error("Please enter a new password");
      return;
    }

    if (newPassword.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    resetMutate(
      { token, newPassword },
      {
        onSuccess: (res: any) => {
          toast.success(res?.message || "Password reset successfully!");
          setTimeout(() => navigate("/login"), 1500);
        },
        onError: (err: any) => {
          const msg =
            err?.response?.data?.message ||
            "Failed to reset password. The link may have expired.";
          toast.error(msg);
        },
      }
    );
  };

  // No token in URL → show error state
  if (!token) {
    return (
      <div className="flex min-h-svh flex-col items-center justify-center bg-muted p-6 md:p-10">
        <div className="w-full max-w-sm">
          <Card className="overflow-hidden p-0">
            <CardContent className="p-6 md:p-8">
              <div className="flex flex-col items-center gap-4 py-8 text-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-100 text-red-600">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </div>
                <h2 className="text-xl font-semibold">Invalid Reset Link</h2>
                <p className="text-muted-foreground">
                  This password reset link is invalid or missing. Please request a new
                  one.
                </p>
                <Button asChild className="mt-2">
                  <Link to="/forgot-password">Request new reset link</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-svh flex-col items-center justify-center bg-muted p-6 md:p-10">
      <div className="w-full max-w-sm">
        <Card className="overflow-hidden p-0">
          <CardContent className="p-6 md:p-8">
            <form onSubmit={handleSubmit}>
              <FieldGroup>
                <div className="flex flex-col items-center gap-2 text-center">
                  <h1 className="text-2xl font-bold">Reset your password</h1>
                  <p className="text-balance text-muted-foreground">
                    Enter your new password below.
                  </p>
                </div>

                <Field>
                  <FieldLabel htmlFor="newPassword">
                    New Password <span className="text-red-500">*</span>
                  </FieldLabel>
                  <Input
                    id="newPassword"
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Enter new password"
                    autoComplete="new-password"
                    disabled={isPending}
                  />
                </Field>

                <Field>
                  <FieldLabel htmlFor="confirmPassword">
                    Confirm Password <span className="text-red-500">*</span>
                  </FieldLabel>
                  <Input
                    id="confirmPassword"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirm new password"
                    autoComplete="new-password"
                    disabled={isPending}
                  />
                </Field>

                <Button type="submit" disabled={isPending} className="w-full">
                  {isPending ? "Resetting..." : "Reset password"}
                </Button>

                <p className="text-center text-sm text-muted-foreground">
                  <Link to="/login" className="text-primary hover:underline">
                    Back to login
                  </Link>
                </p>
              </FieldGroup>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default ResetPassword;
