// components/EmptyState.tsx — ცარიელი მდგომარეობის უნივერსალური კომპონენტი
"use client";
import { motion } from "framer-motion";
import { LucideIcon } from "lucide-react";

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description?: string;
  action?: React.ReactNode;
}

export default function EmptyState({
  icon: Icon,
  title,
  description,
  action,
}: EmptyStateProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-borders bg-background-gray/50 py-12 px-6 text-center"
    >
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
        <Icon className="h-7 w-7 text-primary/60" />
      </div>
      <h3 className="text-sm font-bold text-fitpass-dark">{title}</h3>
      {description && (
        <p className="max-w-xs text-xs text-gray-400">{description}</p>
      )}
      {action && <div className="mt-2">{action}</div>}
    </motion.div>
  );
}