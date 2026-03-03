import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { UserAuth } from "@/context/AuthContext";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

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
    if (
      msg.includes("email-not-verified") ||
      msg.includes("email not verified")
    )
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
      if(error) {
        console.log(error)
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
      if (profile.role === "staff") {
        navigate("/dashboard");
      } else if (profile.role === "student") {
        navigate("/");
      }
    }
  }, [profile, navigate]);

  return (
    <div
      className={cn(
        "w-full max-w-sm mx-auto px-4 sm:px-0 flex flex-col gap-6",
        className
      )}
      {...props}
    >
      <Card className="w-full shadow-md">
        <CardHeader className="space-y-1 pb-4">
          <CardTitle className="text-xl sm:text-2xl">
            Login to your account
          </CardTitle>
          <CardDescription className="text-sm">
            Enter your email below to login to your account
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleLogin} noValidate>
            <FieldGroup className="space-y-4">
              <Field>
                <FieldLabel htmlFor="email">Email</FieldLabel>
                <Input
                  id="email"
                  type="email"
                  placeholder="atejo@gmail.com"
                  required
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={loading}
                  className="w-full"
                />
              </Field>

              <Field>
                <div className="flex items-center justify-between">
                  <FieldLabel htmlFor="password">Password</FieldLabel>
                  <a
                    href="/forgot-password"
                    className="text-sm text-muted-foreground underline-offset-4 hover:underline hover:text-foreground transition-colors"
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
                  className="w-full"
                />
              </Field>

              <Field className="pt-1">
                <Button
                  type="submit"
                  disabled={loading || !email || !password}
                  className="w-full"
                >
                  {loading ? "Logging in…" : "Log In"}
                </Button>
                <FieldDescription className="text-center text-sm text-muted-foreground">
                  Don&apos;t have an account?{" "}
                  <a
                    href="/signup"
                    className="text-foreground underline underline-offset-4 hover:text-primary transition-colors"
                  >
                    Sign up
                  </a>
                </FieldDescription>
              </Field>
            </FieldGroup>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}