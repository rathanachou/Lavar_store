import { useState, useMemo } from "react";
import type { IUser } from "@/service/user.service";
import type { RegisterPayload } from "@/service/auth.service";
import {
  Users as UsersIcon, UserPlus, Trash2, Loader2,
  Search, ShieldCheck, ShoppingCart, X, Eye, EyeOff, KeyRound,
} from "lucide-react";
import { toast } from "sonner";
import { useDeleteUser, useRegisterUser, useResetPassword, useUsers } from "@/hooks/useUser";
import { getCurrentUser } from "@/utils/auth";

// ─── Role badge ───────────────────────────────────────────────
function RoleBadge({ role }: { role: string }) {
  const isAdmin = role === "admin";
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold
      ${isAdmin ? "bg-indigo-100 text-indigo-700" : "bg-green-100 text-green-700"}`}>
      {isAdmin ? <ShieldCheck className="h-3 w-3" /> : <ShoppingCart className="h-3 w-3" />}
      {role}
    </span>
  );
}

// ─── Avatar ───────────────────────────────────────────────────
function UserAvatar({ firstName, lastName }: { firstName: string; lastName: string }) {
  const initials = `${firstName?.[0] ?? ""}${lastName?.[0] ?? ""}`.toUpperCase();
  const colors   = ["bg-indigo-500","bg-violet-500","bg-pink-500","bg-amber-500","bg-teal-500","bg-cyan-500"];
  const color    = colors[(firstName.charCodeAt(0) ?? 0) % colors.length];
  return (
    <div className={`w-9 h-9 rounded-full ${color} flex items-center justify-center text-white text-sm font-bold flex-shrink-0`}>
      {initials || "?"}
    </div>
  );
}

// ─── Reset Password Modal ─────────────────────────────────────
function ResetPasswordModal({ user, onClose }: { user: IUser; onClose: () => void }) {
  const { mutate: reset, isPending } = useResetPassword();
  const [newPassword, setNewPassword] = useState("");
  const [show, setShow]               = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }
    reset({ id: user.id, newPassword }, { onSuccess: onClose });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm mx-4 overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <div className="flex items-center gap-2">
            <KeyRound className="h-5 w-5 text-indigo-600" />
            <div>
              <h2 className="text-sm font-semibold text-gray-800">Reset Password</h2>
              <p className="text-xs text-gray-400">{user.firstName} {user.lastName}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100">
            <X className="h-4 w-4 text-gray-500" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-medium text-gray-600">New Password</label>
            <div className="relative">
              <input
                type={show ? "text" : "password"}
                value={newPassword}
                onChange={e => setNewPassword(e.target.value)}
                placeholder="Min. 6 characters"
                className="w-full border border-gray-200 rounded-lg px-3 py-2 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
              />
              <button type="button" onClick={() => setShow(s => !s)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>
          <div className="flex gap-3 pt-1">
            <button type="button" onClick={onClose}
              className="flex-1 border border-gray-200 rounded-lg py-2 text-sm text-gray-600 hover:bg-gray-50">
              Cancel
            </button>
            <button type="submit" disabled={isPending}
              className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg py-2 text-sm font-medium flex items-center justify-center gap-2 disabled:opacity-60">
              {isPending
                ? <><Loader2 className="h-4 w-4 animate-spin" /> Resetting...</>
                : <><KeyRound className="h-4 w-4" /> Reset</>}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── Register Modal ───────────────────────────────────────────
function RegisterModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { mutate: register, isPending } = useRegisterUser();
  const [show, setShow] = useState(false);
  const [form, setForm] = useState<RegisterPayload>({
    firstName: "", lastName: "", email: "", password: "", gender: "male", role: "cashier",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.firstName || !form.lastName || !form.email || !form.password) {
      toast.error("Please fill in all fields");
      return;
    }
    register(form, {
      onSuccess: () => {
        onClose();
        setForm({ firstName: "", lastName: "", email: "", password: "", gender: "male", role: "cashier" });
      },
    });
  };

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <div className="flex items-center gap-2">
            <UserPlus className="h-5 w-5 text-indigo-600" />
            <h2 className="text-base font-semibold text-gray-800">Register New User</h2>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100">
            <X className="h-4 w-4 text-gray-500" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-medium text-gray-600">First Name</label>
              <input name="firstName" value={form.firstName} onChange={handleChange} placeholder="Rathana"
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400" />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-gray-600">Last Name</label>
              <input name="lastName" value={form.lastName} onChange={handleChange} placeholder="Chou"
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400" />
            </div>
          </div>
          <div className="space-y-1">
            <label className="text-xs font-medium text-gray-600">Email</label>
            <input name="email" type="email" value={form.email} onChange={handleChange} placeholder="john@example.com"
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400" />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-medium text-gray-600">Password</label>
            <div className="relative">
              <input name="password" type={show ? "text" : "password"} value={form.password}
                onChange={handleChange} placeholder="••••••••"
                className="w-full border border-gray-200 rounded-lg px-3 py-2 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400" />
              <button type="button" onClick={() => setShow(s => !s)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-medium text-gray-600">Gender</label>
              <select name="gender" value={form.gender} onChange={handleChange}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 bg-white">
                <option value="male">Male</option>
                <option value="female">Female</option>
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-gray-600">Role</label>
              <select name="role" value={form.role} onChange={handleChange}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 bg-white">
                <option value="cashier">Cashier</option>
                <option value="admin">Admin</option>
              </select>
            </div>
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose}
              className="flex-1 border border-gray-200 rounded-lg py-2 text-sm text-gray-600 hover:bg-gray-50">
              Cancel
            </button>
            <button type="submit" disabled={isPending}
              className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg py-2 text-sm font-medium flex items-center justify-center gap-2 disabled:opacity-60">
              {isPending
                ? <><Loader2 className="h-4 w-4 animate-spin" /> Registering...</>
                : <><UserPlus className="h-4 w-4" /> Register</>}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── Delete Modal ─────────────────────────────────────────────
function DeleteModal({ user, onConfirm, onClose, isPending }: {
  user: IUser;
  onConfirm: () => void;
  onClose: () => void;
  isPending: boolean;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm mx-4 p-6 space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
            <Trash2 className="h-5 w-5 text-red-600" />
          </div>
          <div>
            <h2 className="text-base font-semibold text-gray-800">Delete User</h2>
            <p className="text-xs text-gray-500 mt-0.5">This action cannot be undone.</p>
          </div>
        </div>
        <p className="text-sm text-gray-600">
          Are you sure you want to delete{" "}
          <span className="font-semibold text-gray-800">{user.firstName} {user.lastName}</span>?
        </p>
        <div className="flex gap-3">
          <button onClick={onClose}
            className="flex-1 border border-gray-200 rounded-lg py-2 text-sm text-gray-600 hover:bg-gray-50">
            Cancel
          </button>
          <button onClick={onConfirm} disabled={isPending}
            className="flex-1 bg-red-600 hover:bg-red-700 text-white rounded-lg py-2 text-sm font-medium flex items-center justify-center gap-2 disabled:opacity-60">
            {isPending
              ? <><Loader2 className="h-4 w-4 animate-spin" /> Deleting...</>
              : <><Trash2 className="h-4 w-4" /> Delete</>}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Main Users Page ──────────────────────────────────────────
export default function UsersPage() {
  const { data: users = [], isLoading, isError } = useUsers();
  const { mutate: deleteUser, isPending: isDeleting } = useDeleteUser();

  const [search, setSearch]             = useState<string>("");
  const [registerOpen, setRegisterOpen] = useState<boolean>(false);
  const [deleteTarget, setDeleteTarget] = useState<IUser | null>(null);
  const [resetTarget, setResetTarget]   = useState<IUser | null>(null);

  // ── Identify the currently logged-in user ──────────────────
  const currentUser = useMemo(() => getCurrentUser(), []);
  const currentUserEmail: string | undefined = currentUser?.email ?? currentUser?.Email;

  // ── typed explicitly to avoid implicit any ──────────────────
  const filtered: IUser[] = (users as IUser[]).filter((u: IUser) =>
    `${u.firstName} ${u.lastName} ${u.email} ${u.role}`
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  return (
    <div className="p-6 space-y-6">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-2">
          <UsersIcon className="h-6 w-6 text-indigo-600" />
          <div>
            <h1 className="text-xl font-bold text-gray-800">Users</h1>
            <p className="text-xs text-gray-500">{users.length} total accounts</p>
          </div>
        </div>
        <button onClick={() => setRegisterOpen(true)}
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
          <UserPlus className="h-4 w-4" /> Register User
        </button>
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
        <input
          value={search}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearch(e.target.value)}
          placeholder="Search by name, email, role..."
          className="w-full border border-gray-200 rounded-lg pl-9 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
        />
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center py-20 gap-2 text-gray-400">
            <Loader2 className="h-5 w-5 animate-spin" />
            <span className="text-sm">Loading users...</span>
          </div>
        ) : isError ? (
          <div className="flex items-center justify-center py-20 text-red-400 text-sm">
            Failed to load users. Please try again.
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 gap-2 text-gray-400">
            <UsersIcon className="h-8 w-8 opacity-30" />
            <p className="text-sm">No users found.</p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                {["#", "User", "Email", "Gender", "Role", "Joined", "Action"].map((h: string) => (
                  <th key={h} className={`px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide ${h === "Action" ? "text-right" : "text-left"}`}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.map((user: IUser, idx: number) => {
                const isMe = currentUserEmail != null && user.email.toLowerCase() === currentUserEmail.toLowerCase();
                return (
                <tr key={user.id} className={`transition-colors ${isMe ? "bg-emerald-50/80" : "hover:bg-gray-50/60"}`}>
                  <td className="px-4 py-3 text-gray-400 text-xs">{idx + 1}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <UserAvatar firstName={user.firstName} lastName={user.lastName} />
                        {isMe && (
                          <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-white flex items-center justify-center">
                            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-white" />
                          </div>
                        )}
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-medium text-gray-800">
                          {user.firstName} {user.lastName}
                        </span>
                        {isMe && (
                          <span className="inline-flex items-center px-1.5 py-0.5 rounded-md text-[10px] font-semibold bg-emerald-100 text-emerald-700 leading-none">
                            You
                          </span>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-gray-500">{user.email}</td>
                  <td className="px-4 py-3 text-gray-500 capitalize">{user.gender}</td>
                  <td className="px-4 py-3"><RoleBadge role={user.role} /></td>
                  <td className="px-4 py-3 text-gray-400 text-xs">
                    {new Date(user.createdAt).toLocaleDateString([], {
                      year: "numeric", month: "short", day: "numeric",
                    })}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => setResetTarget(user)}
                        className="inline-flex items-center gap-1 text-xs text-indigo-500 hover:text-indigo-700 hover:bg-indigo-50 px-2.5 py-1.5 rounded-lg transition-colors"
                      >
                        <KeyRound className="h-3.5 w-3.5" /> Reset
                      </button>
                      <button
                        onClick={() => setDeleteTarget(user)}
                        className="inline-flex items-center gap-1 text-xs text-red-500 hover:text-red-700 hover:bg-red-50 px-2.5 py-1.5 rounded-lg transition-colors"
                      >
                        <Trash2 className="h-3.5 w-3.5" /> Delete
                      </button>
                    </div>
                  </td>
                </tr>);
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* Modals */}
      <RegisterModal open={registerOpen} onClose={() => setRegisterOpen(false)} />

      {resetTarget && (
        <ResetPasswordModal
          user={resetTarget}
          onClose={() => setResetTarget(null)}
        />
      )}

      {deleteTarget && (
        <DeleteModal
          user={deleteTarget}
          isPending={isDeleting}
          onClose={() => setDeleteTarget(null)}
          onConfirm={() =>
            deleteUser(deleteTarget.id, {
              onSuccess: () => setDeleteTarget(null),
            })
          }
        />
      )}
    </div>
  );
}