import { useState } from "react";

import { Link, useNavigate } from "react-router-dom";

import { toast } from "sonner";

import { useRegisterMutation } from "@/features/auth/authApi";

import { Input } from "@/shared/ui/input";
import { Button } from "@/shared/ui/button";
import { motion } from "framer-motion";
import { Card, CardHeader, CardTitle, CardContent } from "@/shared/ui/card";
import { Eye, EyeOff } from "lucide-react";

function Register() {
  const navigate = useNavigate();

  const [register, { isLoading }] = useRegisterMutation();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    primaryType: "user",
  });
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);

  const validate = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = "Full Name is required";
    if (!formData.email) newErrors.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) newErrors.email = "Please enter a valid email address";
    if (!formData.password) newErrors.password = "Password is required";
    else {
      if (formData.password.length < 8) newErrors.password = "Password must be at least 8 characters";
      else if (!/[A-Z]/.test(formData.password)) newErrors.password = "Password must contain at least one uppercase letter";
      else if (!/[0-9]/.test(formData.password)) newErrors.password = "Password must contain at least one number";
      else if (!/[^A-Za-z0-9]/.test(formData.password)) newErrors.password = "Password must contain at least one special character";
    }

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
      const response = await register(formData).unwrap();

      if (response.data?.refreshToken) {
        localStorage.setItem("refreshToken", response.data.refreshToken);
      }

      toast.success("Account created successfully");

      navigate("/login");
    } catch (err) {
      toast.error(err?.data?.message || "Registration failed");
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
          <CardHeader className="space-y-3 pb-8 pt-10 text-center relative z-10">
            <CardTitle className="text-3xl font-semibold tracking-tight text-foreground">
              Create Account
            </CardTitle>
            <p className="text-sm text-muted-foreground font-light px-6">
              Join the next generation of developers building the future.
            </p>
          </CardHeader>

          <CardContent className="px-8 pb-8">
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <label className="text-sm font-medium">Full Name</label>
                <Input
                  type="text"
                  name="name"
                  placeholder="Enter your full name"
                  value={formData.name}
                  onChange={handleChange}
                  className={errors.name ? "border-destructive rounded-xl" : "rounded-xl"}
                />
                {errors.name && <p className="text-xs text-destructive">{errors.name}</p>}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Email</label>
                <Input
                  type="email"
                  name="email"
                  placeholder="Enter your email"
                  value={formData.email}
                  onChange={handleChange}
                  className={errors.email ? "border-destructive rounded-xl" : "rounded-xl"}
                />
                {errors.email && <p className="text-xs text-destructive">{errors.email}</p>}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Password</label>
                <div className="relative">
                  <Input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    placeholder="Create password"
                    value={formData.password}
                    onChange={handleChange}
                    className={errors.password ? "border-destructive rounded-xl pr-10" : "rounded-xl pr-10"}
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

              <div className="space-y-2">
                <label className="text-sm font-medium">Account Type</label>
                <select
                  name="primaryType"
                  value={formData.primaryType}
                  onChange={handleChange}
                  className="flex h-11 w-full rounded-xl border border-input bg-background px-4 py-2 text-sm outline-none"
                >
                  <option value="user">Student</option>
                  <option value="employer">Hiring Partner</option>
                  <option value="instructor">Instructor</option>
                </select>
              </div>

              <Button
                className="w-full h-12 text-base font-medium rounded-xl transition-all bg-primary text-primary-foreground hover:bg-primary/90"
                disabled={isLoading}
              >
                {isLoading ? "Creating account..." : "Create Account"}
              </Button>
            </form>

            <p className="mt-8 text-center text-sm text-muted-foreground font-light">
              Already have an account?{" "}
              <Link
                to="/login"
                className="font-medium text-primary hover:underline transition-all"
              >
                Sign In
              </Link>
            </p>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}

export default Register;
