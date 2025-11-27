"use client";

import { useEffect } from "react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-gray-900">500</h1>
        <h2 className="text-2xl font-semibold text-gray-700 mt-4">
          Something went wrong!
        </h2>
        <p className="text-gray-500 mt-2">
          We apologize for the inconvenience.
        </p>
        <button
          onClick={reset}
          className="mt-6 px-6 py-3 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors"
        >
          Try again
        </button>
      </div>
    </div>
  );
}
