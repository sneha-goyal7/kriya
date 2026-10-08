import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { toast } from "sonner";

import { Input } from "@/shared/ui/input";

import { Button } from "@/shared/ui/button";

import { useLoginMutation } from "@/features/auth/authApi";
import { setCredentials } from "@/features/auth/authSlice";
import { motion } from "framer-motion";
import { Card, CardHeader, CardTitle, CardContent } from "@/shared/ui/card";
import { Eye, EyeOff } from "lucide-react";

function Login() {
  const navigate = useNavigate();

  const dispatch = useDispatch();

  const [login, { isLoading }] = useLoginMutation();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);

  const validate = () => {
    const newErrors = {};
    if (!formData.email) newErrors.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) newErrors.email = "Please enter a valid email address";
    if (!formData.password) newErrors.password = "Password is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    if (errors[e.target.name]) {
      setErrors({
        ...errors,
        [e.target.name]: ""
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      const response = await login(formData).unwrap();

      if (response.data.refreshToken) {
        localStorage.setItem("refreshToken", response.data.refreshToken);
      }

      dispatch(
        setCredentials({
          user: response.data.user,
          token: response.data.token,
        }),
      );

      toast.success("Login successful");

      const baseRole = response.data.user?.primaryType?.toLowerCase() || response.data.user?.role?.toLowerCase();
      const isInstructor = baseRole === "instructor" || (baseRole === "user" && response.data.user?.capabilities?.canTeach);

      if (baseRole === "admin") {
        navigate("/admin/dashboard");
      } else if (baseRole === "employer") {
        navigate("/employer/dashboard");
      } else if (isInstructor) {
        navigate("/instructor/dashboard");
      } else if (baseRole === "student" || baseRole === "user") {
        navigate("/student/dashboard");
      } else {
        navigate("/");
      }
    } catch (err) {
      toast.error(err?.data?.message || "Login failed");
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center p-4 bg-background relative overflow-hidden">
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0IiBoZWlnaHQ9IjQiPgo8cmVjdCB3aWR0aD0iNCIgaGVpZ2h0PSI0IiBmaWxsPSIjZmZmIiBmaWxsLW9wYWNpdHk9IjAuMDUiLz4KPC9zdmc+')] opacity-10 pointer-events-none" />

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-md relative z-10"
      >
        <div className="absolute -inset-1 bg-gradient-to-r from-primary/30 to-blue-600/30 blur-2xl opacity-50 rounded-[2rem] pointer-events-none" />

        <Card className="relative overflow-hidden border border-border/50 bg-card/60 backdrop-blur-xl shadow-2xl rounded-2xl">
          <CardHeader className="space-y-3 pb-8 pt-10 text-center">
            <CardTitle className="text-3xl font-semibold tracking-tight text-foreground">
              Welcome Back
            </CardTitle>
            <p className="text-sm text-muted-foreground font-light px-6">
              Enter your credentials to continue your journey on Kriya.
            </p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <label className="text-sm font-medium">Email</label>
                <Input
                  type="email"
                  name="email"
                  placeholder="Enter your email"
                  value={formData.email}
                  onChange={handleChange}
                  className={errors.email ? "border-destructive" : ""}
                />
                {errors.email && <p className="text-xs text-destructive">{errors.email}</p>}
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium">Password</label>
                  <Link to="/forgot-password" className="text-sm font-medium text-primary hover:underline">
                    Forgot password?
                  </Link>
                </div>
                <div className="relative">
                  <Input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    placeholder="Enter your password"
                    value={formData.password}
                    onChange={handleChange}
                    className={errors.password ? "border-destructive pr-10" : "pr-10"}
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                {errors.password && <p className="text-xs text-destructive">{errors.password}</p>}
              </div>

              <Button
                className="w-full h-12 text-base font-medium rounded-xl transition-all bg-primary text-primary-foreground hover:bg-primary/90"
                disabled={isLoading}
                type="submit"
              >
                {isLoading ? "Logging in..." : "Login"}
              </Button>
            </form>

            <div className="mt-8 text-center text-sm text-muted-foreground">
              <p className="text-center text-sm text-muted-foreground font-light">
                Don&apos;t have an account?{" "}
                <Link
                  to="/register"
                  className="font-medium text-primary hover:underline transition-all"
                >
                  Create one
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}

export default Login;
