// src/utils/toast.js
import toast from "react-hot-toast";
import React from "react";
// You are using lucide-react in your project, so we use it here
import { Check, X, AlertCircle } from "lucide-react"; 

export const showCustomToast = (message, type = "success") => {
  toast.custom((t) => (
    <div
      className={`${
        t.visible ? "animate-enter" : "animate-leave"
      } max-w-md w-full bg-white shadow-lg rounded-lg pointer-events-auto flex ring-1 ring-black ring-opacity-5`}
      style={{
        transition: "all 0.5s ease-out",
        transform: t.visible ? "translateY(0)" : "translateY(-20px)",
        opacity: t.visible ? 1 : 0,
      }}
    >
      <div className="flex-1 w-0 p-4">
        <div className="flex items-start">
          <div className="flex-shrink-0 pt-0.5">
            {/* Icons based on type */}
            {type === "success" && (
              <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
                <Check className="h-6 w-6 text-green-600" />
              </div>
            )}
            {type === "error" && (
              <div className="h-10 w-10 rounded-full bg-red-100 flex items-center justify-center">
                <X className="h-6 w-6 text-red-600" />
              </div>
            )}
            {type === "info" && (
              <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                <AlertCircle className="h-6 w-6 text-blue-600" />
              </div>
            )}
          </div>
          <div className="ml-3 flex-1">
            <p className="text-sm font-medium text-gray-900">
              {type === "success" ? "Success" : type === "error" ? "Error" : "Notification"}
            </p>
            <p className="mt-1 text-sm text-gray-500">{message}</p>
          </div>
        </div>
      </div>
      <div className="flex border-l border-gray-200">
        <button
          onClick={() => toast.dismiss(t.id)}
          className="w-full border border-transparent rounded-none rounded-r-lg p-4 flex items-center justify-center text-sm font-medium text-gray-600 hover:text-gray-500 focus:outline-none"
        >
          Close
        </button>
      </div>
    </div>
  ), {
    duration: 4000,
    position: "top-center",
  });
};