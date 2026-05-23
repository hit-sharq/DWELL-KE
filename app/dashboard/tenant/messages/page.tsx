'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { PremiumButton } from '@/components/PremiumButton';
import { GlassmorphicCard } from '@/components/GlassmorphicCard';
import { DashboardNav } from '@/components/DashboardNav';
import { Footer } from '@/components/Footer';

interface Message {
  id: string;
  content: string;
  isRead: boolean;
  createdAt: string;
  sender: {
    id: string;
    firstName: string;
    lastName: string;
    profileImage?: string;
  };
  property?: {
    id: string;
    title: string;
  };
}

export default function TenantMessagesPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [newMessage, setNewMessage] = useState('');
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);

  useEffect(() => {
    fetchMessages();
  }, []);

  const fetchMessages = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/messages');
      if (!response.ok) throw new Error('Failed to fetch messages');
      const data = await response.json();
      setMessages(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load messages');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    try {
      const response = await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          recipientId: selectedConversation,
          content: newMessage,
        }),
      });

      if (!response.ok) throw new Error('Failed to send message');

      setNewMessage('');
      fetchMessages();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send message');
    }
  };

  const unreadCount = messages.filter((m) => !m.isRead).length;

  return (
    <main className="min-h-screen bg-background">
      <DashboardNav role="tenant" />

      <div className="py-12 px-6">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-4 mb-4">
              <Link href="/dashboard/tenant">
                <button className="flex items-center gap-2 text-cyan-400 hover:text-cyan-300 transition-colors">
                  ← Back to Dashboard
                </button>
              </Link>
            </div>
            <div className="flex items-center gap-4">
              <h1 className="text-4xl font-bold text-white">Messages</h1>
              {unreadCount > 0 && (
                <span className="px-3 py-1 bg-cyan-500/20 border border-cyan-500/50 text-cyan-400 rounded-full text-sm font-medium">
                  {unreadCount} unread
                </span>
              )}
            </div>
          </div>

          {/* Error */}
          {error && (
            <div className="mb-6 p-4 rounded-lg bg-red-500/20 border border-red-500/50 text-red-400">
              {error}
            </div>
          )}

          {/* Messages List */}
          {isLoading ? (
            <div className="text-center py-12 text-gray-400">
              Loading your messages...
            </div>
          ) : messages.length === 0 ? (
            <GlassmorphicCard>
              <div className="text-center py-12">
                <p className="text-gray-400 text-lg mb-4">
                  No messages yet. Start a conversation with a landlord!
                </p>
                <Link href="/marketplace">
                  <PremiumButton variant="solid">Browse Properties</PremiumButton>
                </Link>
              </div>
            </GlassmorphicCard>
          ) : (
            <GlassmorphicCard>
              <div className="space-y-4">
                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`p-4 rounded-xl border transition-all cursor-pointer ${
                      msg.isRead
                        ? 'border-slate-700 bg-slate-800/30'
                        : 'border-cyan-500/50 bg-cyan-500/10'
                    }`}
                    onClick={() => setSelectedConversation(msg.sender.id)}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center text-white font-bold">
                            {msg.sender.firstName?.[0] || 'U'}
                          </div>
                          <div>
                            <p className="font-semibold text-white">
                              {msg.sender.firstName} {msg.sender.lastName}
                            </p>
                            {msg.property && (
                              <p className="text-sm text-gray-400">
                                Re: {msg.property.title}
                              </p>
                            )}
                          </div>
                        </div>
                        <p className="text-gray-300 line-clamp-2">{msg.content}</p>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-xs text-gray-500">
                          {new Date(msg.createdAt).toLocaleDateString()}
                        </p>
                        {!msg.isRead && (
                          <span className="inline-block w-2 h-2 bg-cyan-400 rounded-full mt-2"></span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </GlassmorphicCard>
          )}
        </div>
      </div>

      <Footer />
    </main>
  );
}