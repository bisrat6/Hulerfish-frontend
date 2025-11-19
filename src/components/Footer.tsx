import { Mountain, Facebook, Instagram, Twitter, Mail } from "lucide-react";
import { Link } from "react-router-dom";

const Footer = () => {

  return (
    <footer className="relative bg-muted/50 border-t border-border overflow-hidden">
      <div className="relative z-10 container mx-auto px-4 py-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Brand */}
          <div className="md:col-span-2">
            <Link
              to="/"
              className="flex items-center gap-2 font-display text-2xl font-bold mb-3 text-foreground hover:text-primary transition-colors"
            >
              <Mountain className="w-7 h-7 text-primary" />
              <span>Hulet Fish</span>
            </Link>
            <p className="text-muted-foreground text-sm mb-4 max-w-md leading-relaxed">
              Connect with local families through authentic home experiences. 
              From coffee ceremonies to cooking workshops, discover meaningful 
              cultural connections.
            </p>
            <div className="flex gap-2">
              <a
                href="/"
                className="w-9 h-9 rounded-full bg-muted hover:bg-primary hover:text-primary-foreground flex items-center justify-center transition-all border border-border"
                aria-label="Facebook"
              >
                <Facebook className="w-4 h-4" />
              </a>
              <a
                href="/"
                className="w-9 h-9 rounded-full bg-muted hover:bg-primary hover:text-primary-foreground flex items-center justify-center transition-all border border-border"
                aria-label="Instagram"
              >
                <Instagram className="w-4 h-4" />
              </a>
              <a
                href="/"
                className="w-9 h-9 rounded-full bg-muted hover:bg-primary hover:text-primary-foreground flex items-center justify-center transition-all border border-border"
                aria-label="Twitter"
              >
                <Twitter className="w-4 h-4" />
              </a>
              <a
                href="mailto:hello@huletfish.com"
                className="w-9 h-9 rounded-full bg-muted hover:bg-primary hover:text-primary-foreground flex items-center justify-center transition-all border border-border"
                aria-label="Email"
              >
                <Mail className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-semibold text-sm mb-3 text-foreground uppercase tracking-wide">
              Quick Links
            </h3>
            <ul className="space-y-2">
              <li>
                <Link
                  to="/experiences"
                  className="text-muted-foreground hover:text-primary transition-colors text-sm inline-block"
                >
                  Experiences
                </Link>
              </li>
              <li>
                <Link
                  to="/about"
                  className="text-muted-foreground hover:text-primary transition-colors text-sm inline-block"
                >
                  About Us
                </Link>
              </li>
              <li>
                <Link
                  to="/contact"
                  className="text-muted-foreground hover:text-primary transition-colors text-sm inline-block"
                >
                  Contact
                </Link>
              </li>
              <li>
                <Link
                  to="/host-application"
                  className="text-muted-foreground hover:text-primary transition-colors text-sm inline-block"
                >
                  Become a Host
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-semibold text-sm mb-3 text-foreground uppercase tracking-wide">
              Contact
            </h3>
            <ul className="space-y-2 text-muted-foreground text-sm">
              <li>Addis Ababa, Ethiopia</li>
              <li>
                <a 
                  href="mailto:hello@huletfish.com" 
                  className="hover:text-primary transition-colors"
                >
                  hello@huletfish.com
                </a>
              </li>
              <li>+251 11 123 4567</li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-6 border-t border-border flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-muted-foreground">
          <p>
            &copy; {new Date().getFullYear()} Hulet Fish. All rights reserved.
          </p>
          <div className="flex gap-4">
            <Link
              to="/privacy"
              className="hover:text-primary transition-colors"
            >
              Privacy Policy
            </Link>
            <Link
              to="/terms"
              className="hover:text-primary transition-colors"
            >
              Terms of Service
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
