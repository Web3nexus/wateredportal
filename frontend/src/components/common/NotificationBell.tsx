import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Bell,
  CheckCircle,
  Mail,
  UserPlus,
  ShieldCheck,
  AlertCircle,
  Check,
  ExternalLink,
} from 'lucide-react';
import { notificationService } from '../../services/notificationService';
import type { PortalNotification } from '../../types';

export const NotificationBell: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<PortalNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  const fetchNotifications = async () => {
    try {
      const res = await notificationService.getNotifications();
      setNotifications(res.notifications || []);
      setUnreadCount(res.unread_count || 0);
    } catch {
      // Graceful fallback if unauthenticated or network failure
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000); // 30s poll
    return () => clearInterval(interval);
  }, []);

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  const handleMarkAllRead = async () => {
    try {
      setLoading(true);
      await notificationService.markAllAsRead();
      setUnreadCount(0);
      setNotifications((prev) =>
        prev.map((n) => ({ ...n, is_read: true, read_at: new Date().toISOString() }))
      );
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleNotificationClick = async (notif: PortalNotification) => {
    if (!notif.is_read) {
      try {
        await notificationService.markAsRead(notif.id);
        setUnreadCount((c) => Math.max(0, c - 1));
        setNotifications((prev) =>
          prev.map((n) => (n.id === notif.id ? { ...n, is_read: true } : n))
        );
      } catch (e) {
        console.error(e);
      }
    }
    setIsOpen(false);
    if (notif.action_url) {
      navigate(notif.action_url);
    }
  };

  const formatTimeAgo = (dateStr: string) => {
    try {
      const diff = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
      if (diff < 60) return 'Just now';
      if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
      if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
      return `${Math.floor(diff / 86400)}d ago`;
    } catch {
      return '';
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'registration':
        return <UserPlus className="w-4 h-4 text-emerald-600" />;
      case 'approval':
        return <ShieldCheck className="w-4 h-4 text-[#966922]" />;
      case 'communication':
        return <Mail className="w-4 h-4 text-blue-600" />;
      case 'alert':
        return <AlertCircle className="w-4 h-4 text-rose-600" />;
      default:
        return <CheckCircle className="w-4 h-4 text-stone-600" />;
    }
  };

  return (
    <div className="relative inline-block" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        aria-label="View notifications"
        className="relative p-2 rounded-[3px] border border-stone-200/80 bg-stone-50/70 hover:bg-stone-100 hover:border-stone-300 text-stone-700 transition duration-150 focus:outline-none focus:ring-1 focus:ring-[#966922]/50"
      >
        <Bell className="w-4 h-4" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 min-w-[17px] h-[17px] flex items-center justify-center px-1 text-[10px] font-bold text-white bg-[#966922] rounded-full border border-white shadow-sm animate-pulse">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white border border-stone-200 shadow-xl rounded-[3px] overflow-hidden z-50 animate-in fade-in slide-in-from-top-1 duration-150">
          <div className="flex items-center justify-between px-4 py-3 bg-[#faf9f5] border-b border-stone-200">
            <div className="flex items-center space-x-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-stone-900 font-serif">
                Notifications
              </span>
              {unreadCount > 0 && (
                <span className="bg-[#966922]/10 text-[#966922] text-[10px] font-bold px-1.5 py-0.5 rounded-[2px]">
                  {unreadCount} unread
                </span>
              )}
            </div>
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllRead}
                disabled={loading}
                className="text-[11px] font-medium text-stone-500 hover:text-stone-900 flex items-center space-x-1 transition"
              >
                <Check className="w-3 h-3" />
                <span>Mark all as read</span>
              </button>
            )}
          </div>

          <div className="max-h-80 overflow-y-auto divide-y divide-stone-100">
            {notifications.length === 0 ? (
              <div className="py-8 text-center text-xs text-stone-400">
                No notifications right now.
              </div>
            ) : (
              notifications.map((notif) => (
                <div
                  key={notif.id}
                  onClick={() => handleNotificationClick(notif)}
                  className={`px-4 py-3 cursor-pointer hover:bg-stone-50 transition flex items-start space-x-3 text-left ${
                    !notif.is_read ? 'bg-amber-50/25' : ''
                  }`}
                >
                  <div className="p-1.5 rounded-[2px] bg-stone-100/80 border border-stone-200 shrink-0 mt-0.5">
                    {getIcon(notif.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p
                        className={`text-xs truncate ${
                          !notif.is_read ? 'font-semibold text-stone-900' : 'font-medium text-stone-700'
                        }`}
                      >
                        {notif.title}
                      </p>
                      <span className="text-[10px] text-stone-400 shrink-0 ml-2">
                        {formatTimeAgo(notif.created_at)}
                      </span>
                    </div>
                    <p className="text-[11px] text-stone-600 line-clamp-2 mt-0.5 leading-relaxed">
                      {notif.message}
                    </p>
                    {notif.action_url && (
                      <span className="inline-flex items-center text-[10px] font-medium text-[#966922] mt-1 hover:underline">
                        <span>View detail</span>
                        <ExternalLink className="w-2.5 h-2.5 ml-1" />
                      </span>
                    )}
                  </div>
                  {!notif.is_read && (
                    <span className="w-1.5 h-1.5 rounded-full bg-[#966922] mt-2 shrink-0" />
                  )}
                </div>
              ))
            )}
          </div>

          <div className="px-4 py-2 bg-stone-50/80 border-t border-stone-200 text-center text-[11px] text-stone-500">
            System notices & communications
          </div>
        </div>
      )}
    </div>
  );
};
