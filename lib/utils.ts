// lib/utils.ts
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// პირადი ნომრის ვალიდაცია (11 ციფრი)
export function isValidPersonalId(id: string): boolean {
  return /^\d{11}$/.test(id);
}

// პირადი ნომრის → email გადაქცევა
export function personalIdToEmail(personalId: string): string {
  return `${personalId}@zoommer.ge`;
}