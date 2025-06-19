"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Separator } from "@/components/ui/separator";
import {
  Search,
  Filter,
  Star,
  TrendingUp,
  Bot,
  Sparkles,
  Clock,
  Target,
  Users,
  ArrowRight,
  X,
  Loader2,
  RefreshCw
} from "lucide-react";

interface Agent {
  id: string;
  name: string;
  description: string;
  category: string;
  price: number;
  rating: number;
  image?: string;
  totalSales?: number;
  featured?: boolean;
  source?: string;
  score?: number;
}

interface SearchFilters {
  query: string;
  category?: string;
  minPrice: number;
  maxPrice: number;
  minRating: number;
  sortBy: string;
  featured: boolean;
  verified: boolean;
}

const categories = [
  'Customer Support',
  'Data Analysis',
  'Content Creation',
  'Sales Automation',
  'Marketing',
  'Workflow Automation',
  'Email Management',
  'Social Media'
];

const sortOptions = [
  { value: 'relevance', label: 'Most Relevant' },
  { value: 'rating', label: 'Highest Rated' },
  { value: 'price_asc', label: 'Price: Low to High' },
  { value: 'price_desc', label: 'Price: High to Low' },
  { value: 'sales', label: 'Most Popular' },
  { value: 'newest', label: 'Newest First' }
];

export default function AdvancedSearch() {
  const { data: session } = useSession();
  const [agents, setAgents] = useState<Agent[]>([]);
  const [recommendations, setRecommendations] = useState<Agent[]>([]);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [trending, setTrending] = useState<Agent[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [searchHistory, setSearchHistory] = useState<string[]>([]);

  const [filters, setFilters] = useState<SearchFilters>({
    query: '',
    category: '',
    minPrice: 0,
    maxPrice: 1000,
    minRating: 0,
    sortBy: 'relevance',
    featured: false,
    verified: false
  });

  // Debounced search function
  const debouncedSearch = useCallback(
    debounce((searchFilters: SearchFilters) => {
      performSearch(searchFilters);
    }, 500),
    []
  );

  useEffect(() => {
    // Load trending agents on component mount
    loadTrendingAgents();
    loadSearchHistory();
  }, []);

  useEffect(() => {
    if (filters.query.length > 2) {
      debouncedSearch(filters);
      generateSuggestions(filters.query);
    } else {
      setAgents([]);
      setSuggestions([]);
      setShowSuggestions(false);
    }
  }, [filters, debouncedSearch]);

  const performSearch = async (searchFilters: SearchFilters) => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      params.append('q', searchFilters.query);
      if (searchFilters.category) params.append('category', searchFilters.category);
      if (searchFilters.minPrice > 0) params.append('minPrice', searchFilters.minPrice.toString());
      if (searchFilters.maxPrice < 1000) params.append('maxPrice', searchFilters.maxPrice.toString());
      if (searchFilters.minRating > 0) params.append('minRating', searchFilters.minRating.toString());
      params.append('sortBy', searchFilters.sortBy);
      if (searchFilters.featured) params.append('featured', 'true');
      if (searchFilters.verified) params.append('verified', 'true');

      const response = await fetch(`/api/search/advanced?${params}`);
      const data = await response.json();

      setAgents(data.agents || []);
      setRecommendations(data.recommendations || []);
      setTrending(data.trending || []);

      // Add to search history
      if (searchFilters.query && !searchHistory.includes(searchFilters.query)) {
        const newHistory = [searchFilters.query, ...searchHistory.slice(0, 4)];
        setSearchHistory(newHistory);
        localStorage.setItem('searchHistory', JSON.stringify(newHistory));
      }

    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const generateSuggestions = async (query: string) => {
    try {
      const response = await fetch(`/api/search?q=${encodeURIComponent(query)}&limit=5`);
      const data = await response.json();
      setSuggestions(data.suggestions || []);
      setShowSuggestions(true);
    } catch (error) {
      console.error('Suggestions error:', error);
    }
  };

  const loadTrendingAgents = async () => {
    try {
      const response = await fetch('/api/search/advanced?trending=true&limit=6');
      const data = await response.json();
      setTrending(data.trending || []);
    } catch (error) {
      console.error('Trending error:', error);
    }
  };

  const loadSearchHistory = () => {
    try {
      const history = JSON.parse(localStorage.getItem('searchHistory') || '[]');
      setSearchHistory(history);
    } catch (error) {
      console.error('History error:', error);
    }
  };

  const handleSearch = (query: string) => {
    setFilters(prev => ({ ...prev, query }));
    setShowSuggestions(false);
  };

  const clearFilters = () => {
    setFilters({
      query: '',
      category: '',
      minPrice: 0,
      maxPrice: 1000,
      minRating: 0,
      sortBy: 'relevance',
      featured: false,
      verified: false
    });
    setAgents([]);
    setRecommendations([]);
  };

  const getSourceIcon = (source?: string) => {
    switch (source) {
      case 'content':
        return <Target className="h-3 w-3" />;
      case 'collaborative':
        return <Users className="h-3 w-3" />;
      case 'trending':
        return <TrendingUp className="h-3 w-3" />;
      default:
        return <Bot className="h-3 w-3" />;
    }
  };

  const getSourceLabel = (source?: string) => {
    switch (source) {
      case 'content':
        return 'Based on your preferences';
      case 'collaborative':
        return 'Users like you also bought';
      case 'trending':
        return 'Trending in your category';
      default:
        return 'Recommended';
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      {/* Search Header */}
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold text-gray-900">
          <Sparkles className="inline h-8 w-8 text-blue-600 mr-2" />
          AI-Powered Agent Search
        </h1>
        <p className="text-xl text-gray-600">
          Discover the perfect AI agents with intelligent recommendations
        </p>
      </div>

      {/* Search Bar */}
      <Card>
        <CardContent className="p-6">
          <div className="relative">
            <div className="flex items-center space-x-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search for AI agents, workflows, or capabilities..."
                  value={filters.query}
                  onChange={(e) => setFilters(prev => ({ ...prev, query: e.target.value }))}
                  onFocus={() => setShowSuggestions(true)}
                  className="pl-10 pr-4 py-3 text-lg"
                />
                {isLoading && (
                  <Loader2 className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 animate-spin text-blue-600" />
                )}
              </div>
              <Button size="lg" onClick={() => performSearch(filters)}>
                Search
              </Button>
            </div>

            {/* Search Suggestions */}
            {showSuggestions && (suggestions.length > 0 || searchHistory.length > 0) && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-card border rounded-lg shadow-lg z-50 max-h-60 overflow-y-auto">
                {suggestions.length > 0 && (
                  <div className="p-2">
                    <div className="text-xs font-semibold text-muted-foreground mb-2 px-2">Suggestions</div>
                    {suggestions.map((suggestion, index) => (
                      <button
                        key={`suggestion-${suggestion.slice(0, 20)}-${index}`}
                        onClick={() => handleSearch(suggestion)}
                        className="w-full text-left px-3 py-2 hover:bg-gray-50 rounded flex items-center space-x-2"
                      >
                        <Search className="h-3 w-3 text-gray-400" />
                        <span>{suggestion}</span>
                      </button>
                    ))}
                  </div>
                )}

                {searchHistory.length > 0 && (
                  <div className="p-2 border-t">
                    <div className="text-xs font-semibold text-muted-foreground mb-2 px-2">Recent Searches</div>
                    {searchHistory.map((term, index) => (
                      <button
                        key={`history-${term.slice(0, 20)}-${index}`}
                        onClick={() => handleSearch(term)}
                        className="w-full text-left px-3 py-2 hover:bg-gray-50 rounded flex items-center space-x-2"
                      >
                        <Clock className="h-3 w-3 text-gray-400" />
                        <span>{term}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Filter className="h-5 w-5 mr-2" />
            Advanced Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div>
              <label className="text-sm font-medium mb-2 block">Category</label>
              <Select value={filters.category} onValueChange={(value) => setFilters(prev => ({ ...prev, category: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Categories</SelectItem>
                  {categories.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Sort By</label>
              <Select value={filters.sortBy} onValueChange={(value) => setFilters(prev => ({ ...prev, sortBy: value }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {sortOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Price Range: ${filters.minPrice} - ${filters.maxPrice}</label>
              <div className="space-y-3">
                <Slider
                  value={[filters.minPrice, filters.maxPrice]}
                  onValueChange={([min, max]) => setFilters(prev => ({ ...prev, minPrice: min, maxPrice: max }))}
                  max={1000}
                  step={10}
                  className="w-full"
                />
              </div>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Minimum Rating</label>
              <div className="flex items-center space-x-2">
                <Slider
                  value={[filters.minRating]}
                  onValueChange={([rating]) => setFilters(prev => ({ ...prev, minRating: rating }))}
                  max={5}
                  step={0.5}
                  className="flex-1"
                />
                <span className="text-sm font-medium w-12">{filters.minRating}★</span>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={filters.featured}
                  onChange={(e) => setFilters(prev => ({ ...prev, featured: e.target.checked }))}
                  className="rounded"
                />
                <span className="text-sm">Featured Only</span>
              </label>
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={filters.verified}
                  onChange={(e) => setFilters(prev => ({ ...prev, verified: e.target.checked }))}
                  className="rounded"
                />
                <span className="text-sm">Verified Only</span>
              </label>
            </div>

            <div className="flex items-end">
              <Button variant="outline" onClick={clearFilters} className="w-full">
                <X className="h-4 w-4 mr-2" />
                Clear Filters
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Results */}
      <Tabs defaultValue="results" className="w-full">
        <TabsList>
          <TabsTrigger value="results">
            Search Results {agents.length > 0 && `(${agents.length})`}
          </TabsTrigger>
          <TabsTrigger value="recommendations">
            AI Recommendations {recommendations.length > 0 && `(${recommendations.length})`}
          </TabsTrigger>
          <TabsTrigger value="trending">
            Trending {trending.length > 0 && `(${trending.length})`}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="results" className="mt-6">
          {agents.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {agents.map((agent) => (
                <AgentCard key={agent.id} agent={agent} />
              ))}
            </div>
          ) : filters.query ? (
            <div className="text-center py-12">
              <Bot className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No agents found</h3>
              <p className="text-gray-600">Try adjusting your search terms or filters</p>
            </div>
          ) : (
            <div className="text-center py-12">
              <Search className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Start your search</h3>
              <p className="text-gray-600">Enter keywords to find the perfect AI agents</p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="recommendations" className="mt-6">
          {session ? (
            recommendations.length > 0 ? (
              <div className="space-y-6">
                <div className="flex items-center space-x-2 text-blue-600">
                  <Sparkles className="h-5 w-5" />
                  <span className="font-semibold">Personalized for you</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {recommendations.map((agent) => (
                    <AgentCard key={agent.id} agent={agent} showSource />
                  ))}
                </div>
              </div>
            ) : (
              <div className="text-center py-12">
                <Sparkles className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No recommendations yet</h3>
                <p className="text-gray-600">Make some purchases to get personalized recommendations</p>
              </div>
            )
          ) : (
            <div className="text-center py-12">
              <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Sign in for recommendations</h3>
              <p className="text-gray-600">Get personalized AI agent suggestions based on your preferences</p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="trending" className="mt-6">
          {trending.length > 0 ? (
            <div className="space-y-6">
              <div className="flex items-center space-x-2 text-orange-600">
                <TrendingUp className="h-5 w-5" />
                <span className="font-semibold">Popular this month</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {trending.map((agent) => (
                  <AgentCard key={agent.id} agent={agent} />
                ))}
              </div>
            </div>
          ) : (
            <div className="text-center py-12">
              <TrendingUp className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No trending data</h3>
              <p className="text-gray-600">Check back later for trending agents</p>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

// Agent Card Component
function AgentCard({ agent, showSource = false }: { agent: Agent; showSource?: boolean }) {
  return (
    <Card className="hover:shadow-lg transition-shadow cursor-pointer">
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h3 className="font-semibold text-lg mb-2 line-clamp-2">{agent.name}</h3>
            <p className="text-gray-600 text-sm line-clamp-3 mb-3">{agent.description}</p>
          </div>
          {agent.featured && (
            <Badge className="bg-yellow-100 text-yellow-800">Featured</Badge>
          )}
        </div>

        <div className="flex items-center justify-between mb-4">
          <Badge variant="outline">{agent.category}</Badge>
          <div className="flex items-center space-x-1">
            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
            <span className="text-sm font-medium">{agent.rating?.toFixed(1) || 'N/A'}</span>
          </div>
        </div>

        {showSource && agent.source && (
          <div className="flex items-center space-x-2 mb-3 text-xs text-muted-foreground">
            {getSourceIcon(agent.source)}
            <span>{getSourceLabel(agent.source)}</span>
            {agent.score && (
              <Badge variant="secondary" className="text-xs">
                {agent.score}% match
              </Badge>
            )}
          </div>
        )}

        <div className="flex items-center justify-between">
          <span className="text-2xl font-bold text-blue-600">${agent.price}</span>
          <Button size="sm">
            View Details
            <ArrowRight className="h-3 w-3 ml-1" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

// Utility function for debouncing
function debounce<T extends (...args: unknown[]) => unknown>(func: T, wait: number): T {
  let timeout: NodeJS.Timeout;
  return ((...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  }) as T;
}
