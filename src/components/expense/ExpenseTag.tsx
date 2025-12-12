import { X } from "lucide-react";
import { cn } from "../../lib/utils";

interface ExpenseTagProps {
  type: "date" | "amount";
  value: string;
  onRemove?: () => void;
  className?: string;
}

export function ExpenseTag({ type, value, onRemove, className }: ExpenseTagProps) {
  const isDate = type === "date";

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-sm font-medium",
        isDate
          ? "bg-[var(--nlp-date)] text-[var(--nlp-date-text)]"
          : "bg-[var(--nlp-amount)] text-[var(--nlp-amount-text)]",
        className,
      )}
    >
      <span>{value}</span>
      {onRemove && (
        <button
          type="button"
          onClick={onRemove}
          className="ml-0.5 rounded-full p-0.5 hover:bg-black/10 cursor-pointer transition-colors"
          aria-label={`Remove ${type}`}
        >
          <X className="w-3 h-3" />
        </button>
      )}
    </span>
  );
}

export default ExpenseTag;
