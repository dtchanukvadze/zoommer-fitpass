// components/LottieLoader.tsx — Lottie ჩატვირთვის ანიმაცია (fallback-ით)
"use client";
import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";

interface LottieLoaderProps {
  size?: number;
}

export default function LottieLoader({ size = 80 }: LottieLoaderProps) {
  const [animationData, setAnimationData] = useState<object | null>(null);
  const [Lottie, setLottie] = useState<any>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    // დინამიური import — SSR-ის თავიდან აცილებისთვის
    Promise.all([
      import("lottie-react").then((mod) => setLottie(() => mod.default)),
      fetch("/animations/loading.json")
        .then((res) => {
          if (!res.ok) throw new Error("not found");
          return res.json();
        })
        .then((data) => setAnimationData(data)),
    ]).catch(() => setFailed(true));
  }, []);

  // Fallback: თუ Lottie ფაილი არ მოიძებნა → ორანჟისფერი spinner
  if (failed || !Lottie || !animationData) {
    return (
      <Loader2
        className="animate-spin text-primary"
        style={{ width: size, height: size }}
        strokeWidth={2.5}
      />
    );
  }

  return (
    <Lottie animationData={animationData} loop style={{ width: size, height: size }} />
  );
}