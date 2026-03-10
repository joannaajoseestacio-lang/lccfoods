import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { UserAuth } from "@/context/AuthContext";
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import logo from "@/assets/logo.jpg";
import { supabase } from "../../SupabaseClient";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export function SignupForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const { signupNewUser, profile } = UserAuth();

  const [loading, setLoading] = useState(false);
  const [fetchingStudent, setFetchingStudent] = useState(false);
  const [studentFound, setStudentFound] = useState(false);

  const [firstname, setFirstName] = useState("");
  const [lastname, setLastName] = useState("");
  const [idNo, setIDNo] = useState("");
  const [accountType, setAccountType] = useState("student");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [shop_name, setShopName] = useState("");

  const navigate = useNavigate();

  // Reset student-fetched state when account type changes
  useEffect(() => {
    setFirstName("");
    setLastName("");
    setEmail("");
    setIDNo("");
    setStudentFound(false);
  }, [accountType]);

  // Fetch student data when ID number is entered and account type is student
  useEffect(() => {
    if (accountType !== "student" || idNo.length < 4) {
      if (accountType === "student" && idNo.length === 0) {
        setStudentFound(false);
        setFirstName("");
        setLastName("");
        setEmail("");
      }
      return;
    }

    const timeout = setTimeout(async () => {
      try {
        setFetchingStudent(true);
        const { data, error } = await supabase
          .from("students")
          .select("firstname, lastname, email")
          .eq("student_number", idNo)
          .single();

        if (error || !data) {
          setStudentFound(false);
          setFirstName("");
          setLastName("");
          setEmail("");
          return;
        }

        setFirstName(data.firstname ?? "");
        setLastName(data.lastname ?? "");
        setEmail(data.email ?? "");
        setStudentFound(true);
        toast.success("Student record found");
      } catch (err) {
        console.error(err);
        setStudentFound(false);
      } finally {
        setFetchingStudent(false);
      }
    }, 600);

    return () => clearTimeout(timeout);
  }, [idNo, accountType]);

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
      const { success, error } = await signupNewUser({
        email,
        password,
        role: accountType,
        firstname,
        lastname,
        id_number: idNo,
        shop_name,
      });

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

  // Student fields are always read-only — filled automatically via student ID lookup
  const isStudent = accountType === "student";

  return (
    <div
      className={cn(
        "w-full flex flex-col gap-5 px-4 sm:px-0 sm:w-[420px]",
        className,
      )}
      {...props}
    >
      {/* Form Card */}
      <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-6 space-y-4">
        <div className="text-center space-y-1 border-b pb-6">
          <div className="inline-flex mb-3">
            <img className="h-16 w-16 rounded-2xl" src={logo} alt="logo" />
          </div>
          <h1 className="text-2xl font-semibold tracking-tight">
            Create your account
          </h1>
          <p className="text-sm text-gray-500">
            Create account to continue ordering foods.
          </p>
        </div>
        <form onSubmit={handleSignup} className="space-y-4">
          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Account Type</label>
              <Select
                value={accountType}
                onValueChange={setAccountType}
                required
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select account type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectItem value="student">Student</SelectItem>
                    <SelectItem value="teacher">Teacher</SelectItem>
                    <SelectItem value="staff">Staff</SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>
            {accountType === "staff" ? (
              <div className="space-y-1.5">
                <label htmlFor="shop_name" className="text-sm font-medium">
                  Shop Name
                </label>
                <Input
                  id="shop_name"
                  type="text"
                  placeholder="Kravings"
                  required
                  value={shop_name}
                  onChange={(e) => setShopName(e.target.value)}
                  className="h-10 rounded-lg border-gray-200 bg-gray-50 focus:bg-white transition-colors text-sm"
                />
              </div>
            ) : (
              <div className="space-y-1.5">
                <label htmlFor="idNo" className="text-sm font-medium">
                  {accountType === "student" ? "Student" : "Teacher"} ID No.
                </label>
                <div className="relative">
                  <Input
                    id="idNo"
                    type="text"
                    placeholder="20250327"
                    required
                    value={idNo}
                    onChange={(e) => setIDNo(e.target.value)}
                    className="h-10 rounded-lg border-gray-200 bg-gray-50 focus:bg-white transition-colors text-sm pr-8"
                  />
                  {accountType === "student" && fetchingStudent && (
                    <span className="absolute right-2 top-1/2 -translate-y-1/2">
                      <svg
                        className="animate-spin h-4 w-4 text-gray-400"
                        viewBox="0 0 24 24"
                        fill="none"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        />
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8v8H4z"
                        />
                      </svg>
                    </span>
                  )}
                  {accountType === "student" && studentFound && !fetchingStudent && (
                    <span className="absolute right-2 top-1/2 -translate-y-1/2 text-green-500 text-xs">✓</span>
                  )}
                </div>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            <div className="space-y-1.5">
              <label htmlFor="firstname" className="text-sm font-medium">
                First Name
              </label>
              <Input
                id="firstname"
                type="text"
                placeholder="Joanna Marie"
                required
                value={firstname}
                onChange={(e) => setFirstName(e.target.value)}
                disabled={isStudent}
                className={cn(
                  "h-10 rounded-lg border-gray-200 bg-gray-50 focus:bg-white transition-colors text-sm",
                  isStudent && "opacity-60 cursor-not-allowed bg-gray-100"
                )}
              />
            </div>
            <div className="space-y-1.5">
              <label htmlFor="lastname" className="text-sm font-medium">
                Last Name
              </label>
              <Input
                id="lastname"
                type="text"
                placeholder="Estacio"
                required
                value={lastname}
                onChange={(e) => setLastName(e.target.value)}
                disabled={isStudent}
                className={cn(
                  "h-10 rounded-lg border-gray-200 bg-gray-50 focus:bg-white transition-colors text-sm",
                  isStudent && "opacity-60 cursor-not-allowed bg-gray-100"
                )}
              />
            </div>
          </div>

          {/* Email */}
          <div className="space-y-1.5">
            <label htmlFor="email" className="text-sm font-medium">
              Email address
            </label>
            <Input
              id="email"
              type="email"
              placeholder="joannaajoseestacio@gmail.com"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isStudent}
              className={cn(
                "h-10 rounded-lg border-gray-200 bg-gray-50 focus:bg-white transition-colors text-sm",
                isStudent && "opacity-60 cursor-not-allowed bg-gray-100"
              )}
            />
          </div>

          {/* Passwords */}
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
                className="h-10 rounded-lg border-gray-200 bg-gray-50 focus:bg-white transition-colors text-sm"
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
                className="h-10 rounded-lg border-gray-200 bg-gray-50 focus:bg-white transition-colors text-sm"
              />
            </div>
          </div>

          <p className="text-xs text-gray-400">
            Password must be at least 8 characters long.
          </p>

          {/* Submit */}
          <Button
            type="submit"
            disabled={loading || fetchingStudent || (isStudent && !studentFound)}
            className="w-full h-10 rounded-lg text-white text-sm font-medium transition-colors mt-1"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <svg
                  className="animate-spin h-4 w-4"
                  viewBox="0 0 24 24"
                  fill="none"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8v8H4z"
                  />
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
            <span className="w-full border-t border-gray-100" />
          </div>
          <div className="relative flex justify-center">
            <span className="bg-white px-3 text-xs text-gray-400">or</span>
          </div>
        </div>

        <p className="text-center text-sm text-gray-500">
          Already have an account?{" "}
          <Link
            to="/login"
            className="font-medium text-gray-900 underline underline-offset-2 hover:text-gray-600 transition-colors"
          >
            Sign in
          </Link>
        </p>
      </div>

      {/* Footer */}
      <p className="text-center text-xs text-gray-400 px-4">
        By creating an account, you agree to our{" "}
        <a
          href="#"
          className="underline underline-offset-2 hover:text-gray-600 transition-colors"
        >
          Terms of Service
        </a>{" "}
        and{" "}
        <a
          href="#"
          className="underline underline-offset-2 hover:text-gray-600 transition-colors"
        >
          Privacy Policy
        </a>
        .
      </p>
    </div>
  );
}