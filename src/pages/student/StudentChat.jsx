import React, { useState, useEffect, useRef, useCallback } from 'react';
import SmartHeader from '../../components/SmartHeader';
import { useSocket } from '../../context/SocketContext';
import { useAuth } from '../../context/AuthContext';
import {
  getFriends,
  getFriendRequests,
  sendFriendRequest,
  respondToFriendRequest,
  removeFriend,
  getConversationHistory,
  searchStudents,
} from '../../services/chatService';
import {
  MessageSquare,
  Search,
  Send,
  UserPlus,
  Check,
  CheckCheck,
  X,
  Users,
  ChevronLeft,
  Loader2,
  UserMinus,
  Bell,
  AlertTriangle,
  Plus,
} from 'lucide-react';

// ─── Utility Helpers ──────────────────────────────────────────────────────────
const getConversationId = (uid1, uid2) => [uid1, uid2].sort().join('_');

const avatarUrl = (user) =>
  user?.photoURL ||
  `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(user?.displayName || user?.uid || 'U')}&backgroundColor=4f46e5&textColor=ffffff`;

const formatMessageTime = (isoString) => {
  if (!isoString) return '';
  const d = new Date(isoString);
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

const getMessageDateGroup = (isoString) => {
  if (!isoString) return '';
  const d = new Date(isoString);
  const now = new Date();

  const isToday = d.toDateString() === now.toDateString();
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const isYesterday = d.toDateString() === yesterday.toDateString();

  if (isToday) return 'Today';
  if (isYesterday) return 'Yesterday';
  return d.toLocaleDateString([], {
    month: 'short',
    day: 'numeric',
    year: d.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
  });
};

// ─── Date Divider Component ───────────────────────────────────────────────────
const DateDivider = ({ dateStr }) => (
  <div className="flex items-center justify-center my-3 select-none">
    <div className="h-px bg-slate-200 dark:border-white/10 flex-1 max-w-[80px]" />
    <span className="mx-3 text-[11px] font-bold px-3 py-0.5 rounded-full bg-slate-100 dark:bg-white/5 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-white/10 shadow-2xs">
      {dateStr}
    </span>
    <div className="h-px bg-slate-200 dark:border-white/10 flex-1 max-w-[80px]" />
  </div>
);

// ─── MessageBubble Component ──────────────────────────────────────────────────
const MessageBubble = ({ msg, isMine, isConsecutive }) => (
  <div
    className={`flex items-end gap-2 ${isMine ? 'flex-row-reverse' : 'flex-row'} ${isConsecutive ? 'mt-1' : 'mt-2.5'
      }`}
  >
    <div
      className={`max-w-[82%] sm:max-w-[70%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed break-words shadow-sm ${isMine
        ? 'bg-indigo-600 text-white rounded-br-xs shadow-indigo-600/20'
        : 'bg-white dark:bg-[#141414] text-slate-900 dark:text-slate-100 border border-slate-200 dark:border-white/10 rounded-bl-xs'
        }`}
    >
      <p className="whitespace-pre-wrap">{msg.text}</p>

      <div
        className={`flex items-center justify-end gap-1 mt-1 text-[10px] select-none ${isMine ? 'text-indigo-200' : 'text-slate-400'
          }`}
      >
        <span>{formatMessageTime(msg.createdAt)}</span>
        {isMine && (
          <span className="inline-flex items-center ml-0.5" title={msg.read ? 'Read' : 'Delivered'}>
            {msg.read ? (
              <CheckCheck className="w-3.5 h-3.5 text-sky-200" />
            ) : (
              <Check className="w-3.5 h-3.5 text-indigo-300" />
            )}
          </span>
        )}
      </div>
    </div>
  </div>
);

// ─── Reusable Typing Dots Wave ────────────────────────────────────────────────
const TypingDots = ({ size = 'sm', color = 'bg-indigo-500' }) => {
  const dotClass =
    size === 'xs'
      ? 'w-1 h-1'
      : size === 'md'
        ? 'w-2 h-2'
        : 'w-1.5 h-1.5';
  return (
    <span className="inline-flex items-center gap-1">
      <span
        className={`${dotClass} rounded-full ${color} animate-typing-dot`}
        style={{ animationDelay: '0ms' }}
      />
      <span
        className={`${dotClass} rounded-full ${color} animate-typing-dot`}
        style={{ animationDelay: '200ms' }}
      />
      <span
        className={`${dotClass} rounded-full ${color} animate-typing-dot`}
        style={{ animationDelay: '400ms' }}
      />
    </span>
  );
};

// ─── Typing Indicator Bubble ──────────────────────────────────────────────────
const TypingBubble = ({ name, avatar }) => (
  <div className="flex items-end gap-2 mt-2 mb-1 select-none">

    <div className="px-3.5 py-2 rounded-2xl rounded-bl-xs bg-white dark:bg-[#141414] border border-slate-200 dark:border-white/10 shadow-xs flex items-center gap-2">
      <TypingDots size="sm" color="bg-indigo-500 dark:bg-indigo-400" />

    </div>
  </div>
);

// ─── Add Friend Modal ─────────────────────────────────────────────────────────
const AddFriendModal = ({ onClose, currentFriends, onRequestSent }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState({});
  const [sent, setSent] = useState({});
  const debounceRef = useRef(null);

  const friendUids = new Set(currentFriends.map((f) => f.uid));

  const handleSearch = (value) => {
    setQuery(value);
    clearTimeout(debounceRef.current);
    if (value.trim().length < 2) {
      setResults([]);
      return;
    }
    debounceRef.current = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await searchStudents(value.trim());
        setResults(res.data.students || []);
      } catch {
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 350);
  };

  const handleSend = async (toUid) => {
    setSending((s) => ({ ...s, [toUid]: true }));
    try {
      await sendFriendRequest(toUid);
      setSent((s) => ({ ...s, [toUid]: true }));
      onRequestSent?.();
    } catch (err) {
      alert(err?.response?.data?.error || 'Failed to send request');
    } finally {
      setSending((s) => ({ ...s, [toUid]: false }));
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white dark:bg-[#0a0a0a] border border-slate-200 dark:border-white/10 rounded-3xl shadow-2xl w-full max-w-md p-6 overflow-hidden">

        {/* Modal Header */}
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">Find Classmates</h2>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full hover:bg-slate-100 dark:hover:bg-white/10 flex items-center justify-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Search Input */}
        <div className="relative mb-4">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            autoFocus
            type="text"
            value={query}
            onChange={(e) => handleSearch(e.target.value)}
            placeholder="Search by name or roll number…"
            className="w-full pl-10 pr-9 py-3 bg-slate-50 dark:bg-[#141414] border border-slate-200 dark:border-white/10 rounded-2xl text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-indigo-500/50 focus:ring-4 focus:ring-indigo-500/10 shadow-sm transition-all"
          />
          {query && (
            <button
              onClick={() => { setQuery(''); setResults([]); }}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Results */}
        <div className="space-y-2 max-h-72 overflow-y-auto pr-1 custom-scrollbar">
          {loading && (
            <div className="flex justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-indigo-500" />
            </div>
          )}

          {!loading && results.length === 0 && query.trim().length >= 2 && (
            <p className="text-center text-sm text-slate-400 py-8">No students found</p>
          )}

          {!loading && query.trim().length < 2 && (
            <p className="text-center text-xs text-slate-400 py-8">Type at least 2 characters to search</p>
          )}

          {results.map((student) => {
            const isFriend = friendUids.has(student.uid);
            const isSent = sent[student.uid];
            return (
              <div
                key={student.uid}
                className="flex items-center gap-3 p-3 rounded-2xl hover:bg-slate-50 dark:hover:bg-white/5 transition-colors border border-transparent hover:border-slate-100 dark:hover:border-white/5"
              >
                <img
                  src={avatarUrl(student)}
                  alt={student.displayName}
                  className="w-10 h-10 rounded-full object-cover flex-shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-slate-900 dark:text-white truncate">
                    {student.displayName}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                    {student.rollNo} {student.department && `· ${student.department}`}
                  </p>
                </div>

                {isFriend ? (
                  <span className="text-xs text-green-600 dark:text-green-400 font-semibold px-2">
                    Friends
                  </span>
                ) : isSent ? (
                  <span className="text-xs text-indigo-500 font-semibold px-2 flex items-center gap-1">
                    <Check className="w-3.5 h-3.5" /> Sent
                  </span>
                ) : (
                  <button
                    onClick={() => handleSend(student.uid)}
                    disabled={sending[student.uid]}
                    className="px-3.5 py-1.5 text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl transition-all disabled:opacity-60 flex items-center gap-1 shadow-sm shadow-indigo-600/20 active:scale-95"
                  >
                    {sending[student.uid] ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <UserPlus className="w-3.5 h-3.5" />
                    )}
                    Add
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

// ─── Friend Requests Modal ────────────────────────────────────────────────────
const FriendRequestsPanel = ({ requests, onRespond, onClose }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
    <div className="bg-white dark:bg-[#0a0a0a] border border-slate-200 dark:border-white/10 rounded-3xl shadow-2xl w-full max-w-md p-6 overflow-hidden">

      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">Friend Requests</h2>
          {requests.length > 0 && (
            <span className="text-xs font-bold bg-rose-500 text-white rounded-full px-2 py-0.5">
              {requests.length}
            </span>
          )}
        </div>
        <button
          onClick={onClose}
          className="w-8 h-8 rounded-full hover:bg-slate-100 dark:hover:bg-white/10 flex items-center justify-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Body */}
      <div className="space-y-2.5 max-h-80 overflow-y-auto pr-1 custom-scrollbar">
        {requests.length === 0 ? (
          <p className="text-center text-sm text-slate-400 py-8">No pending requests</p>
        ) : (
          requests.map((req) => (
            <div
              key={req.friendshipId}
              className="flex items-center gap-3 p-3 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5"
            >
              <img
                src={avatarUrl(req.sender)}
                alt={req.sender.displayName}
                className="w-10 h-10 rounded-full object-cover flex-shrink-0"
              />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-slate-900 dark:text-white truncate">
                  {req.sender.displayName}
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                  {req.sender.rollNo} {req.sender.department && `· ${req.sender.department}`}
                </p>
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => onRespond(req.friendshipId, 'accepted')}
                  className="w-8 h-8 rounded-xl bg-green-500 hover:bg-green-600 text-white flex items-center justify-center transition-colors shadow-sm"
                  title="Accept"
                >
                  <Check className="w-4 h-4" />
                </button>
                <button
                  onClick={() => onRespond(req.friendshipId, 'rejected')}
                  className="w-8 h-8 rounded-xl bg-slate-200 dark:bg-white/10 hover:bg-rose-500 hover:text-white text-slate-600 dark:text-slate-300 flex items-center justify-center transition-colors"
                  title="Reject"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  </div>
);

// ─── Remove Friend Confirmation Dialog ────────────────────────────────────────
const RemoveFriendModal = ({ friend, onConfirm, onCancel }) => {
  if (!friend) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white dark:bg-[#0a0a0a] border border-slate-200 dark:border-white/10 rounded-3xl shadow-2xl w-full max-w-sm p-6 text-center">
        <div className="w-12 h-12 rounded-2xl bg-rose-50 dark:bg-rose-500/10 text-rose-500 flex items-center justify-center mx-auto mb-4">
          <AlertTriangle className="w-6 h-6" />
        </div>
        <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1">
          Remove {friend.displayName}?
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 mb-6 leading-relaxed">
          You will no longer be able to message each other unless a new friend request is sent and accepted.
        </p>
        <div className="flex items-center gap-2">
          <button
            onClick={onCancel}
            className="flex-1 py-2.5 rounded-xl bg-slate-100 dark:bg-white/10 hover:bg-slate-200 dark:hover:bg-white/15 text-slate-700 dark:text-slate-300 text-xs font-semibold transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold transition-colors shadow-sm"
          >
            Remove Friend
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── Main StudentChat Page ────────────────────────────────────────────────────
export default function StudentChat() {
  const { user } = useAuth();
  const { sendMessage, markRead, emitTyping, emitStopTyping, on, off, onlineUsers, isConnected } = useSocket();

  // ── State ──────────────────────────────────────────────────────────────────
  const [friends, setFriends] = useState([]);
  const [friendRequests, setFriendRequests] = useState([]);
  const [selectedFriend, setSelectedFriend] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [sending, setSending] = useState(false);
  const [loadingFriends, setLoadingFriends] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [showAddFriend, setShowAddFriend] = useState(false);
  const [showRequests, setShowRequests] = useState(false);
  const [friendToRemove, setFriendToRemove] = useState(null);
  const [friendSearch, setFriendSearch] = useState('');
  const [filterTab, setFilterTab] = useState('all'); // 'all' | 'online' | 'unread'
  const [typingFriends, setTypingFriends] = useState({});
  const [unreadMap, setUnreadMap] = useState({}); // friendUid -> count
  const [mobileShowChat, setMobileShowChat] = useState(false);

  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef({});
  const inputRef = useRef(null);

  // ── Load friends and requests ───────────────────────────────────────────────
  const loadFriends = useCallback(async () => {
    try {
      const [friendsRes, reqRes] = await Promise.all([getFriends(), getFriendRequests()]);
      setFriends(friendsRes.data.friends || []);
      setFriendRequests(reqRes.data.requests || []);
    } catch (err) {
      console.error('Failed to load friends:', err);
    } finally {
      setLoadingFriends(false);
    }
  }, []);

  useEffect(() => {
    loadFriends();
  }, [loadFriends]);

  // ── Socket listeners ────────────────────────────────────────────────────────
  useEffect(() => {
    const handleReceiveMessage = (msg) => {
      if (selectedFriend && msg.senderUid === selectedFriend.uid) {
        setMessages((prev) => [...prev, msg]);
        const convId = getConversationId(user.uid, selectedFriend.uid);
        markRead(convId, selectedFriend.uid);
      } else {
        setUnreadMap((prev) => ({
          ...prev,
          [msg.senderUid]: (prev[msg.senderUid] || 0) + 1,
        }));
      }
    };

    const handleMessagesRead = () => {
      setMessages((prev) =>
        prev.map((m) =>
          m.senderUid === user?.uid && !m.read ? { ...m, read: true } : m
        )
      );
    };

    const handleFriendRequest = (requestData) => {
      setFriendRequests((prev) => {
        if (prev.find((r) => r.friendshipId === requestData.friendshipId)) return prev;
        return [requestData, ...prev];
      });
    };

    const handleFriendAccepted = ({ friendshipId, friend }) => {
      setFriends((prev) => {
        if (prev.find((f) => f.uid === friend.uid)) return prev;
        return [...prev, friend];
      });
      setFriendRequests((prev) =>
        prev.filter((r) => r.friendshipId !== friendshipId)
      );
    };

    const handleFriendRemoved = ({ byUid }) => {
      setFriends((prev) => prev.filter((f) => f.uid !== byUid));
      setSelectedFriend((prev) => {
        if (prev?.uid === byUid) {
          setMessages([]);
          setMobileShowChat(false);
          return null;
        }
        return prev;
      });
    };

    const handleTyping = ({ fromUid }) => {
      setTypingFriends((prev) => ({ ...prev, [fromUid]: true }));
      clearTimeout(typingTimeoutRef.current[fromUid]);
      typingTimeoutRef.current[fromUid] = setTimeout(() => {
        setTypingFriends((prev) => ({ ...prev, [fromUid]: false }));
      }, 2500);
    };

    const handleStopTyping = ({ fromUid }) => {
      setTypingFriends((prev) => ({ ...prev, [fromUid]: false }));
    };

    on('receive_message', handleReceiveMessage);
    on('messages_read', handleMessagesRead);
    on('friend_request', handleFriendRequest);
    on('friend_accepted', handleFriendAccepted);
    on('friend_removed', handleFriendRemoved);
    on('user_typing', handleTyping);
    on('user_stop_typing', handleStopTyping);

    return () => {
      off('receive_message', handleReceiveMessage);
      off('messages_read', handleMessagesRead);
      off('friend_request', handleFriendRequest);
      off('friend_accepted', handleFriendAccepted);
      off('friend_removed', handleFriendRemoved);
      off('user_typing', handleTyping);
      off('user_stop_typing', handleStopTyping);
    };
  }, [on, off, selectedFriend, markRead, user?.uid]);

  // ── Auto scroll to bottom ───────────────────────────────────────────────────
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, typingFriends]);

  // ── HTTP fallback polling when socket is disconnected (e.g. Vercel deployment) ──
  useEffect(() => {
    if (!selectedFriend || isConnected) return;

    const pollInterval = setInterval(async () => {
      try {
        const res = await getConversationHistory(selectedFriend.uid);
        if (res.data?.messages) {
          setMessages((prev) => {
            if (res.data.messages.length !== prev.length) {
              return res.data.messages;
            }
            return prev;
          });
        }
      } catch (err) {
        // Silently ignore polling error
      }
    }, 3500);

    return () => clearInterval(pollInterval);
  }, [selectedFriend, isConnected]);

  // ── Select friend & load history ────────────────────────────────────────────
  const selectFriend = async (friend) => {
    setSelectedFriend(friend);
    setMessages([]);
    setLoadingMessages(true);
    setMobileShowChat(true);

    setUnreadMap((prev) => ({ ...prev, [friend.uid]: 0 }));

    try {
      const res = await getConversationHistory(friend.uid);
      setMessages(res.data.messages || []);
      const convId = res.data.convId;
      markRead(convId, friend.uid);
    } catch (err) {
      console.error('Failed to load messages:', err);
    } finally {
      setLoadingMessages(false);
      setTimeout(() => inputRef.current?.focus(), 150);
    }
  };

  // ── Send message ────────────────────────────────────────────────────────────
  const handleSend = async (e) => {
    if (e && e.preventDefault) e.preventDefault();

    // Immediately keep focus synchronously on input so mobile virtual keyboard stays open
    inputRef.current?.focus();

    const text = inputText.trim();
    if (!text || !selectedFriend || sending) return;

    setSending(true);
    setInputText('');
    emitStopTyping(selectedFriend.uid);

    const optimisticId = `opt_${Date.now()}`;
    const optimisticMsg = {
      id: optimisticId,
      senderUid: user.uid,
      toUid: selectedFriend.uid,
      text,
      createdAt: new Date().toISOString(),
      read: false,
    };
    setMessages((prev) => [...prev, optimisticMsg]);

    try {
      const ack = await sendMessage(selectedFriend.uid, text);
      if (ack?.message) {
        setMessages((prev) =>
          prev.map((m) => (m.id === optimisticId ? { ...ack.message } : m))
        );
      }
    } catch (err) {
      console.error('Send failed:', err);
      setMessages((prev) => prev.filter((m) => m.id !== optimisticId));
      setInputText(text);
    } finally {
      setSending(false);
      inputRef.current?.focus();
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend(e);
    }
  };

  // ── Typing indicator dispatch ───────────────────────────────────────────────
  const handleInputChange = (e) => {
    const val = e.target.value;
    setInputText(val);
    if (selectedFriend) {
      if (!val.trim()) {
        emitStopTyping(selectedFriend.uid);
        clearTimeout(typingTimeoutRef.current['self']);
      } else {
        emitTyping(selectedFriend.uid);
        clearTimeout(typingTimeoutRef.current['self']);
        typingTimeoutRef.current['self'] = setTimeout(() => {
          emitStopTyping(selectedFriend.uid);
        }, 1500);
      }
    }
  };

  // ── Friend request actions ──────────────────────────────────────────────────
  const handleRespondRequest = async (friendshipId, action) => {
    try {
      await respondToFriendRequest(friendshipId, action);
      setFriendRequests((prev) => prev.filter((r) => r.friendshipId !== friendshipId));
    } catch (err) {
      alert(err?.response?.data?.error || 'Failed to respond');
    }
  };

  const confirmRemoveFriend = async () => {
    if (!friendToRemove) return;
    const uid = friendToRemove.uid;
    try {
      await removeFriend(uid);
      setFriends((prev) => prev.filter((f) => f.uid !== uid));
      if (selectedFriend?.uid === uid) {
        setSelectedFriend(null);
        setMessages([]);
        setMobileShowChat(false);
      }
    } catch (err) {
      alert(err?.response?.data?.error || 'Failed to remove friend');
    } finally {
      setFriendToRemove(null);
    }
  };

  // ── Filter friends ──────────────────────────────────────────────────────────
  const filteredFriends = friends.filter((f) => {
    const matchesSearch =
      f.displayName?.toLowerCase().includes(friendSearch.toLowerCase()) ||
      f.rollNo?.toLowerCase().includes(friendSearch.toLowerCase());

    if (!matchesSearch) return false;

    if (filterTab === 'online') return onlineUsers.includes(f.uid);
    if (filterTab === 'unread') return (unreadMap[f.uid] || 0) > 0;
    return true;
  });

  const onlineFriendsCount = friends.filter((f) => onlineUsers.includes(f.uid)).length;
  const totalUnreadCount = Object.values(unreadMap).reduce((sum, count) => sum + count, 0);
  const canSend = Boolean(inputText.trim()) && !sending;

  return (
    <div className="h-screen h-[100dvh] bg-slate-50 dark:bg-black text-slate-900 dark:text-white font-sans selection:bg-indigo-500/30 overflow-hidden flex flex-col">
      <SmartHeader />

      <main className="flex-1 w-full max-w-7xl mx-auto px-2 sm:px-6 lg:px-8 pt-18 sm:pt-24 pb-2 sm:pb-6 flex flex-col min-h-0">
        <div className="flex-1 w-full bg-white dark:bg-[#0a0a0a] border border-slate-200 dark:border-white/10 rounded-2xl sm:rounded-3xl shadow-sm overflow-hidden flex min-h-0">

          {/*LEFT PANEL: Friends List */}
          <div
            className={`${mobileShowChat ? 'hidden md:flex' : 'flex'
              } flex-col w-full md:w-80 lg:w-96 shrink-0 bg-white dark:bg-[#0a0a0a] border-r border-slate-200 dark:border-white/10 overflow-hidden`}
          >
            {/* Header */}
            <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-white/10 space-y-3">
              <div className="flex items-center justify-between">
                <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
                  Messages
                </h1>

                <div className="flex items-center gap-1.5">
                  {/* Friend Requests Bell Button */}
                  <button
                    onClick={() => setShowRequests(true)}
                    className="relative w-9 h-9 rounded-full bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 flex items-center justify-center text-slate-600 dark:text-slate-300 transition-colors"
                    title="Friend Requests"
                  >
                    <Bell className="w-4 h-4" />
                    {friendRequests.length > 0 && (
                      <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-rose-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center">
                        {friendRequests.length}
                      </span>
                    )}
                  </button>

                  {/* Add Friend Button */}
                  <button
                    onClick={() => setShowAddFriend(true)}
                    className="w-9 h-9 rounded-full bg-indigo-600 hover:bg-indigo-700 flex items-center justify-center text-white transition-colors shadow-sm shadow-indigo-600/20 active:scale-95"
                    title="Add new friend"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Search Bar matching Notice page */}
              <div className="relative group">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 dark:text-slate-500 group-focus-within:text-indigo-500 transition-colors" />
                <input
                  type="text"
                  value={friendSearch}
                  onChange={(e) => setFriendSearch(e.target.value)}
                  placeholder="Search friends or roll no…"
                  className="w-full pl-10 pr-9 py-2.5 bg-slate-50 dark:bg-[#141414] border border-slate-200 dark:border-white/10 rounded-full text-xs sm:text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-indigo-500/50 focus:ring-4 focus:ring-indigo-500/10 shadow-sm transition-all"
                />
                {friendSearch && (
                  <button
                    onClick={() => setFriendSearch('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Individual Filter Pills matching Notice page style */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setFilterTab('all')}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all border ${filterTab === 'all'
                    ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm shadow-indigo-600/20'
                    : 'bg-white dark:bg-white/5 border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-400 hover:border-slate-300 dark:hover:border-white/20'
                    }`}
                >
                  All ({friends.length})
                </button>
                <button
                  onClick={() => setFilterTab('online')}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all border ${filterTab === 'online'
                    ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm shadow-indigo-600/20'
                    : 'bg-white dark:bg-white/5 border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-400 hover:border-slate-300 dark:hover:border-white/20'
                    }`}
                >
                  Online ({onlineFriendsCount})
                </button>
                {totalUnreadCount > 0 && (
                  <button
                    onClick={() => setFilterTab('unread')}
                    className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all border ${filterTab === 'unread'
                      ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm shadow-indigo-600/20'
                      : 'bg-white dark:bg-white/5 border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-400 hover:border-slate-300 dark:hover:border-white/20'
                      }`}
                  >
                    Unread ({totalUnreadCount})
                  </button>
                )}
              </div>
            </div>

            {/* Friends List */}
            <div className="flex-1 overflow-y-auto p-2.5 sm:p-3 space-y-1 custom-scrollbar">
              {loadingFriends ? (
                <div className="flex justify-center py-12">
                  <Loader2 className="w-6 h-6 animate-spin text-indigo-500" />
                </div>
              ) : filteredFriends.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
                  <div className="w-14 h-14 bg-indigo-50 dark:bg-indigo-500/10 rounded-2xl flex items-center justify-center mb-3">
                    <Users className="w-7 h-7 text-indigo-500" />
                  </div>
                  <p className="text-sm font-bold text-slate-700 dark:text-slate-200">
                    {friendSearch ? 'No friends found' : 'No friends yet'}
                  </p>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {friendSearch ? 'Try a different search' : 'Click + to add classmates'}
                  </p>
                </div>
              ) : (
                filteredFriends.map((friend) => {
                  const isOnline = onlineUsers.includes(friend.uid);
                  const isSelected = selectedFriend?.uid === friend.uid;
                  const isTyping = typingFriends[friend.uid];
                  const unread = unreadMap[friend.uid] || 0;

                  return (
                    <div
                      key={friend.uid}
                      onClick={() => selectFriend(friend)}
                      className={`flex items-center gap-3 p-3 rounded-2xl cursor-pointer transition-all group ${isSelected
                        ? 'bg-indigo-50 dark:bg-indigo-500/15 border border-indigo-200/60 dark:border-indigo-500/20 shadow-xs'
                        : 'hover:bg-slate-50 dark:hover:bg-white/5 border border-transparent'
                        }`}
                    >
                      {/* Avatar with status dot */}
                      <div className="relative flex-shrink-0">
                        <img
                          src={avatarUrl(friend)}
                          alt={friend.displayName}
                          className="w-11 h-11 rounded-full object-cover ring-2 ring-slate-100 dark:ring-white/5"
                        />
                        <span
                          className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-white dark:border-[#0a0a0a] ${isOnline ? 'bg-emerald-500' : 'bg-slate-300 dark:bg-zinc-600'
                            }`}
                        />
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <p
                          className={`text-sm font-bold truncate ${isSelected
                            ? 'text-indigo-600 dark:text-indigo-400'
                            : 'text-slate-900 dark:text-white'
                            }`}
                        >
                          {friend.displayName}
                        </p>
                        <p className="text-xs text-slate-400 truncate mt-0.5">
                          {isTyping ? (
                            <span className="text-indigo-500 font-semibold flex items-center gap-1.5">
                              <span>typing</span>
                              <TypingDots size="xs" color="bg-indigo-500" />
                            </span>
                          ) : isOnline ? (
                            <span className="text-emerald-500 font-medium">Online</span>
                          ) : (
                            friend.department || friend.rollNo || 'Student'
                          )}
                        </p>
                      </div>

                      {/* Unread badge & remove button */}
                      <div className="flex flex-col items-end gap-1 flex-shrink-0">
                        {unread > 0 && (
                          <span className="w-5 h-5 bg-indigo-600 text-white text-[10px] font-bold rounded-full flex items-center justify-center shadow-xs">
                            {unread > 9 ? '9+' : unread}
                          </span>
                        )}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setFriendToRemove(friend);
                          }}
                          className="opacity-0 group-hover:opacity-100 w-6 h-6 rounded-full hover:bg-rose-50 dark:hover:bg-rose-500/10 text-slate-400 hover:text-rose-500 flex items-center justify-center transition-all"
                          title="Remove friend"
                        >
                          <UserMinus className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* ════════════════════════════════════════════════════════════════════
            RIGHT PANEL: Chat Window (Direct Full Height)
           ════════════════════════════════════════════════════════════════════ */}
          <div
            className={`${!mobileShowChat ? 'hidden md:flex' : 'flex'
              } flex-1 flex-col bg-white dark:bg-[#0a0a0a] overflow-hidden`}
          >
            {!selectedFriend ? (
              /* Empty state: No conversation selected */
              <div className="flex-1 flex flex-col items-center justify-center gap-3 text-center p-8 select-none">
                <div className="w-16 h-16 rounded-2xl bg-slate-100 dark:bg-white/5 flex items-center justify-center text-slate-400 dark:text-slate-500 mb-2">
                  <MessageSquare className="w-8 h-8 text-indigo-500" />
                </div>
                <h2 className="text-xl font-bold text-slate-800 dark:text-white">
                  Select a conversation
                </h2>
                <p className="text-sm text-slate-500 dark:text-slate-400 max-w-xs">
                  Choose a friend from the left sidebar to start chatting
                </p>
              </div>
            ) : (
              <>
                {/* Chat Header */}
                <div className="flex items-center justify-between px-4 sm:px-6 py-3.5 border-b border-slate-100 dark:border-white/10 shrink-0 bg-white dark:bg-[#0a0a0a]">
                  <div className="flex items-center gap-3 min-w-0">
                    <button
                      onClick={() => {
                        inputRef.current?.blur();
                        setMobileShowChat(false);
                        setSelectedFriend(null);
                      }}
                      className="md:hidden w-8 h-8 rounded-full hover:bg-slate-100 dark:hover:bg-white/10 flex items-center justify-center text-slate-600 dark:text-slate-300 transition-colors"
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </button>

                    <div className="relative flex-shrink-0">
                      <img
                        src={avatarUrl(selectedFriend)}
                        alt={selectedFriend.displayName}
                        className="w-10 h-10 rounded-full object-cover ring-2 ring-indigo-500/20"
                      />
                      <span
                        className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-white dark:border-[#0a0a0a] ${onlineUsers.includes(selectedFriend.uid)
                          ? 'bg-emerald-500'
                          : 'bg-slate-300 dark:bg-zinc-600'
                          }`}
                      />
                    </div>

                    <div className="min-w-0">
                      <p className="text-sm sm:text-base font-bold text-slate-900 dark:text-white truncate">
                        {selectedFriend.displayName}
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                        {typingFriends[selectedFriend.uid] ? (
                          <span className="text-indigo-500 font-semibold flex items-center gap-1.5">
                            <span>typing</span>
                            <TypingDots size="xs" color="bg-indigo-500" />
                          </span>
                        ) : onlineUsers.includes(selectedFriend.uid) ? (
                          <span className="text-emerald-500 font-medium">Online</span>
                        ) : (
                          selectedFriend.department || selectedFriend.rollNo || 'Offline'
                        )}
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => setFriendToRemove(selectedFriend)}
                    className="w-8 h-8 rounded-full hover:bg-rose-50 dark:hover:bg-rose-500/10 text-slate-400 hover:text-rose-500 flex items-center justify-center transition-colors"
                    title="Remove friend"
                  >
                    <UserMinus className="w-4 h-4" />
                  </button>
                </div>

                {/* Messages Feed */}
                <div
                  onPointerDown={(e) => {
                    // Clicking or scrolling the message feed dismisses the mobile keyboard
                    if (e.target.closest('button') || e.target.closest('a')) return;
                    inputRef.current?.blur();
                  }}
                  className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-1 custom-scrollbar bg-slate-50/50 dark:bg-[#060606]"
                >
                  {loadingMessages ? (
                    <div className="flex justify-center py-12">
                      <Loader2 className="w-6 h-6 animate-spin text-indigo-500" />
                    </div>
                  ) : messages.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-center py-8 select-none">
                      <div className="w-14 h-14 rounded-2xl bg-indigo-50 dark:bg-indigo-500/10 flex items-center justify-center mb-3">
                        <MessageSquare className="w-7 h-7 text-indigo-500" />
                      </div>
                      <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                        No messages yet
                      </p>
                      <p className="text-xs text-slate-400 mt-1">
                        Say hi to {selectedFriend.displayName}! 👋
                      </p>
                    </div>
                  ) : (
                    <>
                      {messages.map((msg, index) => {
                        const isMine = msg.senderUid === user?.uid;
                        const dateGroup = getMessageDateGroup(msg.createdAt);
                        const prevMsg = messages[index - 1];
                        const prevDateGroup = prevMsg ? getMessageDateGroup(prevMsg.createdAt) : null;
                        const showDateDivider = dateGroup !== prevDateGroup;

                        const isConsecutive =
                          prevMsg &&
                          prevMsg.senderUid === msg.senderUid &&
                          !showDateDivider &&
                          new Date(msg.createdAt) - new Date(prevMsg.createdAt) < 120000;

                        return (
                          <React.Fragment key={msg.id || index}>
                            {showDateDivider && <DateDivider dateStr={dateGroup} />}
                            <MessageBubble
                              msg={msg}
                              isMine={isMine}
                              isConsecutive={isConsecutive}
                            />
                          </React.Fragment>
                        );
                      })}

                      {typingFriends[selectedFriend.uid] && (
                        <TypingBubble
                          name={selectedFriend.displayName}
                          avatar={avatarUrl(selectedFriend)}
                        />
                      )}
                    </>
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {/* Input Bar */}
                <div className="p-2 sm:p-4 border-t border-slate-100 dark:border-white/10 bg-white dark:bg-[#0a0a0a] shrink-0">
                  <form
                    onSubmit={handleSend}
                    className="flex items-center gap-1.5 sm:gap-2 bg-slate-50 dark:bg-[#141414] border border-slate-200 dark:border-white/10 rounded-full pl-3.5 sm:pl-4 pr-1 sm:pr-1.5 py-1 sm:py-1.5 focus-within:border-indigo-500/50 focus-within:ring-4 focus-within:ring-indigo-500/10 shadow-sm transition-all"
                  >
                    <input
                      ref={inputRef}
                      type="text"
                      enterKeyHint="send"
                      autoComplete="off"
                      value={inputText}
                      onChange={handleInputChange}
                      onKeyDown={handleKeyDown}
                      placeholder={`Message ${selectedFriend.displayName.split(' ')[0]}…`}
                      className="flex-1 min-w-0 bg-transparent py-1.5 text-sm text-slate-900 dark:text-white placeholder-slate-400 outline-none"
                    />
                    <button
                      type="submit"
                      onClick={(e) => {
                        e.preventDefault();
                        handleSend();
                      }}
                      onMouseDown={(e) => {
                        // Prevent the input from losing focus on desktop clicks
                        e.preventDefault();
                      }}
                      className={`w-10 h-10 sm:w-9 sm:h-9 rounded-full flex items-center justify-center transition-all active:scale-95 shadow-sm shadow-indigo-600/20 shrink-0 cursor-pointer touch-manipulation ${canSend
                        ? 'bg-indigo-600 hover:bg-indigo-700 text-white'
                        : 'bg-indigo-600/40 text-white/50 cursor-not-allowed'
                        }`}
                      title="Send message"
                    >
                      {sending ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Send className="w-4 h-4 ml-0.5" />
                      )}
                    </button>
                  </form>
                </div>
              </>
            )}
          </div>
        </div>
      </main>

      {/* ── Modals & Dialogs ── */}
      {showAddFriend && (
        <AddFriendModal
          onClose={() => setShowAddFriend(false)}
          currentFriends={friends}
          onRequestSent={() => { }}
        />
      )}

      {showRequests && (
        <FriendRequestsPanel
          requests={friendRequests}
          onRespond={handleRespondRequest}
          onClose={() => setShowRequests(false)}
        />
      )}

      {friendToRemove && (
        <RemoveFriendModal
          friend={friendToRemove}
          onConfirm={confirmRemoveFriend}
          onCancel={() => setFriendToRemove(null)}
        />
      )}
    </div>
  );
}
