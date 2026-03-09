import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { UserAuth } from "@/context/AuthContext";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import logo from "@/assets/logo.jpg";

export function SignupForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const { signupNewUser } = UserAuth();

  const [loading, setLoading] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const navigate = useNavigate();

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    if (password.length < 8) {
      toast.error("Password must be at least 8 characters");
      return;
    }

    try {
      setLoading(true);
      const { success, error } = await signupNewUser(email, password, name, "student");

      if (error) {
        toast.error("Signup failed", { description: error.message });
        return;
      }
      if (success) {
        navigate("/");
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className={cn(
        "w-full flex flex-col gap-5 px-4 sm:px-0 sm:w-[420px]",
        className
      )}
      {...props}
    >
      <div className="text-center space-y-1">
        <div className="inline-flex mb-3">
          <img className="h-16 w-16 rounded-2xl" src={logo} alt="logo" />
        </div>
        <h1 className="text-2xl font-semibold tracking-tight">
          Create your account
        </h1>
        <p className="text-sm text-zinc-500">
          Sign in to continue to order foods.
        </p>
      </div>

      {/* Form Card */}
      <div className="bg-white border border-zinc-200 rounded-2xl shadow-sm p-6 space-y-4">
        <form onSubmit={handleSignup} className="space-y-4">
          {/* Full Name */}
          <div className="space-y-1.5">
            <label htmlFor="name" className="text-sm font-medium">
              Full Name
            </label>
            <Input
              id="name"
              type="text"
              placeholder="John Doe"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="h-10 rounded-lg border-zinc-200 bg-zinc-50 focus:bg-white transition-colors text-sm"
            />
          </div>

          {/* Email */}
          <div className="space-y-1.5">
            <label htmlFor="email" className="text-sm font-medium">
              Email address
            </label>
            <Input
              id="email"
              type="email"
              placeholder="you@example.com"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="h-10 rounded-lg border-zinc-200 bg-zinc-50 focus:bg-white transition-colors text-sm"
            />
          </div>

          {/* Password row — stacked on mobile, side-by-side on sm+ */}
          <div className="grid grid-cols-1 gap-3">
            <div className="space-y-1.5">
              <label htmlFor="password" className="text-sm font-medium">
                Password
              </label>
              <Input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="h-10 rounded-lg border-zinc-200 bg-zinc-50 focus:bg-white transition-colors text-sm"
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="confirm-password" className="text-sm font-medium">
                Confirm Password
              </label>
              <Input
                id="confirm-password"
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="h-10 rounded-lg border-zinc-200 bg-zinc-50 focus:bg-white transition-colors text-sm"
              />
            </div>
          </div>

          <p className="text-xs text-zinc-400">
            Password must be at least 8 characters long.
          </p>

          {/* Submit */}
          <Button
            type="submit"
            disabled={loading}
            className="w-full h-10 rounded-lg text-white text-sm font-medium transition-colors mt-1"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
                </svg>
                Creating account…
              </span>
            ) : (
              "Create Account"
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
          Already have an account?{" "}
          <a
            href="/login"
            className="font-medium text-zinc-900 underline underline-offset-2 hover:text-zinc-600 transition-colors"
          >
            Sign in
          </a>
        </p>
      </div>

      {/* Footer */}
      <p className="text-center text-xs text-zinc-400 px-4">
        By creating an account, you agree to our{" "}
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
