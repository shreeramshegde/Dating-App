import React, { useState, useEffect, useRef } from 'react';
import { 
  Send, 
  ArrowLeft, 
  Sparkles, 
  CheckCheck, 
  Search,
  MessageCircle,
  Clock,
  MoreVertical,
  UserX
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

const DATE_EMOJI_SUGGESTIONS = [
  { emoji: '☕', label: 'Coffee date' },
  { emoji: '🍕', label: 'Slice & stroll' },
  { emoji: '🍸', label: 'Drinks & jazz' },
  { emoji: '🎨', label: 'Art gallery' },
  { emoji: '🐕', label: 'Dog park walk' },
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

    // Real-Time STOMP subscription for this match
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

  const handleUnmatch = async () => {
    if (!activeMatch) return;
    if (window.confirm(`Are you sure you want to unmatch with ${activeMatch.targetFirstName}?`)) {
      await api.unmatch(activeMatch.matchId);
      onUnmatch(activeMatch.matchId);
      setShowMenu(false);
    }
  };

  const filteredMatches = matches.filter((m) =>
    m.targetFirstName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="w-full max-w-5xl mx-auto h-[calc(100vh-6.5rem)] bg-white rounded-[32px] border border-hinge-border overflow-hidden flex flex-col md:flex-row shadow-hinge text-left">
      {/* Left Column: Match & Conversation List */}
      <div className={`w-full md:w-80 lg:w-96 border-r border-hinge-border flex flex-col bg-hinge-cream/40 ${selectedMatchId && 'hidden md:flex'}`}>
        {/* Top: New Matches Horizon */}
        <div className="p-4 border-b border-hinge-border">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-[11px] font-bold uppercase tracking-wider text-neutral-500">
              Matches ({matches.length})
            </h3>
            <span className="text-[11px] text-hinge-kohlrabi flex items-center gap-1 font-bold">
              <Sparkles className="w-3 h-3 text-amber-500" /> Mutual
            </span>
          </div>

          <div className="flex items-center gap-3 overflow-x-auto pb-2 scrollbar-none">
            {matches.map((m) => {
              const isSelected = activeMatch?.matchId === m.matchId;
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
                      src={m.targetPhotoUrl}
                      alt={m.targetFirstName}
                      className="w-full h-full object-cover rounded-full"
                    />
                  </div>
                  <span className="text-[11px] font-bold text-neutral-700 group-hover:text-black truncate max-w-[60px]">
                    {m.targetFirstName}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Search */}
        <div className="p-3 border-b border-hinge-border">
          <div className="relative">
            <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search conversations..."
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
              No conversations yet. Swipe right on profiles to match!
            </div>
          ) : (
            filteredMatches.map((m) => {
              const isSelected = activeMatch?.matchId === m.matchId;
              return (
                <div
                  key={m.matchId}
                  onClick={() => onSelectMatch(m.matchId)}
                  className={`p-4 flex items-center gap-3 cursor-pointer transition-colors ${
                    isSelected
                      ? 'bg-white border-l-4 border-hinge-black shadow-subtle'
                      : 'hover:bg-neutral-50'
                  }`}
                >
                  <div className="relative w-12 h-12 rounded-full overflow-hidden shrink-0 border border-hinge-border">
                    <img
                      src={m.targetPhotoUrl}
                      alt={m.targetFirstName}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-0.5">
                      <h4 className="text-sm font-bold text-hinge-black truncate">
                        {m.targetFirstName}
                      </h4>
                      <span className="text-[10px] text-neutral-400">
                        {m.lastMessageTime || m.matchedAt}
                      </span>
                    </div>

                    <p className="text-xs text-neutral-600 truncate font-normal">
                      {m.lastMessage || 'Matched with you! Say hello 👋'}
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

      {/* Right Column: Chat Room */}
      {activeMatch ? (
        <div className={`flex-1 flex flex-col bg-white ${!selectedMatchId && 'hidden md:flex'}`}>
          {/* Chat Header */}
          <div className="p-4 border-b border-hinge-border flex items-center justify-between bg-white relative">
            <div className="flex items-center gap-3">
              <button
                onClick={() => onSelectMatch('')}
                className="md:hidden p-1.5 rounded-full hover:bg-neutral-100 text-neutral-600"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>

              <div className="relative w-11 h-11 rounded-full overflow-hidden border border-hinge-border">
                <img
                  src={activeMatch.targetPhotoUrl}
                  alt={activeMatch.targetFirstName}
                  className="w-full h-full object-cover"
                />
              </div>

              <div>
                <h3 className="text-sm font-bold text-hinge-black">
                  {activeMatch.targetFirstName}
                </h3>
                <span className="text-[11px] text-emerald-700 font-semibold">
                  Matched • Active in chat
                </span>
              </div>
            </div>

            <div className="relative">
              <button
                onClick={() => setShowMenu(!showMenu)}
                className="p-2 rounded-full hover:bg-neutral-100 text-neutral-500 hover:text-black transition-colors"
              >
                <MoreVertical className="w-4 h-4" />
              </button>

              {showMenu && (
                <div className="absolute right-0 mt-2 w-44 rounded-2xl bg-white border border-hinge-border shadow-xl p-1.5 z-40 animate-in fade-in">
                  <button
                    onClick={handleUnmatch}
                    className="w-full px-3 py-2 rounded-xl text-xs font-semibold text-rose-600 hover:bg-rose-50 flex items-center gap-2 text-left"
                  >
                    <UserX className="w-4 h-4" /> Unmatch
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-hinge-cream/20">
            {isLoadingMessages ? (
              <div className="flex items-center justify-center h-full text-xs text-neutral-400 font-medium">
                Loading messages...
              </div>
            ) : messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center p-6 space-y-3">
                <div className="w-12 h-12 rounded-full bg-hinge-stone flex items-center justify-center text-hinge-black">
                  <MessageCircle className="w-6 h-6" />
                </div>
                <h4 className="text-sm font-bold text-hinge-black">No messages yet</h4>
                <p className="text-xs text-neutral-500 max-w-xs font-medium">
                  Break the ice! Ask about {activeMatch.targetFirstName}'s favorite coffee or weekend plans.
                </p>
              </div>
            ) : (
              messages.map((msg) => {
                const isMe = msg.senderId === currentUser.userId;
                return (
                  <div
                    key={msg.id}
                    className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
                  >
                    <div
                      className={`max-w-[75%] sm:max-w-md px-4 py-2.5 rounded-2xl text-xs sm:text-sm leading-relaxed ${
                        isMe
                          ? 'bg-hinge-black text-white rounded-br-sm shadow-sm'
                          : 'bg-white text-hinge-black rounded-bl-sm border border-hinge-border shadow-subtle'
                      }`}
                    >
                      {msg.content}
                    </div>
                    <div className="flex items-center gap-1 mt-1 text-[10px] text-neutral-400 px-1">
                      <Clock className="w-2.5 h-2.5" />
                      <span>{msg.sentAt}</span>
                      {isMe && <CheckCheck className="w-3 h-3 text-hinge-black" />}
                    </div>
                  </div>
                );
              })
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Date Ideas Pill Row */}
          <div className="px-4 py-2 border-t border-hinge-border bg-white flex items-center gap-2 overflow-x-auto scrollbar-none">
            <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider shrink-0">Ask out:</span>
            {DATE_EMOJI_SUGGESTIONS.map((item, i) => (
              <button
                key={i}
                onClick={() => setInputText((prev) => `${prev ? prev + ' ' : ''}How about a ${item.label.toLowerCase()} ${item.emoji}?`)}
                className="px-3 py-1 rounded-full text-xs font-semibold bg-hinge-cream hover:bg-neutral-100 text-neutral-700 hover:text-black border border-hinge-border shrink-0 transition-colors"
              >
                <span>{item.emoji}</span> <span className="ml-1">{item.label}</span>
              </button>
            ))}
          </div>

          {/* Message Input Form */}
          <form onSubmit={handleSendMessage} className="p-3 border-t border-hinge-border bg-white flex items-center gap-2">
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder={`Message ${activeMatch.targetFirstName}...`}
              className="flex-1 px-4 py-2.5 rounded-full bg-hinge-cream border border-hinge-border text-xs sm:text-sm text-hinge-black placeholder-neutral-400 focus:outline-none focus:border-hinge-black"
            />
            <button
              type="submit"
              disabled={!inputText.trim()}
              className="p-3 rounded-full bg-hinge-black hover:bg-neutral-800 disabled:opacity-40 disabled:cursor-not-allowed text-white shadow-md transition-all hover:scale-105 active:scale-95"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      ) : (
        <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-neutral-400">
          <MessageCircle className="w-12 h-12 text-neutral-300 mb-3" />
          <h3 className="text-base font-bold text-hinge-black">No active conversation</h3>
          <p className="text-xs text-neutral-500 mt-1 max-w-sm">
            Select a match from the list on the left or swipe right on the Explore deck to match!
          </p>
        </div>
      )}
    </div>
  );
};
