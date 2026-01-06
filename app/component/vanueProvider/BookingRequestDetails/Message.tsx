'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Search, MoreVertical, Send } from 'lucide-react';

interface Message {
  id: number;
  text: string;
  sender: 'user' | 'other';
  time: string;
}

interface Contact {
  id: number;
  username: string;
  avatar: string;
  lastMessage: string;
  time: string;
  online?: boolean;
}

export default function MessagingApp() {
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [messageText, setMessageText] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const contacts: Contact[] = [
    {
      id: 1,
      username: '@greenstay',
      avatar: '🏨',
      lastMessage: 'Looking forward to the post!',
      time: '1h ago',
      online: true,
    },
    {
      id: 2,
      username: '@urbanbnb',
      avatar: '🏙️',
      lastMessage: 'Please send preview reel.',
      time: '3d ago',
    },
    {
      id: 3,
      username: '@coastalstay',
      avatar: '🏖️',
      lastMessage: 'Thanks for the collaboration!',
      time: '1w ago',
    },
    {
      id: 4,
      username: '@mountainview',
      avatar: '⛰️',
      lastMessage: 'When can you visit us?',
      time: '2w ago',
    },
    {
      id: 5,
      username: '@luxurysuites',
      avatar: '✨',
      lastMessage: 'Great content! Looking forward to more.',
      time: '3w ago',
    },
    {
      id: 6,
      username: '@luxurysuites',
      avatar: '✨',
      lastMessage: 'Great content! Looking forward to more.',
      time: '3w ago',
    },
    {
      id: 7,
      username: '@luxurysuites',
      avatar: '✨',
      lastMessage: 'Great content! Looking forward to more.',
      time: '3w ago',
    },
    {
      id: 8,
      username: '@luxurysuites',
      avatar: '✨',
      lastMessage: 'Great content! Looking forward to more.',
      time: '3w ago',
    },
    {
      id: 9,
      username: '@luxurysuites',
      avatar: '✨',
      lastMessage: 'Great content! Looking forward to more.',
      time: '3w ago',
    },
    {
      id: 10,
      username: '@luxurysuites',
      avatar: '✨',
      lastMessage: 'Great content! Looking forward to more.',
      time: '3w ago',
    },
    {
      id: 11,
      username: '@luxurysuites',
      avatar: '✨',
      lastMessage: 'Great content! Looking forward to more.',
      time: '3w ago',
    },
    {
      id: 12,
      username: '@luxurysuites',
      avatar: '✨',
      lastMessage: 'Great content! Looking forward to more.',
      time: '3w ago',
    },
  ];

  // Filter contacts based on search query
  const filteredContacts = contacts.filter((contact) =>
    contact.username.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const sampleMessages: Message[] = [
    {
      id: 1,
      text: "Hey! Thanks for accepting our collaboration request. We're excited to work with you!",
      sender: 'other',
      time: '10:23 AM',
    },
    {
      id: 2,
      text: "Hi! I'm thrilled to collaborate. Looking forward to creating amazing content for your property.",
      sender: 'user',
      time: '10:25 AM',
    },
    {
      id: 3,
      text: "Perfect! Can you share the draft before posting? We'd love to review it first.",
      sender: 'other',
      time: '11:42 AM',
    },
    {
      id: 4,
      text: "Sure! I'll upload it today evening. Will send you the preview link once it's ready.",
      sender: 'user',
      time: '11:45 AM',
    },
    {
      id: 5,
      text: 'Looking forward to the post! 🎉',
      sender: 'other',
      time: '1h ago',
    },
    {
      id: 6,
      text: "Sure! I'll upload it today evening. Will send you the preview link once it's ready.",
      sender: 'user',
      time: '11:45 AM',
    },
    
  ];

  useEffect(() => {
    if (selectedContact) {
      setMessages(sampleMessages);
    }
  }, [selectedContact]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = () => {
    if (messageText.trim() && selectedContact) {
      const newMessage: Message = {
        id: messages.length + 1,
        text: messageText,
        sender: 'user',
        time: new Date().toLocaleTimeString('en-US', {
          hour: '2-digit',
          minute: '2-digit',
        }),
      };
      setMessages([...messages, newMessage]);
      setMessageText('');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar - Contacts List */}
      <div className="w-72 bg-white border-r border-gray-200 flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <h1 className="text-xl font-semibold mb-3">Messages</h1>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search by host name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-gray-50 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#B74140]"
            />
          </div>
        </div>

        {/* Contacts List - Scrollable */}
        <div className="flex-1 overflow-y-auto p-6">
          {filteredContacts.length > 0 ? (
            filteredContacts.map((contact) => (
              <div
                key={contact.id}
                onClick={() => setSelectedContact(contact)}
                className={`p-6 cursor-pointer transition-colors rounded-lg ${
                  selectedContact?.id === contact.id 
                    ? 'bg-[#B741401A]' 
                    : 'hover:bg-gray-50'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className="relative">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-pink-400 to-purple-500 flex items-center justify-center text-white text-lg">
                      {contact.avatar}
                    </div>
                    {contact.online && (
                      <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start mb-1">
                      <span className="font-semibold text-sm">
                        {contact.username}
                      </span>
                      <span className="text-xs text-gray-500">{contact.time}</span>
                    </div>
                    <p className="text-sm text-gray-600 truncate">
                      {contact.lastMessage}
                    </p>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="p-8 text-center text-gray-500">
              <Search className="w-12 h-12 mx-auto mb-3 text-gray-300" />
              <p className="text-sm">No contacts found</p>
              <p className="text-xs mt-1">Try a different search term</p>
            </div>
          )}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {selectedContact ? (
          <>
            {/* Chat Header */}
            <div className="bg-white border-b border-gray-200 p-[24px] flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-pink-400 to-purple-500 flex items-center justify-center text-white text-lg">
                    {selectedContact.avatar}
                  </div>
                  {selectedContact.online && (
                    <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
                  )}
                </div>
                <div>
                  <h2 className="font-semibold">{selectedContact.username}</h2>
                  {selectedContact.online && (
                    <p className="text-sm text-green-500">Online</p>
                  )}
                </div>
              </div>
             
            </div>

            {/* Messages Area - Scrollable */}
            <div className="flex-1 overflow-y-auto p-[24px] bg-gray-50">
              <div className=" space-y-4">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${
                      message.sender === 'user' ? 'justify-end' : 'justify-start'
                    }`}
                  >
                    <div className="flex items-end gap-2 max-w-xl">
                      {message.sender === 'other' && (
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-pink-400 to-purple-500 flex items-center justify-center text-white text-sm flex-shrink-0">
                          {selectedContact.avatar}
                        </div>
                      )}
                      <div
                        
                      >
                        <p className={`px-4 py-3 rounded-2xl ${
                          message.sender === 'user'
                            ? 'bg-[#B74140] text-white rounded-br-sm'
                            : 'bg-white text-gray-800 rounded-bl-sm'
                        }`}>{message.text}</p>
                        <span
                          className={`font-inter font-normal text-xs leading-4 tracking-normal  mt-1 block ${
                            message.sender === 'user'
                              ? 'text-gray-600 text-right'
                              : 'text-gray-500'
                          }`}
                        >
                          {message.time}
                        </span>
                      </div>
                      {message.sender === 'user' && (
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-gray-600 to-gray-700 flex items-center justify-center text-white text-sm flex-shrink-0">
                          👤
                        </div>
                      )}
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>
            </div>

            {/* Message Input */}
            <div className="bg-white border-t border-gray-200 p-4">
              <div className=" flex items-center gap-3">
                <input
                  type="text"
                  value={messageText}
                  onChange={(e) => setMessageText(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Type a message..."
                  className="flex-1 px-4 py-3 bg-gray-50 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#B74140] text-sm"
                />
                <button
                  onClick={handleSendMessage}
                  disabled={!messageText.trim()}
                  className="bg-[#B74140] text-white px-6 py-3 rounded-lg hover:bg-[#B74140]/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 font-medium"
                >
                  Send
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center bg-gray-50">
            <div className="text-center">
              <div className="text-6xl mb-4">💬</div>
              <h2 className="text-xl font-semibold text-gray-700 mb-2">
                Select a conversation
              </h2>
              <p className="text-gray-500">
                Choose a contact to start messaging
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}