import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { 
  Home, 
  Search, 
  PlusSquare, 
  Heart, 
  MessageCircle,
  User,
  Menu,
  X,
  Settings,
  LogOut,
  Laugh
} from "lucide-react";
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { useAuth } from "@/contexts/AuthContext";
import { useProfile } from "@/hooks/useProfile";
import { CreatePostModal } from "@/components/posts/CreatePostModal";

export const Navigation = () => {
  const { user, signOut } = useAuth();
  const { data: profile } = useProfile();
  const [notifications] = useState(3);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  // Redirect to auth if not authenticated
  useEffect(() => {
    if (!user && location.pathname !== "/auth") {
      navigate("/auth");
    }
  }, [user, navigate, location.pathname]);

  const navItems = [
    { icon: Home, label: "Home", path: "/", active: location.pathname === "/" },
    { icon: Search, label: "Explore", path: "/explore", active: location.pathname === "/explore" },
    { icon: PlusSquare, label: "Create", path: "#", active: false, onClick: () => setShowCreateModal(true) },
    { icon: Laugh, label: "Memes", path: "/memes", active: location.pathname === "/memes" },
    { icon: Heart, label: "Notifications", path: "/notifications", badge: notifications, active: location.pathname === "/notifications" },
  ];

  // Don't render navigation if user is not authenticated
  if (!user) {
    return null;
  }

  const handleNavigation = (path: string, onClick?: () => void) => {
    if (onClick) {
      onClick();
    } else if (path !== "#") {
      navigate(path);
    }
    setIsMenuOpen(false);
  };

  const handleProfileClick = () => {
    navigate("/profile");
    setIsMenuOpen(false);
  };

  const handleLogout = async () => {
    await signOut();
    navigate("/auth");
    setIsMenuOpen(false);
  };

  const handleSettingsClick = () => {
    navigate("/settings");
    setIsMenuOpen(false);
  };

  return (
    <>
      {/* Desktop Navigation */}
      <nav className="hidden md:flex fixed left-0 top-0 h-full w-72 bg-card border-r border-border p-6 flex-col justify-between z-40">
        <div className="space-y-8">
          {/* Logo */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl starmar-gradient flex items-center justify-center">
              <span className="text-white font-bold text-lg">S</span>
            </div>
            <span className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              StarMar
            </span>
          </div>

          {/* Navigation Items */}
          <div className="space-y-2">
            {navItems.map((item, index) => {
              const Icon = item.icon;
              return (
                <Button
                  key={index}
                  variant={item.active ? "secondary" : "ghost"}
                  className="w-full justify-start space-x-3 h-12 text-base"
                  onClick={() => handleNavigation(item.path, item.onClick)}
                >
                  <div className="relative">
                    <Icon className="h-6 w-6" />
                    {item.badge && (
                      <Badge className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 text-xs starmar-gradient border-0">
                        {item.badge}
                      </Badge>
                    )}
                  </div>
                  <span>{item.label}</span>
                </Button>
              );
            })}
          </div>
        </div>

        {/* User Profile */}
        <div className="space-y-4">
          <Button variant="ghost" className="w-full justify-start space-x-3 h-12" onClick={handleSettingsClick}>
            <Settings className="h-6 w-6" />
            <span>Settings</span>
          </Button>
          
          <div className="flex items-center space-x-3 p-3 rounded-2xl bg-secondary cursor-pointer hover:bg-secondary/80 transition-colors" onClick={handleProfileClick}>
            <Avatar className="h-10 w-10">
              <AvatarImage src={profile?.avatar_url} />
              <AvatarFallback>{profile?.display_name?.[0] || profile?.username?.[0] || "U"}</AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="font-medium truncate">{profile?.display_name || profile?.username}</p>
              <p className="text-sm text-muted-foreground truncate">@{profile?.username}</p>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Navigation */}
      <div className="md:hidden">
        {/* Top Bar */}
        <header className="fixed top-0 left-0 right-0 bg-card border-b border-border p-4 flex items-center justify-between z-50">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-lg starmar-gradient flex items-center justify-center">
              <span className="text-white font-bold text-sm">S</span>
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              StarMar
            </span>
          </div>
          
          <Sheet open={isMenuOpen} onOpenChange={setIsMenuOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon">
                <Menu className="h-6 w-6" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-80">
              <SheetHeader>
                <SheetTitle className="text-left">Menu</SheetTitle>
              </SheetHeader>
              
              <div className="mt-8 space-y-6">
                {/* Profile Section */}
                <div className="flex items-center space-x-3 p-4 rounded-2xl bg-secondary cursor-pointer hover:bg-secondary/80 transition-colors" onClick={handleProfileClick}>
                  <Avatar className="h-12 w-12">
                    <AvatarImage src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&h=150&fit=crop&crop=face" />
                    <AvatarFallback>You</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">Your Name</p>
                    <p className="text-sm text-muted-foreground">@yourname</p>
                  </div>
                </div>

                {/* Navigation Items */}
                <div className="space-y-2">
                  {navItems.map((item, index) => {
                    const Icon = item.icon;
                    return (
                      <Button
                        key={index}
                        variant={item.active ? "secondary" : "ghost"}
                        className="w-full justify-start space-x-3 h-12"
                        onClick={() => handleNavigation(item.path, item.onClick)}
                      >
                        <div className="relative">
                          <Icon className="h-6 w-6" />
                          {item.badge && (
                            <Badge className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 text-xs starmar-gradient border-0">
                              {item.badge}
                            </Badge>
                          )}
                        </div>
                        <span>{item.label}</span>
                      </Button>
                    );
                  })}
                </div>

                <hr className="border-border" />

                {/* Settings & Logout */}
                <div className="space-y-2">
                  <Button variant="ghost" className="w-full justify-start space-x-3 h-12" onClick={handleSettingsClick}>
                    <Settings className="h-6 w-6" />
                    <span>Settings</span>
                  </Button>
                  <Button variant="ghost" className="w-full justify-start space-x-3 h-12 text-destructive" onClick={handleLogout}>
                    <LogOut className="h-6 w-6" />
                    <span>Logout</span>
                  </Button>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </header>

        {/* Bottom Navigation */}
        <nav className="fixed bottom-0 left-0 right-0 bg-card border-t border-border p-2 flex justify-around z-40">
          {navItems.slice(0, 5).map((item, index) => {
            const Icon = item.icon;
            return (
              <Button
                key={index}
                variant="ghost"
                size="icon"
                className="h-12 w-12 relative"
                onClick={() => handleNavigation(item.path, item.onClick)}
              >
                <Icon className={`h-6 w-6 ${item.active ? 'text-primary' : ''}`} />
                {item.badge && (
                  <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs starmar-gradient border-0">
                    {item.badge}
                  </Badge>
                )}
              </Button>
            );
          })}
        </nav>
      </div>

      {/* Spacer for fixed navigation */}
      <div className="hidden md:block w-72" />
      <div className="md:hidden h-16" />
      <div className="md:hidden h-16" />
      
      {/* Create Post Modal */}
      <CreatePostModal 
        isOpen={showCreateModal} 
        onClose={() => setShowCreateModal(false)} 
      />
    </>
  );
};