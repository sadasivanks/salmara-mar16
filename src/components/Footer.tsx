import { Facebook, Instagram, Youtube, Linkedin, Lock, Wallet, BadgeCheck } from "lucide-react";
import { Link } from "react-router-dom";
import { siteConfig } from "@/config/site.config";
const logo = "/images/brand/salamara_icon.jpg";

const Footer = () => (
  <footer className="bg-[#5A7A5C] text-white pt-24 pb-12">
    <div className="container mx-auto px-4">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-16 lg:gap-8 mb-20">
        {/* Brand Column */}
        <div className="max-w-xs">
          {/* <img src={logo} alt={siteConfig.name} className="h-12 w-auto mb-6 brightness-0 invert opacity-90" /> */}
          <p className="text-white/90 font-body text-base leading-relaxed">
            Rediscover Wellness Through Authentic Ayurveda. Rooted in Karnataka, trusted PAN India.
          </p>
        </div>

        {/* Quick Links */}
        <div>
          <h3 className="font-display font-bold text-xl mb-8 text-white">Quick Links</h3>
          <ul className="space-y-4">
            {["Home", "About Us", "Shop Now", "Blog", "Contact Us"].map((label) => {
              const href = label === "Home" ? "/" : 
                           label === "About Us" ? "/about" : 
                           label === "Shop Now" ? "/shop" : 
                           label === "Blog" ? "/#blog" : 
                           label === "Contact Us" ? "/contact" : "#footer";
              
              const isExternal = href.startsWith("#");
              
              return (
                <li key={label}>
                  {isExternal ? (
                    <a href={href} className="text-white/90 hover:text-white transition-colors text-base font-body">
                      {label}
                    </a>
                  ) : (
                    <Link to={href} className="text-white/90 hover:text-white transition-colors text-base font-body">
                      {label}
                    </Link>
                  )}
                </li>
              );
            })}
          </ul>
        </div>

        {/* Legal */}
        <div>
          <h3 className="font-display font-bold text-xl mb-8 text-white">Legal</h3>
          <ul className="space-y-4">
            {["Terms & Conditions", "Privacy Policy", "Legacy", "Shipping Policy"].map((label) => {
              const href = label === "Legacy" ? "/about" : "#";
              return (
                <li key={label}>
                  {href === "#" ? (
                    <a href={href} className="text-white/90 hover:text-white transition-colors text-base font-body">
                      {label}
                    </a>
                  ) : (
                    <Link to={href} className="text-white/90 hover:text-white transition-colors text-base font-body">
                      {label}
                    </Link>
                  )}
                </li>
              );
            })}
          </ul>
        </div>

        {/* Connect */}
        <div>
          <h3 className="font-display font-bold text-xl mb-8 text-white">Connect</h3>
          <div className="flex gap-4">
            {[
              { Icon: Facebook, href: siteConfig.social.facebook, label: "Facebook" },
              { Icon: Instagram, href: siteConfig.social.instagram, label: "Instagram" },
              { Icon: Youtube, href: siteConfig.social.youtube, label: "Youtube" }
            ].map(({ Icon, href, label }, i) => (
              <a
                key={i}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full border border-white/20 flex items-center justify-center hover:bg-white/10 transition-all font-body text-base"
                aria-label={label}
              >
                <Icon className="h-4 w-4 text-white" />
              </a>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="pt-12 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-6">
        <p className="text-white/80 text-sm font-body">
          © {new Date().getFullYear()} {siteConfig.name}. All Rights Reserved.
        </p>
        
        <div className="flex flex-wrap items-center gap-6 md:gap-8">
          <div className="flex items-center gap-2 text-white/80">
            <Lock className="h-5 w-5 text-[#C5A059]" />
            <span className="text-xs sm:text-sm uppercase tracking-widest font-bold">Secure Payments</span>
          </div>
          <div className="flex items-center gap-2 text-white/80">
            <Wallet className="h-5 w-5 text-[#C5A059]" />
            <span className="text-xs sm:text-sm uppercase tracking-widest font-bold">COD Available</span>
          </div>
          <div className="flex items-center gap-2 text-white/80">
            <BadgeCheck className="h-5 w-5 text-[#C5A059]" />
            <span className="text-xs sm:text-sm uppercase tracking-widest font-bold">GMP Certified</span>
          </div>
        </div>
      </div>
    </div>
  </footer>
);

export default Footer;
