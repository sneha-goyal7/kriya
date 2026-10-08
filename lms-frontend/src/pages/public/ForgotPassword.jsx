import { useState } from "react";
import { Link } from "react-router-dom";
import { useForgotPasswordMutation } from "@/features/auth/authApi";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { ArrowLeft, Mail } from "lucide-react";

function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [forgotPassword, { isLoading }] = useForgotPasswordMutation();
  const [isSent, setIsSent] = useState(false);

  const validate = () => {
    if (!email) {
      setError("Email is required");
      return false;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("Please enter a valid email address");
      return false;
    }
    setError("");
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      await forgotPassword({ email }).unwrap();
      setIsSent(true);
      toast.success("Password reset email sent!");
    } catch (error) {
      toast.error(error?.data?.message || "Failed to send reset email");
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
              <Mail size={28} />
            </div>
            <h1 className="text-3xl font-medium tracking-tight">Reset Password</h1>
            <p className="mt-3 text-muted-foreground">
              {isSent 
                ? "Check your email for a link to reset your password. If it doesn't appear within a few minutes, check your spam folder." 
                : "Enter your email address and we'll send you a link to reset your password."}
            </p>
          </div>

          {!isSent ? (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <label htmlFor="email" className="text-sm font-medium">Email Address</label>
                <Input
                  id="email"
                  type="email"
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); setError(""); }}
                  className={`rounded-none h-12 px-6 ${error ? 'border-destructive' : ''}`}
                  disabled={isLoading}
                />
                {error && <p className="text-xs text-destructive pl-4">{error}</p>}
              </div>

              <Button type="submit" className="w-full h-12 rounded-none text-base box-glow" disabled={isLoading}>
                {isLoading ? "Sending..." : "Send Reset Link"}
              </Button>
            </form>
          ) : (
            <Button 
              className="w-full h-12 rounded-none text-base" 
              variant="outline"
              onClick={() => setIsSent(false)}
            >
              Try another email
            </Button>
          )}

          <div className="mt-8 text-center">
            <Link to="/login" className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
              <ArrowLeft size={16} className="mr-2" /> Back to Login
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

export default ForgotPassword;
