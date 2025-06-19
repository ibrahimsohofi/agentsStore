"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import {
  Play,
  CheckCircle,
  AlertTriangle,
  X,
  Clock,
  Code,
  Shield,
  Zap,
  Target,
  Settings,
  FileText,
  Download,
  Upload,
  RotateCcw,
  BarChart3,
  Bug
} from "lucide-react";

interface TestResult {
  id: string;
  testType: string;
  status: 'passed' | 'failed' | 'warning' | 'running';
  message: string;
  score?: number;
  details?: string;
  timestamp: string;
}

interface AgentTest {
  id: string;
  agentId: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  overallScore: number;
  results: TestResult[];
  createdAt: string;
  completedAt?: string;
  sandboxUrl?: string;
}

interface AgentTestingProps {
  agentId: string;
  agentName: string;
  onTestComplete?: (results: AgentTest) => void;
}

const testCategories = [
  {
    id: 'security',
    name: 'Security Checks',
    icon: Shield,
    tests: [
      'Input validation',
      'SQL injection protection',
      'XSS prevention',
      'API security',
      'Data encryption'
    ]
  },
  {
    id: 'performance',
    name: 'Performance Tests',
    icon: Zap,
    tests: [
      'Response time',
      'Memory usage',
      'CPU efficiency',
      'Concurrent requests',
      'Load testing'
    ]
  },
  {
    id: 'functionality',
    name: 'Functionality Tests',
    icon: Target,
    tests: [
      'Core features',
      'Error handling',
      'Integration tests',
      'API endpoints',
      'Data processing'
    ]
  },
  {
    id: 'quality',
    name: 'Code Quality',
    icon: Code,
    tests: [
      'Code structure',
      'Documentation',
      'Best practices',
      'Maintainability',
      'Dependencies'
    ]
  }
];

export default function AgentTesting({ agentId, agentName, onTestComplete }: AgentTestingProps) {
  const { data: session } = useSession();
  const [currentTest, setCurrentTest] = useState<AgentTest | null>(null);
  const [testHistory, setTestHistory] = useState<AgentTest[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [selectedTestTypes, setSelectedTestTypes] = useState<string[]>(['security', 'performance', 'functionality', 'quality']);
  const [sandboxMode, setSandboxMode] = useState(false);
  const [testConfig, setTestConfig] = useState({
    timeout: 300,
    concurrent: 10,
    iterations: 100
  });

  const fetchTestHistory = useCallback(async () => {
    try {
      const response = await fetch(`/api/agents/${agentId}/tests`);
      if (response.ok) {
        const tests = await response.json();
        setTestHistory(tests);
        if (tests.length > 0) {
          setCurrentTest(tests[0]);
        }
      }
    } catch (error) {
      console.error('Failed to fetch test history:', error);
    }
  }, [agentId]);

  const runTests = async () => {
    if (!session?.user) return;

    setIsRunning(true);
    try {
      const response = await fetch(`/api/agents/${agentId}/test`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          testTypes: selectedTestTypes,
          sandboxMode,
          config: testConfig
        }),
      });

      if (response.ok) {
        const testResult = await response.json();
        setCurrentTest(testResult);

        // Poll for test completion
        pollTestStatus(testResult.id);
      }
    } catch (error) {
      console.error('Failed to start tests:', error);
    } finally {
      setIsRunning(false);
    }
  };

  const pollTestStatus = async (testId: string) => {
    const pollInterval = setInterval(async () => {
      try {
        const response = await fetch(`/api/agents/${agentId}/tests/${testId}`);
        if (response.ok) {
          const updatedTest = await response.json();
          setCurrentTest(updatedTest);

          if (updatedTest.status === 'completed' || updatedTest.status === 'failed') {
            clearInterval(pollInterval);
            fetchTestHistory();
            if (onTestComplete) {
              onTestComplete(updatedTest);
            }
          }
        }
      } catch (error) {
        console.error('Failed to poll test status:', error);
        clearInterval(pollInterval);
      }
    }, 2000);

    // Clean up after 10 minutes
    setTimeout(() => clearInterval(pollInterval), 600000);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'passed':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'failed':
        return <X className="h-4 w-4 text-red-600" />;
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-yellow-600" />;
      case 'running':
        return <Clock className="h-4 w-4 text-blue-600 animate-spin" />;
      default:
        return <Clock className="h-4 w-4 text-gray-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'passed':
        return 'bg-green-50 border-green-200 text-green-800';
      case 'failed':
        return 'bg-red-50 border-red-200 text-red-800';
      case 'warning':
        return 'bg-yellow-50 border-yellow-200 text-yellow-800';
      case 'running':
        return 'bg-blue-50 border-blue-200 text-blue-800';
      default:
        return 'bg-gray-50 border-gray-200 text-gray-800';
    }
  };

  useEffect(() => {
    fetchTestHistory();
  }, [fetchTestHistory]);

  return (
    <div className="space-y-6">
      {/* Test Control Panel */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Bug className="h-5 w-5 mr-2" />
            Agent Testing & Verification
          </CardTitle>
          <CardDescription>
            Comprehensive testing suite for {agentName} with automated quality checks
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {/* Test Configuration */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Test Categories</label>
                <div className="space-y-2">
                  {testCategories.map((category) => (
                    <label key={category.id} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={selectedTestTypes.includes(category.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedTestTypes(prev => [...prev, category.id]);
                          } else {
                            setSelectedTestTypes(prev => prev.filter(t => t !== category.id));
                          }
                        }}
                        className="rounded"
                      />
                      <span className="text-sm">{category.name}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Timeout (seconds)</label>
                  <Input
                    type="number"
                    value={testConfig.timeout}
                    onChange={(e) => setTestConfig(prev => ({ ...prev, timeout: Number(e.target.value) }))}
                    min="60"
                    max="600"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Concurrent Requests</label>
                  <Input
                    type="number"
                    value={testConfig.concurrent}
                    onChange={(e) => setTestConfig(prev => ({ ...prev, concurrent: Number(e.target.value) }))}
                    min="1"
                    max="100"
                  />
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Test Iterations</label>
                  <Input
                    type="number"
                    value={testConfig.iterations}
                    onChange={(e) => setTestConfig(prev => ({ ...prev, iterations: Number(e.target.value) }))}
                    min="10"
                    max="1000"
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="sandbox"
                    checked={sandboxMode}
                    onChange={(e) => setSandboxMode(e.target.checked)}
                    className="rounded"
                  />
                  <label htmlFor="sandbox" className="text-sm font-medium">
                    Sandbox Mode
                  </label>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center space-x-4">
              <Button
                onClick={runTests}
                disabled={isRunning || selectedTestTypes.length === 0}
                className="flex items-center"
              >
                {isRunning ? (
                  <Clock className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Play className="h-4 w-4 mr-2" />
                )}
                {isRunning ? 'Running Tests...' : 'Start Testing'}
              </Button>

              <Button variant="outline" onClick={fetchTestHistory}>
                <RotateCcw className="h-4 w-4 mr-2" />
                Refresh
              </Button>

              {currentTest?.sandboxUrl && (
                <Button variant="outline" asChild>
                  <a href={currentTest.sandboxUrl} target="_blank" rel="noopener noreferrer">
                    <Settings className="h-4 w-4 mr-2" />
                    Open Sandbox
                  </a>
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Current Test Results */}
      {currentTest && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Current Test Results</CardTitle>
              <div className="flex items-center space-x-2">
                <Badge className={getStatusColor(currentTest.status)}>
                  {currentTest.status.toUpperCase()}
                </Badge>
                <span className="text-sm text-gray-600">
                  Score: {currentTest.overallScore}/100
                </span>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {/* Overall Progress */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">Overall Progress</span>
                  <span className="text-sm text-gray-600">{currentTest.overallScore}%</span>
                </div>
                <Progress value={currentTest.overallScore} className="h-2" />
              </div>

              {/* Test Categories */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {testCategories.map((category) => {
                  const categoryResults = currentTest.results.filter(r =>
                    r.testType.toLowerCase().includes(category.id)
                  );

                  if (categoryResults.length === 0) return null;

                  const categoryScore = categoryResults.reduce((sum, r) => sum + (r.score || 0), 0) / categoryResults.length;
                  const Icon = category.icon;

                  return (
                    <Card key={category.id} className="border-l-4 border-l-blue-500">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-lg flex items-center">
                          <Icon className="h-5 w-5 mr-2" />
                          {category.name}
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium">Category Score</span>
                            <span className="text-sm">{Math.round(categoryScore)}/100</span>
                          </div>
                          <Progress value={categoryScore} className="h-1.5" />

                          <div className="space-y-2">
                            {categoryResults.map((result) => (
                              <div key={result.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                                <div className="flex items-center space-x-2">
                                  {getStatusIcon(result.status)}
                                  <span className="text-sm">{result.message}</span>
                                </div>
                                {result.score && (
                                  <span className="text-sm font-medium">{result.score}/100</span>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>

              {/* Detailed Results */}
              {currentTest.results.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold mb-4">Detailed Test Results</h3>
                  <div className="space-y-2">
                    {currentTest.results.map((result) => (
                      <div key={result.id} className={`p-4 rounded-lg border ${getStatusColor(result.status)}`}>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            {getStatusIcon(result.status)}
                            <div>
                              <p className="font-medium">{result.message}</p>
                              {result.details && (
                                <p className="text-sm opacity-80 mt-1">{result.details}</p>
                              )}
                            </div>
                          </div>
                          <div className="text-right">
                            {result.score && (
                              <div className="font-medium">{result.score}/100</div>
                            )}
                            <div className="text-xs opacity-60">
                              {new Date(result.timestamp).toLocaleTimeString()}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Test History */}
      {testHistory.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Test History</CardTitle>
            <CardDescription>Previous test runs and their results</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {testHistory.slice(0, 5).map((test) => (
                <div key={test.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center space-x-4">
                    <Badge className={getStatusColor(test.status)}>
                      {test.status.toUpperCase()}
                    </Badge>
                    <div>
                      <p className="font-medium">Test Run #{test.id.slice(-6)}</p>
                      <p className="text-sm text-gray-600">
                        {new Date(test.createdAt).toLocaleString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="text-right">
                      <p className="font-medium">{test.overallScore}/100</p>
                      <p className="text-sm text-gray-600">
                        {test.results.length} tests
                      </p>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentTest(test)}
                    >
                      View Details
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
