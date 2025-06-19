"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useSession } from "next-auth/react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";
import {
  MessageCircle,
  Send,
  User,
  Bot,
  Clock,
  CheckCircle,
  AlertCircle,
  Phone,
  Mail,
  Search,
  Filter,
  MoreVertical,
  Paperclip,
  Smile,
  Minimize2,
  Maximize2,
  X,
  Star,
  ThumbsUp,
  ThumbsDown,
  Volume2,
  VolumeX,
  Settings,
  Users,
  Zap,
  FileText,
  Camera,
  Mic,
  MicOff
} from "lucide-react";

interface ChatMessage {
  id: string;
  content: string;
  timestamp: Date;
  sender: {
    id: string;
    name: string;
    role: 'user' | 'agent' | 'system';
    avatar?: string;
  };
  type: 'text' | 'image' | 'file' | 'system';
  status: 'sent' | 'delivered' | 'read';
  attachments?: Array<{
    type: 'image' | 'file';
    url: string;
    name: string;
    size: number;
  }>;
}

interface ChatSession {
  id: string;
  user: {
    id: string;
    name: string;
    email: string;
    avatar?: string;
  };
  agent?: {
    id: string;
    name: string;
    avatar?: string;
    isOnline: boolean;
  };
  status: 'waiting' | 'active' | 'closed' | 'resolved';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  category: string;
  subject: string;
  createdAt: Date;
  lastMessage?: ChatMessage;
  unreadCount: number;
  tags: string[];
  satisfaction?: {
    rating: number;
    feedback: string;
  };
}

interface SupportTicket {
  id: string;
  subject: string;
  description: string;
  category: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'open' | 'in_progress' | 'waiting' | 'closed';
  requester: {
    id: string;
    name: string;
    email: string;
  };
  assignee?: {
    id: string;
    name: string;
  };
  createdAt: Date;
  updatedAt: Date;
  messages: ChatMessage[];
}

const supportCategories = [
  'Technical Support',
  'Billing & Payments',
  'Account Issues',
  'Agent Installation',
  'Performance Issues',
  'Feature Requests',
  'General Inquiry',
  'Bug Report'
];

const priorityColors = {
  low: 'bg-green-100 text-green-800',
  medium: 'bg-yellow-100 text-yellow-800',
  high: 'bg-orange-100 text-orange-800',
  urgent: 'bg-red-100 text-red-800'
};

const statusColors = {
  waiting: 'bg-gray-100 text-gray-800',
  active: 'bg-blue-100 text-blue-800',
  closed: 'bg-gray-100 text-gray-800',
  resolved: 'bg-green-100 text-green-800'
};

export default function ChatSupport({ isMinimized = false, onToggleMinimize }: {
  isMinimized?: boolean;
  onToggleMinimize?: () => void;
}) {
  const { data: session } = useSession();
  const [activeView, setActiveView] = useState<'chat' | 'tickets' | 'new-ticket'>('chat');
  const [currentSession, setCurrentSession] = useState<ChatSession | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterPriority, setFilterPriority] = useState<string>('all');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [newTicket, setNewTicket] = useState({
    subject: '',
    description: '',
    category: '',
    priority: 'medium' as const
  });

  useEffect(() => {
    // Simulate connection status
    setIsConnected(true);
    loadChatHistory();
    loadTickets();
  }, []);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [scrollToBottom]);

  const loadChatHistory = async () => {
    // Simulate loading chat history
    const mockMessages: ChatMessage[] = [
      {
        id: '1',
        content: 'Hi! How can I help you today?',
        timestamp: new Date(Date.now() - 300000),
        sender: { id: 'agent1', name: 'Sarah Wilson', role: 'agent' },
        type: 'text',
        status: 'read'
      },
      {
        id: '2',
        content: 'I\'m having trouble installing the Customer Support AI agent. It keeps showing an error message.',
        timestamp: new Date(Date.now() - 240000),
        sender: { id: session?.user?.id || 'user1', name: session?.user?.name || 'User', role: 'user' },
        type: 'text',
        status: 'read'
      },
      {
        id: '3',
        content: 'I\'d be happy to help you with that. Can you tell me what error message you\'re seeing?',
        timestamp: new Date(Date.now() - 180000),
        sender: { id: 'agent1', name: 'Sarah Wilson', role: 'agent' },
        type: 'text',
        status: 'read'
      }
    ];
    setMessages(mockMessages);

    const mockSession: ChatSession = {
      id: 'session1',
      user: {
        id: session?.user?.id || 'user1',
        name: session?.user?.name || 'User',
        email: session?.user?.email || 'user@example.com'
      },
      agent: {
        id: 'agent1',
        name: 'Sarah Wilson',
        isOnline: true
      },
      status: 'active',
      priority: 'medium',
      category: 'Technical Support',
      subject: 'Agent Installation Issue',
      createdAt: new Date(Date.now() - 600000),
      unreadCount: 0,
      tags: ['installation', 'error']
    };
    setCurrentSession(mockSession);
  };

  const loadTickets = async () => {
    // Simulate loading tickets
    const mockTickets: SupportTicket[] = [
      {
        id: 'ticket1',
        subject: 'Payment Processing Error',
        description: 'Unable to complete purchase due to payment gateway error',
        category: 'Billing & Payments',
        priority: 'high',
        status: 'open',
        requester: {
          id: session?.user?.id || 'user1',
          name: session?.user?.name || 'User',
          email: session?.user?.email || 'user@example.com'
        },
        createdAt: new Date(Date.now() - 3600000),
        updatedAt: new Date(Date.now() - 1800000),
        messages: []
      },
      {
        id: 'ticket2',
        subject: 'Feature Request: Dark Mode',
        description: 'Would like to request dark mode for the marketplace interface',
        category: 'Feature Requests',
        priority: 'low',
        status: 'in_progress',
        requester: {
          id: session?.user?.id || 'user1',
          name: session?.user?.name || 'User',
          email: session?.user?.email || 'user@example.com'
        },
        assignee: {
          id: 'agent2',
          name: 'Mike Johnson'
        },
        createdAt: new Date(Date.now() - 7200000),
        updatedAt: new Date(Date.now() - 3600000),
        messages: []
      }
    ];
    setTickets(mockTickets);
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || isSending) return;

    setIsSending(true);
    const message: ChatMessage = {
      id: Date.now().toString(),
      content: newMessage.trim(),
      timestamp: new Date(),
      sender: {
        id: session?.user?.id || 'user1',
        name: session?.user?.name || 'User',
        role: 'user'
      },
      type: 'text',
      status: 'sent'
    };

    setMessages(prev => [...prev, message]);
    setNewMessage('');

    // Simulate agent response
    setTimeout(() => {
      const agentResponse: ChatMessage = {
        id: (Date.now() + 1).toString(),
        content: 'Thank you for that information. Let me help you resolve this issue.',
        timestamp: new Date(),
        sender: {
          id: 'agent1',
          name: 'Sarah Wilson',
          role: 'agent'
        },
        type: 'text',
        status: 'sent'
      };
      setMessages(prev => [...prev, agentResponse]);
      setIsSending(false);
    }, 1500);
  };

  const submitTicket = async () => {
    if (!newTicket.subject || !newTicket.description || !newTicket.category) {
      toast.error('Please fill in all required fields');
      return;
    }

    const ticket: SupportTicket = {
      id: `ticket${Date.now()}`,
      ...newTicket,
      status: 'open',
      requester: {
        id: session?.user?.id || 'user1',
        name: session?.user?.name || 'User',
        email: session?.user?.email || 'user@example.com'
      },
      createdAt: new Date(),
      updatedAt: new Date(),
      messages: []
    };

    setTickets(prev => [ticket, ...prev]);
    setNewTicket({ subject: '', description: '', category: '', priority: 'medium' });
    setActiveView('tickets');
    toast.success('Support ticket created successfully!');
  };

  const filteredTickets = tickets.filter(ticket => {
    const matchesSearch = ticket.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         ticket.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = filterStatus === 'all' || ticket.status === filterStatus;
    const matchesPriority = filterPriority === 'all' || ticket.priority === filterPriority;
    return matchesSearch && matchesStatus && matchesPriority;
  });

  if (isMinimized) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <Button
          onClick={onToggleMinimize}
          className="rounded-full w-14 h-14 shadow-lg bg-blue-600 hover:bg-blue-700"
        >
          <MessageCircle className="h-6 w-6" />
        </Button>
      </div>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 w-96 h-[600px] bg-card rounded-lg shadow-2xl border border-border flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b bg-blue-600 text-white rounded-t-lg">
        <div className="flex items-center space-x-2">
          <MessageCircle className="h-5 w-5" />
          <span className="font-semibold">Support Chat</span>
          {isConnected && (
            <div className="flex items-center">
              <div className="w-2 h-2 bg-green-400 rounded-full mr-1" />
              <span className="text-xs">Online</span>
            </div>
          )}
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsMuted(!isMuted)}
            className="text-white hover:bg-blue-700"
          >
            {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={onToggleMinimize}
            className="text-white hover:bg-blue-700"
          >
            <Minimize2 className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex border-b">
        <button
          onClick={() => setActiveView('chat')}
          className={`flex-1 py-2 px-4 text-sm font-medium ${
            activeView === 'chat'
              ? 'bg-blue-50 text-blue-600 border-b-2 border-blue-600'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Live Chat
        </button>
        <button
          onClick={() => setActiveView('tickets')}
          className={`flex-1 py-2 px-4 text-sm font-medium ${
            activeView === 'tickets'
              ? 'bg-blue-50 text-blue-600 border-b-2 border-blue-600'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          My Tickets
        </button>
        <button
          onClick={() => setActiveView('new-ticket')}
          className={`flex-1 py-2 px-4 text-sm font-medium ${
            activeView === 'new-ticket'
              ? 'bg-blue-50 text-blue-600 border-b-2 border-blue-600'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          New Ticket
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden">
        {activeView === 'chat' && (
          <div className="h-full flex flex-col">
            {/* Agent Info */}
            {currentSession?.agent && (
              <div className="p-3 bg-gray-50 border-b">
                <div className="flex items-center space-x-2">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback>SW</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-sm font-medium">{currentSession.agent.name}</p>
                    <div className="flex items-center space-x-1">
                      <div className="w-2 h-2 bg-green-400 rounded-full" />
                      <span className="text-xs text-gray-500">Online</span>
                    </div>
                  </div>
                  <Badge className={priorityColors[currentSession.priority]}>
                    {currentSession.priority}
                  </Badge>
                </div>
              </div>
            )}

            {/* Messages */}
            <ScrollArea className="flex-1 p-4">
              <div className="space-y-4">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${
                      message.sender.role === 'user' ? 'justify-end' : 'justify-start'
                    }`}
                  >
                    <div
                      className={`max-w-[80%] rounded-lg p-3 ${
                        message.sender.role === 'user'
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-100 text-gray-900'
                      }`}
                    >
                      <p className="text-sm">{message.content}</p>
                      <p className="text-xs opacity-70 mt-1">
                        {message.timestamp.toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>
                  </div>
                ))}
                {isTyping && (
                  <div className="flex justify-start">
                    <div className="bg-gray-100 rounded-lg p-3">
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>

            {/* Message Input */}
            <div className="p-4 border-t">
              <div className="flex space-x-2">
                <Input
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Type your message..."
                  onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                  disabled={isSending}
                />
                <Button onClick={sendMessage} disabled={isSending || !newMessage.trim()}>
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        )}

        {activeView === 'tickets' && (
          <div className="h-full flex flex-col">
            {/* Search and Filters */}
            <div className="p-4 border-b space-y-3">
              <div className="relative">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                <Input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search tickets..."
                  className="pl-9"
                />
              </div>
              <div className="flex space-x-2">
                <Select value={filterStatus} onValueChange={setFilterStatus}>
                  <SelectTrigger className="flex-1">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="open">Open</SelectItem>
                    <SelectItem value="in_progress">In Progress</SelectItem>
                    <SelectItem value="waiting">Waiting</SelectItem>
                    <SelectItem value="closed">Closed</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={filterPriority} onValueChange={setFilterPriority}>
                  <SelectTrigger className="flex-1">
                    <SelectValue placeholder="Priority" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Priority</SelectItem>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="urgent">Urgent</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Tickets List */}
            <ScrollArea className="flex-1">
              <div className="p-4 space-y-3">
                {filteredTickets.map((ticket) => (
                  <Card
                    key={ticket.id}
                    className="cursor-pointer hover:shadow-md transition-shadow"
                    onClick={() => setSelectedTicket(ticket)}
                  >
                    <CardContent className="p-3">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="font-medium text-sm">{ticket.subject}</h4>
                          <p className="text-xs text-gray-600 mt-1">
                            {ticket.description.substring(0, 80)}...
                          </p>
                          <div className="flex items-center space-x-2 mt-2">
                            <Badge className={priorityColors[ticket.priority]} variant="secondary">
                              {ticket.priority}
                            </Badge>
                            <Badge variant="outline">
                              {ticket.status.replace('_', ' ')}
                            </Badge>
                          </div>
                        </div>
                        <div className="text-xs text-gray-500">
                          {ticket.updatedAt.toLocaleDateString()}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
                {filteredTickets.length === 0 && (
                  <div className="text-center text-gray-500 py-8">
                    <FileText className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                    <p>No tickets found</p>
                  </div>
                )}
              </div>
            </ScrollArea>
          </div>
        )}

        {activeView === 'new-ticket' && (
          <div className="h-full">
            <ScrollArea className="h-full">
              <div className="p-4 space-y-4">
                <div>
                  <label className="text-sm font-medium">Subject *</label>
                  <Input
                    value={newTicket.subject}
                    onChange={(e) => setNewTicket({ ...newTicket, subject: e.target.value })}
                    placeholder="Brief description of your issue"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium">Category *</label>
                  <Select value={newTicket.category} onValueChange={(value) => setNewTicket({ ...newTicket, category: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {supportCategories.map((category) => (
                        <SelectItem key={category} value={category}>
                          {category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium">Priority</label>
                  <Select value={newTicket.priority} onValueChange={(value: string) => setNewTicket({ ...newTicket, priority: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="urgent">Urgent</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium">Description *</label>
                  <Textarea
                    value={newTicket.description}
                    onChange={(e) => setNewTicket({ ...newTicket, description: e.target.value })}
                    placeholder="Provide detailed information about your issue..."
                    rows={4}
                  />
                </div>

                <Button onClick={submitTicket} className="w-full">
                  Submit Ticket
                </Button>
              </div>
            </ScrollArea>
          </div>
        )}
      </div>
    </div>
  );
}
