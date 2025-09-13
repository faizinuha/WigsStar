import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator"; 
import { Heart, Github, Chrome } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useAuth } from "../contexts/AuthContext";
import { DisplayNameField, EmailField, PasswordField, UsernameField } from "../contexts/AuthFormFields";

export function Auth() {
  const { signIn, signUp, resetPassword, signInWithOAuth } = useAuth();
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
    displayName: ""
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.email) newErrors.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = "Email is invalid";
    if (!formData.password) newErrors.password = "Password is required";
    else if (formData.password.length < 6) newErrors.password = "Password must be at least 6 characters";
    if (!isLogin) {
      if (!formData.username) newErrors.username = "Username is required";
      else if (formData.username.length < 3) newErrors.username = "Username must be at least 3 characters";
      if (!formData.displayName) newErrors.displayName = "Display name is required";
      if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = "Passwords don't match";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    setIsLoading(true);

    try {
      let error;
      if (isLogin) {
        ({ error } = await signIn(formData.email, formData.password));
      } else {
        ({ error } = await signUp(
          formData.email,
          formData.password,
          formData.username,
          formData.displayName
        ));
      }
      if (error) {
        setErrors({ general: error.message });
      } else {
        navigate("/");
      }
    } catch {
      setErrors({ general: "Authentication failed. Please try again." });
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: "" }));
  };

  const handleForgotPassword = async () => {
    if (!formData.email) {
      setErrors({ email: "Please enter your email to reset password" });
      return;
    }
    const { error } = await resetPassword(formData.email);
    if (error) setErrors({ general: error.message });
    else alert("Password reset email sent. Check your inbox!");
  };

  const handleOAuthSignIn = async (provider: 'google' | 'github') => {
    setIsLoading(true);
    const { error } = await signInWithOAuth(provider);
    if (error) {
      setErrors({ general: error.message });
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-accent/5 flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6 animate-fade-in">
        {/* Logo */}
        <div className="text-center space-y-2">
          <div className="w-20 h-20 mx-auto rounded-3xl starmar-gradient flex items-center justify-center shadow-lg">
            <span className="text-white font-bold text-3xl">S</span>
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            StarMar
          </h1>
          <p className="text-muted-foreground">
            Connect, share, and discover amazing moments
          </p>
        </div>

        <Card className="glass-card">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">
              {isLogin ? "Welcome Back" : "Join StarMar"}
            </CardTitle>
            <p className="text-muted-foreground">
              {isLogin
                ? "Sign in to your account to continue"
                : "Create your account and start sharing"}
            </p>
          </CardHeader>

          <CardContent className="space-y-6">
            {errors.general && (
              <Alert variant="destructive">
                <AlertDescription>{errors.general}</AlertDescription>
              </Alert>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {!isLogin && (
                <>
                  <DisplayNameField
                    value={formData.displayName}
                    onChange={(e) => handleInputChange("displayName", e.target.value)}
                    error={errors.displayName}
                  />
                  <UsernameField
                    value={formData.username}
                    onChange={(e) => {
                      const value = e.target.value.replace(/[^a-zA-Z0-9_]/g, "").toLowerCase();
                      handleInputChange("username", value);
                    } }
                    error={errors.username} />
                </>
              )}

              <EmailField
                value={formData.email}
                onChange={(e) => handleInputChange("email", e.target.value)}
                error={errors.email} />

              <PasswordField
                id="password"
                label="Password"
                value={formData.password}
                onChange={(e) => handleInputChange("password", e.target.value)}
                error={errors.password}
                showPassword={showPassword}
                toggleShowPassword={() => setShowPassword(!showPassword)} />

              {!isLogin && (
                <PasswordField
                  id="confirmPassword"
                  label="Confirm Password"
                  value={formData.confirmPassword}
                  onChange={(e) => handleInputChange("confirmPassword", e.target.value)}
                  error={errors.confirmPassword} />
              )}

              <Button
                type="submit"
                className="w-full gradient-button"
                disabled={isLoading}
              >
                {isLoading ? "Please wait..." : isLogin ? "Sign In" : "Create Account"}
              </Button>
            </form>

            <div className="text-center space-y-4">
              <div className="relative">
                <Separator />
                <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-card px-2 text-sm text-muted-foreground">
                  or
                </span>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Button variant="outline" onClick={() => handleOAuthSignIn('google')} disabled={isLoading}>
                  <Chrome className="mr-2 h-4 w-4" />
                  Google
                </Button>
                <Button variant="outline" onClick={() => handleOAuthSignIn('github')} disabled={isLoading}>
                  <Github className="mr-2 h-4 w-4" />
                  GitHub
                </Button>
              </div>

              <p className="text-center text-xs text-muted-foreground">
                {isLogin ? "Or sign in with your email" : "Or sign up with your email"}
              </p>

              <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={() => {
                  setIsLogin(!isLogin);
                  setErrors({});
                  setFormData({
                    username: "",
                    email: "",
                    password: "",
                    confirmPassword: "",
                    displayName: ""
                  });
                } }
              >
                {isLogin ? "Don't have an account? Sign up" : "Already have an account? Sign in"}
              </Button>

              {isLogin && (
                <Button variant="ghost" className="text-sm" onClick={handleForgotPassword}>
                  Forgot your password?
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        <div className="text-center text-sm text-muted-foreground">
          <p className="flex items-center justify-center space-x-1">
            <span>Made with</span>
            <Heart className="h-4 w-4 text-red-500" />
            <span>by StarMar Team</span>
          </p>
        </div>
      </div>
    </div>
  );
}
