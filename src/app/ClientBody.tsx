"use client";

import { useEffect } from "react";
import { SessionProvider } from "next-auth/react";
import { Toaster } from "@/components/ui/sonner";
import ChatSupportWrapper from "@/components/ChatSupportWrapper";

export default function ClientBody({
  children,
}: {
  children: React.ReactNode;
}) {
  // Remove any extension-added classes during hydration
  useEffect(() => {
    // This runs only on the client after hydration
    document.body.className = "antialiased";
  }, []);

  return (
    <SessionProvider>
      <div className="antialiased">
        {children}
        <Toaster />
        <ChatSupportWrapper />
      </div>
    </SessionProvider>
  );
}
