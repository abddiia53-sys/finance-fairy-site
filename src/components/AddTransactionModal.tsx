import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Plus, Minus, CalendarIcon, Tag, FileText, DollarSign } from "lucide-react";
import { z } from "zod";

const transactionSchema = z.object({
  description: z.string().trim().min(1, "Beskrivning krävs").max(200, "Max 200 tecken"),
  amount: z.number().positive("Beloppet måste vara positivt").max(99999999, "Beloppet är för stort"),
  category: z.string().trim().min(1, "Välj en kategori"),
  date: z.string().min(1, "Datum krävs"),
  note: z.string().max(500, "Max 500 tecken").optional(),
});

type TransactionFormData = z.infer<typeof transactionSchema>;

const expenseCategories = ["Lokal", "IT", "Personal", "Marknadsföring", "Material", "Försäkring", "Transport", "Övrigt"];
const incomeCategories = ["Intäkt", "Konsultarvode", "Försäljning", "Freelance", "Investering", "Övrigt"];

interface AddTransactionModalProps {
  open: boolean;
  onClose: () => void;
  onAdd: (tx: TransactionFormData & { type: "income" | "expense" }) => void;
  initialType?: "income" | "expense";
}

const AddTransactionModal = ({ open, onClose, onAdd, initialType = "expense" }: AddTransactionModalProps) => {
  const [type, setType] = useState<"income" | "expense">(initialType);
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [note, setNote] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  const categories = type === "expense" ? expenseCategories : incomeCategories;

  const resetForm = () => {
    setDescription("");
    setAmount("");
    setCategory("");
    setDate(new Date().toISOString().split("T")[0]);
    setNote("");
    setErrors({});
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const parsed = transactionSchema.safeParse({
      description,
      amount: parseFloat(amount) || 0,
      category,
      date,
      note: note || undefined,
    });

    if (!parsed.success) {
      const fieldErrors: Record<string, string> = {};
      parsed.error.errors.forEach((err) => {
        if (err.path[0]) fieldErrors[err.path[0] as string] = err.message;
      });
      setErrors(fieldErrors);
      return;
    }

    onAdd({ ...parsed.data, type });
    resetForm();
    onClose();
  };

  if (!open) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm"
        onClick={handleClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ type: "spring", duration: 0.5 }}
          className="w-full max-w-lg glass-card rounded-2xl overflow-hidden glow-border"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-border">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg ${type === "income" ? "bg-primary/10" : "bg-destructive/10"}`}>
                {type === "income" ? (
                  <Plus className="w-5 h-5 text-primary" />
                ) : (
                  <Minus className="w-5 h-5 text-destructive" />
                )}
              </div>
              <h3 className="font-display font-semibold text-lg">
                {type === "income" ? "Lägg till intäkt" : "Lägg till utgift"}
              </h3>
            </div>
            <button onClick={handleClose} className="p-2 rounded-lg hover:bg-secondary transition-colors text-muted-foreground">
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-5">
            {/* Type toggle */}
            <div className="flex gap-2 p-1 rounded-lg bg-secondary">
              <button
                type="button"
                onClick={() => { setType("expense"); setCategory(""); }}
                className={`relative flex-1 py-2 rounded-md text-sm font-medium transition-colors ${
                  type === "expense" ? "text-destructive-foreground" : "text-muted-foreground"
                }`}
              >
                {type === "expense" && (
                  <motion.div layoutId="type-bg" className="absolute inset-0 bg-destructive/80 rounded-md" />
                )}
                <span className="relative z-10">Utgift</span>
              </button>
              <button
                type="button"
                onClick={() => { setType("income"); setCategory(""); }}
                className={`relative flex-1 py-2 rounded-md text-sm font-medium transition-colors ${
                  type === "income" ? "text-primary-foreground" : "text-muted-foreground"
                }`}
              >
                {type === "income" && (
                  <motion.div layoutId="type-bg" className="absolute inset-0 bg-primary rounded-md" />
                )}
                <span className="relative z-10">Intäkt</span>
              </button>
            </div>

            {/* Description */}
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-muted-foreground mb-2">
                <FileText className="w-4 h-4" /> Beskrivning
              </label>
              <input
                type="text"
                value={description}
                onChange={(e) => { setDescription(e.target.value); setErrors((p) => ({ ...p, description: "" })); }}
                placeholder="T.ex. Kontorshyra mars"
                maxLength={200}
                className="w-full px-4 py-3 rounded-lg bg-secondary/50 border border-border text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-shadow"
              />
              {errors.description && <p className="text-xs text-destructive mt-1">{errors.description}</p>}
            </div>

            {/* Amount */}
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-muted-foreground mb-2">
                <DollarSign className="w-4 h-4" /> Belopp (kr)
              </label>
              <input
                type="number"
                value={amount}
                onChange={(e) => { setAmount(e.target.value); setErrors((p) => ({ ...p, amount: "" })); }}
                placeholder="0"
                min="0"
                step="0.01"
                className="w-full px-4 py-3 rounded-lg bg-secondary/50 border border-border text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-shadow tabular-nums"
              />
              {errors.amount && <p className="text-xs text-destructive mt-1">{errors.amount}</p>}
            </div>

            {/* Category + Date row */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-muted-foreground mb-2">
                  <Tag className="w-4 h-4" /> Kategori
                </label>
                <select
                  value={category}
                  onChange={(e) => { setCategory(e.target.value); setErrors((p) => ({ ...p, category: "" })); }}
                  className="w-full px-4 py-3 rounded-lg bg-secondary/50 border border-border text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-shadow appearance-none"
                >
                  <option value="" className="bg-card">Välj...</option>
                  {categories.map((c) => (
                    <option key={c} value={c} className="bg-card">{c}</option>
                  ))}
                </select>
                {errors.category && <p className="text-xs text-destructive mt-1">{errors.category}</p>}
              </div>
              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-muted-foreground mb-2">
                  <CalendarIcon className="w-4 h-4" /> Datum
                </label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg bg-secondary/50 border border-border text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-shadow"
                />
                {errors.date && <p className="text-xs text-destructive mt-1">{errors.date}</p>}
              </div>
            </div>

            {/* Note */}
            <div>
              <label className="text-sm font-medium text-muted-foreground mb-2 block">Anteckning (valfritt)</label>
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Extra information..."
                maxLength={500}
                rows={2}
                className="w-full px-4 py-3 rounded-lg bg-secondary/50 border border-border text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-shadow resize-none"
              />
            </div>

            {/* Submit */}
            <button
              type="submit"
              className={`w-full py-3 rounded-lg font-medium text-sm transition-colors ${
                type === "income"
                  ? "bg-primary text-primary-foreground hover:bg-primary/90"
                  : "bg-destructive text-destructive-foreground hover:bg-destructive/90"
              }`}
            >
              {type === "income" ? "Lägg till intäkt" : "Lägg till utgift"}
            </button>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default AddTransactionModal;
