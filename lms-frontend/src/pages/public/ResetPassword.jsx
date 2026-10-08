import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useResetPasswordMutation } from "@/features/auth/authApi";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { Lock } from "lucide-react";

function ResetPassword() {
  const { token } = useParams();
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errors, setErrors] = useState({});
  const [resetPassword, { isLoading }] = useResetPasswordMutation();

  const validate = () => {
    const newErrors = {};
    if (!password) newErrors.password = "Password is required";
    else if (password.length < 6) newErrors.password = "Password must be at least 6 characters";
    
    if (!confirmPassword) newErrors.confirmPassword = "Confirm password is required";
    else if (password !== confirmPassword) newErrors.confirmPassword = "Passwords do not match";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      await resetPassword({ token, password }).unwrap();
      toast.success("Password reset successfully! You can now log in.");
      navigate("/login");
    } catch (error) {
      toast.error(error?.data?.message || "Failed to reset password");
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      {/* Background Aurora */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none opacity-30">
        <div className="absolute -top-[10%] -left-[10%] w-[50%] h-[50%] rounded-full bg-primary/20 dark:bg-primary/20 blur-[120px] mix-blend-multiply dark:mix-blend-screen" />
        <div className="absolute top-[20%] -right-[10%] w-[40%] h-[60%] rounded-full bg-primary/20 dark:bg-primary/20 blur-[150px] mix-blend-multiply dark:mix-blend-screen" />
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md relative z-10"
      >
        <div className="rounded-none border border-border/50 bg-card/60 p-8 shadow-elevated backdrop-blur-xl">
          <div className="mb-8 text-center">
            <div className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-none bg-primary/10 text-primary">
              <Lock size={28} />
            </div>
            <h1 className="text-3xl font-medium tracking-tight">Create New Password</h1>
            <p className="mt-3 text-muted-foreground">
              Your new password must be different from previous used passwords.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-medium">New Password</label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => { setPassword(e.target.value); setErrors({...errors, password: ""}); }}
                className={`rounded-none h-12 px-6 ${errors.password ? 'border-destructive' : ''}`}
                disabled={isLoading}
              />
              {errors.password && <p className="text-xs text-destructive pl-4">{errors.password}</p>}
            </div>

            <div className="space-y-2">
              <label htmlFor="confirmPassword" className="text-sm font-medium">Confirm Password</label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => { setConfirmPassword(e.target.value); setErrors({...errors, confirmPassword: ""}); }}
                className={`rounded-none h-12 px-6 ${errors.confirmPassword ? 'border-destructive' : ''}`}
                disabled={isLoading}
              />
              {errors.confirmPassword && <p className="text-xs text-destructive pl-4">{errors.confirmPassword}</p>}
            </div>

            <Button type="submit" className="w-full h-12 rounded-none text-base box-glow" disabled={isLoading}>
              {isLoading ? "Resetting..." : "Reset Password"}
            </Button>
          </form>
        </div>
      </motion.div>
    </div>
  );
}

export default ResetPassword;
