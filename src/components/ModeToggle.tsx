import { motion } from "framer-motion";
import { Building2, User } from "lucide-react";

interface ModeToggleProps {
  mode: "personal" | "business";
  onToggle: (mode: "personal" | "business") => void;
}

const ModeToggle = ({ mode, onToggle }: ModeToggleProps) => {
  return (
    <div className="flex items-center gap-1 p-1 rounded-lg bg-secondary">
      <button
        onClick={() => onToggle("personal")}
        className={`relative flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
          mode === "personal" ? "text-primary-foreground" : "text-muted-foreground hover:text-foreground"
        }`}
      >
        {mode === "personal" && (
          <motion.div
            layoutId="mode-bg"
            className="absolute inset-0 bg-primary rounded-md"
            transition={{ type: "spring", duration: 0.4 }}
          />
        )}
        <span className="relative z-10 flex items-center gap-2">
          <User className="w-4 h-4" />
          Privat
        </span>
      </button>
      <button
        onClick={() => onToggle("business")}
        className={`relative flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
          mode === "business" ? "text-primary-foreground" : "text-muted-foreground hover:text-foreground"
        }`}
      >
        {mode === "business" && (
          <motion.div
            layoutId="mode-bg"
            className="absolute inset-0 bg-primary rounded-md"
            transition={{ type: "spring", duration: 0.4 }}
          />
        )}
        <span className="relative z-10 flex items-center gap-2">
          <Building2 className="w-4 h-4" />
          Företag
        </span>
      </button>
    </div>
  );
};

export default ModeToggle;
