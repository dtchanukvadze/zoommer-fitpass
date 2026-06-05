"use client";
import Lottie from "lottie-react";
import loadingAnimation from "@/public/animations/loading.json"; // დარწმუნდით, რომ გზა სწორია

export default function DashboardLoading() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background-gray">
      <div className="w-32 h-32"> {/* ზომის კონტროლი აქ */}
        <Lottie 
          animationData={loadingAnimation} 
          loop={true} 
          autoplay={true} 
        />
      </div>
      <p className="mt-4 text-sm font-medium text-gray-500">იტვირთება...</p>
    </div>
  );
}