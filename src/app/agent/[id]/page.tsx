"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Star,
  Bot,
  Zap,
  Shield,
  TrendingUp,
  Users,
  ArrowLeft,
  Download,
  Eye,
  Heart,
  Share2,
  CheckCircle,
  Clock,
  Globe,
  Settings,
  Code,
  FileText,
  Play,
  ShoppingCart
} from "lucide-react";
import Link from "next/link";
import ReviewsSection from "@/components/ReviewsSection";
import AgentTesting from "@/components/AgentTesting";
import AgentAnalytics from "@/components/AgentAnalytics";

// Mock agent data - in a real app, this would come from an API
const mockAgent = {
  id: 1,
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
};

const mockReviews = [
  {
    id: 1,
    user: "Sarah Johnson",
    avatar: "SJ",
    rating: 5,
    date: "2024-12-10",
    comment: "Incredible AI agent! Reduced our customer support workload by 70%. The sentiment analysis is spot-on and the escalation logic works perfectly.",
    helpful: 12,
    unhelpful: 0,
    verified: true,
    userLiked: false,
    userDisliked: false
  },
  {
    id: 2,
    user: "Michael Chen",
    avatar: "MC",
    rating: 5,
    date: "2024-12-08",
    comment: "Easy to set up and configure. The documentation is excellent and the n8n workflow is well-structured. Highly recommended!",
    helpful: 8,
    unhelpful: 1,
    verified: true,
    userLiked: false,
    userDisliked: false
  },
  {
    id: 3,
    user: "Emily Rodriguez",
    avatar: "ER",
    rating: 4,
    date: "2024-12-05",
    comment: "Great agent overall. Works well with our existing Zendesk setup. Would love to see more customization options for response templates.",
    helpful: 5,
    unhelpful: 2,
    verified: false,
    userLiked: false,
    userDisliked: false
  },
  {
    id: 4,
    user: "David Kim",
    avatar: "DK",
    rating: 5,
    date: "2024-12-03",
    comment: "Amazing workflow! The AI understands context really well and the multi-language support is fantastic. Worth every penny.",
    helpful: 15,
    unhelpful: 0,
    verified: true,
    userLiked: false,
    userDisliked: false
  },
  {
    id: 5,
    user: "Lisa Thompson",
    avatar: "LT",
    rating: 4,
    date: "2024-11-28",
    comment: "Solid customer support agent. Setup was straightforward and it integrates well with our existing tools. Sometimes needs fine-tuning for industry-specific terms.",
    helpful: 7,
    unhelpful: 1,
    verified: true,
    userLiked: false,
    userDisliked: false
  },
  {
    id: 6,
    user: "Alex Martinez",
    avatar: "AM",
    rating: 3,
    date: "2024-11-25",
    comment: "Decent agent but had some issues with complex queries. Support was helpful though and they're working on improvements.",
    helpful: 4,
    unhelpful: 3,
    verified: true,
    userLiked: false,
    userDisliked: false
  }
];

export default function AgentDetail({ params }: { params: { id: string } }) {
  const [selectedImage, setSelectedImage] = useState(0);
  const [isWishlisted, setIsWishlisted] = useState(false);

  const agent = mockAgent; // In real app, fetch based on params.id

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="border-b bg-background/90 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <Link href="/" className="flex items-center space-x-2">
                <Bot className="h-8 w-8 text-blue-600" />
                <span className="text-2xl font-bold text-foreground">AgentStore</span>
              </Link>
            </div>
            <div className="hidden md:flex items-center space-x-8">
              <Link href="/marketplace" className="text-muted-foreground hover:text-foreground">Browse Agents</Link>
              <Link href="/sell" className="text-muted-foreground hover:text-foreground">Sell</Link>
              <Link href="/docs" className="text-muted-foreground hover:text-foreground">Documentation</Link>
              <Link href="/pricing" className="text-muted-foreground hover:text-foreground">Pricing</Link>
            </div>
            <div className="flex items-center space-x-4">
              <Button variant="ghost">Sign In</Button>
              <Button>Get Started</Button>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <div className="flex items-center space-x-2 text-sm text-muted-foreground mb-6">
          <Link href="/marketplace" className="hover:text-foreground flex items-center">
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back to Marketplace
          </Link>
          <span>/</span>
          <span className="text-foreground">{agent.name}</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Agent Header */}
            <div>
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h1 className="text-4xl font-bold text-foreground mb-2">{agent.name}</h1>
                  <p className="text-xl text-muted-foreground">{agent.description}</p>
                </div>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsWishlisted(!isWishlisted)}
                    className={isWishlisted ? "text-red-600 border-red-600" : ""}
                  >
                    <Heart className={`h-4 w-4 ${isWishlisted ? "fill-current" : ""}`} />
                  </Button>
                  <Button variant="outline" size="sm">
                    <Share2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Tags and Metadata */}
              <div className="flex flex-wrap items-center gap-4 mb-6">
                <div className="flex items-center space-x-1">
                  {Array.from({ length: 5 }, (_, i) => (
                    <Star
                      key={`star-${i + 1}`}
                      className={`h-5 w-5 ${i < Math.floor(agent.rating) ? 'fill-yellow-400 text-yellow-400' : 'text-muted-foreground'}`}
                    />
                  ))}
                  <span className="font-semibold">{agent.rating}</span>
                  <span className="text-muted-foreground">({agent.reviews} reviews)</span>
                </div>

                <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                  <span className="flex items-center">
                    <Download className="h-4 w-4 mr-1" />
                    {agent.totalPurchases} purchases
                  </span>
                  <span className="flex items-center">
                    <Clock className="h-4 w-4 mr-1" />
                    Updated {agent.lastUpdated}
                  </span>
                  <span className="flex items-center">
                    <Settings className="h-4 w-4 mr-1" />
                    v{agent.version}
                  </span>
                </div>
              </div>

              {/* Tags */}
              <div className="flex flex-wrap gap-2 mb-6">
                {agent.tags.map((tag) => (
                  <Badge key={tag} variant="secondary">
                    {tag}
                  </Badge>
                ))}
              </div>

              {/* Seller Info */}
              <Card className="mb-6">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <Avatar>
                        <AvatarFallback>{agent.seller.avatar}</AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="font-semibold">{agent.seller.name}</span>
                          {agent.seller.verified && (
                            <Shield className="h-4 w-4 text-green-600" />
                          )}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {agent.seller.rating}★ • {agent.seller.totalSales} sales • Joined {agent.seller.joinedDate}
                        </div>
                      </div>
                    </div>
                    <Button variant="outline" size="sm">
                      View Profile
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Preview Images/Video */}
            <Card>
              <CardHeader>
                <CardTitle>Preview</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="aspect-video bg-muted rounded-lg overflow-hidden">
                    <img
                      src={agent.preview.images[selectedImage]}
                      alt="Agent preview"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex space-x-2 overflow-x-auto">
                    {agent.preview.images.map((image, index) => (
                      <button
                        key={`preview-${image}`}
                        onClick={() => setSelectedImage(index)}
                        className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 ${
                          selectedImage === index ? 'border-blue-500' : 'border-border'
                        }`}
                      >
                        <img src={image} alt={`Preview ${index + 1}`} className="w-full h-full object-cover" />
                      </button>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Tabs Content */}
            <Tabs defaultValue="description" className="w-full">
              <TabsList className="grid w-full grid-cols-6">
                <TabsTrigger value="description">Description</TabsTrigger>
                <TabsTrigger value="setup">Setup Guide</TabsTrigger>
                <TabsTrigger value="testing">Testing</TabsTrigger>
                <TabsTrigger value="analytics">Analytics</TabsTrigger>
                <TabsTrigger value="reviews">Reviews</TabsTrigger>
                <TabsTrigger value="changelog">Changelog</TabsTrigger>
              </TabsList>

              <TabsContent value="description" className="mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle>About This Agent</CardTitle>
                  </CardHeader>
                  <CardContent className="prose max-w-none">
                    <div className="whitespace-pre-line text-foreground">
                      {agent.longDescription}
                    </div>

                    <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <h4 className="font-semibold mb-3">Requirements</h4>
                        <ul className="space-y-1">
                          {agent.requirements.map((req, index) => (
                            <li key={`req-${req}`} className="flex items-center text-sm">
                              <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
                              {req}
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div>
                        <h4 className="font-semibold mb-3">Integrations</h4>
                        <div className="flex flex-wrap gap-2">
                          {agent.integrations.map((integration) => (
                            <Badge key={integration} variant="outline">
                              {integration}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="setup" className="mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Installation & Setup</CardTitle>
                    <CardDescription>
                      Follow these steps to get your agent up and running
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-4">
                      <div className="flex items-start space-x-3">
                        <div className="bg-blue-100 text-blue-600 rounded-full w-6 h-6 flex items-center justify-center text-sm font-semibold">1</div>
                        <div>
                          <h4 className="font-semibold">Download the Workflow</h4>
                          <p className="text-muted-foreground">Import the n8n workflow file into your workspace</p>
                        </div>
                      </div>
                      <div className="flex items-start space-x-3">
                        <div className="bg-blue-100 text-blue-600 rounded-full w-6 h-6 flex items-center justify-center text-sm font-semibold">2</div>
                        <div>
                          <h4 className="font-semibold">Configure API Keys</h4>
                          <p className="text-muted-foreground">Add your OpenAI API key and webhook endpoints</p>
                        </div>
                      </div>
                      <div className="flex items-start space-x-3">
                        <div className="bg-blue-100 text-blue-600 rounded-full w-6 h-6 flex items-center justify-center text-sm font-semibold">3</div>
                        <div>
                          <h4 className="font-semibold">Test the Integration</h4>
                          <p className="text-muted-foreground">Run a test to ensure everything is working correctly</p>
                        </div>
                      </div>
                    </div>

                    <div className="mt-6 space-y-3">
                      <Button className="w-full" variant="outline">
                        <FileText className="h-4 w-4 mr-2" />
                        View Full Documentation
                      </Button>
                      <Button className="w-full" variant="outline">
                        <Play className="h-4 w-4 mr-2" />
                        Watch Setup Video
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="testing" className="mt-6">
                <AgentTesting
                  agentId={agent.id.toString()}
                  agentName={agent.name}
                  onTestComplete={(results) => {
                    console.log('Test completed:', results);
                  }}
                />
              </TabsContent>

              <TabsContent value="analytics" className="mt-6">
                <AgentAnalytics
                  agentId={agent.id.toString()}
                  agentName={agent.name}
                />
              </TabsContent>

              <TabsContent value="reviews" className="mt-6">
                <ReviewsSection
                  agentId={agent.id.toString()}
                  agentName={agent.name}
                  reviews={mockReviews}
                  averageRating={agent.rating}
                  totalReviews={agent.reviews}
                />
              </TabsContent>

              <TabsContent value="changelog" className="mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Version History</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="border-l-2 border-blue-500 pl-4">
                        <div className="flex items-center space-x-2 mb-1">
                          <span className="font-semibold">v2.1.0</span>
                          <Badge variant="secondary">Latest</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">December 15, 2024</p>
                        <ul className="text-sm text-foreground space-y-1">
                          <li>• Added multi-language support</li>
                          <li>• Improved sentiment analysis accuracy</li>
                          <li>• Fixed webhook timeout issues</li>
                        </ul>
                      </div>
                      <div className="border-l-2 border-border pl-4">
                        <span className="font-semibold">v2.0.0</span>
                        <p className="text-sm text-muted-foreground mb-2">November 28, 2024</p>
                        <ul className="text-sm text-foreground space-y-1">
                          <li>• Complete workflow redesign</li>
                          <li>• Added escalation management</li>
                          <li>• New analytics dashboard</li>
                        </ul>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Purchase Card */}
            <Card className="sticky top-24">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-2xl">${agent.price}</CardTitle>
                  {agent.featured && (
                    <Badge className="bg-yellow-100 text-yellow-800">Featured</Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button className="w-full" size="lg">
                  <ShoppingCart className="h-4 w-4 mr-2" />
                  Purchase Agent
                </Button>
                <Button variant="outline" className="w-full">
                  <Eye className="h-4 w-4 mr-2" />
                  Live Demo
                </Button>

                <div className="text-center text-sm text-muted-foreground">
                  <p>✓ Instant download</p>
                  <p>✓ 30-day money-back guarantee</p>
                  <p>✓ Free updates for 1 year</p>
                </div>
              </CardContent>
            </Card>

            {/* Quick Info */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Info</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Category</span>
                  <span className="font-medium capitalize">{agent.category.replace('-', ' ')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Version</span>
                  <span className="font-medium">{agent.version}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Last Updated</span>
                  <span className="font-medium">{agent.lastUpdated}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Total Sales</span>
                  <span className="font-medium">{agent.totalPurchases}</span>
                </div>
              </CardContent>
            </Card>

            {/* Related Agents */}
            <Card>
              <CardHeader>
                <CardTitle>Related Agents</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-3">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="flex items-center space-x-3 p-2 rounded-lg hover:bg-muted cursor-pointer">
                      <div className="bg-blue-100 p-2 rounded-lg flex-shrink-0">
                        <Bot className="h-4 w-4 text-blue-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">Sales Bot Pro</p>
                        <p className="text-xs text-muted-foreground">$39</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
