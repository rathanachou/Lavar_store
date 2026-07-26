import { useEffect, useState } from "react";
import { useSearchParams, useNavigate, Link } from "react-router-dom";
import { Card, CardContent } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Spinner } from "../components/ui/spinner";
import { verifyEmail } from "../service/auth.service";

type VerifyState = "loading" | "success" | "error";

function VerifyEmail() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [state, setState] = useState<VerifyState>("loading");
  const [message, setMessage] = useState("");

  useEffect(() => {
    const token = searchParams.get("token");

    if (!token) {
      setState("error");
      setMessage("Missing verification token. Please use the link from your email.");
      return;
    }

    verifyEmail(token)
      .then((res) => {
        setState("success");
        setMessage(res.message || "Email verified successfully!");
      })
      .catch((err) => {
        setState("error");
        setMessage(
          err?.response?.data?.message ||
            "Verification failed. The link may have expired."
        );
      });
  }, [searchParams]);

  return (
    <div className="flex min-h-svh flex-col items-center justify-center bg-muted p-6 md:p-10">
      <Card className="w-full max-w-sm">
        <CardContent className="p-6 text-center">
          {state === "loading" && (
            <div className="flex flex-col items-center gap-4 py-8">
              <Spinner className="h-8 w-8" />
              <p className="text-muted-foreground">Verifying your email...</p>
            </div>
          )}

          {state === "success" && (
            <div className="flex flex-col items-center gap-4 py-8">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-100 text-green-600">
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
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
              <h2 className="text-xl font-semibold">Email Verified!</h2>
              <p className="text-muted-foreground">{message}</p>
              <Button onClick={() => navigate("/login")} className="mt-2">
                Go to Login
              </Button>
            </div>
          )}

          {state === "error" && (
            <div className="flex flex-col items-center gap-4 py-8">
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
              <h2 className="text-xl font-semibold">Verification Failed</h2>
              <p className="text-muted-foreground">{message}</p>
              <div className="flex gap-3 mt-2">
                <Button variant="outline" onClick={() => navigate("/login")}>
                  Back to Login
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default VerifyEmail;
