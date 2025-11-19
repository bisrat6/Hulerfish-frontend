import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Mountain, Menu, X, User } from "lucide-react";
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";

const Navigation = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const { isAuthenticated, user } = useAuth();
  const location = useLocation();

  const isHomePage = location.pathname === "/";

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768); // md breakpoint
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    if (!isHomePage || isMobile) {
      setIsScrolled(true);
      return;
    }

    const handleScroll = () => {
      const scrollPosition = window.scrollY;
      setIsScrolled(scrollPosition > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [isHomePage, isMobile]);

  const isActive = (path: string) => {
    if (path === "/") {
      return location.pathname === "/";
    }
    return location.pathname.startsWith(path);
  };

  const getLinkClassName = (path: string) => {
    const baseClasses = "transition-colors font-medium";
    const activeClasses = isActive(path)
      ? "text-primary font-semibold"
      : "text-foreground hover:text-primary";
    return `${baseClasses} ${activeClasses}`;
  };

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      isScrolled || !isHomePage || isMobile
        ? 'bg-background/95 backdrop-blur-sm border-b border-border shadow-sm' 
        : 'bg-transparent backdrop-blur-none border-b border-transparent'
    }`}>
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className={`flex items-center gap-2 font-display text-2xl font-bold transition-colors ${
            isScrolled || !isHomePage || isMobile
              ? 'text-primary hover:text-primary-light' 
              : 'text-primary-foreground hover:text-secondary'
          }`}>
            <Mountain className="w-8 h-8" />
            <span>Hulet Fish</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            <Link to="/" className={`transition-colors font-medium ${
              isActive("/") 
                ? (isScrolled || !isHomePage || isMobile) ? "text-primary font-semibold" : "text-secondary font-semibold"
                : (isScrolled || !isHomePage || isMobile) ? "text-foreground hover:text-primary" : "text-primary-foreground hover:text-secondary"
            }`}>
              Home
            </Link>
            <Link to="/tours" className={`transition-colors font-medium ${
              isActive("/tours") 
                ? (isScrolled || !isHomePage || isMobile) ? "text-primary font-semibold" : "text-secondary font-semibold"
                : (isScrolled || !isHomePage || isMobile) ? "text-foreground hover:text-primary" : "text-primary-foreground hover:text-secondary"
            }`}>
              Experiences
            </Link>
            <Link to="/about" className={`transition-colors font-medium ${
              isActive("/about") 
                ? (isScrolled || !isHomePage || isMobile) ? "text-primary font-semibold" : "text-secondary font-semibold"
                : (isScrolled || !isHomePage || isMobile) ? "text-foreground hover:text-primary" : "text-primary-foreground hover:text-secondary"
            }`}>
              About
            </Link>
            <Link to="/contact" className={`transition-colors font-medium ${
              isActive("/contact") 
                ? (isScrolled || !isHomePage || isMobile) ? "text-primary font-semibold" : "text-secondary font-semibold"
                : (isScrolled || !isHomePage || isMobile) ? "text-foreground hover:text-primary" : "text-primary-foreground hover:text-secondary"
            }`}>
              Contact
            </Link>
            {isAuthenticated ? (
              <Button asChild variant="adventure" size="sm">
                <Link to="/profile">
                  <User className="w-4 h-4 mr-2" />
                  {user?.name?.split(' ')[0] || 'Profile'}
                </Link>
              </Button>
            ) : (
              <>
                <Button asChild variant="outline" size="sm">
                  <Link to="/login">Log In</Link>
                </Button>
                <Button asChild variant="adventure" size="sm">
                  <Link to="/signup">Sign Up</Link>
                </Button>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            className={`md:hidden transition-colors ${
              isScrolled || !isHomePage || isMobile ? 'text-foreground' : 'text-primary-foreground'
            }`}
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label="Toggle menu"
          >
            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-border animate-fade-in">
            <div className="flex flex-col gap-4">
              <Link 
                to="/" 
                className={getLinkClassName("/")}
                onClick={() => setIsMenuOpen(false)}
              >
                Home
              </Link>
              <Link 
                to="/tours" 
                className={getLinkClassName("/tours")}
                onClick={() => setIsMenuOpen(false)}
              >
                Experiences
              </Link>
              <Link 
                to="/about" 
                className={getLinkClassName("/about")}
                onClick={() => setIsMenuOpen(false)}
              >
                About
              </Link>
              <Link 
                to="/contact" 
                className={getLinkClassName("/contact")}
                onClick={() => setIsMenuOpen(false)}
              >
                Contact
              </Link>
              {isAuthenticated ? (
                <Button asChild variant="adventure" size="sm" className="w-full">
                  <Link to="/profile" onClick={() => setIsMenuOpen(false)}>
                    <User className="w-4 h-4 mr-2" />
                    Profile
                  </Link>
                </Button>
              ) : (
                <>
                  <Button asChild variant="outline" size="sm" className="w-full">
                    <Link to="/login" onClick={() => setIsMenuOpen(false)}>
                      Log In
                    </Link>
                  </Button>
                  <Button asChild variant="adventure" size="sm" className="w-full">
                    <Link to="/signup" onClick={() => setIsMenuOpen(false)}>
                      Sign Up
                    </Link>
                  </Button>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navigation;
