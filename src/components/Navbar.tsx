import { motion } from "framer-motion";
import { Bell, Settings, LogOut } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate, useLocation } from "react-router-dom";
import { toast } from "sonner";
import logo from "@/assets/finance-fairy-logo.png";

const Navbar = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const navLinks = [
    { label: "Dashboard", href: "/" },
    { label: "Transaktioner", href: "/" },
    { label: "Rapporter", href: "/rapporter" },
    { label: "Fakturor", href: "/fakturor" },
  ];

  const handleSignOut = async () => {
    await signOut();
    toast.success("Utloggad!");
    navigate("/auth");
  };

  return (
    <motion.header
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="flex items-center justify-between px-8 py-4 border-b border-border bg-card/50 backdrop-blur-xl sticky top-0 z-50"
    >
      <div className="flex items-center gap-8">
        <div className="flex items-center gap-2">
          <img src={logo} alt="Finance Fairy" className="w-8 h-8 object-contain" />
          <h1 className="text-xl font-display font-bold">
            <span className="text-foreground">Finance</span>{" "}
            <span className="text-gradient">Fairy</span>
          </h1>
        </div>
        <nav className="hidden md:flex items-center gap-6">
          {navLinks.map(link => (
            <button
              key={link.label}
              onClick={() => navigate(link.href)}
              className={`text-sm font-medium transition-colors ${
                location.pathname === link.href
                  ? "text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {link.label}
            </button>
          ))}
        </nav>
      </div>

      <div className="flex items-center gap-4">
        
        <button className="p-2 rounded-lg hover:bg-secondary transition-colors text-muted-foreground hover:text-foreground">
          <Bell className="w-5 h-5" />
        </button>
        <button className="p-2 rounded-lg hover:bg-secondary transition-colors text-muted-foreground hover:text-foreground">
          <Settings className="w-5 h-5" />
        </button>
        <div className="w-9 h-9 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center">
          <span className="text-sm font-semibold text-primary">{user?.email?.[0]?.toUpperCase() || "A"}</span>
        </div>
        <button onClick={handleSignOut} className="p-2 rounded-lg hover:bg-secondary transition-colors text-muted-foreground hover:text-foreground" title="Logga ut">
          <LogOut className="w-5 h-5" />
        </button>
      </div>
    </motion.header>
  );
};

export default Navbar;
