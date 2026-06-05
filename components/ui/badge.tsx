// components/ui/badge.tsx
import { cn } from "@/lib/utils";

export function Badge({
  status,
  className,
}: {
  status: "active" | "cancelled";
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold",
        status === "active"
          ? "bg-green-50 text-green-600"
          : "bg-gray-100 text-gray-500",
        className
      )}
    >
      <span
        className={cn(
          "h-2 w-2 rounded-full",
          status === "active" ? "bg-green-500" : "bg-gray-400"
        )}
      />
      {status === "active" ? "აქტიური" : "გაუქმებული"}
    </span>
  );
}