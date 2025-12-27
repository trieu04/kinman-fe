import type { Debt } from "@/types";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface SettleUpDialogProps {
  open: boolean;
  debt: Debt | null;
  onClose: () => void;
  onConfirm: () => void;
}

export function SettleUpDialog({ open, debt, onClose, onConfirm }: SettleUpDialogProps) {
  const getName = (user: string | any) => {
    if (typeof user === 'string') return user;
    return user?.name || user?.email || '?';
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Ghi nhận thanh toán</DialogTitle>
          <DialogDescription>
            Xác nhận ghi nhận khoản thanh toán {" "}
            <strong>{debt?.amount.toLocaleString()}</strong> từ {" "}
            <strong>{getName(debt?.from)}</strong> tới {" "}
            <strong>{getName(debt?.to)}</strong>?
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Hủy</Button>
          <Button onClick={onConfirm}>Xác nhận</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
