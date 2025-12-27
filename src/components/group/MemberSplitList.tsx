
import { Users } from "lucide-react";
import type { GroupMember } from "../../types";

interface MemberSplitListProps {
  members: GroupMember[];
  splitType: "equal" | "exact";
  selectedMemberIds: string[];
  exactAmounts: Record<string, string>;
  totalAmount: number;
  onMemberToggle: (userId: string) => void;
  onExactAmountChange: (userId: string, amount: string) => void;
}

export function MemberSplitList({
  members,
  splitType,
  selectedMemberIds,
  exactAmounts,
  totalAmount,
  onMemberToggle,
  onExactAmountChange,
}: MemberSplitListProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
      maximumFractionDigits: 0,
    }).format(value);
  };

  const selectedCount = selectedMemberIds.length;
  const equalShare = selectedCount > 0 ? totalAmount / selectedCount : 0;

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium flex items-center gap-1">
        <Users className="w-4 h-4" />
        Split Among ({selectedCount} selected)
      </label>
      <div className="space-y-2 max-h-[200px] overflow-y-auto">
        {members.map((member) => {
          const memberId = member.userId || member.user?.id || "";
          const isSelected = selectedMemberIds.includes(memberId);
          return (
            <div
              key={member.id}
              className={`flex items-center justify-between p-3 rounded-lg border transition-colors cursor-pointer ${
                isSelected
                  ? "border-primary bg-primary/5"
                  : "border-border hover:border-muted-foreground"
              }`}
              onClick={() => splitType === "equal" && onMemberToggle(memberId)}
            >
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={isSelected}
                  onChange={() => onMemberToggle(memberId)}
                  className="w-4 h-4 cursor-pointer"
                  onClick={(e) => e.stopPropagation()}
                />
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white text-sm font-medium">
                  {member.user?.name?.charAt(0)?.toUpperCase() || "?"}
                </div>
                <span className="font-medium">
                  {member.user?.name || member.user?.username}
                </span>
              </div>

              {splitType === "equal" ? (
                <span
                  className={`font-semibold ${
                    isSelected ? "text-foreground" : "text-muted-foreground"
                  }`}
                >
                  {isSelected && totalAmount > 0
                    ? formatCurrency(equalShare)
                    : "-"}
                </span>
              ) : (
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
                  className="w-24 h-8 px-2 text-right rounded-md border border-border bg-card text-sm"
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
