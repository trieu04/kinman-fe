import type { Group } from "@/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface GroupHeaderProps {
  group: Group;
  onOpenAddExpense: () => void;
}

export function GroupHeader({ group, onOpenAddExpense }: GroupHeaderProps) {
  return (
    <div className="flex justify-between items-center">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">{group.name}</h2>
        <div className="flex items-center gap-2 mt-1">
          <span className="text-sm text-muted-foreground">Mã nhóm:</span>
          <Badge variant="secondary" className="font-mono">
            {group.code}
          </Badge>
        </div>
      </div>
      <Button onClick={onOpenAddExpense}>Thêm chi tiêu</Button>
    </div>
  );
}
