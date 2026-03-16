import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Send, User, Clock, CheckCircle2, Copy } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'react-hot-toast';
import api from '../../services/api';
import { cn } from '../../utils/cn';

export function WhatsappChat() {
  const { user } = useAuth();
  const [conversations, setConversations] = useState([]);
  const [activeConversation, setActiveConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoadingList, setIsLoadingList] = useState(true);
  const [isLoadingChat, setIsLoadingChat] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef(null);

  // Initial Load - Fetch Left Pane
  useEffect(() => {
    fetchConversations();
    // Optional: Set up a polling interval here for updates if WebSockets aren't active yet
    const interval = setInterval(fetchConversations, 10000); // 10 seconds polling for MVP
    return () => clearInterval(interval);
  }, []);

  // When a chat is selected, fetch messages (Right Pane)
  useEffect(() => {
    if (activeConversation) {
      fetchMessages(activeConversation.id);
      const interval = setInterval(() => fetchMessages(activeConversation.id), 5000); // 5 sec poll
      return () => clearInterval(interval);
    }
  }, [activeConversation]);

  // Auto-scroll Down
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  const fetchConversations = async () => {
    try {
      const response = await api.get('/whatsapp/conversations');
      setConversations(response.data.data); // Assuming pagination
    } catch (error) {
      console.error('Failed to load conversations', error);
    } finally {
      setIsLoadingList(false);
    }
  };

  const fetchMessages = async (id) => {
    try {
      // Avoid hard-loading UI sweeps on silent background polls
      if (messages.length === 0) setIsLoadingChat(true);
      
      const response = await api.get(`/whatsapp/conversations/${id}`);
      setMessages(response.data.data.messages);
      
      // Update the active conversation data if any metadata changed
      setConversations(prev => prev.map(c => c.id === id ? { ...c, unread_count: 0 } : c));
    } catch (error) {
      console.error('Failed to load chat history', error);
    } finally {
      setIsLoadingChat(false);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !activeConversation) return;

    const content = newMessage.trim();
    setNewMessage(''); // optimistic clear
    setIsSending(true);

    try {
      const response = await api.post('/whatsapp/messages', {
        conversation_id: activeConversation.id,
        content: content,
        message_type: 'text'
      });
      // Append optimistically
      setMessages(prev => [...prev, response.data.data]);
    } catch (error) {
      toast.error('Failed to send message.');
      setNewMessage(content); // revert clear on fail
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="flex bg-white h-[calc(100vh-8rem)] rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
      
      {/* LEFT PANE - Conversations List */}
      <div className="w-1/3 min-w-[320px] max-w-[400px] border-r border-gray-200 bg-gray-50 flex flex-col">
        <div className="p-4 border-b border-gray-200 bg-white">
          <h2 className="text-lg font-display font-medium text-gray-900">Conversations</h2>
          <p className="text-sm text-gray-500 mt-1">Active WhatsApp Threads</p>
        </div>

        <div className="flex-1 overflow-y-auto w-full">
          {isLoadingList ? (
            <div className="p-8 text-center text-gray-400">Loading threads...</div>
          ) : conversations.length === 0 ? (
            <div className="p-8 text-center text-sm text-gray-500">
              No active conversations. When someone messages your WABA number, they will appear here.
            </div>
          ) : (
            <ul className="divide-y divide-gray-200">
              {conversations.map((conv) => (
                <li 
                  key={conv.id}
                  onClick={() => setActiveConversation(conv)}
                  className={cn(
                    "p-4 hover:bg-white cursor-pointer transition-colors border-l-4",
                    activeConversation?.id === conv.id 
                      ? "bg-white border-brand-500 shadow-sm" 
                      : "border-transparent"
                  )}
                >
                  <div className="flex justify-between items-start mb-1 gap-2">
                    <span className="font-medium text-gray-900 truncate">
                      {conv.wa_profile_name || conv.wa_contact_number}
                    </span>
                    <span className="text-xs text-gray-400 flex-shrink-0">
                      {conv.last_message_at ? format(new Date(conv.last_message_at), 'MMM d, h:mm a') : 'New'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-500 truncate pr-4">
                      {conv.wa_contact_number}
                    </span>
                    {conv.unread_count > 0 && (
                      <span className="inline-flex items-center rounded-full bg-brand-100 px-2 py-0.5 text-xs font-medium text-brand-700">
                        {conv.unread_count}
                      </span>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* RIGHT PANE - Chat Window */}
      <div className="flex-1 flex flex-col bg-white w-full">
        {!activeConversation ? (
          <div className="flex-1 flex items-center justify-center bg-gray-50/50">
            <div className="text-center p-8 glass rounded-2xl max-w-sm">
              <div className="mx-auto h-12 w-12 text-brand-300 mb-4 bg-brand-50 rounded-full flex items-center justify-center">
                <MessageSquareText className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-medium text-gray-900">No Chat Selected</h3>
              <p className="mt-2 text-sm text-gray-500">
                Select a conversation from the left menu to view history and reply to messages.
              </p>
            </div>
          </div>
        ) : (
          <>
            {/* Chat Header */}
            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center bg-white shrink-0 shadow-sm z-10">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 bg-brand-100 rounded-full flex items-center justify-center text-brand-700 font-medium">
                  <User className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-lg font-medium text-gray-900 leading-tight">
                    {activeConversation.wa_profile_name || 'Unknown Contact'}
                  </h3>
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <span>+{activeConversation.wa_contact_number}</span>
                    <span className={cn(
                      "px-2 py-0.5 rounded-full text-xs font-medium",
                      activeConversation.status === 'open' ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-700"
                    )}>
                      {activeConversation.status.toUpperCase()}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Chat Messages */}
            <div className="flex-1 overflow-y-auto p-6 bg-slate-50 space-y-6">
              {isLoadingChat && messages.length === 0 ? (
                <div className="text-center text-gray-500">Loading messages...</div>
              ) : messages.length === 0 ? (
                <div className="text-center text-gray-500">No messages yet. Say hello!</div>
              ) : (
                messages.map((msg, idx) => {
                  const isInbound = msg.direction === 'inbound';
                  return (
                    <div key={msg.id || idx} className={cn("flex", isInbound ? "justify-start" : "justify-end")}>
                      <div className={cn(
                        "max-w-[75%] rounded-2xl px-5 py-3 shadow-sm",
                        isInbound 
                          ? "bg-white border border-gray-100 text-gray-900 rounded-tl-sm" 
                          : "bg-brand-600 text-white rounded-tr-sm"
                      )}>
                        {/* Text formatting (WhatsApp uses things like *bold*, _italic_, ~strikethrough~ - handling raw text here simply) */}
                        <div className="text-sm whitespace-pre-wrap">{msg.content || `[${msg.message_type}]`}</div>
                        
                        <div className={cn(
                          "mt-1 text-[10px] flex items-center gap-1",
                          isInbound ? "text-gray-400 justify-start" : "text-brand-200 justify-end"
                        )}>
                          {format(new Date(msg.sent_at), 'h:mm a')}
                          {!isInbound && (
                            <CheckCircle2 className={cn("h-3 w-3", msg.status === 'read' ? "text-white" : "opacity-50")} />
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Chat Input */}
            <div className="p-4 bg-white border-t border-gray-200 shrink-0">
              <form onSubmit={handleSendMessage} className="flex gap-3">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Type a message..."
                  className="flex-1 rounded-full border-0 py-3 px-5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-brand-500 sm:text-sm sm:leading-6 bg-gray-50"
                  disabled={isSending}
                />
                <button
                  type="submit"
                  disabled={isSending || !newMessage.trim()}
                  className="inline-flex items-center justify-center rounded-full bg-brand-600 p-3 text-white shadow-sm hover:bg-brand-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  {isSending ? (
                    <div className="h-5 w-5 animate-spin rounded-full border-2 border-t-white border-r-transparent border-b-white border-l-transparent" />
                  ) : (
                    <Send className="h-5 w-5 ml-0.5" />
                  )}
                </button>
              </form>
              <div className="mt-2 text-center text-xs text-gray-400">
                Messages sent from LeadLayer will appear from your verified WhatsApp Business Account.
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// Quick inline stub for missing icon
function MessageSquareText(props) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
      <path d="M13 8H7"/>
      <path d="M17 12H7"/>
    </svg>
  );
}
