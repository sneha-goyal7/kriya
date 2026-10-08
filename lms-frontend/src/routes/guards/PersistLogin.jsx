import { useSelector } from "react-redux";
import { useVerifyAuthQuery } from "@/features/auth/authApi";
import { useState, useEffect } from "react";
import SplashScreen from "@/components/common/SplashScreen";

const PersistLogin = ({ children }) => {
  const { token } = useSelector((state) => state.auth);
  
  // Enforce a minimum display time (e.g., 2.8 seconds) so the intro animation finishes
  const [showSplash, setShowSplash] = useState(true);

  // Only skip the query if we already have a token in memory
  const { isLoading: isAuthLoading } = useVerifyAuthQuery(undefined, {
    skip: !!token,
  });

  useEffect(() => {
    // Enforce a minimum display time so the intro animation finishes playing
    // The animation is sped up and takes roughly 1.0 second to complete.
    const timer = setTimeout(() => {
      setShowSplash(false);
    }, 1000); 

    return () => clearTimeout(timer);
  }, []);

  // Show splash if EITHER the auth check is running OR the artificial timer is running
  if (isAuthLoading || showSplash) {
    return <SplashScreen />;
  }

  return children;
};

export default PersistLogin;
