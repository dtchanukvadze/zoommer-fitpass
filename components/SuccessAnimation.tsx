// components/SuccessAnimation.tsx
"use client";
import { motion, AnimatePresence } from "framer-motion";
import { Check } from "lucide-react";

// მარტივი CSS/Framer ალტერნატივა Lottie-სთვის.
// Lottie გამოსაყენებლად: <Lottie animationData={successJson} loop={false} />
export default function SuccessAnimation({
  show,
  message = "წარმატებით შესრულდა!",
}: {
  show: boolean;
  message?: string;
}) {
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-fitpass-dark/40 backdrop-blur-sm"
        >
          <motion.div
            initial={{ scale: 0.8, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.8, opacity: 0 }}
            className="flex flex-col items-center gap-4 rounded-3xl bg-white px-12 py-10 shadow-card-hover"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 200, delay: 0.1 }}
              className="flex h-20 w-20 items-center justify-center rounded-full bg-green-50"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.3, type: "spring" }}
                className="flex h-14 w-14 items-center justify-center rounded-full bg-green-500"
              >
                <Check className="h-8 w-8 text-white" strokeWidth={3} />
              </motion.div>
            </motion.div>
            <p className="text-lg font-bold text-fitpass-dark">{message}</p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}