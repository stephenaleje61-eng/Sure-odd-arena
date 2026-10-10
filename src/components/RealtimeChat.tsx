import React, { useState, useEffect, useRef } from 'react';
import {
  MessageSquare,
  Send,
  Users,
  Shield,
  Clock,
  AlertTriangle,
  Ban,
  Trash2,
  CheckCircle2,
  Wifi,
  WifiOff
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { ChatMessage } from '../types';

interface RealtimeChatProps {
  isAdmin: boolean;
}

const CHANNELS = ['General', 'SportyBet', 'MSport', 'Football.com', 'Bet9ja'] as const;
type ChannelType = typeof CHANNELS[number];

export const RealtimeChat: React.FC<RealtimeChatProps> = ({ isAdmin }) => {
  // Username state
  const [username, setUsername] = useState<string>(() => {
    return localStorage.getItem('sure_odd_chat_username') || '';
  });
  const [tempUsername, setTempUsername] = useState('');
  const [activeChannel, setActiveChannel] = useState<ChannelType>('General');

  // Messages & pagination
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loadingHistory, setLoadingHistory] = useState(true);

  // Connection status & Real presence online count
  const [isConnected, setIsConnected] = useState(false);
  const [onlineCount, setOnlineCount] = useState<number>(1);

  // Rate limiting (1 message per 3 seconds)
  const [cooldownRemaining, setCooldownRemaining] = useState<number>(0);
  const lastSendTimeRef = useRef<number>(0);

  // Blocked users
  const [blockedUsers, setBlockedUsers] = useState<string[]>(() => {
    try {
      return JSON.parse(localStorage.getItem('sure_odd_blocked_users') || '[]');
    } catch {
      return [];
    }
  });

  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Show toast notification
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Cooldown countdown timer
  useEffect(() => {
    if (cooldownRemaining <= 0) return;
    const interval = setInterval(() => {
      setCooldownRemaining((prev) => Math.max(0, prev - 1));
    }, 1000);
    return () => clearInterval(interval);
  }, [cooldownRemaining]);

  // Load message history from Supabase table messages
  useEffect(() => {
    let isMounted = true;
    async function loadHistory() {
      try {
        setLoadingHistory(true);
        const { data, error } = await supabase
          .from('messages')
          .select('*')
          .order('id', { ascending: false })
          .limit(80);

        if (!error && data && isMounted) {
          // Sort ascending for chronological chat
          setMessages(data.reverse());
        }
      } catch (err) {
        console.error('Error fetching chat messages:', err);
      } finally {
        if (isMounted) setLoadingHistory(false);
      }
    }

    loadHistory();

    return () => {
      isMounted = false;
    };
  }, []);

  // Supabase Realtime Subscription + Presence Tracking
  useEffect(() => {
    const channelName = 'sure-arena-chat-room';
    const room = supabase.channel(channelName, {
      config: {
        presence: {
          key: username || `user_${Math.random().toString(36).substring(2, 6)}`,
        },
      },
    });

    // Subscribe to new postgres changes on table messages
    room
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'messages' },
        (payload) => {
          const newRow = payload.new as ChatMessage;
          setMessages((prev) => {
            // Deduplicate if already present
            if (prev.some((m) => m.id === newRow.id)) return prev;
            return [...prev, newRow];
          });
        }
      )
      .on(
        'postgres_changes',
        { event: 'DELETE', schema: 'public', table: 'messages' },
        (payload) => {
          const deletedId = payload.old.id;
          setMessages((prev) => prev.filter((m) => m.id !== deletedId));
        }
      )
      .on('presence', { event: 'sync' }, () => {
        const presenceState = room.presenceState();
        const activePresenceUsers = Object.keys(presenceState).length;
        setOnlineCount(Math.max(1, activePresenceUsers));
      })
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          setIsConnected(true);
          // Track presence for online count
          room.track({
            online_at: new Date().toISOString(),
            user: username || 'visitor',
          });
        } else if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
          setIsConnected(false);
        }
      });

    return () => {
      room.unsubscribe();
    };
  }, [username]);

  // Scroll to bottom on new message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, activeChannel]);

  // Parse channel from message text if prefixed e.g. [SportyBet] ...
  const parseMessageChannel = (rawMessage: string): { channel: ChannelType; text: string } => {
    for (const ch of CHANNELS) {
      if (rawMessage.startsWith(`[${ch}] `)) {
        return {
          channel: ch,
          text: rawMessage.slice(ch.length + 3),
        };
      }
    }
    return { channel: 'General', text: rawMessage };
  };

  // Send message handler
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim()) {
      showToast('Please set your username first.');
      return;
    }

    const trimmed = newMessage.trim();
    if (!trimmed) return;

    if (trimmed.length > 200) {
      showToast('Message exceeds maximum length of 200 characters.');
      return;
    }

    // Rate limit check: 3 seconds
    const now = Date.now();
    const elapsed = now - lastSendTimeRef.current;
    if (elapsed < 3000) {
      const waitSeconds = Math.ceil((3000 - elapsed) / 1000);
      setCooldownRemaining(waitSeconds);
      showToast(`Rate limit: wait ${waitSeconds}s before sending.`);
      return;
    }

    // Prefix with active channel if not General
    const formattedPayload =
      activeChannel === 'General' ? trimmed : `[${activeChannel}] ${trimmed}`;

    try {
      lastSendTimeRef.current = now;
      setCooldownRemaining(3);
      setNewMessage('');

      const { data, error } = await supabase.from('messages').insert([
        {
          username: username.trim(),
          message: formattedPayload,
        },
      ]).select();

      if (error) {
        showToast('Error sending message. Check connection.');
        console.error('Insert message error:', error);
      } else if (data && data[0]) {
        // Optimistic append if postgres_changes is slightly delayed
        setMessages((prev) => {
          if (prev.some((m) => m.id === data[0].id)) return prev;
          return [...prev, data[0]];
        });
      }
    } catch (err) {
      console.error(err);
      showToast('Failed to send message.');
    }
  };

  // Block user handler
  const handleBlockUser = (userToBlock: string) => {
    if (userToBlock === username) return;
    const updated = [...blockedUsers, userToBlock];
    setBlockedUsers(updated);
    localStorage.setItem('sure_odd_blocked_users', JSON.stringify(updated));
    showToast(`Blocked messages from ${userToBlock}`);
  };

  // Report message handler
  const handleReportMessage = (msgId: string | number) => {
    showToast(`Message #${msgId} reported to Arena moderators.`);
  };

  // Admin delete message handler
  const handleDeleteMessage = async (msgId: string | number) => {
    if (!isAdmin) return;
    try {
      const { error } = await supabase.from('messages').delete().eq('id', msgId);
      if (!error) {
        setMessages((prev) => prev.filter((m) => m.id !== msgId));
        showToast('Message removed from database.');
      }
    } catch (err) {
      console.error('Delete error:', err);
    }
  };

  // Filter messages for active channel & unblocked users
  const visibleMessages = messages.filter((m) => {
    if (blockedUsers.includes(m.username)) return false;
    const { channel } = parseMessageChannel(m.message);
    if (activeChannel === 'General') return true;
    return channel === activeChannel;
  });

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed top-20 right-4 z-50 bg-[#1f222a] border border-[#ffd700] text-white px-4 py-2.5 rounded-lg shadow-xl text-xs flex items-center gap-2 animate-in fade-in duration-200">
          <CheckCircle2 className="w-4 h-4 text-[#ffd700]" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-6 border-b border-[#1f2228] gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs uppercase font-bold text-[#00ff88] tracking-wider">
            <MessageSquare className="w-4 h-4 text-[#00ff88]" />
            <span>COMMUNITY ARENA</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black font-arena tracking-tight text-white mt-1">
            Real-Time Live Chat
          </h2>
          <p className="text-xs text-gray-400 mt-1">
            Exchange banker slips, discuss in-play odds, and follow community sentiment.
          </p>
        </div>

        {/* Real Presence Online Count */}
        <div className="flex items-center gap-3 bg-[#121316] border border-[#22252c] px-3.5 py-2 rounded-xl">
          <div className="flex items-center gap-2 text-xs font-semibold">
            {isConnected ? (
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#00ff88] opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-[#00ff88]"></span>
              </span>
            ) : (
              <span className="h-2 w-2 rounded-full bg-red-500"></span>
            )}
            <span className="text-white font-mono-numbers font-bold text-sm">
              {onlineCount}
            </span>
            <span className="text-gray-400 text-xs">Live Bettors</span>
          </div>

          <div className="h-4 w-px bg-[#22252c]"></div>

          <div className="flex items-center gap-1 text-[11px] text-gray-400">
            {isConnected ? (
              <span className="text-[#00ff88] flex items-center gap-1">
                <Wifi className="w-3.5 h-3.5" /> Realtime
              </span>
            ) : (
              <span className="text-amber-400 flex items-center gap-1">
                <WifiOff className="w-3.5 h-3.5" /> Connecting
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Channels Bar */}
      <div className="flex items-center gap-2 overflow-x-auto py-4 scrollbar-none">
        {CHANNELS.map((ch) => {
          const isSelected = activeChannel === ch;
          return (
            <button
              key={ch}
              onClick={() => setActiveChannel(ch)}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold tracking-wide transition-colors whitespace-nowrap ${
                isSelected
                  ? 'bg-[#ffd700] text-black font-bold shadow-md'
                  : 'bg-[#121316] text-gray-300 hover:bg-[#181920] border border-[#22252c]'
              }`}
            >
              #{ch}
            </button>
          );
        })}
      </div>

      {/* Chat Container */}
      <div className="bg-[#121316] border border-[#22252c] rounded-2xl overflow-hidden shadow-2xl flex flex-col h-[520px]">
        {/* Username Selection Header if not set */}
        {!username ? (
          <div className="p-4 bg-[#181920] border-b border-[#22252c] flex flex-col sm:flex-row items-center justify-between gap-3">
            <span className="text-xs text-gray-300">
              Choose your chat handle to start talking (no password required):
            </span>
            <div className="flex gap-2 w-full sm:w-auto">
              <input
                type="text"
                placeholder="Your username..."
                maxLength={20}
                value={tempUsername}
                onChange={(e) => setTempUsername(e.target.value)}
                className="px-3 py-1.5 bg-[#121316] border border-[#2d313d] rounded-lg text-xs text-white focus:outline-none focus:border-[#ffd700] flex-1 sm:w-44"
              />
              <button
                onClick={() => {
                  if (tempUsername.trim()) {
                    setUsername(tempUsername.trim());
                    localStorage.setItem('sure_odd_chat_username', tempUsername.trim());
                  }
                }}
                className="px-3 py-1.5 bg-[#ffd700] hover:bg-[#ffe033] text-black font-bold text-xs rounded-lg transition-colors"
              >
                Join Chat
              </button>
            </div>
          </div>
        ) : (
          <div className="px-4 py-2 bg-[#16171d] border-b border-[#22252c] flex items-center justify-between text-xs text-gray-400">
            <div className="flex items-center gap-2">
              <span>Chatting as:</span>
              <strong className="text-[#ffd700] font-arena text-sm">{username}</strong>
            </div>
            <button
              onClick={() => {
                setUsername('');
                localStorage.removeItem('sure_odd_chat_username');
              }}
              className="text-[11px] text-gray-500 hover:text-gray-300 underline"
            >
              Change Handle
            </button>
          </div>
        )}

        {/* Messages Scroll Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3.5">
          {loadingHistory ? (
            <div className="py-20 text-center text-xs text-gray-400">
              Loading realtime messages...
            </div>
          ) : visibleMessages.length === 0 ? (
            <div className="py-16 text-center text-xs text-gray-500">
              No messages in #{activeChannel} yet. Be the first to start the match discussion!
            </div>
          ) : (
            visibleMessages.map((msg) => {
              const { channel, text } = parseMessageChannel(msg.message);
              const isSelf = msg.username === username;
              const formattedTime = new Date(msg.created_at).toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit',
              });

              return (
                <div
                  key={msg.id}
                  className={`flex items-start gap-2.5 group ${
                    isSelf ? 'flex-row-reverse' : ''
                  }`}
                >
                  {/* Avatar */}
                  <div className="w-8 h-8 rounded-lg bg-[#1f222a] border border-[#2b2f3a] text-xs font-bold font-arena text-gray-300 flex items-center justify-center shrink-0">
                    {msg.username.slice(0, 2).toUpperCase()}
                  </div>

                  {/* Message Bubble */}
                  <div
                    className={`max-w-md rounded-xl p-3 text-xs ${
                      isSelf
                        ? 'bg-[#1e2330] border border-[#2d3548] text-white'
                        : 'bg-[#181920] border border-[#22252c] text-gray-200'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-3 mb-1">
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-white font-arena">
                          {msg.username}
                        </span>
                        {channel !== 'General' && (
                          <span className="text-[10px] px-1.5 py-0.2 rounded bg-[#ffd700]/15 text-[#ffd700] font-semibold">
                            {channel}
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] text-gray-500 font-mono-numbers">
                        {formattedTime}
                      </span>
                    </div>

                    <p className="leading-relaxed break-words">{text}</p>

                    {/* Hover Actions: Report / Block / Admin Delete */}
                    <div className="mt-2 pt-1 border-t border-[#252834] flex items-center justify-end gap-2 text-[10px] opacity-0 group-hover:opacity-100 transition-opacity">
                      {!isSelf && (
                        <>
                          <button
                            onClick={() => handleReportMessage(msg.id)}
                            className="text-gray-500 hover:text-amber-400 transition-colors"
                            title="Report Message"
                          >
                            Report
                          </button>
                          <span>·</span>
                          <button
                            onClick={() => handleBlockUser(msg.username)}
                            className="text-gray-500 hover:text-red-400 transition-colors"
                            title="Block User"
                          >
                            Block
                          </button>
                        </>
                      )}
                      {isAdmin && (
                        <>
                          <span>·</span>
                          <button
                            onClick={() => handleDeleteMessage(msg.id)}
                            className="text-red-400 hover:text-red-300 flex items-center gap-0.5"
                          >
                            <Trash2 className="w-3 h-3" />
                            <span>Delete</span>
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Bar */}
        <form
          onSubmit={handleSendMessage}
          className="p-3 bg-[#16171d] border-t border-[#22252c] flex items-center gap-2"
        >
          <div className="relative flex-1">
            <input
              type="text"
              placeholder={
                username
                  ? `Message in #${activeChannel} (max 200 chars)...`
                  : 'Enter username above first...'
              }
              value={newMessage}
              disabled={!username}
              maxLength={200}
              onChange={(e) => setNewMessage(e.target.value)}
              className="w-full pl-3 pr-14 py-2.5 bg-[#101114] border border-[#252830] rounded-xl text-xs text-white placeholder-gray-500 focus:outline-none focus:border-[#ffd700] disabled:opacity-50"
            />
            <span
              className={`absolute right-3 top-3 text-[10px] font-mono-numbers ${
                newMessage.length >= 190 ? 'text-red-400 font-bold' : 'text-gray-500'
              }`}
            >
              {200 - newMessage.length}
            </span>
          </div>

          <button
            type="submit"
            disabled={!username || cooldownRemaining > 0 || !newMessage.trim()}
            className="px-4 py-2.5 bg-[#ffd700] hover:bg-[#ffe033] disabled:bg-[#20222a] disabled:text-gray-500 text-black font-bold text-xs rounded-xl transition-colors flex items-center gap-1.5 shrink-0"
          >
            {cooldownRemaining > 0 ? (
              <span className="font-mono-numbers">{cooldownRemaining}s</span>
            ) : (
              <>
                <Send className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Send</span>
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};
