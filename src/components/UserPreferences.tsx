"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import {
  Settings,
  Bell,
  Palette,
  Filter,
  Brain,
  Globe,
  DollarSign,
  Star,
  Zap,
  User,
  Eye,
  Mail,
  Save,
  RefreshCw,
  Sparkles
} from "lucide-react";

interface UserPreferences {
  id?: string;
  // Browsing preferences
  preferredCategories: string[];
  priceRange: { min: number; max: number };
  ratingThreshold: number;

  // Interface preferences
  theme: string;
  language: string;
  currency: string;
  itemsPerPage: number;
  defaultSortBy: string;
  showFeaturedFirst: boolean;

  // Notification preferences
  emailNotifications: boolean;
  pushNotifications: boolean;
  marketingEmails: boolean;
  weeklyDigest: boolean;
  priceDropAlerts: boolean;
  newAgentAlerts: boolean;

  // Content preferences
  showAdultContent: boolean;
  preferredContentType: string[];
  expertise: string;
  usageType: string;

  // AI-driven preferences
  interestProfile?: object;
  behaviorPattern?: object;
  recommendationWeights?: object;
}

const categories = [
  "Customer Support",
  "Data Analysis",
  "Content Creation",
  "Sales Automation",
  "Marketing",
  "Development Tools",
  "Finance",
  "HR & Recruitment",
  "Project Management",
  "E-commerce"
];

const contentTypes = [
  "Chatbots",
  "Analytics Tools",
  "Writing Assistants",
  "Image Generators",
  "Code Assistants",
  "Voice Assistants",
  "Automation Scripts",
  "Data Processors"
];

const languages = [
  { code: "en", name: "English" },
  { code: "es", name: "Spanish" },
  { code: "fr", name: "French" },
  { code: "de", name: "German" },
  { code: "ja", name: "Japanese" },
  { code: "zh", name: "Chinese" }
];

const currencies = [
  { code: "USD", name: "US Dollar", symbol: "$" },
  { code: "EUR", name: "Euro", symbol: "€" },
  { code: "GBP", name: "British Pound", symbol: "£" },
  { code: "JPY", name: "Japanese Yen", symbol: "¥" }
];

const themes = [
  { value: "light", name: "Light", icon: "☀️" },
  { value: "dark", name: "Dark", icon: "🌙" },
  { value: "auto", name: "Auto", icon: "🔄" }
];

export default function UserPreferences() {
  const { data: session } = useSession();
  const [preferences, setPreferences] = useState<UserPreferences>({
    preferredCategories: [],
    priceRange: { min: 0, max: 1000 },
    ratingThreshold: 0,
    theme: "light",
    language: "en",
    currency: "USD",
    itemsPerPage: 12,
    defaultSortBy: "relevance",
    showFeaturedFirst: true,
    emailNotifications: true,
    pushNotifications: true,
    marketingEmails: false,
    weeklyDigest: true,
    priceDropAlerts: true,
    newAgentAlerts: false,
    showAdultContent: false,
    preferredContentType: [],
    expertise: "all",
    usageType: "business"
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (session?.user?.id) {
      fetchPreferences();
    }
  }, [session]);

  const fetchPreferences = async () => {
    try {
      const response = await fetch("/api/profile/preferences");
      if (response.ok) {
        const data = await response.json();
        if (data.preferences) {
          setPreferences({
            ...preferences,
            ...data.preferences,
            preferredCategories: data.preferences.preferredCategories || [],
            priceRange: data.preferences.priceRange || { min: 0, max: 1000 },
            preferredContentType: data.preferences.preferredContentType || []
          });
        }
      }
    } catch (error) {
      console.error("Failed to fetch preferences:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const savePreferences = async () => {
    if (!session?.user?.id) return;

    setIsSaving(true);
    try {
      const response = await fetch("/api/profile/preferences", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(preferences),
      });

      if (response.ok) {
        toast.success("Preferences saved successfully!");
      } else {
        throw new Error("Failed to save preferences");
      }
    } catch (error) {
      console.error("Error saving preferences:", error);
      toast.error("Failed to save preferences. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleCategoryToggle = (category: string) => {
    setPreferences(prev => ({
      ...prev,
      preferredCategories: prev.preferredCategories.includes(category)
        ? prev.preferredCategories.filter(c => c !== category)
        : [...prev.preferredCategories, category]
    }));
  };

  const handleContentTypeToggle = (contentType: string) => {
    setPreferences(prev => ({
      ...prev,
      preferredContentType: prev.preferredContentType.includes(contentType)
        ? prev.preferredContentType.filter(c => c !== contentType)
        : [...prev.preferredContentType, contentType]
    }));
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <RefreshCw className="h-8 w-8 animate-spin text-blue-600" />
        <span className="ml-2 text-lg">Loading preferences...</span>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">User Preferences</h1>
          <p className="text-gray-600">Customize your marketplace experience</p>
        </div>
        <Button onClick={savePreferences} disabled={isSaving}>
          {isSaving ? (
            <>
              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="h-4 w-4 mr-2" />
              Save Changes
            </>
          )}
        </Button>
      </div>

      <Tabs defaultValue="browsing" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="browsing" className="flex items-center gap-2">
            <Filter className="h-4 w-4" />
            Browsing
          </TabsTrigger>
          <TabsTrigger value="interface" className="flex items-center gap-2">
            <Palette className="h-4 w-4" />
            Interface
          </TabsTrigger>
          <TabsTrigger value="notifications" className="flex items-center gap-2">
            <Bell className="h-4 w-4" />
            Notifications
          </TabsTrigger>
          <TabsTrigger value="content" className="flex items-center gap-2">
            <Eye className="h-4 w-4" />
            Content
          </TabsTrigger>
          <TabsTrigger value="ai" className="flex items-center gap-2">
            <Brain className="h-4 w-4" />
            AI & Personalization
          </TabsTrigger>
        </TabsList>

        {/* Browsing Preferences */}
        <TabsContent value="browsing" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Filter className="h-5 w-5" />
                  Preferred Categories
                </CardTitle>
                <CardDescription>
                  Select categories you're most interested in
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-2">
                  {categories.map((category) => (
                    <div key={category} className="flex items-center space-x-2">
                      <Checkbox
                        id={category}
                        checked={preferences.preferredCategories.includes(category)}
                        onCheckedChange={() => handleCategoryToggle(category)}
                      />
                      <label
                        htmlFor={category}
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        {category}
                      </label>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5" />
                  Price Range
                </CardTitle>
                <CardDescription>
                  Set your preferred price range for agents
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label className="text-sm font-medium">
                    Price Range: ${preferences.priceRange.min} - ${preferences.priceRange.max}
                  </Label>
                  <div className="mt-2 space-y-2">
                    <div>
                      <Label htmlFor="min-price" className="text-xs text-gray-600">
                        Minimum Price
                      </Label>
                      <Slider
                        id="min-price"
                        min={0}
                        max={500}
                        step={5}
                        value={[preferences.priceRange.min]}
                        onValueChange={(value) =>
                          setPreferences(prev => ({
                            ...prev,
                            priceRange: { ...prev.priceRange, min: value[0] }
                          }))
                        }
                        className="w-full"
                      />
                    </div>
                    <div>
                      <Label htmlFor="max-price" className="text-xs text-gray-600">
                        Maximum Price
                      </Label>
                      <Slider
                        id="max-price"
                        min={10}
                        max={1000}
                        step={10}
                        value={[preferences.priceRange.max]}
                        onValueChange={(value) =>
                          setPreferences(prev => ({
                            ...prev,
                            priceRange: { ...prev.priceRange, max: value[0] }
                          }))
                        }
                        className="w-full"
                      />
                    </div>
                  </div>
                </div>

                <Separator />

                <div>
                  <Label className="text-sm font-medium mb-2 block">
                    Minimum Rating: {preferences.ratingThreshold} stars
                  </Label>
                  <Slider
                    min={0}
                    max={5}
                    step={0.5}
                    value={[preferences.ratingThreshold]}
                    onValueChange={(value) =>
                      setPreferences(prev => ({
                        ...prev,
                        ratingThreshold: value[0]
                      }))
                    }
                    className="w-full"
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Interface Preferences */}
        <TabsContent value="interface" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Palette className="h-5 w-5" />
                  Appearance
                </CardTitle>
                <CardDescription>
                  Customize the look and feel of the interface
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="theme" className="text-sm font-medium">Theme</Label>
                  <Select
                    value={preferences.theme}
                    onValueChange={(value) =>
                      setPreferences(prev => ({ ...prev, theme: value }))
                    }
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select theme" />
                    </SelectTrigger>
                    <SelectContent>
                      {themes.map((theme) => (
                        <SelectItem key={theme.value} value={theme.value}>
                          {theme.icon} {theme.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="language" className="text-sm font-medium">Language</Label>
                  <Select
                    value={preferences.language}
                    onValueChange={(value) =>
                      setPreferences(prev => ({ ...prev, language: value }))
                    }
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select language" />
                    </SelectTrigger>
                    <SelectContent>
                      {languages.map((lang) => (
                        <SelectItem key={lang.code} value={lang.code}>
                          {lang.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="currency" className="text-sm font-medium">Currency</Label>
                  <Select
                    value={preferences.currency}
                    onValueChange={(value) =>
                      setPreferences(prev => ({ ...prev, currency: value }))
                    }
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select currency" />
                    </SelectTrigger>
                    <SelectContent>
                      {currencies.map((currency) => (
                        <SelectItem key={currency.code} value={currency.code}>
                          {currency.symbol} {currency.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  Display Options
                </CardTitle>
                <CardDescription>
                  Configure how content is displayed
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="items-per-page" className="text-sm font-medium">
                    Items per page: {preferences.itemsPerPage}
                  </Label>
                  <Slider
                    min={6}
                    max={48}
                    step={6}
                    value={[preferences.itemsPerPage]}
                    onValueChange={(value) =>
                      setPreferences(prev => ({ ...prev, itemsPerPage: value[0] }))
                    }
                    className="w-full mt-2"
                  />
                </div>

                <div>
                  <Label htmlFor="sort-by" className="text-sm font-medium">Default Sort By</Label>
                  <Select
                    value={preferences.defaultSortBy}
                    onValueChange={(value) =>
                      setPreferences(prev => ({ ...prev, defaultSortBy: value }))
                    }
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select default sort" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="relevance">Relevance</SelectItem>
                      <SelectItem value="price_low">Price: Low to High</SelectItem>
                      <SelectItem value="price_high">Price: High to Low</SelectItem>
                      <SelectItem value="rating">Highest Rated</SelectItem>
                      <SelectItem value="newest">Newest First</SelectItem>
                      <SelectItem value="popular">Most Popular</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="featured-first"
                    checked={preferences.showFeaturedFirst}
                    onCheckedChange={(checked) =>
                      setPreferences(prev => ({ ...prev, showFeaturedFirst: checked }))
                    }
                  />
                  <Label htmlFor="featured-first" className="text-sm font-medium">
                    Show featured agents first
                  </Label>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Notification Preferences */}
        <TabsContent value="notifications" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="h-5 w-5" />
                  General Notifications
                </CardTitle>
                <CardDescription>
                  Manage how you receive notifications
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="email-notifications"
                    checked={preferences.emailNotifications}
                    onCheckedChange={(checked) =>
                      setPreferences(prev => ({ ...prev, emailNotifications: checked }))
                    }
                  />
                  <div>
                    <Label htmlFor="email-notifications" className="text-sm font-medium">
                      Email Notifications
                    </Label>
                    <p className="text-xs text-gray-600">
                      Receive order updates and important notifications via email
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="push-notifications"
                    checked={preferences.pushNotifications}
                    onCheckedChange={(checked) =>
                      setPreferences(prev => ({ ...prev, pushNotifications: checked }))
                    }
                  />
                  <div>
                    <Label htmlFor="push-notifications" className="text-sm font-medium">
                      Push Notifications
                    </Label>
                    <p className="text-xs text-gray-600">
                      Get instant notifications in your browser
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="weekly-digest"
                    checked={preferences.weeklyDigest}
                    onCheckedChange={(checked) =>
                      setPreferences(prev => ({ ...prev, weeklyDigest: checked }))
                    }
                  />
                  <div>
                    <Label htmlFor="weekly-digest" className="text-sm font-medium">
                      Weekly Digest
                    </Label>
                    <p className="text-xs text-gray-600">
                      Summary of new agents and updates each week
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Mail className="h-5 w-5" />
                  Marketing & Alerts
                </CardTitle>
                <CardDescription>
                  Customize marketing emails and price alerts
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="marketing-emails"
                    checked={preferences.marketingEmails}
                    onCheckedChange={(checked) =>
                      setPreferences(prev => ({ ...prev, marketingEmails: checked }))
                    }
                  />
                  <div>
                    <Label htmlFor="marketing-emails" className="text-sm font-medium">
                      Marketing Emails
                    </Label>
                    <p className="text-xs text-gray-600">
                      Promotional content and featured agent spotlights
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="price-drop-alerts"
                    checked={preferences.priceDropAlerts}
                    onCheckedChange={(checked) =>
                      setPreferences(prev => ({ ...prev, priceDropAlerts: checked }))
                    }
                  />
                  <div>
                    <Label htmlFor="price-drop-alerts" className="text-sm font-medium">
                      Price Drop Alerts
                    </Label>
                    <p className="text-xs text-gray-600">
                      Get notified when agents in your watchlist go on sale
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="new-agent-alerts"
                    checked={preferences.newAgentAlerts}
                    onCheckedChange={(checked) =>
                      setPreferences(prev => ({ ...prev, newAgentAlerts: checked }))
                    }
                  />
                  <div>
                    <Label htmlFor="new-agent-alerts" className="text-sm font-medium">
                      New Agent Alerts
                    </Label>
                    <p className="text-xs text-gray-600">
                      Be the first to know about new agents in your categories
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Content Preferences */}
        <TabsContent value="content" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Eye className="h-5 w-5" />
                  Content Types
                </CardTitle>
                <CardDescription>
                  Select the types of AI agents you're interested in
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-2">
                  {contentTypes.map((contentType) => (
                    <div key={contentType} className="flex items-center space-x-2">
                      <Checkbox
                        id={contentType}
                        checked={preferences.preferredContentType.includes(contentType)}
                        onCheckedChange={() => handleContentTypeToggle(contentType)}
                      />
                      <label
                        htmlFor={contentType}
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        {contentType}
                      </label>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  User Profile
                </CardTitle>
                <CardDescription>
                  Help us understand your needs better
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="expertise" className="text-sm font-medium">Expertise Level</Label>
                  <Select
                    value={preferences.expertise}
                    onValueChange={(value) =>
                      setPreferences(prev => ({ ...prev, expertise: value }))
                    }
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select expertise level" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="beginner">Beginner</SelectItem>
                      <SelectItem value="intermediate">Intermediate</SelectItem>
                      <SelectItem value="advanced">Advanced</SelectItem>
                      <SelectItem value="all">Show All Levels</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="usage-type" className="text-sm font-medium">Primary Usage</Label>
                  <Select
                    value={preferences.usageType}
                    onValueChange={(value) =>
                      setPreferences(prev => ({ ...prev, usageType: value }))
                    }
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select usage type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="personal">Personal Use</SelectItem>
                      <SelectItem value="business">Business Use</SelectItem>
                      <SelectItem value="both">Both Personal & Business</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="adult-content"
                    checked={preferences.showAdultContent}
                    onCheckedChange={(checked) =>
                      setPreferences(prev => ({ ...prev, showAdultContent: checked }))
                    }
                  />
                  <div>
                    <Label htmlFor="adult-content" className="text-sm font-medium">
                      Show Adult Content
                    </Label>
                    <p className="text-xs text-gray-600">
                      Include mature or adult-oriented content in search results
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* AI & Personalization */}
        <TabsContent value="ai" className="mt-6">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Brain className="h-5 w-5" />
                  AI-Powered Personalization
                </CardTitle>
                <CardDescription>
                  Let our AI learn your preferences to provide better recommendations
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-4 border rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Sparkles className="h-5 w-5 text-purple-600" />
                      <h4 className="font-medium">Smart Recommendations</h4>
                    </div>
                    <p className="text-sm text-gray-600">
                      AI analyzes your browsing and purchase history to suggest relevant agents
                    </p>
                  </div>

                  <div className="p-4 border rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Zap className="h-5 w-5 text-blue-600" />
                      <h4 className="font-medium">Adaptive Interface</h4>
                    </div>
                    <p className="text-sm text-gray-600">
                      Interface adapts based on your most-used features and preferences
                    </p>
                  </div>

                  <div className="p-4 border rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Star className="h-5 w-5 text-yellow-600" />
                      <h4 className="font-medium">Quality Predictions</h4>
                    </div>
                    <p className="text-sm text-gray-600">
                      AI predicts which agents you'll find most useful based on your pattern
                    </p>
                  </div>
                </div>

                {preferences.interestProfile && (
                  <div className="mt-6">
                    <h4 className="font-medium mb-3">Your Interest Profile</h4>
                    <div className="flex flex-wrap gap-2">
                      {Object.entries(preferences.interestProfile).map(([interest, score]) => (
                        <Badge key={interest} variant="secondary">
                          {interest}: {typeof score === 'number' ? Math.round(score * 100) : score}%
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                  <p className="text-sm text-blue-800">
                    <strong>Privacy Note:</strong> All AI learning happens locally and respects your privacy.
                    You can clear your profile data at any time from your account settings.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      <div className="flex justify-end">
        <Button onClick={savePreferences} disabled={isSaving} size="lg">
          {isSaving ? (
            <>
              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              Saving Preferences...
            </>
          ) : (
            <>
              <Save className="h-4 w-4 mr-2" />
              Save All Preferences
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
