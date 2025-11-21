import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { aiService, type ParsedTransaction } from "../services/ai.service";
import { Loader2, Sparkles, Mic } from "lucide-react";
import { TransactionForm } from "@/features/transactions/components/TransactionForm";

export function AiAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [text, setText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<ParsedTransaction | null>(null);
  const [showForm, setShowForm] = useState(false);

  const handleAnalyze = async () => {
    if (!text) return;
    setIsLoading(true);
    try {
      const data = await aiService.parseTransaction(text);
      setResult(data);
    } catch (error) {
      console.error("Failed to analyze text", error);
    } finally {
      setIsLoading(false);
    }
  };

  const startListening = () => {
    if ("webkitSpeechRecognition" in window || "SpeechRecognition" in window) {
      const SpeechRecognition =
        (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      recognition.onstart = () => setIsLoading(true);
      recognition.onend = () => setIsLoading(false);
      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setText(transcript);
      };
      recognition.start();
    } else {
      alert("Speech recognition not supported in this browser.");
    }
  };

  const handleCreate = () => {
    setShowForm(true);
  };

  const handleSuccess = () => {
    setIsOpen(false);
    setShowForm(false);
    setResult(null);
    setText("");
    // Ideally trigger a refresh of the transaction list
    window.location.reload(); // Simple refresh for now
  };

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button
          variant="default"
          size="icon"
          className="fixed bottom-8 right-8 h-14 w-14 rounded-full shadow-lg bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 transition-all duration-300 z-50"
        >
          <Sparkles className="h-6 w-6 text-white" />
        </Button>
      </SheetTrigger>
      <SheetContent className="w-[400px] sm:w-[540px] overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-indigo-500" />
            AI Assistant
          </SheetTitle>
          <SheetDescription>
            Describe your transaction or use voice input.
          </SheetDescription>
        </SheetHeader>

        {!showForm ? (
          <div className="mt-6 space-y-6">
            <div className="space-y-2">
              <Label>Transaction Description</Label>
              <div className="relative">
                <Textarea
                  placeholder="e.g. Spent $50 on groceries at Walmart yesterday"
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  className="min-h-[100px] pr-10"
                />
                <Button
                  size="icon"
                  variant="ghost"
                  className="absolute bottom-2 right-2"
                  onClick={startListening}
                  disabled={isLoading}
                >
                  <Mic className={`h-4 w-4 ${isLoading ? "text-red-500 animate-pulse" : "text-muted-foreground"}`} />
                </Button>
              </div>
            </div>

            <Button
              onClick={handleAnalyze}
              disabled={!text || isLoading}
              className="w-full"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Analyzing...
                </>
              ) : (
                "Analyze"
              )}
            </Button>

            {result && (
              <div className="space-y-4 border rounded-lg p-4 bg-muted/50">
                <h3 className="font-semibold">Analysis Result</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Amount:</span>
                    <p className="font-medium">${result.amount}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Date:</span>
                    <p className="font-medium">{result.date}</p>
                  </div>
                  <div className="col-span-2">
                    <span className="text-muted-foreground">Description:</span>
                    <p className="font-medium">{result.description}</p>
                  </div>
                  <div className="col-span-2">
                    <span className="text-muted-foreground">Category (Guessed):</span>
                    <p className="font-medium">{result.categoryName}</p>
                  </div>
                </div>
                <Button onClick={handleCreate} className="w-full">
                  Create Transaction
                </Button>
              </div>
            )}
          </div>
        ) : (
          <div className="mt-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold">Review & Save</h3>
              <Button variant="ghost" size="sm" onClick={() => setShowForm(false)}>
                Back
              </Button>
            </div>
            <TransactionForm
              onSuccess={handleSuccess}
              initialData={result || undefined}
            />
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
