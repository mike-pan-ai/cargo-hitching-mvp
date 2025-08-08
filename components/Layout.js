// components/Layout.js
import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { useAuth } from '../contexts/AuthContext';
import { formatDistanceToNow, format, isToday, isYesterday } from 'date-fns';
import API_BASE_URL from '../utils/api';


// Chat Dropdown Component
// Chat Dropdown Component with Modal
function ChatDropdown({ user }) {
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [sending, setSending] = useState(false);
  const router = useRouter();
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (user) {
      loadConversations();
      const interval = setInterval(loadConversations, 30000);
      return () => clearInterval(interval);
    }
  }, [user]);

  useEffect(() => {
    if (selectedConversation && isModalOpen) {
      loadMessages(selectedConversation.other_user.id);
      // Poll for new messages every 5 seconds when modal is open
      const interval = setInterval(() => {
        loadMessages(selectedConversation.other_user.id);
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [selectedConversation, isModalOpen]);

const [shouldAutoScroll, setShouldAutoScroll] = useState(true);
const messagesContainerRef = useRef(null);

// Check if user is scrolled near bottom
const checkScrollPosition = () => {
  if (messagesContainerRef.current) {
    const { scrollTop, scrollHeight, clientHeight } = messagesContainerRef.current;
    const isNearBottom = scrollTop + clientHeight >= scrollHeight - 100;
    setShouldAutoScroll(isNearBottom);
  }
};

// Only auto-scroll when new messages arrive AND user is at bottom
useEffect(() => {
  if (isModalOpen && messages.length > 0 && shouldAutoScroll) {
    setTimeout(scrollToBottom, 100);
  }
}, [messages, isModalOpen, shouldAutoScroll]);

  const loadConversations = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await fetch(`${API_BASE_URL}/api/messages/conversations`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        const data = await response.json();
        setConversations(data.conversations || []);
      }
    } catch (error) {
      console.error('Error loading conversations:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadMessages = async (userId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/api/messages/conversation/${userId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        const data = await response.json();
        setMessages(data.messages || []);
      }
    } catch (error) {
      console.error('Error loading messages:', error);
    }
  };

  const sendMessage = async (e) => {
  e.preventDefault();
  if (!newMessage.trim() || !selectedConversation) return;

  setSending(true);
  const messageText = newMessage.trim();
  setNewMessage('');

  try {
    const token = localStorage.getItem('token');

    const requestData = {
      recipient_id: selectedConversation.other_user.id,
      message: messageText,
      trip_id: selectedConversation.trip_id || null
    };

    const response = await fetch(`${API_BASE_URL}/api/messages/send`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(requestData)
    });

    if (response.ok) {
        loadMessages(selectedConversation.other_user.id);
        loadConversations();
        // Always scroll when user sends a message
        setShouldAutoScroll(true);
        setTimeout(scrollToBottom, 100);
    } else {
      const errorData = await response.json();
      console.error('Failed to send message:', errorData);
      setNewMessage(messageText); // Restore message on error
    }
  } catch (error) {
    console.error('Error sending message:', error);
    setNewMessage(messageText); // Restore message on error
  } finally {
    setSending(false);
  }
};

   const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleConversationClick = (conversation) => {
    setSelectedConversation(conversation);
    setIsModalOpen(true);
  };

  const formatChatTime = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now - date) / (1000 * 60 * 60);

    if (diffInHours < 1) {
      const diffInMinutes = Math.floor((now - date) / (1000 * 60));
      return diffInMinutes <= 1 ? 'Just now' : `${diffInMinutes}m ago`;
    } else if (diffInHours < 24) {
      return `${Math.floor(diffInHours)}h ago`;
    } else {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }
  };

  const formatMessageTime = (timestamp) => {
  // Ensure timestamp is treated as UTC
  let date;
  if (timestamp.endsWith('Z')) {
    date = new Date(timestamp); // Already UTC
  } else {
    date = new Date(timestamp + 'Z'); // Force UTC interpretation
  }

  const now = new Date();
  const diffInHours = (now - date) / (1000 * 60 * 60);

  if (diffInHours < 24) {
    return date.toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit'
    });
  } else {
    return date.toLocaleDateString([], {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }
};

  const truncateMessage = (text, maxLength = 40) => {
    if (!text) return 'New conversation started';
    return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
  };

  const getInitials = (name) => {
    if (!name) return 'U';
    const names = name.split(' ');
    return names.length > 1 ? `${names[0][0]}${names[1][0]}` : names[0][0];
  };

  const getAvatarColor = (userId) => {
    const colors = ['bg-blue-600', 'bg-green-600', 'bg-purple-600', 'bg-red-600', 'bg-yellow-600', 'bg-indigo-600'];
    const index = userId ? userId.charCodeAt(userId.length - 1) % colors.length : 0;
    return colors[index];
  };

  const totalUnread = conversations.reduce((sum, conv) => sum + (conv.unread_count || 0), 0);

  return (
    <>
      {/* Chat Dropdown */}
      <div className="relative group">
        <button className="p-2 text-gray-600 hover:text-gray-900 relative transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
          {totalUnread > 0 && (
            <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-600 text-white text-xs rounded-full flex items-center justify-center">
              {totalUnread > 9 ? '9+' : totalUnread}
            </span>
          )}
        </button>

        {/* Dropdown Menu */}
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg py-2 z-50 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 border border-gray-100 max-h-96 overflow-y-auto">
          <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-gray-900">
              Messages {totalUnread > 0 && `(${totalUnread})`}
            </h3>
          </div>

          <div className="divide-y divide-gray-100">
            {loading ? (
              <div className="px-4 py-8 text-center">
                <div className="animate-spin rounded-full h-6 w-6 border-2 border-blue-600 border-t-transparent mx-auto"></div>
                <p className="text-sm text-gray-500 mt-2">Loading conversations...</p>
              </div>
            ) : conversations.length === 0 ? (
              <div className="px-4 py-8 text-center">
                <div className="w-12 h-12 mx-auto mb-3 bg-gray-100 rounded-full flex items-center justify-center">
                  <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                </div>
                <p className="text-sm font-medium text-gray-900">No conversations yet</p>
                <p className="text-xs text-gray-500 mt-1">Start chatting with cargo owners</p>
              </div>
            ) : (
              conversations.slice(0, 5).map((conversation) => (
                <div
                  key={conversation.conversation_id}
                  onClick={() => handleConversationClick(conversation)}
                  className="px-4 py-3 hover:bg-gray-50 transition-colors cursor-pointer"
                >
                  <div className="flex items-start space-x-3">
                    <div className={`w-10 h-10 ${getAvatarColor(conversation.other_user.id)} rounded-full flex items-center justify-center text-white text-sm font-bold`}>
                      {getInitials(conversation.other_user.name).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {conversation.other_user.name || 'Unknown User'}
                        </p>
                        <span className="text-xs text-gray-400">
                          {formatChatTime(conversation.last_message_time)}
                        </span>
                      </div>
                      <p className="text-sm text-gray-500 truncate">
                        {truncateMessage(conversation.last_message)}
                      </p>
                    </div>
                    {conversation.unread_count > 0 && (
                      <div className="flex flex-col items-end space-y-1">
                        <div className="w-2 h-2 bg-blue-600 rounded-full flex-shrink-0"></div>
                        {conversation.unread_count > 1 && (
                          <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2 py-1 rounded-full">
                            {conversation.unread_count}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Chat Modal */}
      {isModalOpen && selectedConversation && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-40"
            onClick={() => setIsModalOpen(false)}
          />

          {/* Modal */}
          <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4">
            <div className="bg-white rounded-lg shadow-xl w-full h-full sm:h-[600px] sm:max-w-4xl flex overflow-hidden">
          {/* Conversations List */}
              <div className="hidden sm:flex w-1/3 border-r border-gray-200 flex-col">
                <div className="p-4 border-b border-gray-200 flex items-center justify-between">
                  <h2 className="text-lg font-semibold">Messages</h2>
                </div>

                <div className="flex-1 overflow-y-auto">
                  {conversations.map((conv) => (
                    <div
                      key={conv.conversation_id}
                      onClick={() => setSelectedConversation(conv)}
                      className={`p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 ${
                        selectedConversation?.conversation_id === conv.conversation_id ? 'bg-blue-50' : ''
                      }`}
                    >
                      <div className="flex items-start space-x-3">
                        <div className={`w-10 h-10 ${getAvatarColor(conv.other_user.id)} rounded-full flex items-center justify-center text-white text-sm font-bold`}>
                          {getInitials(conv.other_user.name)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <h3 className="text-sm font-medium text-gray-900 truncate">
                              {conv.other_user.name}
                            </h3>
                            {conv.unread_count > 0 && (
                              <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                            )}
                          </div>
                          <p className="text-xs text-gray-500 truncate">
                            {truncateMessage(conv.last_message) || 'Start conversation...'}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Chat Area */}
              <div className="flex-1 flex flex-col">
              {/* Chat Header */}
                <div className="p-4 border-b border-gray-200 flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className={`w-10 h-10 ${getAvatarColor(selectedConversation.other_user.id)} rounded-full flex items-center justify-center text-white text-sm font-bold`}>
                      {getInitials(selectedConversation.other_user.name)}
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{selectedConversation.other_user.name}</h3>
                      <p className="text-sm text-green-500">Online</p>
                    </div>
                  </div>

                  {/* Close Button - Top Right */}
                  <button
                    onClick={() => setIsModalOpen(false)}
                    className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition-colors"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                {/* Messages */}
                <div
                  ref={messagesContainerRef}
                  onScroll={checkScrollPosition}
                  className="flex-1 overflow-y-auto p-4 space-y-4"
                    >
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${message.is_mine ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-xs px-4 py-2 rounded-lg ${
                          message.is_mine
                            ? 'bg-blue-500 text-white'
                            : 'bg-gray-100 text-gray-900'
                        }`}
                      >
                        <p className="text-sm">{message.message}</p>
                        <p className={`text-xs mt-1 ${
                          message.is_mine ? 'text-blue-100' : 'text-gray-500'
                        }`}>
                          {formatMessageTime(message.created_at)}
                        </p>
                      </div>
                    </div>
                  ))}
                  {/* Invisible div to scroll to */}
                  <div ref={messagesEndRef} />
                </div>

                {/* Message Input */}
                <div className="p-4 border-t border-gray-200">
                  <form onSubmit={sendMessage} className="flex items-center space-x-3">
                    <button type="button" className="text-gray-500 hover:text-gray-700">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                      </svg>
                    </button>

                    <input
                      type="text"
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      placeholder="Type a message..."
                      className="flex-1 border border-gray-300 rounded-full px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      disabled={sending}
                      style={{ fontSize: '16px' }}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          sendMessage(e);
                        }
                      }}
                    />

                    <button
                      type="submit"
                      disabled={sending || !newMessage.trim()}
                      className="bg-gray-500 text-white p-2 rounded-full hover:bg-gray-600 disabled:bg-gray-300"
                    >
                      {sending ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                      ) : (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                        </svg>
                      )}
                    </button>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
}

// Real Notification Dropdown Component
function NotificationDropdown({ user }) {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    if (user) {
      loadAllNotifications();
      // Refresh every 30 seconds
      const interval = setInterval(loadAllNotifications, 30000);
      return () => clearInterval(interval);
    }
  }, [user]);

  const loadAllNotifications = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const allNotifications = [];

      // Load chat notifications
      try {
        const chatResponse = await fetch(`${API_BASE_URL}/api/messages/conversations`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });

        if (chatResponse.ok) {
          const chatData = await chatResponse.json();
          const chatNotifications = (chatData.conversations || [])
            .filter(conv => conv.unread_count > 0)
            .map(conv => ({
              id: `chat_${conv.conversation_id}`,
              type: 'chat',
              title: 'New message',
              message: `${conv.other_user.name}: ${truncateText(conv.last_message, 40)}`,
              time: conv.last_message_time,
              unread: true,
              actionUrl: `/chat/${conv.other_user.id}`,
              count: conv.unread_count,
              icon: 'chat',
              color: 'blue'
            }));

          allNotifications.push(...chatNotifications);
        }
      } catch (error) {
        console.error('Error loading chat notifications:', error);
      }

      // Sort by time (most recent first)
      allNotifications.sort((a, b) => new Date(b.time) - new Date(a.time));
      setNotifications(allNotifications);

    } catch (error) {
      console.error('Error loading notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const truncateText = (text, maxLength) => {
    if (!text) return 'New conversation started';
    return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
  };

  const formatNotificationTime = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now - date) / (1000 * 60 * 60);

    if (diffInHours < 1) {
      const diffInMinutes = Math.floor((now - date) / (1000 * 60));
      return diffInMinutes <= 1 ? 'Just now' : `${diffInMinutes}m ago`;
    } else if (diffInHours < 24) {
      return `${Math.floor(diffInHours)}h ago`;
    } else if (diffInHours < 48) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }
  };

  const handleNotificationClick = async (notification) => {
  // Mark this specific notification as read when clicked
  if (notification.type === 'chat') {
    try {
      const token = localStorage.getItem('token');
      await fetch(`${API_BASE_URL}/api/messages/mark-read`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          conversation_id: notification.id.replace('chat_', '')
        })
      });
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  }

  if (notification.actionUrl) {
    router.push(notification.actionUrl);
  }
};

  const markAllAsRead = async () => {
    try {
      const token = localStorage.getItem('token');

      // Mark all chat messages as read
      for (const notification of notifications) {
        if (notification.type === 'chat') {
          await fetch(`${API_BASE_URL}/api/messages/mark-read`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
              conversation_id: notification.id.replace('chat_', '')
            })
          });
        }
      }

      // Refresh notifications
      loadAllNotifications();
    } catch (error) {
      console.error('Error marking notifications as read:', error);
    }
  };

  const totalUnread = notifications.reduce((sum, notif) => sum + (notif.count || 1), 0);

  return (
    <div className="relative group">
      <button className="p-2 text-gray-600 hover:text-gray-900 relative transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center">
          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 22c1.1 0 2-.9 2-2h-4c0 1.1.9 2 2 2zm6-6v-5c0-3.07-1.64-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.63 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2z"/>
          </svg>
        {totalUnread > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-600 text-white text-xs rounded-full flex items-center justify-center">
            {totalUnread > 9 ? '9+' : totalUnread}
          </span>
        )}
      </button>

      {/* Notification Dropdown Menu */}
      <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg py-2 z-50 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 border border-gray-100 max-h-96 overflow-y-auto">
        {/* Header */}
        <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-gray-900">
            Notifications {totalUnread > 0 && `(${totalUnread})`}
          </h3>
          {totalUnread > 0 && (
            <button
              onClick={markAllAsRead}
              className="text-xs text-blue-600 hover:text-blue-800 font-medium"
            >
              Mark all read
            </button>
          )}
        </div>

        {/* Notification Items */}
        <div className="divide-y divide-gray-100">
          {loading ? (
            <div className="px-4 py-8 text-center">
              <div className="animate-spin rounded-full h-6 w-6 border-2 border-blue-600 border-t-transparent mx-auto"></div>
              <p className="text-sm text-gray-500 mt-2">Loading notifications...</p>
            </div>
          ) : notifications.length === 0 ? (
            <div className="px-4 py-8 text-center">
              <div className="w-12 h-12 mx-auto mb-3 bg-gray-100 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5-5-5 5h5zM15 17v3a3 3 0 01-6 0v-3" />
                </svg>
              </div>
              <p className="text-sm font-medium text-gray-900">All caught up!</p>
              <p className="text-xs text-gray-500 mt-1">No new notifications</p>
            </div>
          ) : (
            notifications.map((notification) => (
              <div
                key={notification.id}
                onClick={() => handleNotificationClick(notification)}
                className="px-4 py-3 hover:bg-gray-50 transition-colors cursor-pointer"
              >
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0 mt-2"></div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900">{notification.title}</p>
                    <p className="text-xs text-gray-500 mt-1">{notification.message}</p>
                    <p className="text-xs text-gray-400 mt-1">{formatNotificationTime(notification.time)}</p>
                  </div>
                  <div className="flex flex-col items-end space-y-1">
                    <span className="bg-green-100 text-green-800 text-xs font-medium px-2 py-1 rounded-full">
                      Chat
                    </span>
                    {notification.count > 1 && (
                      <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2 py-1 rounded-full">
                        {notification.count}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        {notifications.length > 0 && (
          <div className="px-4 py-3 border-t border-gray-100">
            <Link
              href="/conversations"
              className="text-sm text-blue-600 hover:text-blue-800 font-medium flex items-center justify-center"
            >
              View all messages
              <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

function Sidebar({ activeSection, setActiveSection }) {
  const router = useRouter();
  const { user, logout } = useAuth();

  const menuItems = [
    {
      id: 'overview',
      label: 'Overview',
      icon: 'M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z',
      href: '/dashboard'
    },
    {
      id: 'trips',
      label: 'My Trips',
      icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z',
      href: '/trips/my-trips'
    },
    {
      id: 'cargo',
      label: 'My Cargo',
      icon: 'M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4',
      href: '/trips/my-trips'
    },
    {
      id: 'browse',
      label: 'Browse',
      icon: 'M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z',
      href: '/trips/search'
    }
  ];

  const handleNavigation = (item) => {
    setActiveSection(item.id);
    if (item.href) {
      router.push(item.href);
    }
  };

  // Determine active section based on current route
  const currentPath = router.pathname;
  const getActiveSection = () => {
  if (currentPath === '/dashboard') return 'overview';
  if (currentPath === '/trips/search') return 'browse';
  if (currentPath.includes('/chat')) return 'messages';
  if (currentPath.includes('/trips')) return 'trips';
  return 'overview';
};

  return (
    <div className="w-72 bg-white border-r border-gray-200 h-screen fixed left-0 top-0">
      {/* Logo */}
      <div className="p-6 border-b border-gray-200">
        <Link href="/dashboard">
          <div className="flex items-center space-x-2 cursor-pointer">
            <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path d="M8 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM15 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z"/>
                <path d="M3 4a1 1 0 00-1 1v1a1 1 0 001 1h1a1 1 0 001-1V5a1 1 0 00-1-1H3zM6 4a1 1 0 011-1h7a1 1 0 011 1v10a1 1 0 01-1 1H7a1 1 0 01-1-1V4z"/>
              </svg>
            </div>
            <span className="font-semibold text-lg text-gray-900 berlin-type-font text-xl">SeasonShip</span>
          </div>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="p-4">
        <ul className="space-y-1">
          {menuItems.map((item) => (
            <li key={item.id}>
              <button
                onClick={() => handleNavigation(item)}
                className={`w-full flex items-center space-x-3 px-4 py-3 text-left rounded-lg transition-colors ${
                  getActiveSection() === item.id
                    ? 'bg-gray-900 text-white'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={item.icon} />
                </svg>
                <span className="font-medium">{item.label}</span>
              </button>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
}

export default function Layout({ children }) {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [activeSection, setActiveSection] = useState('overview');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Pages that shouldn't show the sidebar
  const noSidebarPages = ['/login', '/register', '/'];

  const shouldShowSidebar = user && !noSidebarPages.includes(router.pathname);

  if (!shouldShowSidebar) {
    return <>{children}</>;
  }

const menuItems = [
  {
    id: 'overview',
    label: 'Overview',
    icon: 'M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z',
    href: '/dashboard'
  },
  {
    id: 'trips',
    label: 'My Trips',
    icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z',
    href: '/trips/my-trips'
  },
  {
    id: 'cargo',
    label: 'My Cargo',
    icon: 'M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4',
    href: '/trips/my-trips'
  },
  {
    id: 'browse',
    label: 'Browse',
    icon: 'M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z',
    href: '/trips/search'
  }
];

const handleNavigation = (item) => {
  setActiveSection(item.id);
  if (item.href) {
    router.push(item.href);
  }
};

// Determine active section based on current route
const currentPath = router.pathname;
const getActiveSection = () => {
  if (currentPath === '/dashboard') return 'overview';
  if (currentPath === '/trips/search') return 'browse';  // Check EXACT path first
  if (currentPath.includes('/trips')) return 'trips';    // Then check other trips
  return 'overview';
};

  return (
  <div className="flex flex-col min-h-screen">
    {/* Mobile sidebar overlay */}
    {sidebarOpen && (
      <div
        className="fixed inset-0 z-40 lg:hidden"
        onClick={() => setSidebarOpen(false)}
      >
        <div className="fixed inset-0 bg-gray-600 bg-opacity-75"></div>
      </div>
    )}
      {/* Top Header Bar - Full Width */}
      <header className="px-4 lg:px-6 h-14 flex items-center border-b border-gray-200 bg-white">
  {/* Mobile menu button */}
  <button
    onClick={() => setSidebarOpen(true)}
    className="lg:hidden p-2 text-gray-600 hover:text-gray-900 mr-3"
  >
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
    </svg>
  </button>

  {/* Logo */}
  <Link href="/dashboard" className="flex items-center justify-center">
    <span className="font-bold berlin-type-font text-xl sm:text-2xl">SeasonShip</span>
  </Link>

        {/* Right Side - Navigation */}
        <nav className="ml-auto flex gap-4 sm:gap-6 items-center">
          <NotificationDropdown user={user} />

        {/* Chat Dropdown */}
          <ChatDropdown user={user} />

          {/* User Profile Dropdown */}
          <div className="relative group">
            <button className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors hover:bg-gray-100 h-10 w-10">
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </button>

            {/* Dropdown Menu */}
            <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg py-2 z-50 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 border border-gray-200">
              <div className="px-4 py-2 border-b border-gray-200">
                <p className="text-sm font-medium text-gray-900">
                  {user?.first_name && user?.last_name ? `${user.first_name} ${user.last_name}` : 'User Account'}
                </p>
                <p className="text-xs text-gray-500 truncate">{user?.email}</p>
              </div>

              <Link href="/profile" className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                <svg className="w-4 h-4 mr-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                My Profile
              </Link>

              <Link href="/trips/my-trips" className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                <svg className="w-4 h-4 mr-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                My Trips
              </Link>

              <Link href="/settings" className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                <svg className="w-4 h-4 mr-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                Settings
              </Link>

              <hr className="my-2 border-gray-200" />

              <button
                onClick={logout}
                className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
              >
                <svg className="w-4 h-4 mr-3 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                Logout
              </button>
            </div>
          </div>
        </nav>
      </header>

      <div className="flex flex-1">
        {/* Sidebar */}
        <aside className={`
  fixed inset-y-0 left-0 z-50 w-64 bg-gray-50 border-r border-gray-200 p-4 transform transition-transform duration-300 ease-in-out
  lg:translate-x-0 lg:static lg:inset-0
  ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
`}>
  {/* Close button for mobile */}
  <div className="flex items-center justify-between mb-4 lg:hidden">
    <span className="font-bold berlin-type-font text-xl">SeasonShip</span>
    <button
      onClick={() => setSidebarOpen(false)}
      className="p-2 text-gray-600 hover:text-gray-900"
    >
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
      </svg>
    </button>
  </div>
          <nav className="space-y-2">
            {menuItems.map((item) => (
              <button
                key={item.id}
                onClick={() => handleNavigation(item)}
                className={`w-full justify-start flex items-center space-x-3 px-4 py-3 text-left rounded-lg transition-colors ${
                  getActiveSection() === item.id
                    ? 'bg-black text-white'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={item.icon} />
                </svg>
                <span className="font-medium">{item.label}</span>
              </button>
            ))}
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-3 sm:p-6 lg:ml-0">
          {children}
        </main>
      </div>
    </div>
  );
}