// src/components/dashboard/notifications-button.tsx
"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { BellIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

interface NotificationItem {
  id: string;
  title: string;
  message: string;
  createdAt: string;
  read: boolean;
  actionUrl?: string | null;
  metadata?: string | null;
}

interface NotificationsButtonProps {
  variant?: "default" | "outline" | "secondary" | "ghost";
  size?: "default" | "sm" | "lg" | "icon";
}

export function NotificationsButton({
  variant = "outline",
  size = "sm",
}: NotificationsButtonProps) {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(false);
  const unreadCount = notifications.filter((n) => !n.read).length;

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/notifications?limit=20");
      if (!response.ok) {
        throw new Error("Failed to fetch notifications");
      }
      const data = await response.json();
      setNotifications(data.notifications || []);
    } catch (error) {
      console.error("Error fetching notifications:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (open) {
      fetchNotifications();
    }
  }, [open]);

  const markAsRead = async (id: string) => {
    try {
      await fetch(`/api/notifications/${id}`, {
        method: "PATCH",
      });
      setNotifications((prev) =>
        prev.map((notification) =>
          notification.id === id ? { ...notification, read: true } : notification
        )
      );
    } catch (error) {
      console.error("Failed to update notification:", error);
    }
  };

  return (
    <>
      <Button variant={variant} size={size} onClick={() => setOpen(true)}>
        <BellIcon className="h-4 w-4 mr-2" />
        Notifications
        {unreadCount > 0 && (
          <Badge className="ml-2 bg-red-500 text-white hover:bg-red-500">
            {unreadCount}
          </Badge>
        )}
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Notifications</DialogTitle>
            <DialogDescription>
              Stay on top of approvals, reviews, and account activity.
            </DialogDescription>
          </DialogHeader>
          <div className="max-h-[400px] overflow-y-auto space-y-4">
            {loading ? (
              <p className="text-sm text-gray-500">Loading notifications...</p>
            ) : notifications.length === 0 ? (
              <p className="text-sm text-gray-500 text-center py-8">
                No notifications yet.
              </p>
            ) : (
              notifications.map((notification, index) => (
                <div key={notification.id}>
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-medium text-sm">{notification.title}</p>
                      <p className="text-sm text-gray-600 mt-1">
                        {notification.message}
                      </p>
                      <p className="text-xs text-gray-400 mt-2">
                        {new Date(notification.createdAt).toLocaleString()}
                      </p>
                    </div>
                    {!notification.read && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-xs"
                        onClick={() => markAsRead(notification.id)}
                      >
                        Mark as read
                      </Button>
                    )}
                  </div>
                  {index !== notifications.length - 1 && (
                    <Separator className="my-3" />
                  )}
                </div>
              ))
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

