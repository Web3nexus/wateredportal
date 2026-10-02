import React, { useEffect, useState } from 'react';
import { memberService } from '../../services/memberService';
import { MessageRecipient } from '../../types';
import { Modal } from '../../components/common/Modal';
import {
  Mail,
  MailOpen,
  Archive,
  Search,
  Clock,
  Inbox,
} from 'lucide-react';

export const MessagesPage: React.FC = () => {
  const [messages, setMessages] = useState<MessageRecipient[]>([]);
  const [filter, setFilter] = useState<'all' | 'unread' | 'archived'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedItem, setSelectedItem] = useState<MessageRecipient | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchMessages = (activeFilter = filter) => {
    setIsLoading(true);
    memberService
      .getMessages(activeFilter)
      .then((res) => {
        setMessages(res.messages.data);
        setUnreadCount(res.unread_count);
      })
      .catch((err) => console.error(err))
      .finally(() => setIsLoading(false));
  };

  useEffect(() => {
    fetchMessages(filter);
  }, [filter]);

  const openMessage = async (item: MessageRecipient) => {
    setSelectedItem(item);
    if (!item.is_read) {
      try {
        await memberService.markMessageRead(item.id, true);
        setMessages((prev) =>
          prev.map((m) =>
            m.id === item.id
              ? { ...m, is_read: true, read_at: new Date().toISOString() }
              : m
          )
        );
        setUnreadCount((c) => Math.max(0, c - 1));
      } catch (err) {
        console.error(err);
      }
    }
  };

  const handleToggleArchive = async (item: MessageRecipient, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const res = await memberService.toggleArchiveMessage(item.id);
      setMessages((prev) =>
        prev.map((m) =>
          m.id === item.id ? { ...m, is_archived: res.is_archived } : m
        )
      );
      if (filter === 'archived' && !res.is_archived) {
        setMessages((prev) => prev.filter((m) => m.id !== item.id));
      } else if (filter !== 'archived' && res.is_archived) {
        setMessages((prev) => prev.filter((m) => m.id !== item.id));
      }
      if (selectedItem?.id === item.id) {
        setSelectedItem((s) => (s ? { ...s, is_archived: res.is_archived } : null));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleToggleRead = async (item: MessageRecipient, e: React.MouseEvent) => {
    e.stopPropagation();
    const newStatus = !item.is_read;
    try {
      await memberService.markMessageRead(item.id, newStatus);
      setMessages((prev) =>
        prev.map((m) =>
          m.id === item.id
            ? {
                ...m,
                is_read: newStatus,
                read_at: newStatus ? new Date().toISOString() : undefined,
              }
            : m
        )
      );
      setUnreadCount((c) => (newStatus ? Math.max(0, c - 1) : c + 1));
      if (selectedItem?.id === item.id) {
        setSelectedItem((s) => (s ? { ...s, is_read: newStatus } : null));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const filteredMessages = messages.filter((m) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      m.message?.subject?.toLowerCase().includes(q) ||
      m.message?.body?.toLowerCase().includes(q) ||
      m.message?.sender?.name?.toLowerCase().includes(q)
    );
  });

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-200 gap-4">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-indigo-600 block mb-1">
            Communications
          </span>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
            Messages & Announcements
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Official announcements, event notifications, and organization notices
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200">
            {unreadCount} Unread
          </span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-3.5 rounded-2xl border border-slate-200/80 shadow-xs">
        <div className="flex items-center space-x-1.5 w-full sm:w-auto">
          <button
            onClick={() => setFilter('all')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              filter === 'all'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            All
          </button>
          <button
            onClick={() => setFilter('unread')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              filter === 'unread'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            Unread ({unreadCount})
          </button>
          <button
            onClick={() => setFilter('archived')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              filter === 'archived'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            Archived
          </button>
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search messages..."
            className="w-full pl-9 pr-3.5 py-1.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-hidden transition-all"
          />
        </div>
      </div>

      {/* Messages List */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        {isLoading ? (
          <div className="py-20 flex flex-col items-center justify-center space-y-2">
            <div className="w-8 h-8 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin" />
            <p className="text-xs text-slate-500">Loading inbox...</p>
          </div>
        ) : filteredMessages.length === 0 ? (
          <div className="py-16 text-center text-slate-400">
            <Inbox className="w-10 h-10 mx-auto mb-2 opacity-30" />
            <p className="text-xs font-medium">No messages found in this view.</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {filteredMessages.map((item) => (
              <div
                key={item.id}
                onClick={() => openMessage(item)}
                className={`p-4 sm:p-5 flex items-start justify-between gap-4 cursor-pointer transition-colors group ${
                  !item.is_read ? 'bg-indigo-50/30 hover:bg-indigo-50/60' : 'hover:bg-slate-50'
                }`}
              >
                <div className="flex items-start space-x-3.5 min-w-0 flex-1">
                  <div className="mt-0.5 shrink-0">
                    {!item.is_read ? (
                      <span className="w-2.5 h-2.5 rounded-full bg-indigo-600 block shadow-xs" />
                    ) : (
                      <span className="w-2.5 h-2.5 rounded-full bg-slate-200 block" />
                    )}
                  </div>

                  <div className="space-y-1 min-w-0 flex-1">
                    <div className="flex items-center space-x-2">
                      <h4
                        className={`text-xs font-semibold truncate ${
                          !item.is_read ? 'text-slate-900 font-bold' : 'text-slate-700'
                        }`}
                      >
                        {item.message?.subject || 'Member Notice'}
                      </h4>
                      <span className="text-[10px] text-slate-400 font-mono">
                        {item.message?.sender?.name || 'Watered Team'}
                      </span>
                    </div>

                    <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                      {item.message?.body || ''}
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-2 shrink-0">
                  <span className="text-[11px] text-slate-400 flex items-center space-x-1">
                    <Clock className="w-3 h-3" />
                    <span>
                      {item.message?.created_at
                        ? new Date(item.message.created_at).toLocaleDateString()
                        : ''}
                    </span>
                  </span>

                  <button
                    onClick={(e) => handleToggleRead(item, e)}
                    className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-200/60 transition-colors"
                    title={item.is_read ? 'Mark as unread' : 'Mark as read'}
                  >
                    {item.is_read ? <Mail className="w-3.5 h-3.5" /> : <MailOpen className="w-3.5 h-3.5" />}
                  </button>

                  <button
                    onClick={(e) => handleToggleArchive(item, e)}
                    className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-200/60 transition-colors"
                    title={item.is_archived ? 'Move to inbox' : 'Archive'}
                  >
                    <Archive className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Reader Modal */}
      <Modal
        isOpen={!!selectedItem}
        onClose={() => setSelectedItem(null)}
        title={selectedItem?.message?.subject || 'Message'}
      >
        {selectedItem && (
          <div className="space-y-4 p-2">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 text-xs text-slate-500">
              <div className="flex items-center space-x-2">
                <span className="font-semibold text-slate-800">
                  {selectedItem.message?.sender?.name || 'Watered Team'}
                </span>
                <span>&bull;</span>
                <span>
                  {selectedItem.message?.created_at
                    ? new Date(selectedItem.message.created_at).toLocaleString()
                    : ''}
                </span>
              </div>
            </div>

            <div className="text-xs sm:text-sm text-slate-700 leading-relaxed whitespace-pre-line py-2">
              {selectedItem.message?.body}
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
              <button
                onClick={(e) => handleToggleArchive(selectedItem, e)}
                className="text-xs text-slate-500 hover:text-slate-800 flex items-center space-x-1"
              >
                <Archive className="w-3.5 h-3.5" />
                <span>{selectedItem.is_archived ? 'Move to Inbox' : 'Archive Message'}</span>
              </button>

              <button
                onClick={() => setSelectedItem(null)}
                className="px-4 py-2 rounded-xl bg-slate-900 text-white text-xs font-semibold hover:bg-slate-800 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};
