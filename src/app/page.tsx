import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Star, Bot, Zap, Shield, TrendingUp, Users, ArrowRight, Check } from "lucide-react";
import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Navigation */}
      <nav className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <Bot className="h-8 w-8 text-blue-600" />
              <span className="text-2xl font-bold text-gray-900">AgentStore</span>
            </div>
            <div className="hidden md:flex items-center space-x-8">
              <Link href="/marketplace" className="text-gray-600 hover:text-gray-900">Browse Agents</Link>
              <Link href="/sell" className="text-gray-600 hover:text-gray-900">Sell</Link>
              <Link href="/docs" className="text-gray-600 hover:text-gray-900">Documentation</Link>
              <Link href="/pricing" className="text-gray-600 hover:text-gray-900">Pricing</Link>
            </div>
            <div className="flex items-center space-x-4">
              <Button variant="ghost">Sign In</Button>
              <Button>Get Started</Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <Badge className="mb-4 bg-blue-100 text-blue-800 hover:bg-blue-100">
            🚀 The future of AI automation is here
          </Badge>
          <h1 className="text-5xl md:text-7xl font-bold text-gray-900 mb-6">
            The <span className="text-blue-600">Marketplace</span> for
            <br />AI Agents & Automation
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Discover, buy, and sell intelligent AI agents. From customer support bots to data analysis workflows -
            find the perfect automation solution for your business or monetize your AI expertise.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Button size="lg" className="text-lg px-8 py-6">
              Browse Marketplace <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <Button size="lg" variant="outline" className="text-lg px-8 py-6">
              Start Selling
            </Button>
          </div>

          {/* Hero Image/Dashboard Preview */}
          <div className="relative mx-auto max-w-5xl">
            <div className="bg-white rounded-2xl shadow-2xl p-8 border">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Sample Agent Cards */}
                <Card className="border-2 border-dashed border-gray-200 hover:border-blue-300 transition-colors">
                  <CardHeader className="pb-3">
                    <div className="flex justify-between items-start">
                      <div className="bg-blue-100 p-2 rounded-lg">
                        <Bot className="h-6 w-6 text-blue-600" />
                      </div>
                      <Badge variant="secondary">$29</Badge>
                    </div>
                    <CardTitle className="text-lg">Customer Support AI</CardTitle>
                    <CardDescription>24/7 intelligent customer service automation</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center space-x-1 mb-2">
                      {[...Array(5)].map((_, i) => (
                        <Star key={`star-1-${i}`} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      ))}
                      <span className="text-sm text-gray-500 ml-1">(124)</span>
                    </div>
                    <p className="text-sm text-gray-500">by AutomationPro</p>
                  </CardContent>
                </Card>

                <Card className="border-2 border-dashed border-gray-200 hover:border-blue-300 transition-colors">
                  <CardHeader className="pb-3">
                    <div className="flex justify-between items-start">
                      <div className="bg-green-100 p-2 rounded-lg">
                        <TrendingUp className="h-6 w-6 text-green-600" />
                      </div>
                      <Badge variant="secondary">$49</Badge>
                    </div>
                    <CardTitle className="text-lg">Sales Analytics Bot</CardTitle>
                    <CardDescription>Real-time sales data analysis and insights</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center space-x-1 mb-2">
                      {[...Array(5)].map((_, i) => (
                        <Star key={`star-2-${i}`} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      ))}
                      <span className="text-sm text-gray-500 ml-1">(89)</span>
                    </div>
                    <p className="text-sm text-gray-500">by DataWizard</p>
                  </CardContent>
                </Card>

                <Card className="border-2 border-dashed border-gray-200 hover:border-blue-300 transition-colors">
                  <CardHeader className="pb-3">
                    <div className="flex justify-between items-start">
                      <div className="bg-purple-100 p-2 rounded-lg">
                        <Zap className="h-6 w-6 text-purple-600" />
                      </div>
                      <Badge variant="secondary">$19</Badge>
                    </div>
                    <CardTitle className="text-lg">Content Creator</CardTitle>
                    <CardDescription>Automated blog posts and social media content</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center space-x-1 mb-2">
                      {[...Array(4)].map((_, i) => (
                        <Star key={`star-3-${i}`} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      ))}
                      <Star className="h-4 w-4 text-gray-300" />
                      <span className="text-sm text-gray-500 ml-1">(67)</span>
                    </div>
                    <p className="text-sm text-gray-500">by ContentAI</p>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Why Choose AgentStore?
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              The most trusted platform for AI automation solutions
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <div className="bg-blue-100 p-3 rounded-lg w-fit">
                  <Shield className="h-8 w-8 text-blue-600" />
                </div>
                <CardTitle className="text-xl">Secure & Trusted</CardTitle>
                <CardDescription>
                  All agents are verified and tested. Secure payments with buyer protection.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-0 shadow-lg">
              <CardHeader>
                <div className="bg-green-100 p-3 rounded-lg w-fit">
                  <Zap className="h-8 w-8 text-green-600" />
                </div>
                <CardTitle className="text-xl">Instant Deployment</CardTitle>
                <CardDescription>
                  One-click installation and setup. Get your agents running in minutes.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-0 shadow-lg">
              <CardHeader>
                <div className="bg-purple-100 p-3 rounded-lg w-fit">
                  <Users className="h-8 w-8 text-purple-600" />
                </div>
                <CardTitle className="text-xl">Expert Community</CardTitle>
                <CardDescription>
                  Learn from top automation experts and get support from our community.
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold text-blue-600 mb-2">2,500+</div>
              <div className="text-gray-600">AI Agents</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-green-600 mb-2">50K+</div>
              <div className="text-gray-600">Active Users</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-purple-600 mb-2">98%</div>
              <div className="text-gray-600">Success Rate</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-orange-600 mb-2">$2M+</div>
              <div className="text-gray-600">Total Sales</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-blue-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold text-white mb-4">
            Ready to Automate Your Business?
          </h2>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Join thousands of businesses already using AI agents to streamline operations and boost productivity.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" variant="secondary" className="text-lg px-8 py-6">
              Browse Marketplace
            </Button>
            <Button size="lg" variant="outline" className="text-lg px-8 py-6 border-white text-white hover:bg-white hover:text-blue-600">
              Start Selling Today
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <Bot className="h-8 w-8 text-blue-400" />
                <span className="text-2xl font-bold">AgentStore</span>
              </div>
              <p className="text-gray-400">
                The premier marketplace for AI agents and automation solutions.
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Marketplace</h3>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="/browse" className="hover:text-white">Browse Agents</Link></li>
                <li><Link href="/categories" className="hover:text-white">Categories</Link></li>
                <li><Link href="/featured" className="hover:text-white">Featured</Link></li>
                <li><Link href="/new" className="hover:text-white">New Arrivals</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Sellers</h3>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="/sell" className="hover:text-white">Start Selling</Link></li>
                <li><Link href="/seller-guide" className="hover:text-white">Seller Guide</Link></li>
                <li><Link href="/pricing" className="hover:text-white">Pricing</Link></li>
                <li><Link href="/analytics" className="hover:text-white">Analytics</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Support</h3>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="/help" className="hover:text-white">Help Center</Link></li>
                <li><Link href="/docs" className="hover:text-white">Documentation</Link></li>
                <li><Link href="/contact" className="hover:text-white">Contact Us</Link></li>
                <li><Link href="/api" className="hover:text-white">API</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2025 AgentStore. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
