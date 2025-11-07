"use client";
import React, { useEffect, useState } from "react";
import { Spinner } from "@/components/ui/spinner";
import { useSession, signIn, signOut } from "next-auth/react";

function LoginForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  // const { data: session, status } = useSession();

  const handleGoogleLogin = async () => {
    setError(null);
    setIsLoading(true);
    await signIn("google", { callbackUrl: "/connect/linkedin" });
  };

  // if (status === "loading") {
  //   return (
  //     <div className="flex items-center justify-center min-h-screen">
  //       <Spinner className="w-8 h-8" />
  //     </div>
  //   );
  // }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 px-4">
      <div className="w-full max-w-md bg-white shadow-lg rounded-2xl p-8 flex flex-col items-center justify-center">
        <h2 className="text-2xl font-semibold text-gray-800 mb-6 text-center">
          Login to use <span className="text-blue-600">LinkedinPoster</span>
        </h2>

        <button
          type="button"
          onClick={handleGoogleLogin}
          disabled={isLoading}
          className="cursor-pointer flex items-center justify-center w-full border border-gray-300 rounded-md bg-white hover:bg-gray-100 text-gray-700 font-medium py-3 transition-all duration-200 shadow-sm"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="22"
            height="22"
            viewBox="0 0 48 48"
            className="mr-3"
          >
            <path
              fill="#EA4335"
              d="M24 9.5c3.54 0 6.73 1.22 9.24 3.23l6.9-6.9C36.16 2.41 30.4 0 24 0 14.64 0 6.48 5.64 2.64 13.86l8.06 6.27C12.36 13.14 17.76 9.5 24 9.5z"
            />
            <path
              fill="#4285F4"
              d="M46.5 24c0-1.64-.14-3.22-.4-4.75H24v9h12.7c-.55 2.96-2.2 5.47-4.7 7.2l7.3 5.66C43.76 37.14 46.5 31.04 46.5 24z"
            />
            <path
              fill="#FBBC05"
              d="M10.7 28.13c-.5-1.5-.8-3.1-.8-4.75s.3-3.25.8-4.75L2.64 13.86C.94 17.36 0 20.57 0 24s.94 6.64 2.64 10.14l8.06-6.01z"
            />
            <path
              fill="#34A853"
              d="M24 48c6.4 0 12.16-2.41 16.14-6.57l-7.3-5.66c-2.02 1.38-4.6 2.18-7.34 2.18-6.24 0-11.64-3.64-14.3-8.62l-8.06 6.01C6.48 42.36 14.64 48 24 48z"
            />
            <path fill="none" d="M0 0h48v48H0z" />
          </svg>
          {isLoading ? "Loading..." : "Login with Google"}
        </button>

        {error && (
          <p className="text-red-500 text-sm text-center mt-4">{error}</p>
        )}

        <p className="text-gray-400 text-xs text-center mt-6">
          By continuing, you agree to our{" "}
          <a href="#" className="underline hover:text-gray-600">
            Terms
          </a>{" "}
          and{" "}
          <a href="#" className="underline hover:text-gray-600">
            Privacy Policy
          </a>
          .
        </p>
      </div>
    </div>
  );
}

export default LoginForm;
