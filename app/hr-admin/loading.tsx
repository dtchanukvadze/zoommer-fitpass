// app/hr-admin/loading.tsx — HR პანელის ჩატვირთვის ეკრანი
"use client";
import LottieLoader from "@/components/LottieLoader";

export default function HrAdminLoading() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background-gray">
      <LottieLoader size={120} />
      <p className="mt-4 text-sm font-medium text-gray-500">
        HR პანელი იტვირთება...
      </p>
    </div>
  );
}