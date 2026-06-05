// app/dashboard/loading.tsx — Dashboard-ის ჩატვირთვის ეკრანი
"use client";
import LottieLoader from "@/components/LottieLoader";

export default function DashboardLoading() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background-gray">
      <LottieLoader size={120} />
      <p className="mt-4 text-sm font-medium text-gray-500">იტვირთება...</p>
    </div>
  );
}