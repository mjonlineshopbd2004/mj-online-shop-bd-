import React, { useState, useEffect, useRef } from 'react';
import { 
  collection, 
  query, 
  orderBy, 
  limit, 
  onSnapshot, 
  addDoc, 
  serverTimestamp,
  Timestamp,
  where
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../contexts/AuthContext';
import { MessageSquare, Send, User as UserIcon, Loader2, ChevronLeft } from 'lucide-react';
import { cn } from '../lib/utils';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

interface ChatMessage {
  id: string;
  text: string;
  userId: string;
  userName: string;
  userPhoto: string;
  createdAt: Timestamp;
  role?: string;
  conversationId: string;
  isAdminReply?: boolean;
}

interface Conversation {
  userId: string;
  userName: string;
  lastMessage: string;
  lastTimestamp: Timestamp;
}

export default function Support() {
  const { user, profile, isAdmin, setAuthModalOpen } = useAuth();
  const navigate = useNavigate();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  
  // Admin specific states
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [selectedUserName, setSelectedUserName] = useState<string>('');

  const scrollRef = useRef<HTMLDivElement>(null);

  // Effect for Admin: Load list of conversations
  useEffect(() => {
    if (!isAdmin || selectedUserId) return;

    setLoading(true);
    const q = query(
      collection(db, 'support_messages'),
      orderBy('createdAt', 'desc'),
      limit(200)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const uniqueConvos: Record<string, Conversation> = {};
      snapshot.docs.forEach(doc => {
        const data = doc.data();
        const cid = data.conversationId;
        if (!uniqueConvos[cid]) {
          uniqueConvos[cid] = {
            userId: cid,
            userName: data.userName || 'Unknown User',
            lastMessage: data.text,
            lastTimestamp: data.createdAt
          };
        }
      });
      setConversations(Object.values(uniqueConvos));
      setLoading(false);
    }, (error) => {
      console.error("Admin convo error:", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [isAdmin, selectedUserId]);

  // Effect for Customer or Admin (selected user): Load messages
  useEffect(() => {
    const targetCid = isAdmin ? selectedUserId : user?.uid;
    if (!targetCid) {
      if (!isAdmin) setLoading(false);
      return;
    }

    setLoading(true);
    const q = query(
      collection(db, 'support_messages'),
      where('conversationId', '==', targetCid),
      orderBy('createdAt', 'desc'),
      limit(50)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const msgs = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as ChatMessage)).reverse();
      setMessages(msgs);
      setLoading(false);
      
      setTimeout(() => {
        if (scrollRef.current) {
          scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
      }, 100);
    }, (error) => {
      console.error("Chat error:", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [selectedUserId, user?.uid, isAdmin]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      setAuthModalOpen(true);
      return;
    }
    if (!newMessage.trim() || isSending) return;

    const targetCid = isAdmin ? selectedUserId : user.uid;
    if (!targetCid) return;

    setIsSending(true);
    try {
      await addDoc(collection(db, 'support_messages'), {
        text: newMessage.trim(),
        userId: user.uid,
        userName: profile?.displayName || 'User',
        userPhoto: profile?.photoURL || '',
        role: profile?.role || 'customer',
        createdAt: serverTimestamp(),
        conversationId: targetCid,
        isAdminReply: isAdmin
      });
      setNewMessage('');
    } catch (error) {
      console.error("Error sending message:", error);
      toast.error("মেসেজ পাঠানো যায়নি।");
    } finally {
      setIsSending(false);
    }
  };

  const openConversation = (convo: Conversation) => {
    setSelectedUserId(convo.userId);
    setSelectedUserName(convo.userName);
  };

  if (!user) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center p-6 text-center">
        <MessageSquare className="h-16 w-16 text-gray-200 mb-4" />
        <h2 className="text-xl font-bold text-gray-900 mb-2">Support Chat</h2>
        <p className="text-gray-500 mb-6">চ্যাট করতে দয়া করে লগইন করুন।</p>
        <button 
          onClick={() => setAuthModalOpen(true)}
          className="bg-primary text-white px-8 py-3 rounded-xl font-bold shadow-lg shadow-primary/20"
        >
          Login Now
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto bg-white min-h-[calc(100vh-100px)] flex flex-col shadow-sm">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 p-4 flex items-center justify-between sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => {
              if (isAdmin && selectedUserId) {
                setSelectedUserId(null);
              } else {
                navigate(-1);
              }
            }} 
            className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
          >
            <ChevronLeft className="h-6 w-6 text-gray-600" />
          </button>
          <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center text-primary">
            <MessageSquare className="h-5 w-5" />
          </div>
          <div>
            <h1 className="font-black text-lg text-gray-900 uppercase tracking-tight">
              {isAdmin 
                ? (selectedUserId ? selectedUserName : 'Customer Support') 
                : 'Support Chat'}
            </h1>
            <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">
              {isAdmin ? (selectedUserId ? 'Active Conversation' : 'Manage Inquiries') : 'Chat with Admin'}
            </p>
          </div>
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {isAdmin && !selectedUserId ? (
          /* Admin: Conversation List */
          <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50">
            {loading ? (
              <div className="flex flex-col items-center justify-center h-full text-gray-400 gap-2">
                <Loader2 className="h-8 w-8 animate-spin" />
                <p className="text-xs font-bold uppercase tracking-widest">Loading Conversations...</p>
              </div>
            ) : conversations.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-gray-400 text-center px-4 gap-4">
                <MessageSquare className="h-16 w-16 opacity-10" />
                <p className="text-sm font-bold">কোনো মেসেজ পাওয়া যায়নি।</p>
              </div>
            ) : (
              conversations.map((convo) => (
                <button
                  key={convo.userId}
                  onClick={() => openConversation(convo)}
                  className="w-full flex items-center gap-4 p-4 bg-white hover:bg-gray-50 rounded-2xl transition-all border border-gray-100 text-left shadow-sm hover:shadow-md"
                >
                  <div className="w-12 h-12 rounded-full bg-primary/5 flex items-center justify-center text-primary border border-primary/10">
                    <UserIcon className="h-6 w-6" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-sm font-black text-gray-900 truncate uppercase tracking-tight">{convo.userName}</p>
                      <span className="text-[10px] text-gray-400 font-bold">
                        {convo.lastTimestamp?.toDate().toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 truncate font-medium">{convo.lastMessage}</p>
                  </div>
                </button>
              ))
            )}
          </div>
        ) : (
          /* Chat View */
          <>
            <div 
              ref={scrollRef}
              className="flex-1 overflow-y-auto p-4 space-y-6 bg-gray-50/30"
            >
              {loading ? (
                <div className="flex flex-col items-center justify-center h-full text-gray-400 gap-2">
                  <Loader2 className="h-8 w-8 animate-spin" />
                </div>
              ) : messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-gray-400 text-center px-4 gap-4">
                  <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center shadow-sm border border-gray-100">
                    <MessageSquare className="h-10 w-10 opacity-20" />
                  </div>
                  <p className="text-sm font-bold text-gray-500 max-w-[250px]">আপনার প্রশ্নটি এখানে লিখুন। অ্যাডমিন খুব শীঘ্রই উত্তর দেবেন।</p>
                </div>
              ) : (
                messages.map((msg) => (
                  <div 
                    key={msg.id}
                    className={cn(
                      "flex gap-3 max-w-[85%]",
                      msg.userId === user?.uid ? "ml-auto flex-row-reverse" : "mr-auto"
                    )}
                  >
                    <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gray-200 overflow-hidden border-2 border-white shadow-sm">
                      {msg.userPhoto ? (
                        <img src={msg.userPhoto} alt={msg.userName} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400 bg-white">
                          <UserIcon className="h-5 w-5" />
                        </div>
                      )}
                    </div>
                    <div className={cn(
                      "flex flex-col",
                      msg.userId === user?.uid ? "items-end" : "items-start"
                    )}>
                      <div className="flex items-center gap-2 mb-1.5">
                        <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">{msg.userName}</span>
                        {msg.isAdminReply && (
                          <span className="bg-red-500 text-white text-[8px] font-black px-2 py-0.5 rounded-full uppercase tracking-tighter">Admin</span>
                        )}
                      </div>
                      <div className={cn(
                        "px-4 py-3 rounded-2xl text-sm shadow-sm leading-relaxed",
                        msg.userId === user?.uid 
                          ? "bg-primary text-white rounded-tr-none font-medium" 
                          : "bg-white text-gray-800 border border-gray-100 rounded-tl-none font-medium"
                      )}>
                        {msg.text}
                      </div>
                      <span className="text-[9px] text-gray-400 font-bold mt-1.5 uppercase tracking-widest">
                        {msg.createdAt?.toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Input Area */}
            <div className="p-4 bg-white border-t border-gray-100 sticky bottom-0">
              <form onSubmit={handleSendMessage} className="flex gap-3">
                <input
                  type="text"
                  placeholder="মেসেজ লিখুন..."
                  className="flex-1 bg-gray-50 border border-gray-100 rounded-2xl px-5 py-3 text-sm outline-none focus:ring-2 focus:ring-primary/20 focus:bg-white transition-all font-medium"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                />
                <button
                  type="submit"
                  disabled={!newMessage.trim() || isSending}
                  className="bg-primary text-white p-3 rounded-2xl hover:scale-105 active:scale-95 transition-all disabled:opacity-50 disabled:scale-100 shadow-lg shadow-primary/20"
                >
                  {isSending ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
                </button>
              </form>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
