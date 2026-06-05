// components/ui/input.tsx — reusable input კომპონენტი (icon + label + error)
"use client";
import * as React from "react";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: LucideIcon;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, icon: Icon, ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label className="mb-1.5 block text-sm font-semibold text-fitpass-dark">
            {label}
          </label>
        )}
        <div className="relative">
          {Icon && (
            <Icon className="absolute left-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
          )}
          <input
            ref={ref}
            className={cn(
              "w-full rounded-xl border border-borders bg-background-gray py-2.5 text-sm text-fitpass-dark outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20",
              Icon ? "pl-11 pr-4" : "px-4",
              error && "border-red-400 focus:border-red-400 focus:ring-red-100",
              className
            )}
            {...props}
          />
        </div>
        {error && (
          <p className="mt-1 text-xs font-medium text-red-500">{error}</p>
        )}
      </div>
    );
  }
);
Input.displayName = "Input";