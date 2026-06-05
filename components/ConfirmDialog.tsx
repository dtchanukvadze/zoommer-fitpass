// components/ConfirmDialog.tsx
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";

export default function ConfirmDialog({ open, onOpenChange, onConfirm, title, description, loading }: any) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>გაუქმება</Button>
          <Button variant="danger" onClick={onConfirm} disabled={loading}>{loading ? "იტვირთება..." : "წაშლა"}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}