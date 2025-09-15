// pages/GoogleAuthCallback.jsx - CORRECTED VERSION
import React, { useEffect, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAppContext } from "../context/AppContext";
import { BASE_URL } from "../utils/api";

const GoogleAuthCallback = () => {
  const hasProcessed = useRef(false);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { login } = useAppContext();
  const [status, setStatus] = useState("processing");
  const [message, setMessage] = useState("Setting up your account...");

  useEffect(() => {
    if (hasProcessed.current) return;
    hasProcessed.current = true;

    const handleCallback = async () => {
      try {
        setStatus("processing");
        setMessage("Verifying your Google account...");

        const code = searchParams.get("code");
        const state = searchParams.get("state");
        const error = searchParams.get("error");

        console.log("Google callback received:", {
          code: !!code,
          state,
          error,
        });

        if (error) {
          console.error("Google OAuth error:", error);
          setStatus("error");
          setMessage("Authentication was cancelled");
          setTimeout(() => navigate("/login?error=oauth_cancelled"), 2000);
          return;
        }

        if (!code) {
          console.error("No authorization code received");
          setStatus("error");
          setMessage("No authorization code received");
          setTimeout(
            () => navigate("/login?error=no_authorization_code"),
            2000
          );
          return;
        }

        // Clear any existing state
        sessionStorage.removeItem("oauth_state");
        setMessage("Authenticating with our servers...");

        // ✅ CORRECT: Call the right endpoint with proper error handling
        let response;
        let data;
        const maxRetries = 3;
        let retryCount = 0;

        while (retryCount < maxRetries) {
          try {
            // ✅ ENSURE we're calling the right backend API
            const apiUrl = process.env.REACT_APP_API_URL || BASE_URL || 'https://lion-bidi-backend.onrender.com';
            const endpoint = `${apiUrl}/api/auth/google/callback`;
            
            console.log(`🔗 Attempt ${retryCount + 1}: Calling ${endpoint}`);

            response = await fetch(endpoint, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                "Accept": "application/json", // ✅ Explicitly request JSON
              },
              body: JSON.stringify({
                code,
                state,
                attempt: retryCount + 1,
              }),
            });

            console.log(`📡 Response status: ${response.status}`);
            console.log(`📡 Response headers:`, response.headers);

            // ✅ Check if response is actually JSON before parsing
            const contentType = response.headers.get("content-type");
            if (!contentType || !contentType.includes("application/json")) {
              const textResponse = await response.text();
              console.error("❌ Expected JSON but got:", textResponse);
              throw new Error(`Server returned ${response.status}: ${textResponse}`);
            }

            data = await response.json();
            console.log("✅ Backend response:", data);

            if (response.ok && data.success) {
              break; // Success, exit retry loop
            } else if (data.retryable && retryCount < maxRetries - 1) {
              retryCount++;
              setMessage(
                `Authentication attempt ${retryCount + 1} of ${maxRetries}...`
              );
              await new Promise((resolve) => setTimeout(resolve, 1000));
              continue;
            } else {
              throw new Error(data.message || "Authentication failed");
            }
          } catch (fetchError) {
            console.error(`❌ Fetch error attempt ${retryCount + 1}:`, fetchError);
            
            if (retryCount < maxRetries - 1) {
              retryCount++;
              setMessage(
                `Retrying authentication (${retryCount + 1}/${maxRetries})...`
              );
              await new Promise((resolve) => setTimeout(resolve, 1000));
              continue;
            } else {
              throw fetchError;
            }
          }
        }

        if (!response.ok || !data.success) {
          throw new Error(data.message || "Authentication failed");
        }

        setMessage("Finalizing your login...");

        // Store the JWT token
        if (data.token) {
          localStorage.setItem("token", data.token);
          console.log("Token stored successfully");
        }

        // Update app context with user data
        console.log("Updating app context with user:", data.user);
        const userDataWithTimestamp = {
          ...data.user,
          _loginTimestamp: Date.now(),
        };
        await login(userDataWithTimestamp);

        setStatus("success");
        setMessage("Login successful! Redirecting...");

        setTimeout(() => {
          console.log("Navigating to homepage...");
          navigate("/", { replace: true });
        }, 1500);
      } catch (error) {
        console.error("Google auth callback error:", error);
        setStatus("error");
        setMessage("Authentication failed. Redirecting...");
        setTimeout(() => {
          navigate(
            `/login?error=auth_failed&message=${encodeURIComponent(
              error.message
            )}`
          );
        }, 2000);
      }
    };

    handleCallback();
  }, [searchParams, navigate, login]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="bg-white p-8 rounded-lg shadow-md text-center max-w-md w-full mx-4">
        <div className="mb-4">
          {status === "processing" && (
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
          )}
          {status === "success" && (
            <div className="text-green-500 mb-4">
              <svg
                className="w-12 h-12 mx-auto"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
          )}
          {status === "error" && (
            <div className="text-red-500 mb-4">
              <svg
                className="w-12 h-12 mx-auto"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </div>
          )}
        </div>

        <h2 className="text-xl font-semibold mb-2">
          {status === "processing" && "Setting up your account"}
          {status === "success" && "Welcome to Lion Bidi!"}
          {status === "error" && "Something went wrong"}
        </h2>

        <p className="text-gray-600">{message}</p>
      </div>
    </div>
  );
};

export default GoogleAuthCallback;
