import { motion } from "framer-motion";
import { Plus, FileText, Receipt, PiggyBank, Link2 } from "lucide-react";

interface QuickActionsProps {
  onConnectBank?: () => void;
}

const QuickActions = ({ onConnectBank }: QuickActionsProps) => {
  const actions = [
    { label: "Ny utgift", icon: Receipt, color: "bg-destructive/10 text-destructive", onClick: undefined },
    { label: "Ny intäkt", icon: Plus, color: "bg-primary/10 text-primary", onClick: undefined },
    { label: "Skanna bank", icon: Link2, color: "bg-accent text-accent-foreground", onClick: onConnectBank },
    { label: "Skapa faktura", icon: FileText, color: "bg-warning/10 text-warning", onClick: undefined },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.4 }}
      className="glass-card rounded-xl p-6"
    >
      <h3 className="text-lg font-display font-semibold mb-4">Snabbåtgärder</h3>
      <div className="grid grid-cols-2 gap-3">
        {actions.map((action) => (
          <button
            key={action.label}
            onClick={action.onClick}
            className="flex items-center gap-3 p-4 rounded-lg bg-secondary/50 hover:bg-secondary transition-colors text-left group"
          >
            <div className={`p-2 rounded-lg ${action.color}`}>
              <action.icon className="w-4 h-4" />
            </div>
            <span className="text-sm font-medium text-muted-foreground group-hover:text-foreground transition-colors">
              {action.label}
            </span>
          </button>
        ))}
      </div>
    </motion.div>
  );
};

export default QuickActions;
