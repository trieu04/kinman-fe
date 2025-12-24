import type { NlpEntity, NlpParseResult } from "../types";

/**
 * Parse natural language input to extract date, amount, and description.
 * This is a placeholder implementation using regex patterns.
 * Can be replaced with LLM-based parsing (Gemini/Ollama) later.
 */

// Date patterns
const DATE_PATTERNS = [
  { pattern: /\btoday\b/i, getValue: () => new Date() },
  { pattern: /\byesterday\b/i, getValue: () => {
    const d = new Date();
    d.setDate(d.getDate() - 1);
    return d;
  } },
  { pattern: /\btomorrow\b/i, getValue: () => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d;
  } },
  { pattern: /\bnext\s+(monday|tuesday|wednesday|thursday|friday|saturday|sunday)\b/i, getValue: (match: string) => {
    const days = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];
    const targetDay = days.indexOf(match.toLowerCase().split(" ")[1]);
    const d = new Date();
    const currentDay = d.getDay();
    const daysUntilTarget = ((targetDay - currentDay + 7) % 7) || 7;
    d.setDate(d.getDate() + daysUntilTarget);
    return d;
  } },
  { pattern: /\b(\d{1,2})[/\-](\d{1,2})(?:[/\-](\d{2,4}))?\b/, getValue: (match: string) => {
    const parts = match.split(/[/\-]/);
    const day = Number.parseInt(parts[0], 10);
    const month = Number.parseInt(parts[1], 10) - 1;
    const year = parts[2] ? (parts[2].length === 2 ? 2000 + Number.parseInt(parts[2], 10) : Number.parseInt(parts[2], 10)) : new Date().getFullYear();
    return new Date(year, month, day);
  } },
];

// Amount patterns
const AMOUNT_PATTERNS = [
  // Vietnamese format: 500k, 1.5M, 2tr
  { pattern: /\b(\d+(?:[.,]\d+)?)\s*k\b/i, multiplier: 1000 },
  { pattern: /\b(\d+(?:[.,]\d+)?)\s*m\b/i, multiplier: 1000000 },
  { pattern: /\b(\d+(?:[.,]\d+)?)\s*(?:tr|triệu)\b/i, multiplier: 1000000 },
  { pattern: /\b(\d+(?:[.,]\d+)?)\s*(?:nghìn|ngàn)\b/i, multiplier: 1000 },
  // Currency formats
  { pattern: /\$\s*(\d+(?:[.,]\d+)?)/, multiplier: 1 },
  { pattern: /(\d+(?:[.,]\d+)?)\s*(?:đ|vnd|VND)\b/, multiplier: 1 },
  // Plain numbers (large numbers likely to be money)
  { pattern: /\b(\d{4,})(?:[.,]\d+)?\b/, multiplier: 1, minValue: 1000 },
];

function parseAmount(value: string, multiplier: number): number {
  // Handle both comma and dot as decimal separators
  const normalized = value.replace(/,/g, ".");
  return Number.parseFloat(normalized) * multiplier;
}

export function parseExpenseText(text: string): NlpParseResult {
  const entities: NlpEntity[] = [];
  let description = text;
  let extractedAmount: number | undefined;
  let extractedDate: Date | undefined;

  // Find dates - check each pattern and keep the first exact match
  for (let i = 0; i < DATE_PATTERNS.length; i++) {
    const datePattern = DATE_PATTERNS[i];
    const match = text.match(datePattern.pattern);
    
    if (match) {
      const date = datePattern.getValue(match[0]);
      entities.push({
        type: "date",
        value: match[0],
        parsedValue: date,
        startIndex: match.index!,
        endIndex: match.index! + match[0].length,
      });
      extractedDate = date;
      break; // Only take first date match
    }
  }

  // Find amounts
  for (const amountPattern of AMOUNT_PATTERNS) {
    const match = text.match(amountPattern.pattern);
    if (match) {
      const amount = parseAmount(match[1], amountPattern.multiplier);
      if (!amountPattern.minValue || amount >= amountPattern.minValue) {
        entities.push({
          type: "amount",
          value: match[0],
          parsedValue: amount,
          startIndex: match.index!,
          endIndex: match.index! + match[0].length,
        });
        extractedAmount = amount;
        break; // Only take first amount match
      }
    }
  }

  // Remove matched entities from description
  const sortedEntities = [...entities].sort((a, b) => b.startIndex - a.startIndex);
  for (const entity of sortedEntities) {
    description = description.slice(0, entity.startIndex) + description.slice(entity.endIndex);
  }
  description = description.replace(/\s+/g, " ").trim();

  return {
    originalText: text,
    entities,
    description,
    amount: extractedAmount,
    date: extractedDate,
  };
}

// Helper to format currency for display
export function formatCurrency(amount: number, currency = "VND"): string {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(amount);
}

// Helper to format relative dates
export function formatRelativeDate(date: Date): string {
  // Reset both dates to midnight to avoid time-based mismatches
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const checkDate = new Date(date);
  checkDate.setHours(0, 0, 0, 0);
  
  const diffDays = Math.floor((checkDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

  if (diffDays === 0)
    return "Today";
  if (diffDays === -1)
    return "Yesterday";
  if (diffDays === 1)
    return "Tomorrow";

  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}
