"use client";

import { useState } from "react";
import ChatSupport from "./ChatSupport";

export default function ChatSupportWrapper() {
  const [isMinimized, setIsMinimized] = useState(true);

  const toggleMinimize = () => {
    setIsMinimized(!isMinimized);
  };

  return (
    <ChatSupport
      isMinimized={isMinimized}
      onToggleMinimize={toggleMinimize}
    />
  );
}
