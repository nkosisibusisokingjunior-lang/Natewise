import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router";
import { useAuth } from "@/react-app/auth/ApiAuth";
import { GlassCard } from "@/react-app/components/ui/GlassCard";
import { GlassButton } from "@/react-app/components/ui/GlassButton";
import { LoadingSpinner } from "@/react-app/components/ui/LoadingSpinner";

export default function Register() {
  const { register, isPending, user } = useAuth();
  const navigate = useNavigate();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (user) navigate("/dashboard");
  }, [user, navigate]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await register({ email, password, firstName, lastName });
      navigate("/dashboard");
    } catch (err: any) {
      setError(err?.response?.data?.error || "Registration failed.");
    } finally {
      setSubmitting(false);
    }
  };

  if (isPending) return <LoadingSpinner fullScreen message="Loading..." />;

  return (
    <div className="min-h-screen bg-gradient-to-br from-surface via-surface-subtle to-surface text-slate-50 flex items-center justify-center px-4">
      <GlassCard className="w-full max-w-md p-6 space-y-4">
        <div>
          <h1 className="text-2xl font-semibold text-slate-50">Create account</h1>
          <p className="text-sm text-slate-300">Join NateWise and start learning.</p>
        </div>
        <form onSubmit={onSubmit} className="space-y-3">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <label className="text-xs text-slate-300">First name</label>
              <input
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className="mt-1 w-full rounded-lg bg-white/10 px-3 py-2 text-sm text-white outline-none focus:ring-2 focus:ring-brand-soft"
              />
            </div>
            <div>
              <label className="text-xs text-slate-300">Last name</label>
              <input
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className="mt-1 w-full rounded-lg bg-white/10 px-3 py-2 text-sm text-white outline-none focus:ring-2 focus:ring-brand-soft"
              />
            </div>
          </div>
          <div>
            <label className="text-xs text-slate-300">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="mt-1 w-full rounded-lg bg-white/10 px-3 py-2 text-sm text-white outline-none focus:ring-2 focus:ring-brand-soft"
            />
          </div>
          <div>
            <label className="text-xs text-slate-300">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="mt-1 w-full rounded-lg bg-white/10 px-3 py-2 text-sm text-white outline-none focus:ring-2 focus:ring-brand-soft"
            />
          </div>
          {error && (
            <div className="rounded-lg border border-amber-400/40 bg-amber-500/10 px-3 py-2 text-sm text-amber-100">
              {error}
            </div>
          )}
          <GlassButton type="submit" className="w-full" disabled={submitting}>
            {submitting ? "Creating..." : "Create account"}
          </GlassButton>
        </form>
        <p className="text-xs text-slate-400">
          Already have an account?{" "}
          <Link className="text-brand-soft hover:underline" to="/login">
            Sign in
          </Link>
        </p>
      </GlassCard>
    </div>
  );
}
