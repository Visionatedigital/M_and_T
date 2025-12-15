import { MapPin, Phone, Mail } from "lucide-react";
import { Link } from "react-router-dom";
import logo from "@/assets/logo.jpg";

const Footer = () => {
  return (
    <footer className="bg-primary text-primary-foreground">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Logo and About */}
          <div className="space-y-4">
            <img src={logo} alt="M&T Microfinance" className="h-16 w-auto brightness-0 invert" />
            <p className="text-sm text-primary-foreground/90">
              Developing Together - Your trusted microfinance partner in Uganda.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-bold text-lg mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="text-sm text-primary-foreground/90 hover:text-primary-foreground transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/about" className="text-sm text-primary-foreground/90 hover:text-primary-foreground transition-colors">
                  About Us
                </Link>
              </li>
              <li>
                <Link to="/products" className="text-sm text-primary-foreground/90 hover:text-primary-foreground transition-colors">
                  Products
                </Link>
              </li>
              <li>
                <Link to="/branches" className="text-sm text-primary-foreground/90 hover:text-primary-foreground transition-colors">
                  Our Branches
                </Link>
              </li>
              <li>
                <Link to="/staff-login" className="text-sm text-primary-foreground/90 hover:text-primary-foreground transition-colors">
                  Staff Portal
                </Link>
              </li>
            </ul>
          </div>

          {/* Products */}
          <div>
            <h3 className="font-bold text-lg mb-4">Our Products</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/products" className="text-sm text-primary-foreground/90 hover:text-primary-foreground transition-colors">
                  Personal Loans
                </Link>
              </li>
              <li>
                <Link to="/products" className="text-sm text-primary-foreground/90 hover:text-primary-foreground transition-colors">
                  Civil Servant Loans
                </Link>
              </li>
              <li>
                <Link to="/products" className="text-sm text-primary-foreground/90 hover:text-primary-foreground transition-colors">
                  Logbook Finance
                </Link>
              </li>
              <li>
                <Link to="/products" className="text-sm text-primary-foreground/90 hover:text-primary-foreground transition-colors">
                  SME Loans
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="font-bold text-lg mb-4">Contact Us</h3>
            <ul className="space-y-3">
              <li className="flex items-start gap-2 text-sm text-primary-foreground/90">
                <MapPin className="h-5 w-5 flex-shrink-0 mt-0.5" />
                <span>Plot 2D/2E Nakasero Hill Road<br />P.O.Box 29692 Kampala, Uganda</span>
              </li>
              <li className="flex items-center gap-2 text-sm text-primary-foreground/90">
                <Phone className="h-5 w-5 flex-shrink-0" />
                <div className="flex flex-col">
                  <a href="tel:+256785609370" className="hover:text-primary-foreground transition-colors">
                    +256 785 609 370
                  </a>
                  <a href="tel:+256756790357" className="hover:text-primary-foreground transition-colors">
                    +256 756 790 357
                  </a>
                </div>
              </li>
              <li className="flex items-center gap-2 text-sm text-primary-foreground/90">
                <Mail className="h-5 w-5 flex-shrink-0" />
                <a href="mailto:info@m&tmicrofinance.com" className="hover:text-primary-foreground transition-colors">
                  info@m&tmicrofinance.com
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-primary-foreground/20 mt-8 pt-8 text-center text-sm text-primary-foreground/80">
          <p>&copy; {new Date().getFullYear()} M&T Microfinance (U) Ltd. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
