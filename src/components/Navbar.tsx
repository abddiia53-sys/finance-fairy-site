import { motion } from "framer-motion";
import { Bell, Settings, LogOut } from "lucide-react";
import ModeToggle from "./ModeToggle";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate, useLocation } from "react-router-dom";
import { toast } from "sonner";

interface NavbarProps {
  mode: "personal" | "business";
  onModeChange: (mode: "personal" | "business") => void;
}

const Navbar = ({ mode, onModeChange }: NavbarProps) => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

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
        <h1 className="text-2xl font-display font-bold">
          <span className="text-gradient">26</span>
          <span className="text-muted-foreground">.io</span>
        </h1>
        <nav className="hidden md:flex items-center gap-6">
          <a href="#" className="text-sm font-medium text-foreground hover:text-primary transition-colors">Dashboard</a>
          <a href="#" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">Transaktioner</a>
          <a href="#" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">Rapporter</a>
          <a href="#" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">Fakturor</a>
        </nav>
      </div>

      <div className="flex items-center gap-4">
        <ModeToggle mode={mode} onToggle={onModeChange} />
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
