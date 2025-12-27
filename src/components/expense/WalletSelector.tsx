import * as React from "react";
import { Wallet } from "lucide-react";
import { Button } from "../ui/button";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "../ui/select";
import walletService from "../../services/walletService";
import type { Wallet as WalletType } from "../../types";

interface WalletSelectorProps {
    wallets: WalletType[];
    selectedWalletId: string;
    onWalletSelect: (walletId: string) => void;
    onWalletCreated: (wallet: WalletType) => void;
}

export function WalletSelector({
    wallets,
    selectedWalletId,
    onWalletSelect,
    onWalletCreated,
}: WalletSelectorProps) {
    const [showNewWallet, setShowNewWallet] = React.useState(false);
    const [newWalletName, setNewWalletName] = React.useState("");
    const [isCreating, setIsCreating] = React.useState(false);

    const handleCreateWallet = async (e?: React.FormEvent) => {
        e?.preventDefault();
        if (!newWalletName.trim()) return;

        setIsCreating(true);
        try {
            const wallet = await walletService.create({
                name: newWalletName.trim(),
                balance: 0,
                currency: "VND",
            });
            onWalletCreated(wallet);
            onWalletSelect(wallet.id);
            setShowNewWallet(false);
            setNewWalletName("");
        } catch (error) {
            console.error("Failed to create wallet:", error);
        } finally {
            setIsCreating(false);
        }
    };

    return (
        <div className="space-y-2">
            <label className="text-sm font-medium flex items-center gap-2">
                <Wallet className="w-4 h-4 text-muted-foreground" />
                Wallet
            </label>
            <div className="h-10">
                {showNewWallet ? (
                    <div className="flex gap-2 h-full">
                        <input
                            type="text"
                            value={newWalletName}
                            onChange={(e) => setNewWalletName(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === "Enter") {
                                    handleCreateWallet(e);
                                }
                            }}
                            placeholder="Wallet name"
                            className="flex-1 h-10 px-3 rounded-md border border-input bg-background text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                            autoFocus
                            disabled={isCreating}
                        />
                        <Button
                            size="sm"
                            onClick={handleCreateWallet}
                            className="h-10 px-3"
                            disabled={isCreating}
                        >
                            Add
                        </Button>
                        <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => setShowNewWallet(false)}
                            className="h-10 w-10 p-0"
                            disabled={isCreating}
                        >
                            ×
                        </Button>
                    </div>
                ) : (
                    <Select value={selectedWalletId} onValueChange={onWalletSelect}>
                        <SelectTrigger className="h-10">
                            <SelectValue placeholder="Select wallet" />
                        </SelectTrigger>
                        <SelectContent>
                            {wallets.map((wallet) => (
                                <SelectItem key={wallet.id} value={wallet.id}>
                                    {wallet.icon || "💳"} {wallet.name}
                                </SelectItem>
                            ))}
                            <button
                                onClick={(e) => {
                                    e.preventDefault();
                                    setShowNewWallet(true);
                                }}
                                className="w-full px-2 py-1.5 text-sm text-left text-primary hover:bg-accent cursor-pointer flex items-center gap-2"
                            >
                                <span className="text-lg leading-none">+</span> Create new
                                wallet
                            </button>
                        </SelectContent>
                    </Select>
                )}
            </div>
        </div>
    );
}
