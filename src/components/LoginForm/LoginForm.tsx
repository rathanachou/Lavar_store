import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { toast } from "sonner";

import { cn } from "../../lib/utils";
import { Button } from "../ui/button";
import { Card, CardContent } from "../ui/card";
import { Field, FieldGroup, FieldLabel } from "../ui/field";
import { Input } from "../ui/input";
import { useAuthLogin, useResendVerification } from "../../hooks/useAuth";
import { useAuth } from "../../hooks/AuthContext";

export function LoginForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const [email,         setEmail]         = useState("");
  const [password,      setPassword]      = useState("");
  const [isLoading,     setIsLoading]     = useState(false);
  const [error,         setError]         = useState("");
  const [emailNotVerified, setEmailNotVerified] = useState(false);

  const navigate                = useNavigate();
  const { mutate: loginMutate } = useAuthLogin();
  const { mutate: resendMutate, isPending: isResending } = useResendVerification();
  const { login }               = useAuth();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setEmailNotVerified(false);

    if (!email || !password) {
      setError("Email and password are required");
      return;
    }

    setIsLoading(true);
    console.log("🟡 [3] Calling API...");

    loginMutate({ email, password }, {
      onSuccess: (res: any) => {
        console.log("✅ [4] API response:", res);
        console.log("✅ [5] res.data:", res?.data);
        console.log("✅ [6] res.token:", res?.token);

        const token: string | null =
          typeof res?.data === "string"        ? res.data       :
          typeof res?.data?.token === "string" ? res.data.token :
          typeof res?.token === "string"       ? res.token      :
          null;

        console.log("✅ [7] Extracted token:", token ? token.slice(0, 30) + "..." : "NULL");

        if (!token) {
          console.error("❌ [8] Token is null — check API response shape");
          setError("Login failed: token not received");
          setIsLoading(false);
          return;
        }

        console.log("🟡 [9] Calling login(token) to save to context + localStorage...");
        login(token);
        console.log("✅ [10] login() called — localStorage should have token now");
        console.log("✅ [11] localStorage token:", localStorage.getItem("token")?.slice(0, 30) + "...");

        try {
          const payload  = JSON.parse(atob(token.split(".")[1]));
          const userRole = payload?.role ?? null;
          console.log("✅ [12] JWT payload:", payload);
          console.log("✅ [13] Role:", userRole);

          setTimeout(() => {
            console.log("🟡 [14] Navigating to:", userRole === "admin" ? "/admin/dashboard" : "/admin/pos");
            if (userRole === "admin") {
              navigate("/admin/dashboard", { replace: true });
            } else {
              navigate("/admin/pos", { replace: true });
            }
          }, 100);

        } catch (err) {
          console.error("❌ [15] JWT decode failed:", err);
          setTimeout(() => navigate("/admin/pos", { replace: true }), 100);
        }

        setIsLoading(false);
      },

      onError: (err: any) => {
        const code = err?.response?.data?.code;
        const msg  = err?.response?.data?.message || "Invalid email or password";

        if (code === "EMAIL_NOT_VERIFIED") {
          setEmailNotVerified(true);
        }

        setError(msg);
        setIsLoading(false);
      },
    });
  };

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card className="overflow-hidden p-0">
        <CardContent className="grid p-0 md:grid-cols-2">

          <form className="p-6 md:p-8" onSubmit={handleSubmit}>
            <FieldGroup>
              <div className="flex flex-col items-center gap-2 text-center">
                <h1 className="text-2xl font-bold">Welcome back</h1>
                <p className="text-balance text-muted-foreground">Login to system</p>
              </div>

              <FieldGroup>
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
                    disabled={isLoading}
                  />
                </Field>

                <Field>
                  <div className="flex items-center justify-between">
                    <FieldLabel htmlFor="password">
                      Password <span className="text-red-500">*</span>
                    </FieldLabel>
                    <Link
                      to="/forgot-password"
                      className="text-sm text-primary hover:underline"
                    >
                      Forgot password?
                    </Link>
                  </div>
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    autoComplete="current-password"
                    disabled={isLoading}
                  />
                </Field>

                {error && <p className="text-red-500 text-sm">{error}</p>}

                {emailNotVerified && (
                  <div className="flex flex-col gap-2 mt-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      disabled={isResending}
                      onClick={() => {
                        resendMutate(email, {
                          onSuccess: (res: any) => {
                            setError("");
                            setEmailNotVerified(false);
                            toast.success("Verification email resent! Please check your inbox.");
                          },
                          onError: (err: any) => {
                            const msg = err?.response?.data?.message || "Failed to resend";
                            toast.error(msg);
                          },
                        });
                      }}
                    >
                      {isResending ? "Sending..." : "Resend verification email"}
                    </Button>
                    <p className="text-center text-xs text-muted-foreground">
                      <Link
                        to="/forgot-password"
                        className="text-primary hover:underline"
                      >
                        Forgot your password?
                      </Link>
                    </p>
                  </div>
                )}
              </FieldGroup>

              <Field>
                <Button type="submit" disabled={isLoading} className="w-full">
                  {isLoading ? "Loading..." : "Login"}
                </Button>
              </Field>
            </FieldGroup>
          </form>

          <div className="relative hidden bg-muted md:block">
            <img
              src="/logo.png"
              alt="Leva Store"
              className="absolute inset-0 h-full w-full object-cover dark:brightness-[0.2] dark:grayscale"
            />
          </div>

        </CardContent>
      </Card>
    </div>
  );
}