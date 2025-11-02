import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Mountain, Menu, X, User } from "lucide-react";
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";

const Navigation = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { isAuthenticated, user } = useAuth();

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 font-display text-2xl font-bold text-primary hover:text-primary-light transition-colors">
            <Mountain className="w-8 h-8" />
            <span>HUlet fish</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            <Link to="/" className="text-foreground hover:text-primary transition-colors font-medium">
              Home
            </Link>
            <Link to="/tours" className="text-foreground hover:text-primary transition-colors font-medium">
              Experiences
            </Link>
            <Link to="/about" className="text-foreground hover:text-primary transition-colors font-medium">
              About
            </Link>
            <Link to="/contact" className="text-foreground hover:text-primary transition-colors font-medium">
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
            className="md:hidden text-foreground"
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
                className="text-foreground hover:text-primary transition-colors font-medium"
                onClick={() => setIsMenuOpen(false)}
              >
                Home
              </Link>
              <Link 
                to="/tours" 
                className="text-foreground hover:text-primary transition-colors font-medium"
                onClick={() => setIsMenuOpen(false)}
              >
                Experiences
              </Link>
              <Link 
                to="/about" 
                className="text-foreground hover:text-primary transition-colors font-medium"
                onClick={() => setIsMenuOpen(false)}
              >
                About
              </Link>
              <Link 
                to="/contact" 
                className="text-foreground hover:text-primary transition-colors font-medium"
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
