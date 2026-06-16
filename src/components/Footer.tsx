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
              Developing Together - Your trusted partner. M&T Microfinance Uganda Limited is licensed and regulated by the Uganda Microfinance Regulatory Authority (UMRA).
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
              <li className="flex items-start gap-2 text-sm text-primary-foreground/90">
                <Phone className="h-5 w-5 flex-shrink-0 mt-0.5" />
                <div className="flex flex-col">
                  <a href="tel:+256730687607" className="hover:text-primary-foreground transition-colors">
                    +256 (0) 730 687 607
                  </a>
                  <a href="tel:+256708693071" className="hover:text-primary-foreground transition-colors">
                    +256 (0) 708 693 071
                  </a>
                </div>
              </li>
              <li className="flex items-center gap-2 text-sm text-primary-foreground/90">
                <Mail className="h-5 w-5 flex-shrink-0" />
                <a href="mailto:info@mtmicrofinance.com" className="hover:text-primary-foreground transition-colors">
                  info@mtmicrofinance.com
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-primary-foreground/20 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center text-sm text-primary-foreground/80 gap-4">
          <p>&copy; {new Date().getFullYear()} M&T Microfinance Uganda Limited. All rights reserved.</p>
          <div className="flex gap-4">
            <Link to="/privacy" className="hover:text-primary-foreground hover:underline transition-colors">
              Privacy Policy
            </Link>
            <Link to="/terms" className="hover:text-primary-foreground hover:underline transition-colors">
              Terms of Use
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
