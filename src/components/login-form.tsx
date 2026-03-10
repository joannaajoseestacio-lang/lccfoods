import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { UserAuth } from "@/context/AuthContext";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import logo from "@/assets/logo.jpg";

function getAuthErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    const msg = error.message.toLowerCase();

    if (msg.includes("user-not-found") || msg.includes("no user record"))
      return "No account found with this email address.";
    if (
      msg.includes("wrong-password") ||
      msg.includes("invalid-credential") ||
      msg.includes("invalid credential")
    )
      return "Incorrect email or password. Please try again.";
    if (msg.includes("invalid-email"))
      return "Please enter a valid email address.";
    if (msg.includes("user-disabled"))
      return "This account has been disabled. Please contact support.";
    if (msg.includes("too-many-requests"))
      return "Too many failed attempts. Please wait a moment and try again.";
    if (msg.includes("network-request-failed") || msg.includes("network"))
      return "Network error. Please check your connection and try again.";
    if (msg.includes("email-not-verified") || msg.includes("email not verified"))
      return "Please verify your email address before logging in.";
    if (msg.includes("invalid login credentials"))
      return "Incorrect email or password. Please try again.";
    if (msg.includes("email not confirmed"))
      return "Please confirm your email address before logging in.";
    if (msg.includes("rate limit"))
      return "Too many attempts. Please wait a moment and try again.";

    if (error.message.length < 120) return error.message;
  }

  return "An unexpected error occurred. Please try again.";
}

export function LoginForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();
  const { signInUser, profile } = UserAuth();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      const { error } = await signInUser(email, password);
      if (error) {
        toast.error("Login failed", { description: error.message });
        return;
      }
    } catch (err) {
      const description = getAuthErrorMessage(err);
      toast.error("Login failed", { description });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (profile) {
      if (profile.role === "admin") {
        navigate("/admin");
      } else if (profile.role === "staff") {
        navigate("/dashboard");
      } else {
        navigate("/");
      }
    }
  }, [profile, navigate]);

  return (
    <div
      className={cn("w-full flex flex-col gap-5 px-4 sm:px-0 sm:w-[420px]", className)}
      {...props}
    >

      {/* Form Card */}
      <div className="bg-white border border-zinc-200 rounded-2xl shadow-sm p-6 space-y-4">
        <div className="text-center space-y-1 border-b pb-6">
          <div className="inline-flex mb-3">
            <img className="h-16 w-16 rounded-2xl" src={logo} alt="logo" />
          </div>
          <h1 className="text-2xl font-semibold tracking-tight">
            Welcome back!
          </h1>
          <p className="text-sm text-zinc-500">
            Sign in to continue to order foods.
          </p>
        </div>
        
        <form onSubmit={handleLogin} noValidate className="space-y-4">
          {/* Email */}
          <div className="space-y-1.5">
            <label htmlFor="email" className="text-sm font-medium text-zinc-700">
              Email address
            </label>
            <Input
              id="email"
              type="email"
              placeholder="you@example.com"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
              className="h-10 rounded-lg border-zinc-200 bg-zinc-50 focus:bg-white transition-colors text-sm w-full"
            />
          </div>

          {/* Password */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label htmlFor="password" className="text-sm font-medium text-zinc-700">
                Password
              </label>
              <a
                href="/forgot-password"
                className="text-xs text-zinc-400 hover:text-zinc-600 underline underline-offset-2 transition-colors"
                tabIndex={loading ? -1 : undefined}
              >
                Forgot password?
              </a>
            </div>
            <Input
              id="password"
              type="password"
              required
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
              className="h-10 rounded-lg border-zinc-200 bg-zinc-50 focus:bg-white transition-colors text-sm w-full"
            />
          </div>

          {/* Submit */}
          <Button
            type="submit"
            disabled={loading || !email || !password}
            className="w-full h-10 rounded-lg text-white text-sm font-medium transition-colors mt-1"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
                </svg>
                Signing in…
              </span>
            ) : (
              "Log In"
            )}
          </Button>
        </form>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-zinc-100" />
          </div>
          <div className="relative flex justify-center">
            <span className="bg-white px-3 text-xs text-zinc-400">or</span>
          </div>
        </div>

        <p className="text-center text-sm text-zinc-500">
          Don&apos;t have an account?{" "}
          <a
            href="/signup"
            className="font-medium text-zinc-900 underline underline-offset-2 hover:text-zinc-600 transition-colors"
          >
            Sign up
          </a>
        </p>
      </div>

      <p className="text-center text-xs text-zinc-400 px-4">
        By signing in, you agree to our{" "}
        <a href="#" className="underline underline-offset-2 hover:text-zinc-600 transition-colors">
          Terms of Service
        </a>{" "}
        and{" "}
        <a href="#" className="underline underline-offset-2 hover:text-zinc-600 transition-colors">
          Privacy Policy
        </a>
        .
      </p>
    </div>
  );
}