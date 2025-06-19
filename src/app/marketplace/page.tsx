"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import Navigation from "@/components/Navigation";
import { useCartStore, mockAgentsData, searchAgents } from "@/lib/store";
import {
  Star,
  Bot,
  Zap,
  Shield,
  TrendingUp,
  Users,
  Search,
  Filter,
  Grid3x3,
  List,
  HeadphonesIcon,
  BarChart3,
  FileText,
  ShoppingCart,
  Mail,
  Calendar,
  Database,
  MessageSquare,
  Plus
} from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

// Mock data for agent categories
const agentCategories = [
  { id: "all", name: "All Categories", count: 2500 },
  { id: "customer-support", name: "Customer Support", count: 450, icon: HeadphonesIcon },
  { id: "sales", name: "Sales & Marketing", count: 380, icon: TrendingUp },
  { id: "analytics", name: "Data Analytics", count: 320, icon: BarChart3 },
  { id: "content", name: "Content Creation", count: 290, icon: FileText },
  { id: "ecommerce", name: "E-commerce", count: 250, icon: ShoppingCart },
  { id: "communication", name: "Communication", count: 220, icon: Mail },
  { id: "scheduling", name: "Scheduling", count: 180, icon: Calendar },
  { id: "database", name: "Database", count: 150, icon: Database },
  { id: "chat", name: "Chat & Messaging", count: 140, icon: MessageSquare },
];



export default function Marketplace() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [sortBy, setSortBy] = useState("popular");
  const [viewMode, setViewMode] = useState("grid");
  const [priceRange, setPriceRange] = useState([0, 1000] as [number, number]);
  const [ratingFilter, setRatingFilter] = useState(0);

  const { addItem } = useCartStore();

  // Convert price range string to numbers for the search function
  const getPriceRange = (range: string): [number, number] => {
    switch (range) {
      case "free": return [0, 0];
      case "under-25": return [0, 24];
      case "25-50": return [25, 50];
      case "over-50": return [51, 1000];
      default: return [0, 1000];
    }
  };

  const priceRangeString = priceRange[0] === 0 && priceRange[1] === 1000 ? "all" :
    priceRange[0] === 0 && priceRange[1] === 0 ? "free" :
    priceRange[0] === 0 && priceRange[1] === 24 ? "under-25" :
    priceRange[0] === 25 && priceRange[1] === 50 ? "25-50" :
    priceRange[0] === 51 && priceRange[1] === 1000 ? "over-50" : "all";

  const filteredAgents = searchAgents(
    mockAgentsData,
    searchQuery,
    selectedCategory,
    priceRange,
    ratingFilter,
    sortBy
  );

  const handleAddToCart = (agent: typeof mockAgentsData[0]) => {
    addItem({
      id: Math.random().toString(36).substring(7),
      agentId: agent.id,
      name: agent.name,
      price: agent.price,
      seller: agent.seller.name,
      image: agent.image,
    });
    toast.success(`${agent.name} added to cart!`);
  };

  const AgentCard = ({ agent, featured = false }: { agent: typeof mockAgentsData[0], featured?: boolean }) => (
    <Card className={`hover:shadow-lg transition-all duration-200 cursor-pointer group ${featured ? 'ring-2 ring-blue-200 dark:ring-blue-800' : ''}`}>
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          <div className="flex items-center space-x-2">
            <div className="bg-blue-100 p-2 rounded-lg">
              <Bot className="h-6 w-6 text-blue-600" />
            </div>
            {agent.verified && (
              <Shield className="h-4 w-4 text-green-600" />
            )}
            {featured && (
              <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                Featured
              </Badge>
            )}
          </div>
          <Badge variant="outline" className="font-semibold">
            ${agent.price}
          </Badge>
        </div>
        <CardTitle className="text-lg group-hover:text-blue-600 transition-colors">
          {agent.name}
        </CardTitle>
        <CardDescription className="line-clamp-2">
          {agent.description}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center space-x-1 mb-3">
          {[...Array(5)].map((_, i) => (
            <Star
              key={`rating-${agent.id}-${i}`}
              className={`h-4 w-4 ${i < Math.floor(agent.rating) ? 'fill-yellow-400 text-yellow-400' : 'text-muted-foreground'}`}
            />
          ))}
          <span className="text-sm text-muted-foreground ml-1">
            {agent.rating} ({agent.reviews})
          </span>
        </div>

        <div className="flex flex-wrap gap-1 mb-3">
          {agent.tags.slice(0, 3).map((tag) => (
            <Badge key={tag} variant="secondary" className="text-xs">
              {tag}
            </Badge>
          ))}
        </div>

        <div className="flex justify-between items-center gap-2">
          <p className="text-sm text-muted-foreground">by {agent.seller.name}</p>
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={(e) => {
                e.stopPropagation();
                handleAddToCart(agent);
              }}
            >
              <Plus className="h-4 w-4" />
            </Button>
            <Link href={`/agent/${agent.id}`}>
              <Button size="sm" className="hover:bg-blue-700">
                View Details
              </Button>
            </Link>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="min-h-screen bg-background">
      <Navigation
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        showSearch={true}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-2">AI Agent Marketplace</h1>
          <p className="text-xl text-muted-foreground">Discover intelligent automation solutions for your business</p>
        </div>

        {/* Search and Filters */}
        <div className="bg-card rounded-lg shadow-sm border p-6 mb-8">
          <div className="flex flex-col lg:flex-row gap-4 items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search agents, categories, or tags..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            <div className="flex gap-4">
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  {agentCategories.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name} ({category.count})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select
                value={priceRangeString}
                onValueChange={(value) => setPriceRange(getPriceRange(value))}
              >
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Price" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Prices</SelectItem>
                  <SelectItem value="free">Free</SelectItem>
                  <SelectItem value="under-25">Under $25</SelectItem>
                  <SelectItem value="25-50">$25 - $50</SelectItem>
                  <SelectItem value="over-50">Over $50</SelectItem>
                </SelectContent>
              </Select>

              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="popular">Most Popular</SelectItem>
                  <SelectItem value="newest">Newest</SelectItem>
                  <SelectItem value="price-low">Price: Low to High</SelectItem>
                  <SelectItem value="price-high">Price: High to Low</SelectItem>
                  <SelectItem value="rating">Highest Rated</SelectItem>
                </SelectContent>
              </Select>

              <div className="flex border rounded-lg">
                <Button
                  variant={viewMode === "grid" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setViewMode("grid")}
                  className="rounded-r-none"
                >
                  <Grid3x3 className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === "list" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setViewMode("list")}
                  className="rounded-l-none"
                >
                  <List className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>

        <div className="flex gap-8">
          {/* Sidebar - Categories */}
          <div className="hidden lg:block w-64 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Categories</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {agentCategories.map((category) => {
                  const IconComponent = category.icon;
                  return (
                    <button
                      key={category.id}
                      onClick={() => setSelectedCategory(category.id)}
                      className={`w-full flex items-center justify-between p-2 rounded-lg text-left hover:bg-muted transition-colors ${
                        selectedCategory === category.id ? 'bg-blue-50 text-blue-600' : 'text-foreground'
                      }`}
                    >
                      <div className="flex items-center space-x-2">
                        {IconComponent && <IconComponent className="h-4 w-4" />}
                        <span className="text-sm">{category.name}</span>
                      </div>
                      <span className="text-xs text-muted-foreground">{category.count}</span>
                    </button>
                  );
                })}
              </CardContent>
            </Card>

            {/* Featured Badge */}
            <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border-blue-200 dark:border-blue-800">
              <CardHeader>
                <CardTitle className="text-lg text-blue-900">Featured Agents</CardTitle>
                <CardDescription className="text-blue-700">
                  Hand-picked by our team for exceptional quality and performance.
                </CardDescription>
              </CardHeader>
            </Card>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            {/* Results Header */}
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-xl font-semibold text-foreground">
                  {filteredAgents.length} agents found
                </h2>
                <p className="text-muted-foreground">
                  {selectedCategory !== "all" &&
                    `in ${agentCategories.find(c => c.id === selectedCategory)?.name}`
                  }
                </p>
              </div>
            </div>

            {/* Featured Section */}
            {selectedCategory === "all" && (
              <div className="mb-8">
                <h3 className="text-2xl font-bold text-foreground mb-4">Featured Agents</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {mockAgentsData.filter(agent => agent.featured).slice(0, 3).map((agent) => (
                    <AgentCard key={agent.id} agent={agent} featured={true} />
                  ))}
                </div>
              </div>
            )}

            {/* Agent Grid */}
            <div className={viewMode === "grid"
              ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
              : "space-y-4"
            }>
              {filteredAgents.map((agent) => (
                <AgentCard key={agent.id} agent={agent} />
              ))}
            </div>

            {/* Empty State */}
            {filteredAgents.length === 0 && (
              <div className="text-center py-12">
                <Bot className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-foreground mb-2">No agents found</h3>
                <p className="text-muted-foreground mb-4">
                  Try adjusting your search criteria or browse different categories.
                </p>
                <Button onClick={() => {
                  setSearchQuery("");
                  setSelectedCategory("all");
                  setPriceRange([0, 1000]);
                  setRatingFilter(0);
                }}>
                  Clear Filters
                </Button>
              </div>
            )}

            {/* Load More */}
            {filteredAgents.length > 0 && (
              <div className="text-center mt-12">
                <Button variant="outline" size="lg">
                  Load More Agents
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
