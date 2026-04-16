import React, { useEffect, useState, useRef } from 'react';
import { Layout } from './Dashboard';
import { io, Socket } from 'socket.io-client';
import { sendChatMessage, getChat, getChats, getMutualFollowers, createDirectChat, getProfile } from '../api';

const socket: Socket = io(import.meta.env.VITE_API_URL, {
    withCredentials: true
});

interface User {
  id: number;
  username: string;
  avatar?: string;
  online?: boolean;
}

interface Chat {
  id: number;
  other_user_id: number;
  other_username: string;
  last_message: string;
  last_message_time: string;
}

const ChatPage = ({ onLogout }: { onLogout: () => void }) => {
  const [chats, setChats] = useState<Chat[]>([]);
  const [mutualFollowers, setMutualFollowers] = useState<User[]>([]);
  const [selectedChat, setSelectedChat] = useState<Chat | null>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [textInput, setTextInput] = useState("");
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [showNewChatModal, setShowNewChatModal] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const init = async () => {
      try {
        const [profile, activeChats, mutuals] = await Promise.all([
          getProfile(),
          getChats(),
          getMutualFollowers()
        ]);
        setCurrentUser(profile);
        setChats(activeChats);
        setMutualFollowers(mutuals);
        if (activeChats.length > 0) {
          setSelectedChat(activeChats[0]);
        }
      } catch (err) {
        console.error("Failed to initialize chat page", err);
      }
    };
    init();
  }, []);

  useEffect(() => {
    if (!selectedChat) return;

    socket.emit('join_chat', selectedChat.id);
    
    const fetchMessages = async () => {
      try {
        const result = await getChat(selectedChat.id.toString());
        setMessages(result);
      } catch (err) {
        console.error('Error fetching messages:', err);
      }
    };
    
    fetchMessages();

    const handleReceiveMessage = (newMessage: any) => {
      // Only add message if it belongs to the selected chat
      if (newMessage.chat_id === selectedChat.id) {
        setMessages((prev) => [...prev, newMessage]);
      }
      
      // Update chat list last message
      setChats(prev => prev.map(c => 
        c.id === newMessage.chat_id 
          ? { ...c, last_message: newMessage.content, last_message_time: newMessage.created_at } 
          : c
      ));
    };

    socket.on('receive_message', handleReceiveMessage);

    return () => {
      socket.off('receive_message', handleReceiveMessage);
    };
  }, [selectedChat]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleMessageSubmit = async (e: React.SubmitEvent) => {
    e.preventDefault();
    if (!selectedChat) return;

    if (!textInput.trim() && selectedFiles.length === 0) {
      return; 
    }

    const formData = new FormData();
    formData.append('content', textInput.trim());
    selectedFiles.forEach(file => {
      formData.append('images', file);
    });

    try {
      await sendChatMessage(selectedChat.id, formData);
      setTextInput("");
      setSelectedFiles([]);
      setPreviewUrls([]);
    } catch (err) {
      console.error('Error sending message:', err);
    }
  };

  const handleStartChat = async (userId: number) => {
    try {
      const result = await createDirectChat(userId);
      const activeChats = await getChats();
      setChats(activeChats);
      const newChat = activeChats.find((c: Chat) => c.id === result.chatId);
      if (newChat) setSelectedChat(newChat);
      setShowNewChatModal(false);
    } catch (err) {
      console.error("Failed to start chat", err);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files);
      setSelectedFiles(filesArray);
      const urls = filesArray.map(file => URL.createObjectURL(file));
      setPreviewUrls(urls);
    }
  };

  return (
    <Layout title="Messages" onLogout={onLogout}>
      <div className="chat-container" style={{ display: 'flex', height: 'calc(100vh - 180px)', background: 'var(--card-bg)', borderRadius: '12px', overflow: 'hidden', border: '1px solid var(--border-color)' }}>
        
        {/* Users List */}
        <aside className="chat-sidebar" style={{ width: '300px', borderRight: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column' }}>
          <div style={{ padding: '20px', borderBottom: '1px solid var(--border-color)', display: 'flex', gap: '10px' }}>
            <input 
              type="text" 
              placeholder="Search chats..." 
              style={{ flex: 1, padding: '10px 15px', borderRadius: '20px', border: '1px solid var(--border-color)', background: 'var(--bg-dark)', color: 'var(--text-main)', outline: 'none', fontSize: '0.9rem' }}
            />
            <button 
              onClick={() => setShowNewChatModal(true)}
              style={{ background: 'var(--accent-indigo)', color: '#fff', border: 'none', borderRadius: '50%', width: '40px', height: '40px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              title="New Chat"
            >
              <i className="fas fa-plus"></i>
            </button>
          </div>
          <div style={{ flex: 1, overflowY: 'auto' }}>
            {chats.length === 0 && (
              <div style={{ padding: '40px 20px', textAlign: 'center', color: 'var(--text-muted)' }}>
                <p>No active conversations.</p>
                <button onClick={() => setShowNewChatModal(true)} className="btn-link" style={{ color: 'var(--accent-indigo)', marginTop: '10px', background: 'none', border: 'none', cursor: 'pointer' }}>Start chatting</button>
              </div>
            )}
            {chats.map(chat => (
              <div 
                key={chat.id} 
                onClick={() => setSelectedChat(chat)}
                style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '12px', 
                  padding: '15px 20px', 
                  cursor: 'pointer',
                  background: selectedChat?.id === chat.id ? 'rgba(99, 102, 241, 0.1)' : 'transparent',
                  borderLeft: selectedChat?.id === chat.id ? '4px solid var(--accent-indigo)' : '4px solid transparent',
                  transition: 'all 0.2s'
                }}
              >
                <img src={`https://ui-avatars.com/api/?name=${chat.other_username}&background=random`} alt="" style={{ width: '45px', height: '45px', borderRadius: '50%' }} />
                <div style={{ flex: 1, overflow: 'hidden' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                    <h4 style={{ margin: 0, fontSize: '0.95rem', color: 'var(--text-main)' }}>{chat.other_username}</h4>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      {chat.last_message_time ? new Date(chat.last_message_time).toLocaleDateString() : ''}
                    </span>
                  </div>
                  <p style={{ margin: '4px 0 0', fontSize: '0.85rem', color: 'var(--text-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {chat.last_message || 'No messages yet'}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </aside>

        {/* Chat Window */}
        <section style={{ flex: 1, display: 'flex', flexDirection: 'column', background: 'var(--bg-dark)' }}>
          {selectedChat ? (
            <>
              {/* Chat Header */}
              <div style={{ padding: '15px 25px', borderBottom: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'var(--card-bg)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <img src={`https://ui-avatars.com/api/?name=${selectedChat.other_username}&background=random`} alt="" style={{ width: '40px', height: '40px', borderRadius: '50%' }} />
                  <div>
                    <h4 style={{ margin: 0, fontSize: '1rem', color: 'var(--text-main)' }}>{selectedChat.other_username}</h4>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Online</span>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '15px', color: 'var(--text-muted)', fontSize: '1.1rem' }}>
                  <i className="fas fa-info-circle" style={{ cursor: 'pointer' }}></i>
                </div>
              </div>

              {/* Messages Area */}
              <div style={{ flex: 1, padding: '25px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '15px' }}>
                {messages.length === 0 && (
                  <div style={{ margin: 'auto', textAlign: 'center', color: 'var(--text-muted)' }}>
                    <p>No messages yet. Say hi! 👋</p>
                  </div>
                )}
                {messages.map(msg => {
                  const isMe = msg.sender_id === currentUser?.id;
                  
                  // Handle images whether they are objects (JSONB) or stringified JSON
                  let msgImages = [];
                  try {
                    msgImages = typeof msg.images === 'string' ? JSON.parse(msg.images) : (msg.images || []);
                  } catch (e) {
                    console.error("Failed to parse message images", e);
                  }

                  return (
                    <div key={msg.id} style={{ alignSelf: isMe ? 'flex-end' : 'flex-start', maxWidth: '70%', display: 'flex', flexDirection: 'column', alignItems: isMe ? 'flex-end' : 'flex-start' }}>
                      <div style={{ 
                        padding: '12px 16px', 
                        borderRadius: isMe ? '18px 18px 2px 18px' : '18px 18px 18px 2px', 
                        background: isMe ? 'var(--accent-indigo)' : 'var(--card-bg)',
                        color: '#fff',
                        fontSize: '0.95rem',
                        boxShadow: '0 2px 5px rgba(0,0,0,0.1)'
                      }}>
                        {msg.content}
                        {msgImages && msgImages.length > 0 && (
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px', marginTop: '8px' }}>
                            {msgImages.map((img: string, i: number) => (
                              <img key={i} src={img} alt="" style={{ maxWidth: '100%', borderRadius: '8px', cursor: 'pointer' }} onClick={() => window.open(img, '_blank')} />
                            ))}
                          </div>
                        )}
                      </div>
                      <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '5px' }}>
                        {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </div>

              {/* Input Area */}
              <div style={{ padding: '20px 25px', background: 'var(--card-bg)', borderTop: '1px solid var(--border-color)' }}>
                {previewUrls.length > 0 && (
                  <div style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
                    {previewUrls.map((url, i) => (
                      <div key={i} style={{ position: 'relative' }}>
                        <img src={url} alt="preview" style={{ width: '60px', height: '60px', objectFit: 'cover', borderRadius: '8px', border: '2px solid var(--accent-indigo)' }} />
                        <button 
                          onClick={() => {
                            setSelectedFiles(prev => prev.filter((_, idx) => idx !== i));
                            setPreviewUrls(prev => prev.filter((_, idx) => idx !== i));
                          }}
                          style={{ position: 'absolute', top: '-5px', right: '-5px', background: '#ef4444', color: '#fff', border: 'none', borderRadius: '50%', width: '18px', height: '18px', fontSize: '10px', cursor: 'pointer' }}
                        >
                          <i className="fas fa-times"></i>
                        </button>
                      </div>
                    ))}
                  </div>
                )}
                <form onSubmit={handleMessageSubmit} style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                  <div style={{ display: 'flex', gap: '15px', color: 'var(--text-muted)', fontSize: '1.2rem' }}>
                    <i className="fas fa-plus-circle" style={{ cursor: 'pointer' }}></i>
                    <i className="fas fa-image" style={{ cursor: 'pointer' }} onClick={() => fileInputRef.current?.click()}></i>
                    <input 
                      type="file" 
                      ref={fileInputRef} 
                      style={{ display: 'none' }} 
                      multiple 
                      accept="image/*"
                      onChange={handleFileChange}
                    />
                  </div>
                  <input 
                    type="text" 
                    placeholder="Type a message..." 
                    value={textInput}
                    onChange={(e) => setTextInput(e.target.value)}
                    style={{ flex: 1, padding: '12px 20px', borderRadius: '25px', border: '1px solid var(--border-color)', background: 'var(--bg-dark)', color: 'var(--text-main)', outline: 'none' }}
                  />
                  <button type="submit" style={{ background: 'var(--accent-indigo)', color: '#fff', border: 'none', width: '45px', height: '45px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'transform 0.2s' }}>
                    <i className="fas fa-paper-plane"></i>
                  </button>
                </form>
              </div>
            </>
          ) : (
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
              <div style={{ textAlign: 'center' }}>
                <i className="fas fa-comments" style={{ fontSize: '4rem', marginBottom: '20px', opacity: 0.2 }}></i>
                <h3>Select a chat to start messaging</h3>
                <p>Or start a new one with your mutual followers.</p>
                <button onClick={() => setShowNewChatModal(true)} className="primary-btn" style={{ marginTop: '20px' }}>New Chat</button>
              </div>
            </div>
          )}
        </section>
      </div>

      {/* New Chat Modal */}
      {showNewChatModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ background: 'var(--sidebar-bg)', width: '400px', borderRadius: '12px', padding: '25px', border: '1px solid var(--border-color)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ margin: 0 }}>New Chat</h3>
              <button onClick={() => setShowNewChatModal(false)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '1.2rem' }}>
                <i className="fas fa-times"></i>
              </button>
            </div>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '15px' }}>You can only chat with people you mutually follow.</p>
            <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
              {mutualFollowers.length === 0 ? (
                <p style={{ textAlign: 'center', padding: '20px', color: 'var(--text-muted)' }}>No mutual followers found.</p>
              ) : (
                mutualFollowers.map(user => (
                  <div 
                    key={user.id} 
                    onClick={() => handleStartChat(user.id)}
                    style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px', borderRadius: '8px', cursor: 'pointer', transition: 'background 0.2s' }}
                    onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
                    onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                  >
                    <img src={`https://ui-avatars.com/api/?name=${user.username}&background=random`} alt="" style={{ width: '40px', height: '40px', borderRadius: '50%' }} />
                    <span style={{ fontWeight: 'bold' }}>{user.username}</span>
                    <i className="fas fa-plus-circle" style={{ marginLeft: 'auto', color: 'var(--accent-indigo)' }}></i>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default ChatPage;
