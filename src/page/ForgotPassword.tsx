import { useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "sonner";

import { Button } from "../components/ui/button";
import { Card, CardContent } from "../components/ui/card";
import { Field, FieldGroup, FieldLabel } from "../components/ui/field";
import { Input } from "../components/ui/input";
import { useForgotPassword } from "../hooks/useAuth";

function ForgotPassword() {
  const [email, setEmail] = useState("");
  const { mutate: forgotMutate, isPending } = useForgotPassword();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!email) {
      toast.error("Please enter your email address");
      return;
    }

    forgotMutate(
      { email },
      {
        onSuccess: (res: any) => {
          toast.success(
            res?.message ||
              "If that email is registered, you will receive a password reset link shortly."
          );
          setEmail("");
        },
        onError: (err: any) => {
          const msg =
            err?.response?.data?.message || "Something went wrong. Please try again.";
          toast.error(msg);
        },
      }
    );
  };

  return (
    <div className="flex min-h-svh flex-col items-center justify-center bg-muted p-6 md:p-10">
      <div className="w-full max-w-sm">
        <Card className="overflow-hidden p-0">
          <CardContent className="p-6 md:p-8">
            <form onSubmit={handleSubmit}>
              <FieldGroup>
                <div className="flex flex-col items-center gap-2 text-center">
                  <h1 className="text-2xl font-bold">Forgot password?</h1>
                  <p className="text-balance text-muted-foreground">
                    Enter your email address and we'll send you a link to reset your
                    password.
                  </p>
                </div>

                <Field>
                  <FieldLabel htmlFor="email">
                    Email <span className="text-red-500">*</span>
                  </FieldLabel>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email"
                    autoComplete="email"
                    disabled={isPending}
                  />
                </Field>

                <Button type="submit" disabled={isPending} className="w-full">
                  {isPending ? "Sending..." : "Send reset link"}
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

export default ForgotPassword;
