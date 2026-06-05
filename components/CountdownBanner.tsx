// components/CountdownBanner.tsx
"use client";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Lock, Clock } from "lucide-react";
import { getTimeRemaining } from "@/lib/deadline";

export default function CountdownBanner({ locked }: { locked: boolean }) {
  const [time, setTime] = useState(getTimeRemaining());

  useEffect(() => {
    const interval = setInterval(() => setTime(getTimeRemaining()), 1000);
    return () => clearInterval(interval);
  }, []);

  if (locked) {
    return (
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-3 rounded-2xl border border-borders bg-fitpass-dark px-6 py-4 text-white"
      >
        <Lock className="h-5 w-5 shrink-0 text-primary" />
        <p className="text-sm font-medium">
          ამ თვის ცვლილებების დედლაინი ამოიწურა (20 რიცხვი). პორტალი გაიხსნება
          მომავალი თვის 1 რიცხვში.
        </p>
      </motion.div>
    );
  }

  const blocks = [
    { label: "დღე", value: time.days },
    { label: "საათი", value: time.hours },
    { label: "წუთი", value: time.minutes },
    { label: "წამი", value: time.seconds },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col gap-3 rounded-2xl bg-gradient-to-r from-primary to-secondary px-6 py-5 text-white shadow-card-hover sm:flex-row sm:items-center sm:justify-between"
    >
      <div className="flex items-center gap-2">
        <Clock className="h-5 w-5" />
        <span className="text-sm font-semibold">
          ცვლილებების დედლაინამდე დარჩა:
        </span>
      </div>
      <div className="flex gap-3">
        {blocks.map((b) => (
          <div
            key={b.label}
            className="flex min-w-[58px] flex-col items-center rounded-xl bg-white/20 px-2 py-1.5 backdrop-blur-sm"
          >
            <span className="text-xl font-black tabular-nums">
              {String(b.value).padStart(2, "0")}
            </span>
            <span className="text-[10px] font-medium opacity-90">{b.label}</span>
          </div>
        ))}
      </div>
    </motion.div>
  );
}