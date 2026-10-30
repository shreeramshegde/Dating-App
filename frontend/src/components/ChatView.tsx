import React, { useState, useEffect, useRef } from 'react';
import { 
  Send, 
  ArrowLeft, 
  Sparkles, 
  CheckCheck, 
  Search,
  MoreVertical, 
  UserX,
  PawPrint
} from 'lucide-react';
import { MatchItem, ChatMessage, UserProfile } from '../types';
import { api } from '../services/api';
import { wsService } from '../services/websocket';

interface ChatViewProps {
  matches: MatchItem[];
  currentUser: UserProfile;
  selectedMatchId?: string;
  onSelectMatch: (matchId: string) => void;
  onUnmatch: (matchId: string) => void;
}

const PET_SUGGESTION_CHIPS = [
  { label: '📅 Schedule a visit to meet' },
  { label: '💉 Vaccination & health status?' },
  { label: '🐕 Good with other pets / kids?' },
  { label: '🚗 I am heading over to rescue' },
  { label: '📍 Share exact landmark / street' },
];

export const ChatView: React.FC<ChatViewProps> = ({
  matches,
  currentUser,
  selectedMatchId,
  onSelectMatch,
  onUnmatch,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const activeMatch = matches.find((m) => m.matchId === selectedMatchId) || matches[0];

  useEffect(() => {
    if (!activeMatch) return;

    let isMounted = true;
    setIsLoadingMessages(true);

    api.getMessages(activeMatch.matchId)
      .then((data) => {
        if (isMounted) setMessages(data);
      })
      .finally(() => {
        if (isMounted) setIsLoadingMessages(false);
      });

    // Mark as read
    api.markMessagesRead(activeMatch.matchId);

    // Real-Time STOMP subscription for this conversation
    const unsubscribe = wsService.subscribeToMatch(activeMatch.matchId, (incoming) => {
      if (isMounted) {
        setMessages((prev) => [...prev, incoming]);
      }
    });

    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, [activeMatch?.matchId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || !activeMatch) return;

    const content = inputText.trim();
    setInputText('');

    // Try WebSocket send first; fallback to REST
    const sentViaWs = wsService.sendChatMessage(activeMatch.matchId, content);
    if (!sentViaWs) {
      const serverMsg = await api.sendMessage(activeMatch.matchId, content);
      setMessages((prev) => [...prev, serverMsg]);
    }
  };

  const handleCloseThread = async () => {
    if (!activeMatch) return;
    if (window.confirm(`Are you sure you want to close the conversation with ${activeMatch.matchedUserName}?`)) {
      await api.unmatch(activeMatch.matchId);
      onUnmatch(activeMatch.matchId);
      setShowMenu(false);
    }
  };

  const filteredMatches = matches.filter((m) =>
    m.matchedUserName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    m.pet.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="w-full max-w-5xl mx-auto h-[calc(100vh-6.5rem)] bg-white rounded-[32px] border border-hinge-border overflow-hidden flex flex-col md:flex-row shadow-hinge text-left">
      {/* Left Column: Match & Conversation List */}
      <div className={`w-full md:w-80 lg:w-96 border-r border-hinge-border flex flex-col bg-hinge-cream/40 ${selectedMatchId && 'hidden md:flex'}`}>
        {/* Top: Active Matches Horizon */}
        <div className="p-4 border-b border-hinge-border">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-[11px] font-bold uppercase tracking-wider text-neutral-500">
              Connections ({matches.length})
            </h3>
            <span className="text-[11px] text-amber-800 flex items-center gap-1 font-bold">
              <Sparkles className="w-3 h-3 text-amber-500" /> Active
            </span>
          </div>

          <div className="flex items-center gap-3 overflow-x-auto pb-2 scrollbar-none">
            {matches.map((m) => {
              const isSelected = activeMatch?.matchId === m.matchId;
              const petPhoto = m.pet.photos[0]?.photoUrl || 'https://images.unsplash.com/photo-1543852786-1cf6624b9987?auto=format&fit=crop&w=400&q=80';
              return (
                <button
                  key={m.matchId}
                  onClick={() => onSelectMatch(m.matchId)}
                  className="flex flex-col items-center gap-1 shrink-0 group focus:outline-none"
                >
                  <div className={`relative w-14 h-14 rounded-full p-0.5 transition-all duration-200 ${
                    isSelected 
                      ? 'ring-2 ring-hinge-black scale-105' 
                      : 'hover:ring-2 hover:ring-neutral-300'
                  }`}>
                    <img
                      src={petPhoto}
                      alt={m.pet.name}
                      className="w-full h-full object-cover rounded-full"
                    />
                    {m.matchType === 'RESCUE' && (
                      <span className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-rose-600 border border-white flex items-center justify-center text-[9px] text-white">
                        🚨
                      </span>
                    )}
                  </div>
                  <span className="text-[11px] font-bold text-neutral-700 group-hover:text-black truncate max-w-[65px]">
                    {m.pet.name}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Search Input */}
        <div className="p-3 border-b border-hinge-border">
          <div className="relative">
            <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search pets or guardians..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-full bg-white border border-hinge-border text-xs text-hinge-black placeholder-neutral-400 focus:outline-none focus:border-hinge-black"
            />
          </div>
        </div>

        {/* Messages List */}
        <div className="flex-1 overflow-y-auto divide-y divide-hinge-border/50">
          {filteredMatches.length === 0 ? (
            <div className="p-6 text-center text-neutral-400 text-xs font-medium">
              No conversations yet. Swipe right on adoptable pets or claim rescue alerts!
            </div>
          ) : (
            filteredMatches.map((m) => {
              const isSelected = activeMatch?.matchId === m.matchId;
              const petPhoto = m.pet.photos[0]?.photoUrl || 'https://images.unsplash.com/photo-1543852786-1cf6624b9987?auto=format&fit=crop&w=400&q=80';
              return (
                <div
                  key={m.matchId}
                  onClick={() => onSelectMatch(m.matchId)}
                  className={`p-4 flex items-center gap-3.5 cursor-pointer transition-colors ${
                    isSelected ? 'bg-white shadow-subtle' : 'hover:bg-white/60'
                  }`}
                >
                  <div className="relative w-12 h-12 rounded-2xl overflow-hidden shrink-0 border border-hinge-border bg-neutral-100">
                    <img
                      src={petPhoto}
                      alt={m.pet.name}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h4 className="font-serif font-bold text-sm text-hinge-black truncate flex items-center gap-1.5">
                        <span>{m.pet.name}</span>
                        <span className="text-[10px] font-sans text-neutral-400 font-normal">
                          ({m.matchedUserName})
                        </span>
                      </h4>
                      <span className="text-[10px] text-neutral-400">
                        {m.matchedAt ? new Date(m.matchedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                      </span>
                    </div>

                    <p className="text-xs text-neutral-500 truncate mt-0.5 font-medium">
                      {m.lastMessage || 'New inquiry connected'}
                    </p>
                  </div>

                  {m.unreadCount > 0 && (
                    <span className="w-2 h-2 rounded-full bg-rose-500 shrink-0"></span>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Right Column: Active Conversation */}
      {activeMatch ? (
        <div className="flex-1 flex flex-col bg-white">
          {/* Chat Header */}
          <div className="p-4 border-b border-hinge-border flex items-center justify-between bg-hinge-cream/20">
            <div className="flex items-center gap-3">
              <button
                onClick={() => onSelectMatch('')}
                className="md:hidden p-1.5 rounded-full hover:bg-neutral-100 text-neutral-600"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>

              <div className="relative w-10 h-10 rounded-2xl overflow-hidden border border-hinge-border bg-neutral-100 shrink-0">
                <img
                  src={activeMatch.pet.photos[0]?.photoUrl}
                  alt={activeMatch.pet.name}
                  className="w-full h-full object-cover"
                />
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-serif font-bold text-base text-hinge-black">
                    {activeMatch.pet.name}
                  </h3>
                  <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                    activeMatch.matchType === 'RESCUE'
                      ? 'bg-rose-100 text-rose-800'
                      : 'bg-amber-100 text-amber-900'
                  }`}>
                    {activeMatch.matchType}
                  </span>
                </div>
                <p className="text-[11px] text-neutral-500">
                  Guardian: <strong>{activeMatch.matchedUserName}</strong> ({activeMatch.matchedUserRole})
                </p>
              </div>
            </div>

            {/* Menu Dropdown */}
            <div className="relative">
              <button
                onClick={() => setShowMenu(!showMenu)}
                className="p-2 rounded-full hover:bg-neutral-100 text-neutral-400 hover:text-black"
              >
                <MoreVertical className="w-4 h-4" />
              </button>

              {showMenu && (
                <div className="absolute right-0 mt-1 w-44 rounded-2xl bg-white shadow-xl border border-hinge-border p-1.5 z-30 animate-in fade-in zoom-in-95">
                  <button
                    onClick={handleCloseThread}
                    className="w-full text-left px-3 py-2 rounded-xl text-xs font-semibold text-rose-600 hover:bg-rose-50 flex items-center gap-2"
                  >
                    <UserX className="w-3.5 h-3.5" /> Close Conversation
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Quick Suggestion Pills */}
          <div className="px-4 py-2 border-b border-hinge-border/50 bg-neutral-50/50 flex items-center gap-2 overflow-x-auto scrollbar-none">
            {PET_SUGGESTION_CHIPS.map((chip, idx) => (
              <button
                key={idx}
                onClick={() => setInputText(chip.label)}
                className="px-3 py-1 rounded-full text-[11px] font-semibold bg-white hover:bg-neutral-100 border border-neutral-200 text-neutral-700 whitespace-nowrap shadow-subtle transition-colors"
              >
                {chip.label}
              </button>
            ))}
          </div>

          {/* Message Stream */}
          <div className="flex-1 p-5 overflow-y-auto space-y-4 bg-hinge-cream/20">
            {isLoadingMessages ? (
              <div className="text-center text-xs text-neutral-400 py-10 font-medium">
                Loading live chat history...
              </div>
            ) : messages.length === 0 ? (
              <div className="text-center py-12 space-y-2 max-w-sm mx-auto">
                <div className="w-10 h-10 rounded-full bg-amber-100 text-amber-800 flex items-center justify-center mx-auto">
                  <PawPrint className="w-5 h-5" />
                </div>
                <h4 className="font-serif font-bold text-sm text-hinge-black">
                  Start the conversation about {activeMatch.pet.name}
                </h4>
                <p className="text-xs text-neutral-500">
                  Introduce yourself, share your living situation, or arrange a time to meet.
                </p>
              </div>
            ) : (
              messages.map((msg) => {
                const isMe = msg.senderId === currentUser.id;
                return (
                  <div
                    key={msg.id}
                    className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
                  >
                    <div
                      className={`max-w-[75%] px-4 py-2.5 rounded-2xl text-xs font-medium leading-relaxed shadow-subtle ${
                        isMe
                          ? 'bg-hinge-black text-white rounded-br-none'
                          : 'bg-white text-hinge-black border border-hinge-border rounded-bl-none'
                      }`}
                    >
                      {msg.content}
                    </div>
                    <div className="flex items-center gap-1 mt-1 text-[10px] text-neutral-400 px-1">
                      <span>{msg.sentAt}</span>
                      {isMe && <CheckCheck className="w-3 h-3 text-sky-500" />}
                    </div>
                  </div>
                );
              })
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Message Input Bar */}
          <form
            onSubmit={handleSendMessage}
            className="p-3 border-t border-hinge-border bg-white flex items-center gap-2"
          >
            <input
              type="text"
              placeholder={`Message ${activeMatch.matchedUserName}...`}
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              className="flex-1 px-4 py-2.5 rounded-full bg-hinge-cream border border-hinge-border text-xs text-hinge-black placeholder-neutral-400 focus:outline-none focus:border-hinge-black"
            />
            <button
              type="submit"
              disabled={!inputText.trim()}
              className="p-2.5 rounded-full bg-hinge-black text-white hover:bg-neutral-800 disabled:opacity-30 transition-all hover:scale-105 active:scale-95"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      ) : (
        <div className="flex-1 hidden md:flex items-center justify-center p-8 text-neutral-400 text-xs">
          Select a conversation from the left to start messaging.
        </div>
      )}
    </div>
  );
};
