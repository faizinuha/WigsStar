import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Github, Chrome } from "lucide-react";
import { DiscordIcon } from "../components/ui/icons/DiscordIcon";
import { SpotifyIcon } from "../components/ui/icons/SpotifyIcon";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useAuth } from "../contexts/AuthContext";
import { DisplayNameField, EmailField, PasswordField, UsernameField } from "../contexts/AuthFormFields";
import starMarLogo from "../../assets/Logo/StarMar-.png";
import { DownloadProofModal } from "../components/DownloadProofModal";
import { generateAndDownloadProofFile } from "../lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export function Auth() {
  const { addAccount, signUp, resetPassword, addAccountWithOAuth, user, accounts, signOut } = useAuth();
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
  const [showDownloadModal, setShowDownloadModal] = useState(false);
  const [registeredEmail, setRegisteredEmail] = useState<string | null>(null);
  const [showAccountSelection, setShowAccountSelection] = useState(false);

  useEffect(() => {
    if (user) {
      // If user is logged in, don't show account selection, proceed to app.
      navigate('/');
    } else if (accounts.length > 0) {
      // If logged out but there are stored accounts, show selection.
      setShowAccountSelection(true);
    } else {
      // No stored accounts, show the standard login form.
      setShowAccountSelection(false);
    }
  }, [user, accounts, navigate]);

  const handleAccountSelect = (account: any) => {
    setFormData(prev => ({
      ...prev,
      email: account.user.email || '',
      password: '', // Clear password field
    }));
    setShowAccountSelection(false);
  };

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
      const { error } = isLogin
        ? await addAccount(formData.email, formData.password)
        : await signUp(formData.email, formData.password, formData.username, formData.displayName);

      if (error) {
        setErrors({ general: error.message });
      } else {
        if (!isLogin) {
          alert("Sign up successful! Please check your email to verify your account.");
          setIsLogin(true);
        } else {
          navigate("/");
        }
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

  const handleOAuthSignIn = async (provider: 'google' | 'github' | 'discord' | 'spotify') => {
    setIsLoading(true);
    await addAccountWithOAuth(provider);
  };

  const toggleForm = () => {
    setIsLogin(!isLogin);
    setErrors({});
    setFormData({ username: "", email: "", password: "", confirmPassword: "", displayName: "" });
  };

  const handleDownloadConfirm = () => {
    if (registeredEmail) {
      generateAndDownloadProofFile(registeredEmail);
      setShowDownloadModal(false);
      navigate("/");
    }
  };

  const getTitle = () => {
    if (showAccountSelection) return 'Choose an account';
    if (isLogin) {
      return user ? 'Add another account' : 'Sign In';
    }
    return 'Create an account';
  }

  return (
    <div className="min-h-screen w-full lg:grid lg:grid-cols-2 bg-background">
      <div className="hidden bg-primary/5 lg:flex flex-col items-center justify-center p-12 text-center">
        <img src={starMarLogo} alt="StarMar Logo" className="w-48 mb-6" />
        <h1 className="text-4xl font-bold text-primary">Welcome to StarMar</h1>
        <p className="mt-4 text-lg text-muted-foreground">
          A new way to connect with the world.
        </p>
      </div>

      <div className="flex items-center justify-center py-12 px-4 relative">
        <div className="w-full max-w-md space-y-6">
          <div className="text-center lg:hidden">
            <img src={starMarLogo} alt="StarMar Logo" className="w-24 mx-auto mb-4" />
          </div>

          {showAccountSelection && (
            <Card className="border-none shadow-none sm:border sm:shadow-sm mb-4">
              <CardHeader className="text-center">
                <CardTitle className="text-2xl">Choose an account</CardTitle>
                <CardDescription>
                  Select an account to continue.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 gap-3">
                  {accounts.map((account) => (
                    <div 
                      key={account.user.id} 
                      className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-center gap-4 cursor-pointer flex-1 min-w-0" onClick={() => handleAccountSelect(account)}>
                        <Avatar className="h-12 w-12">
                          <AvatarImage src={account.user.user_metadata?.avatar_url} alt={account.user.user_metadata?.display_name || account.user.email} />
                          <AvatarFallback>{account.user.email?.substring(0, 2).toUpperCase()}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0"> 
                          <p className="font-semibold truncate">{account.user.user_metadata?.display_name || account.user.email}</p>
                          <p className="text-sm text-muted-foreground truncate">{account.user.email}</p>
                        </div>
                      </div>
                      <Button variant="ghost" size="sm" onClick={() => signOut(account.user.id)}>
                        Remove
                      </Button>
                    </div>
                  ))}
                </div>
                <Separator />
                <Button variant="secondary" className="w-full" onClick={() => {
                  setShowAccountSelection(false);
                  setFormData({ username: "", email: "", password: "", confirmPassword: "", displayName: "" }); // Clear form
                }}>
                  Login with another account
                </Button>
              </CardContent>
            </Card>
          )}

          {!showAccountSelection && (
            <Card className="border-none shadow-none sm:border sm:shadow-sm">
              <CardHeader className="text-center">
                <CardTitle className="text-2xl">{getTitle()}</CardTitle>
                <CardDescription>
                  {isLogin ? "Enter your credentials to sign in." : "Fill in the details to create your account."}
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-4">
                {errors.general && (
                  <Alert variant="destructive">
                    <AlertDescription>{errors.general}</AlertDescription>
                  </Alert>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                  {!isLogin && (
                    <>
                      <DisplayNameField value={formData.displayName} onChange={(e) => handleInputChange("displayName", e.target.value)} error={errors.displayName} />
                      <UsernameField value={formData.username} onChange={(e) => handleInputChange("username", e.target.value.replace(/[^a-zA-Z0-9_]/g, "").toLowerCase())} error={errors.username} />
                    </>
                  )}
                  <EmailField value={formData.email} onChange={(e) => handleInputChange("email", e.target.value)} error={errors.email} />
                  <PasswordField id="password" label="Password" value={formData.password} onChange={(e) => handleInputChange("password", e.target.value)} error={errors.password} showPassword={showPassword} toggleShowPassword={() => setShowPassword(!showPassword)} />
                  {!isLogin && <PasswordField id="confirmPassword" label="Confirm Password" value={formData.confirmPassword} onChange={(e) => handleInputChange("confirmPassword", e.target.value)} error={errors.confirmPassword} />}
                  <Button type="submit" className="w-full gradient-button" disabled={isLoading}>
                    {isLoading ? "Please wait..." : isLogin ? (user ? "Add Account" : "Sign In") : "Create Account"}
                  </Button>
                </form>

                <div className="relative">
                  <div className="absolute inset-0 flex items-center"><span className="w-full border-t" /></div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-card px-2 text-muted-foreground">Or continue with</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <Button variant="outline" onClick={() => handleOAuthSignIn('google')} disabled={isLoading}><Chrome className="mr-2 h-4 w-4" />Google</Button>
                  <Button variant="outline" onClick={() => handleOAuthSignIn('github')} disabled={isLoading}><Github className="mr-2 h-4 w-4" />Github</Button>
                  <Button variant="outline" onClick={() => handleOAuthSignIn('discord')} disabled={isLoading}><DiscordIcon className="mr-2 h-4 w-4" />Discord</Button>
                  <Button variant="outline" onClick={() => handleOAuthSignIn('spotify')} disabled={isLoading}><SpotifyIcon className="mr-2 h-4 w-4" />Spotify</Button>
                </div>

                {!user && (
                  <p className="text-center text-sm text-muted-foreground">
                    {isLogin ? "Don't have an account?" : "Already have an account?"}{" "}
                    <Button variant="link" onClick={toggleForm} className="p-0 h-auto">
                      {isLogin ? "Sign up" : "Sign in"}
                    </Button>
                  </p>
                )}

                {isLogin && (
                  <div className="text-center">
                    <Button variant="link" className="text-sm p-0 h-auto" onClick={handleForgotPassword}>
                      Forgot password?
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
      <DownloadProofModal
        isOpen={showDownloadModal}
        onClose={() => setShowDownloadModal(false)}
        onConfirmDownload={handleDownloadConfirm}
      />
    </div>
  );
}
