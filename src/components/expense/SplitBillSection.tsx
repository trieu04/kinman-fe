import { Users } from "lucide-react";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "../ui/select";
import type { Group, SplitType } from "../../types";

interface SplitBillSectionProps {
    enabled: boolean;
    onToggle: (enabled: boolean) => void;
    groups: Group[];
    selectedGroupId: string;
    onGroupSelect: (groupId: string) => void;
    splitType: SplitType;
    onSplitTypeChange: (type: SplitType) => void;
    selectedMemberIds: string[];
    onMemberToggle: (userId: string) => void;
    exactAmounts: Record<string, string>;
    onExactAmountChange: (userId: string, amount: string) => void;
    totalAmount: number;
    currentUserId?: string;
}

export function SplitBillSection({
    enabled,
    onToggle,
    groups,
    selectedGroupId,
    onGroupSelect,
    splitType,
    onSplitTypeChange,
    selectedMemberIds,
    onMemberToggle,
    exactAmounts,
    onExactAmountChange,
    totalAmount,
    currentUserId,
}: SplitBillSectionProps) {
    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat("vi-VN", {
            style: "currency",
            currency: "VND",
            maximumFractionDigits: 0,
        }).format(value);
    };

    const exactTotal = Object.values(exactAmounts).reduce(
        (sum, val) => sum + (Number(val) || 0),
        0
    );
    const exactRemaining = totalAmount - exactTotal;

    const selectedGroup = groups.find((g) => g.id === selectedGroupId);

    return (
        <>
            {/* Split Bill Toggle */}
            <div className="flex items-center justify-between p-4 rounded-xl bg-muted/40">
                <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-primary/10">
                        <Users className="w-4 h-4 text-primary" />
                    </div>
                    <span className="text-sm font-medium">Split with group?</span>
                </div>
                <button
                    type="button"
                    onClick={() => onToggle(!enabled)}
                    aria-label="Toggle split bill"
                    title="Toggle split bill"
                    className={`w-12 h-7 rounded-full transition-all duration-200 cursor-pointer ${enabled ? "bg-primary" : "bg-muted"
                        }`}
                >
                    <span
                        className={`block w-5 h-5 rounded-full bg-white shadow-md transform transition-transform duration-200 ${enabled ? "translate-x-6" : "translate-x-1"
                            }`}
                    />
                </button>
            </div>

            {/* Split Bill Details */}
            {enabled && (
                <div className="p-4 rounded-xl border border-border bg-muted/20 space-y-4">
                    {/* Group Selection */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Select Group</label>
                        <Select value={selectedGroupId} onValueChange={onGroupSelect}>
                            <SelectTrigger className="bg-background">
                                <SelectValue placeholder="Select a group to split with" />
                            </SelectTrigger>
                            <SelectContent>
                                {groups.map((group) => (
                                    <SelectItem key={group.id} value={group.id}>
                                        {group.name}
                                        <span className="ml-2 text-muted-foreground text-xs">
                                            ({group.members.length} members)
                                        </span>
                                    </SelectItem>
                                ))}
                                {groups.length === 0 && (
                                    <div className="p-2 text-sm text-muted-foreground text-center">
                                        No groups found
                                    </div>
                                )}
                            </SelectContent>
                        </Select>
                    </div>

                    {selectedGroupId && (
                        <>
                            {/* Split Method */}
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Split Method</label>
                                <div className="flex gap-2">
                                    <button
                                        type="button"
                                        onClick={() => onSplitTypeChange("equal" as SplitType)}
                                        className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-medium transition-colors cursor-pointer ${splitType === "equal"
                                                ? "bg-primary text-white"
                                                : "bg-background border border-border text-muted-foreground hover:bg-accent"
                                            }`}
                                    >
                                        Equal Split
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => onSplitTypeChange("exact" as SplitType)}
                                        className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-medium transition-colors cursor-pointer ${splitType === "exact"
                                                ? "bg-primary text-white"
                                                : "bg-background border border-border text-muted-foreground hover:bg-accent"
                                            }`}
                                    >
                                        Exact Amount
                                    </button>
                                </div>
                            </div>

                            {/* Members List */}
                            <div className="space-y-2">
                                <label className="text-sm font-medium flex items-center justify-between">
                                    <span>Members</span>
                                    {splitType === "equal" && (
                                        <span className="text-xs text-muted-foreground">
                                            {formatCurrency(
                                                selectedMemberIds.length > 0
                                                    ? Math.floor(totalAmount / selectedMemberIds.length)
                                                    : 0
                                            )}{" "}
                                            / person
                                        </span>
                                    )}
                                </label>
                                <div className="max-h-[150px] overflow-y-auto space-y-2 pr-1">
                                    {selectedGroup?.members.map((member) => {
                                        const memberId = member.userId || member.user?.id || "";
                                        const isSelected = selectedMemberIds.includes(memberId);

                                        return (
                                            <div
                                                key={member.id}
                                                className={`flex items-center justify-between p-2 rounded-lg border text-sm transition-colors ${isSelected && splitType === "equal"
                                                        ? "border-primary/50 bg-primary/5"
                                                        : "border-border bg-background"
                                                    }`}
                                                onClick={() =>
                                                    splitType === "equal" && onMemberToggle(memberId)
                                                }
                                            >
                                                <div className="flex items-center gap-2">
                                                    {splitType === "equal" && (
                                                        <input
                                                            type="checkbox"
                                                            checked={isSelected}
                                                            onChange={() => onMemberToggle(memberId)}
                                                            className="rounded border-gray-300 text-primary focus:ring-primary"
                                                            onClick={(e) => e.stopPropagation()}
                                                        />
                                                    )}
                                                    <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-xs font-medium text-primary">
                                                        {member.user?.name?.charAt(0).toUpperCase() ||
                                                            member.user?.username?.charAt(0).toUpperCase()}
                                                    </div>
                                                    <span
                                                        className={
                                                            memberId === currentUserId ? "font-semibold" : ""
                                                        }
                                                    >
                                                        {member.user?.name || member.user?.username}
                                                        {memberId === currentUserId && " (You)"}
                                                    </span>
                                                </div>

                                                {splitType === "exact" && (
                                                    <input
                                                        type="number"
                                                        value={exactAmounts[memberId] || ""}
                                                        onChange={(e) => {
                                                            onExactAmountChange(memberId, e.target.value);
                                                            if (
                                                                !selectedMemberIds.includes(memberId) &&
                                                                e.target.value
                                                            ) {
                                                                onMemberToggle(memberId);
                                                            }
                                                        }}
                                                        onClick={(e) => e.stopPropagation()}
                                                        placeholder="0"
                                                        className="w-20 h-7 px-2 text-right rounded-md border border-border bg-background text-xs"
                                                    />
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Exact Split Summary */}
                            {splitType === "exact" && (
                                <div className="flex justify-between items-center text-xs pt-1">
                                    <span className="text-muted-foreground">
                                        Assigned: {formatCurrency(exactTotal)}
                                    </span>
                                    <span
                                        className={
                                            Math.abs(exactRemaining) < 1
                                                ? "text-green-600 font-medium"
                                                : "text-red-500 font-medium"
                                        }
                                    >
                                        Remaining: {formatCurrency(exactRemaining)}
                                    </span>
                                </div>
                            )}
                        </>
                    )}
                </div>
            )}
        </>
    );
}
