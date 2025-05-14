import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { 
  Bell, 
  BellDot,
} from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/auth-context";
import { useLanguage } from "@/contexts/language-context";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

type Notification = {
  id: number;
  userId: number;
  message: string;
  type: string;
  isRead: boolean;
  relatedId: number | null;
  createdAt: string | Date;
};

export default function NotificationBell() {
  const { user } = useAuth();
  const { translate } = useLanguage();
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);

  // Get notifications for the user
  const { data: notifications = [], refetch } = useQuery<Notification[]>({
    queryKey: [`/api/notifications/${user?.id}`],
    enabled: !!user,
  });

  // Format the notifications
  const formattedNotifications = notifications.map(notification => ({
    ...notification,
    createdAt: new Date(notification.createdAt),
  }));

  // Calculate unread count
  const unreadCount = formattedNotifications.filter(n => !n.isRead).length;

  // Mark a notification as read
  const markAsRead = async (notificationId: number) => {
    try {
      await apiRequest("POST", `/api/notifications/${notificationId}/read`);
      refetch();
    } catch (error) {
      console.error("Failed to mark notification as read:", error);
      // Show a toast error message to the user
      toast({
        title: "Error",
        description: "Failed to mark notification as read. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Auto-refresh notifications every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      if (user) {
        refetch();
      }
    }, 30000);

    return () => clearInterval(interval);
  }, [user, refetch]);

  if (!user) {
    return null;
  }

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative"
          aria-label="Notifications"
        >
          {unreadCount > 0 ? (
            <>
              <BellDot className="h-5 w-5" />
              <Badge 
                className="absolute -top-1 -right-1 px-1.5 py-0.5 min-w-[1.2rem] h-[1.2rem] flex items-center justify-center bg-primary text-[10px]"
              >
                {unreadCount > 99 ? "99+" : unreadCount}
              </Badge>
            </>
          ) : (
            <Bell className="h-5 w-5" />
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent 
        className="w-80 p-0" 
        align="end"
        sideOffset={8}
      >
        <div className="px-4 py-3 font-medium border-b flex justify-between items-center">
          <div>{translate("Notifications")}</div>
          {unreadCount > 0 && (
            <Badge variant="outline" className="ml-2 font-normal">
              {unreadCount} {translate("new")}
            </Badge>
          )}
        </div>
        {formattedNotifications.length === 0 ? (
          <div className="py-8 text-center text-muted-foreground">
            {translate("No notifications yet")}
          </div>
        ) : (
          <ScrollArea className="h-[300px]">
            <div className="divide-y">
              {formattedNotifications.map((notification) => (
                <div 
                  key={notification.id} 
                  className={`px-4 py-3 hover:bg-accent/10 ${notification.isRead ? "" : "bg-primary/5"}`}
                  onClick={() => {
                    if (!notification.isRead) {
                      markAsRead(notification.id);
                    }
                  }}
                >
                  <div className="flex justify-between items-start">
                    <div className="font-medium text-sm">{notification.message}</div>
                    {!notification.isRead && (
                      <span className="w-2 h-2 rounded-full bg-primary mt-1 flex-shrink-0"></span>
                    )}
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">
                    {format(notification.createdAt, 'PPp')}
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        )}
        <Separator />
        <div className="p-2">
          <Button
            variant="ghost"
            size="sm"
            className="w-full text-center text-xs text-muted-foreground"
            onClick={() => {
              // Mark all as read
              Promise.all(
                formattedNotifications
                  .filter(n => !n.isRead)
                  .map(n => markAsRead(n.id))
              ).then(() => refetch());
            }}
          >
            {translate("Mark all as read")}
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}