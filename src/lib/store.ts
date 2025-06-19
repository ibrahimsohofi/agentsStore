import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// Types
export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  role: 'buyer' | 'seller' | 'admin';
  verified: boolean;
  joinedDate: string;
}

export interface CartItem {
  id: string;
  agentId: string;
  name: string;
  price: number;
  seller: string;
  image: string;
}

export interface Review {
  id: string;
  agentId: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  rating: number;
  comment: string;
  date: string;
  verified: boolean;
  helpful: number;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  register: (userData: Omit<User, 'id' | 'joinedDate'>) => Promise<boolean>;
  logout: () => void;
  updateUser: (userData: Partial<User>) => void;
}

interface CartState {
  items: CartItem[];
  addItem: (item: CartItem) => void;
  removeItem: (agentId: string) => void;
  clearCart: () => void;
  getItemsCount: () => number;
  getTotalPrice: () => number;
}

interface ReviewState {
  reviews: Review[];
  addReview: (review: Omit<Review, 'id' | 'date' | 'helpful'>) => void;
  getReviewsByAgent: (agentId: string) => Review[];
  markHelpful: (reviewId: string) => void;
}

// Auth Store
export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      login: async (email: string, password: string) => {
        // Mock authentication - in real app, this would call an API
        if (email && password) {
          const mockUser: User = {
            id: Math.random().toString(36).substring(7),
            email,
            name: email.split('@')[0],
            role: email.includes('seller') ? 'seller' : 'buyer',
            verified: true,
            joinedDate: new Date().toISOString().split('T')[0]
          };
          set({ user: mockUser, isAuthenticated: true });
          return true;
        }
        return false;
      },
      register: async (userData) => {
        // Mock registration
        const newUser: User = {
          ...userData,
          id: Math.random().toString(36).substring(7),
          joinedDate: new Date().toISOString().split('T')[0]
        };
        set({ user: newUser, isAuthenticated: true });
        return true;
      },
      logout: () => {
        set({ user: null, isAuthenticated: false });
      },
      updateUser: (userData) => {
        const currentUser = get().user;
        if (currentUser) {
          set({ user: { ...currentUser, ...userData } });
        }
      }
    }),
    {
      name: 'auth-storage',
    }
  )
);

// Cart Store
export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      addItem: (item) => {
        const items = get().items;
        const existingItem = items.find(i => i.agentId === item.agentId);
        if (!existingItem) {
          set({ items: [...items, item] });
        }
      },
      removeItem: (agentId) => {
        set({ items: get().items.filter(item => item.agentId !== agentId) });
      },
      clearCart: () => {
        set({ items: [] });
      },
      getItemsCount: () => get().items.length,
      getTotalPrice: () => get().items.reduce((total, item) => total + item.price, 0)
    }),
    {
      name: 'cart-storage',
    }
  )
);

// Review Store
export const useReviewStore = create<ReviewState>()(
  persist(
    (set, get) => ({
      reviews: [],
      addReview: (reviewData) => {
        const newReview: Review = {
          ...reviewData,
          id: Math.random().toString(36).substring(7),
          date: new Date().toISOString().split('T')[0],
          helpful: 0
        };
        set({ reviews: [...get().reviews, newReview] });
      },
      getReviewsByAgent: (agentId) => {
        return get().reviews.filter(review => review.agentId === agentId);
      },
      markHelpful: (reviewId) => {
        const reviews = get().reviews.map(review =>
          review.id === reviewId
            ? { ...review, helpful: review.helpful + 1 }
            : review
        );
        set({ reviews });
      }
    }),
    {
      name: 'reviews-storage',
    }
  )
);

// Mock agents data with enhanced search functionality
export const mockAgentsData = [
  {
    id: '1',
    name: "Advanced Customer Support AI",
    description: "24/7 intelligent customer service with sentiment analysis and escalation management",
    longDescription: `This advanced AI agent revolutionizes customer support by providing intelligent, round-the-clock assistance with sophisticated sentiment analysis capabilities. Built with cutting-edge natural language processing, it can understand customer emotions, provide empathetic responses, and automatically escalate complex issues to human agents when needed.

Key capabilities include:
• Multi-language support for global customer base
• Integration with popular helpdesk platforms
• Real-time sentiment analysis and emotion detection
• Automated ticket routing based on urgency and complexity
• Comprehensive analytics and reporting dashboard
• Customizable response templates and workflows`,
    price: 29,
    rating: 4.9,
    reviews: 124,
    totalPurchases: 1250,
    category: "customer-support",
    seller: {
      name: "AutomationPro",
      avatar: "AP",
      verified: true,
      rating: 4.8,
      totalSales: 89,
      joinedDate: "2023"
    },
    verified: true,
    image: "https://ugc.same-assets.com/YGjp5-4jrKPnAejU6djYbRdg6f08Ontf.webp",
    tags: ["n8n", "OpenAI", "Webhooks", "Customer Service", "AI", "Automation"],
    featured: true,
    lastUpdated: "2024-12-15",
    version: "2.1.0",
    requirements: ["n8n workspace", "OpenAI API key", "Webhook endpoint"],
    integrations: ["Slack", "Discord", "Zendesk", "Freshdesk", "Intercom"],
    documentation: "https://docs.example.com/customer-support-ai",
    demo: "https://demo.example.com/customer-support-ai",
    preview: {
      images: [
        "https://ugc.same-assets.com/YGjp5-4jrKPnAejU6djYbRdg6f08Ontf.webp",
        "https://ugc.same-assets.com/TKQD_RRpMytxab-2Tw6Mst1R-nFbtUbk.png",
        "https://ugc.same-assets.com/GeS5xcJMOmbQw9cDuhBDa_JWP3RMSitf.webp"
      ],
      video: "https://example.com/demo-video.mp4"
    }
  },
  {
    id: '2',
    name: "Sales Analytics Dashboard Bot",
    description: "Real-time sales data analysis with automated reporting and insights",
    longDescription: "Advanced analytics agent that provides comprehensive sales insights...",
    price: 49,
    rating: 4.8,
    reviews: 89,
    totalPurchases: 890,
    category: "sales",
    seller: {
      name: "DataWizard",
      avatar: "DW",
      verified: true,
      rating: 4.7,
      totalSales: 45,
      joinedDate: "2023"
    },
    verified: true,
    image: "https://ugc.same-assets.com/TKQD_RRpMytxab-2Tw6Mst1R-nFbtUbk.png",
    tags: ["Analytics", "Automation", "Reports", "Sales", "Dashboard"],
    featured: true,
    lastUpdated: "2024-12-10",
    version: "1.8.0",
    requirements: ["n8n workspace", "Database connection", "Analytics API"],
    integrations: ["Salesforce", "HubSpot", "Google Analytics", "Tableau"],
    documentation: "https://docs.example.com/sales-analytics",
    demo: "https://demo.example.com/sales-analytics",
    preview: {
      images: [
        "https://ugc.same-assets.com/TKQD_RRpMytxab-2Tw6Mst1R-nFbtUbk.png",
        "https://ugc.same-assets.com/YGjp5-4jrKPnAejU6djYbRdg6f08Ontf.webp"
      ],
      video: "https://example.com/demo-video.mp4"
    }
  },
  {
    id: '3',
    name: "AI Content Creator Pro",
    description: "Automated blog posts, social media content, and SEO optimization",
    longDescription: "Professional content creation agent for marketing teams...",
    price: 19,
    rating: 4.7,
    reviews: 67,
    totalPurchases: 567,
    category: "content",
    seller: {
      name: "ContentAI",
      avatar: "CA",
      verified: false,
      rating: 4.5,
      totalSales: 23,
      joinedDate: "2024"
    },
    verified: false,
    image: "https://ugc.same-assets.com/GeS5xcJMOmbQw9cDuhBDa_JWP3RMSitf.webp",
    tags: ["Content", "SEO", "Social Media", "Marketing", "Writing"],
    featured: false,
    lastUpdated: "2024-12-05",
    version: "1.5.2",
    requirements: ["n8n workspace", "OpenAI API key", "Content platforms"],
    integrations: ["WordPress", "Twitter", "LinkedIn", "Facebook"],
    documentation: "https://docs.example.com/content-creator",
    demo: "https://demo.example.com/content-creator",
    preview: {
      images: [
        "https://ugc.same-assets.com/GeS5xcJMOmbQw9cDuhBDa_JWP3RMSitf.webp"
      ],
      video: "https://example.com/demo-video.mp4"
    }
  }
];

// Search and filter utility functions
export const searchAgents = (
  agents: typeof mockAgentsData,
  query: string,
  category = 'all',
  priceRange: [number, number] = [0, 1000],
  ratingFilter = 0,
  sortBy = 'popular'
) => {
  const filteredAgents = agents.filter(agent => {
    const matchesSearch = !query ||
      agent.name.toLowerCase().includes(query.toLowerCase()) ||
      agent.description.toLowerCase().includes(query.toLowerCase()) ||
      agent.tags.some(tag => tag.toLowerCase().includes(query.toLowerCase())) ||
      agent.seller.name.toLowerCase().includes(query.toLowerCase());

    const matchesCategory = category === 'all' || agent.category === category;
    const matchesPrice = agent.price >= priceRange[0] && agent.price <= priceRange[1];
    const matchesRating = agent.rating >= ratingFilter;

    return matchesSearch && matchesCategory && matchesPrice && matchesRating;
  });

  // Sort results
  switch (sortBy) {
    case 'price-low':
      filteredAgents.sort((a, b) => a.price - b.price);
      break;
    case 'price-high':
      filteredAgents.sort((a, b) => b.price - a.price);
      break;
    case 'rating':
      filteredAgents.sort((a, b) => b.rating - a.rating);
      break;
    case 'newest':
      filteredAgents.sort((a, b) => new Date(b.lastUpdated).getTime() - new Date(a.lastUpdated).getTime());
      break;
    default:
      filteredAgents.sort((a, b) => b.totalPurchases - a.totalPurchases);
      break;
  }

  return filteredAgents;
};
