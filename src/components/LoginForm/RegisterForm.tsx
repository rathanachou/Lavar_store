import { useState } from "react";
import { toast } from "sonner";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "../ui/field";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { useAuthRegister } from "../../hooks/useAuth";
import { isAdmin } from "../../utils/auth";
import type { RegisterPayload } from "@/service/auth.service";

interface RegisterFormData {
  firstName:       string;
  lastName:        string;
  email:           string;
  password:        string;
  confirmPassword: string;
  gender:          string;
  role:            string;
}

interface Props {
  onSuccess?: () => void;
}

const RegisterForm = ({ onSuccess }: Props) => {
  const [showPassword, setShowPassword] = useState(false);

  const currentUserIsAdmin = isAdmin();

  const [form, setForm] = useState<RegisterFormData>({
    firstName:       "",
    lastName:        "",
    email:           "",
    password:        "",
    confirmPassword: "",
    gender:          "",
    role:            "cashier", // default always cashier
  });

  const [errors, setErrors] = useState<
    Partial<Record<keyof RegisterFormData, { message: string }>>
  >({});

  const { mutate: registerMutate, isPending } = useAuthRegister();

  // ── Validation ───────────────────────────────────────────────
  const validate = (): boolean => {
    const newErrors: Partial<
      Record<keyof RegisterFormData, { message: string }>
    > = {};

    if (!form.firstName.trim())
      newErrors.firstName = { message: "First name is required" };

    if (!form.lastName.trim())
      newErrors.lastName = { message: "Last name is required" };

    if (!form.email.trim())
      newErrors.email = { message: "Email is required" };
    else if (!/\S+@\S+\.\S+/.test(form.email))
      newErrors.email = { message: "Invalid email format" };

    if (!form.password)
      newErrors.password = { message: "Password is required" };
    else if (form.password.length < 6)
      newErrors.password = { message: "Min. 6 characters" };

    if (!form.confirmPassword)
      newErrors.confirmPassword = { message: "Please confirm password" };
    else if (form.password !== form.confirmPassword)
      newErrors.confirmPassword = { message: "Passwords do not match" };

    if (!form.gender)
      newErrors.gender = { message: "Gender is required" };

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // ── Handle Input Change ──────────────────────────────────────
  const handleChange = (name: string, value: string) => {
    setForm((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: undefined }));
  };

  // ── Handle Submit ────────────────────────────────────────────
  const handleSubmit = () => {
    if (!validate()) return;

    const { confirmPassword, ...payload } = form;

    const finalPayload: RegisterPayload = {
      ...payload,
      // Admin can choose role, cashier is always locked to "cashier"
      role: currentUserIsAdmin ? payload.role : "cashier",
    };

    registerMutate(finalPayload, {
      onSuccess: () => {
        toast.success("Account created! Please check your email to verify.");
        setForm({
          firstName:       "",
          lastName:        "",
          email:           "",
          password:        "",
          confirmPassword: "",
          gender:          "",
          role:            "cashier",
        });
        setErrors({});
        onSuccess?.();
      },
      onError: (error: any) => {
        const msg =
          error?.response?.data?.message || "Failed to create account";
        toast.error(msg);
      },
    });
  };

  // ── Render ───────────────────────────────────────────────────
  return (
    <div>
      <FieldGroup>

        {/* Name Row */}
        <div className="grid grid-cols-2 gap-4">
          <Field data-invalid={!!errors.firstName}>
            <FieldLabel htmlFor="firstName">
              First Name <span className="text-red-500">*</span>
            </FieldLabel>
            <Input
              id="firstName"
              value={form.firstName}
              onChange={(e) => handleChange("firstName", e.target.value)}
              placeholder="Rathana"
              autoComplete="off"
            />
            {errors.firstName && <FieldError errors={[errors.firstName]} />}
          </Field>

          <Field data-invalid={!!errors.lastName}>
            <FieldLabel htmlFor="lastName">
              Last Name <span className="text-red-500">*</span>
            </FieldLabel>
            <Input
              id="lastName"
              value={form.lastName}
              onChange={(e) => handleChange("lastName", e.target.value)}
              placeholder="Chou"
              autoComplete="off"
            />
            {errors.lastName && <FieldError errors={[errors.lastName]} />}
          </Field>
        </div>

        {/* Email */}
        <Field data-invalid={!!errors.email}>
          <FieldLabel htmlFor="reg-email">
            Email <span className="text-red-500">*</span>
          </FieldLabel>
          <Input
            id="reg-email"
            type="email"
            value={form.email}
            onChange={(e) => handleChange("email", e.target.value)}
            placeholder="example@email.com"
            autoComplete="off"
          />
          {errors.email && <FieldError errors={[errors.email]} />}
        </Field>

        {/* Password */}
        <Field data-invalid={!!errors.password}>
          <FieldLabel htmlFor="reg-password">
            Password <span className="text-red-500">*</span>
          </FieldLabel>
          <div className="relative">
            <Input
              id="reg-password"
              type={showPassword ? "text" : "password"}
              value={form.password}
              onChange={(e) => handleChange("password", e.target.value)}
              placeholder="Min. 6 characters"
              autoComplete="off"
              className="pr-16"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              {showPassword ? "Hide" : "Show"}
            </button>
          </div>
          {errors.password && <FieldError errors={[errors.password]} />}
        </Field>

        {/* Confirm Password */}
        <Field data-invalid={!!errors.confirmPassword}>
          <FieldLabel htmlFor="reg-confirm">
            Confirm Password <span className="text-red-500">*</span>
          </FieldLabel>
          <Input
            id="reg-confirm"
            type={showPassword ? "text" : "password"}
            value={form.confirmPassword}
            onChange={(e) => handleChange("confirmPassword", e.target.value)}
            placeholder="Repeat password"
            autoComplete="off"
          />
          {errors.confirmPassword && (
            <FieldError errors={[errors.confirmPassword]} />
          )}
        </Field>

        {/* Gender + Role */}
        <div
          className={`grid gap-4 ${
            currentUserIsAdmin ? "grid-cols-2" : "grid-cols-1"
          }`}
        >
          <Field data-invalid={!!errors.gender}>
            <FieldLabel>
              Gender <span className="text-red-500">*</span>
            </FieldLabel>
            <Select
              value={form.gender}
              onValueChange={(val) => handleChange("gender", val)}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select gender" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="male">Male</SelectItem>
                <SelectItem value="female">Female</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
            {errors.gender && <FieldError errors={[errors.gender]} />}
          </Field>

          {/* Role — visible to admin only */}
          {currentUserIsAdmin && (
            <Field>
              <FieldLabel>Role</FieldLabel>
              <Select
                value={form.role}
                onValueChange={(val) => handleChange("role", val)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="cashier">Cashier</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                </SelectContent>
              </Select>
            </Field>
          )}
        </div>

        {/* Admin warning when assigning admin role */}
        {currentUserIsAdmin && form.role === "admin" && (
          <div className="rounded-lg border border-yellow-500/30 bg-yellow-500/10 p-3 text-sm text-yellow-600 dark:text-yellow-400 flex gap-2">
            <span>⚠️</span>
            <p className="leading-relaxed">
              <strong>Admin role</strong> grants full system access including
              user management and all reports. Assign with caution.
            </p>
          </div>
        )}

        {/* Submit */}
        <Button
          type="button"
          disabled={isPending}
          className="w-full"
          onClick={handleSubmit}
        >
          {isPending ? "Creating account..." : "Create Account"}
        </Button>

      </FieldGroup>
    </div>
  );
};

export default RegisterForm;