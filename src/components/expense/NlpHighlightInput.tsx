import * as React from "react";
import { parseExpenseText, formatRelativeDate, formatCurrency } from "../../lib/nlp";
import { ExpenseTag } from "./ExpenseTag";
import type { NlpParseResult } from "../../types";

interface NlpHighlightInputProps {
  value: string;
  onChange: (value: string) => void;
  parseResult: NlpParseResult | null;
  onParseResultChange: (result: NlpParseResult | null) => void;
  onClearDate: () => void;
  onClearAmount: () => void;
  placeholder?: string;
  className?: string;
}

export function NlpHighlightInput({
  value,
  onChange,
  parseResult,
  onParseResultChange,
  onClearDate,
  onClearAmount,
  placeholder = "e.g., \"Coffee 50k today\"",
  className,
}: NlpHighlightInputProps) {
  const inputRef = React.useRef<HTMLInputElement>(null);

  // Parse text when it changes
  React.useEffect(() => {
    if (value.trim()) {
      const result = parseExpenseText(value);
      onParseResultChange(result);
    }
    else {
      onParseResultChange(null);
    }
  }, [value, onParseResultChange]);

  const dateEntity = parseResult?.entities.find(e => e.type === "date");
  const amountEntity = parseResult?.entities.find(e => e.type === "amount");

  return (
    <div className={className}>
      {/* Input Field */}
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full h-12 px-4 text-lg rounded-lg border border-border bg-card focus:outline-none focus:ring-2 focus:ring-ring transition-all"
          autoFocus
        />
      </div>

      {/* Detected Entities */}
      {parseResult && (parseResult.entities.length > 0) && (
        <div className="flex flex-wrap items-center gap-2 mt-3">
          <span className="text-xs text-muted-foreground">Detected:</span>

          {dateEntity && (
            <ExpenseTag
              type="date"
              value={formatRelativeDate(dateEntity.parsedValue as Date)}
              onRemove={onClearDate}
            />
          )}

          {amountEntity && (
            <ExpenseTag
              type="amount"
              value={formatCurrency(amountEntity.parsedValue as number)}
              onRemove={onClearAmount}
            />
          )}
        </div>
      )}

      {/* Description Preview */}
      {parseResult?.description && parseResult.entities.length > 0 && (
        <div className="mt-2 text-sm text-muted-foreground">
          <span className="font-medium">Note:</span>
          {" "}
          {parseResult.description}
        </div>
      )}
    </div>
  );
}

export default NlpHighlightInput;
