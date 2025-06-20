"use client";

import { ToastBar, Toaster } from "react-hot-toast";
import Checkmark from "#/components/Icons/Checkmark";
import Warning from "#/components/Icons/Warning";
import LoadingSpinner from "./LoadingSpinner";

export const transactionToast = {
  loading: "Waiting for the transaction to be executed",
  success: "Your transaction has been executed",
  error: "Your transaction has failed",
};

export default function Toast() {
  return (
    <Toaster
      toastOptions={{
        style: {
          backgroundColor: "#DEDEDE",
          borderRadius: 4,
          padding: "8px 20px",
        },
        loading: {
          icon: <LoadingSpinner size={32} />,
        },
        success: {
          duration: 4000,
          icon: <Checkmark />,
        },
        error: {
          duration: 4000,
          icon: <Warning />,
        },
      }}
    >
      {(t) => (
        <ToastBar toast={t} style={{ maxWidth: 500 }}>
          {({ icon, message }) => (
            <div className="flex flex-row items-center gap-2">
              {icon}
              <span className="font-sans text-base text-gray-900">
                {message}
              </span>
            </div>
          )}
        </ToastBar>
      )}
    </Toaster>
  );
}
