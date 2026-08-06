"use client";

import React, { createContext, useContext, useState, useCallback } from "react";
import NotificationModal, {
  NotificationModalType,
} from "@/components/ui/NotificationModal";
import { useRouter } from "next/navigation";

interface ShowNotificationParams {
  type?: NotificationModalType;
  title: string;
  description: string;
  badgeText?: string;
  primaryButtonText?: string;
  autoCloseDelay?: number;
  redirectUrl?: string; // Optional redirect after close
}

interface NotificationContextType {
  show: (params: ShowNotificationParams) => void;
  hide: () => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(
  undefined
);

export function NotificationProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [config, setConfig] = useState<ShowNotificationParams>({
    type: "info",
    title: "",
    description: "",
  });

  const show = useCallback((params: ShowNotificationParams) => {
    setConfig(params);
    setIsOpen(true);
  }, []);

  const hide = useCallback(() => {
    setIsOpen(false);
    if (config.redirectUrl) {
      router.push(config.redirectUrl);
      router.refresh();
    }
  }, [config.redirectUrl, router]);

  return (
    <NotificationContext.Provider value={{ show, hide }}>
      {children}
      <NotificationModal
        isOpen={isOpen}
        onClose={hide}
        type={config.type}
        title={config.title}
        description={config.description}
        badgeText={config.badgeText}
        primaryButtonText={config.primaryButtonText || "Mengerti"}
        onPrimaryClick={hide}
        autoCloseDelay={config.autoCloseDelay}
      />
    </NotificationContext.Provider>
  );
}

export function useNotificationModal() {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error(
      "useNotificationModal must be used within a NotificationProvider"
    );
  }
  return context;
}
