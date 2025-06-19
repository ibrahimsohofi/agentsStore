import { type NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import type { Agent, NotificationType } from '@prisma/client'

interface TestResult {
  id: string;
  testType: string;
  status: 'passed' | 'failed' | 'warning' | 'running';
  message: string;
  score?: number;
  details?: string;
  timestamp: string;
}

interface QualityCheck {
  name: string;
  passed: boolean;
  score: number;
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

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (session.user.role !== 'ADMIN' && session.user.role !== 'SELLER') {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }

    const { testTypes, sandboxMode, config } = await request.json()
    const agentId = params.id

    // Check if agent exists and user has permission
    const agent = await prisma.agent.findUnique({
      where: { id: agentId },
      include: { seller: true }
    })

    if (!agent) {
      return NextResponse.json({ error: 'Agent not found' }, { status: 404 })
    }

    if (session.user.role === 'SELLER' && agent.sellerId !== session.user.id) {
      return NextResponse.json({ error: 'Not your agent' }, { status: 403 })
    }

    // Generate a unique test ID
    const testId = `test_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

    // Create initial test response
    const agentTest: AgentTest = {
      id: testId,
      agentId,
      status: 'running',
      overallScore: 0,
      results: [],
      createdAt: new Date().toISOString(),
      sandboxUrl: sandboxMode ? `https://sandbox.example.com/agent/${agentId}/test/${testId}` : undefined
    }

    // Store test in progress (you could use Redis or database here)
    // For now, we'll simulate it running and return the initial state

    // Start running tests asynchronously
    runComprehensiveTests(agent, testTypes, config, testId).catch(console.error)

    return NextResponse.json(agentTest)

  } catch (error) {
    console.error('Error running agent test:', error)
    return NextResponse.json(
      { error: 'Failed to run test' },
      { status: 500 }
    )
  }
}

// Get test results for an agent
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const agentId = params.id

    // Check if user has permission to view tests
    const agent = await prisma.agent.findUnique({
      where: { id: agentId },
      select: { sellerId: true }
    })

    if (!agent) {
      return NextResponse.json({ error: 'Agent not found' }, { status: 404 })
    }

    if (session.user.role !== 'ADMIN' && agent.sellerId !== session.user.id) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }

    // For demo purposes, return mock test history
    // In a real implementation, you'd fetch from database or cache
    const mockTests: AgentTest[] = [
      {
        id: 'test_prev_1',
        agentId,
        status: 'completed',
        overallScore: 85,
        results: generateMockResults(),
        createdAt: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
        completedAt: new Date(Date.now() - 86000000).toISOString()
      },
      {
        id: 'test_prev_2',
        agentId,
        status: 'completed',
        overallScore: 78,
        results: generateMockResults(),
        createdAt: new Date(Date.now() - 172800000).toISOString(), // 2 days ago
        completedAt: new Date(Date.now() - 172400000).toISOString()
      }
    ]

    return NextResponse.json(mockTests)

  } catch (error) {
    console.error('Error fetching test results:', error)
    return NextResponse.json(
      { error: 'Failed to fetch tests' },
      { status: 500 }
    )
  }
}

// Automated test functions
async function runQualityTests(agent: Agent) {
  const checks = []
  let score = 0

  // Check description quality
  if (agent.description && agent.description.length >= 100) {
    checks.push({ name: 'Description Length', passed: true, score: 20 })
    score += 20
  } else {
    checks.push({ name: 'Description Length', passed: false, score: 0 })
  }

  // Check if has long description
  if (agent.longDescription && agent.longDescription.length >= 300) {
    checks.push({ name: 'Detailed Description', passed: true, score: 15 })
    score += 15
  } else {
    checks.push({ name: 'Detailed Description', passed: false, score: 0 })
  }

  // Check if has tags
  const tags = JSON.parse(agent.tags || '[]')
  if (tags.length >= 3) {
    checks.push({ name: 'Sufficient Tags', passed: true, score: 10 })
    score += 10
  } else {
    checks.push({ name: 'Sufficient Tags', passed: false, score: 0 })
  }

  // Check if has requirements
  const requirements = JSON.parse(agent.requirements || '[]')
  if (requirements.length >= 1) {
    checks.push({ name: 'Requirements Listed', passed: true, score: 10 })
    score += 10
  } else {
    checks.push({ name: 'Requirements Listed', passed: false, score: 0 })
  }

  // Check if has features
  const features = JSON.parse(agent.features || '[]')
  if (features.length >= 3) {
    checks.push({ name: 'Feature List', passed: true, score: 15 })
    score += 15
  } else {
    checks.push({ name: 'Feature List', passed: false, score: 0 })
  }

  // Check if has image
  if (agent.image) {
    checks.push({ name: 'Has Preview Image', passed: true, score: 10 })
    score += 10
  } else {
    checks.push({ name: 'Has Preview Image', passed: false, score: 0 })
  }

  // Check if has documentation
  if (agent.documentation) {
    checks.push({ name: 'Documentation Provided', passed: true, score: 10 })
    score += 10
  } else {
    checks.push({ name: 'Documentation Provided', passed: false, score: 0 })
  }

  // Check pricing reasonableness
  if (agent.price >= 1 && agent.price <= 1000) {
    checks.push({ name: 'Reasonable Pricing', passed: true, score: 10 })
    score += 10
  } else {
    checks.push({ name: 'Reasonable Pricing', passed: false, score: 0 })
  }

  const status = score >= 80 ? 'PASSED' : score >= 60 ? 'NEEDS_REVIEW' : 'FAILED'
  const feedback = score >= 80 ? 'Agent meets all quality standards' :
                  score >= 60 ? 'Agent meets basic standards but could be improved' :
                  'Agent needs significant improvements before approval'

  return {
    status,
    score,
    feedback,
    details: {
      checks,
      totalScore: score,
      maxScore: 100,
      recommendations: generateQualityRecommendations(checks)
    }
  }
}

async function runSecurityScan(agent: Agent) {
  const checks = []
  let score = 0

  // Check for malicious keywords in description
  const maliciousKeywords = ['hack', 'exploit', 'steal', 'phishing', 'malware', 'virus']
  const description = `${agent.description} ${agent.longDescription}`.toLowerCase()
  const hasMaliciousContent = maliciousKeywords.some(keyword => description.includes(keyword))

  if (!hasMaliciousContent) {
    checks.push({ name: 'No Malicious Keywords', passed: true, score: 30 })
    score += 30
  } else {
    checks.push({ name: 'No Malicious Keywords', passed: false, score: 0 })
  }

  // Check for valid download URL format
  if (agent.downloadUrl?.startsWith('https://')) {
    checks.push({ name: 'Secure Download URL', passed: true, score: 25 })
    score += 25
  } else {
    checks.push({ name: 'Secure Download URL', passed: false, score: 0 })
  }

  // Check for appropriate category
  const validCategories = ['Customer Support', 'Data Analysis', 'Content Creation', 'Sales Automation', 'Marketing']
  if (validCategories.includes(agent.category)) {
    checks.push({ name: 'Valid Category', passed: true, score: 20 })
    score += 20
  } else {
    checks.push({ name: 'Valid Category', passed: false, score: 0 })
  }

  // Check for reasonable integrations
  const integrations = JSON.parse(agent.integrations || '[]')
  if (integrations.length <= 10) {
    checks.push({ name: 'Reasonable Integrations', passed: true, score: 25 })
    score += 25
  } else {
    checks.push({ name: 'Reasonable Integrations', passed: false, score: 0 })
  }

  const status = score >= 80 ? 'PASSED' : 'FAILED'
  const feedback = score >= 80 ? 'Agent passes security checks' : 'Agent failed security validation'

  return {
    status,
    score,
    feedback,
    details: {
      checks,
      totalScore: score,
      maxScore: 100
    }
  }
}

async function runPerformanceTest(agent: Agent) {
  // Simulate performance metrics
  const responseTime = Math.random() * 2000 + 500 // 500-2500ms
  const memoryUsage = Math.random() * 100 + 50 // 50-150MB
  const cpuUsage = Math.random() * 50 + 10 // 10-60%

  const checks = []
  let score = 0

  if (responseTime < 1000) {
    checks.push({ name: 'Response Time < 1s', passed: true, score: 40 })
    score += 40
  } else {
    checks.push({ name: 'Response Time < 1s', passed: false, score: 0 })
  }

  if (memoryUsage < 100) {
    checks.push({ name: 'Memory Usage < 100MB', passed: true, score: 30 })
    score += 30
  } else {
    checks.push({ name: 'Memory Usage < 100MB', passed: false, score: 0 })
  }

  if (cpuUsage < 50) {
    checks.push({ name: 'CPU Usage < 50%', passed: true, score: 30 })
    score += 30
  } else {
    checks.push({ name: 'CPU Usage < 50%', passed: false, score: 0 })
  }

  const status = score >= 70 ? 'PASSED' : 'FAILED'
  const feedback = score >= 70 ? 'Agent meets performance requirements' : 'Agent has performance issues'

  return {
    status,
    score,
    feedback,
    details: {
      checks,
      metrics: {
        responseTime: Math.round(responseTime),
        memoryUsage: Math.round(memoryUsage),
        cpuUsage: Math.round(cpuUsage)
      }
    }
  }
}

async function runCompatibilityCheck(agent: Agent) {
  const checks = []
  let score = 0

  // Check for n8n compatibility
  const hasN8nKeywords = `${agent.description} ${agent.longDescription}`.toLowerCase()
    .includes('n8n') || JSON.parse(agent.integrations || '[]').includes('n8n')

  if (hasN8nKeywords) {
    checks.push({ name: 'n8n Compatibility', passed: true, score: 50 })
    score += 50
  } else {
    checks.push({ name: 'n8n Compatibility', passed: false, score: 0 })
  }

  // Check for API compatibility
  const hasApiKeywords = `${agent.description} ${agent.longDescription}`.toLowerCase()
    .includes('api') || (agent.documentation?.toLowerCase().includes('api'))

  if (hasApiKeywords) {
    checks.push({ name: 'API Integration', passed: true, score: 30 })
    score += 30
  } else {
    checks.push({ name: 'API Integration', passed: false, score: 0 })
  }

  // Check for standard format
  if (agent.downloadUrl?.includes('.json')) {
    checks.push({ name: 'Standard Format', passed: true, score: 20 })
    score += 20
  } else {
    checks.push({ name: 'Standard Format', passed: false, score: 0 })
  }

  const status = score >= 70 ? 'PASSED' : 'FAILED'
  const feedback = score >= 70 ? 'Agent is compatible with platform standards' : 'Agent has compatibility issues'

  return {
    status,
    score,
    feedback,
    details: { checks }
  }
}

function generateQualityRecommendations(checks: QualityCheck[]) {
  const recommendations = []

  for (const check of checks) {
    if (!check.passed) {
      switch (check.name) {
        case 'Description Length':
          recommendations.push('Add a more detailed description (at least 100 characters)')
          break
        case 'Detailed Description':
          recommendations.push('Provide a comprehensive long description (at least 300 characters)')
          break
        case 'Sufficient Tags':
          recommendations.push('Add more relevant tags (at least 3) to improve discoverability')
          break
        case 'Requirements Listed':
          recommendations.push('List system requirements and prerequisites')
          break
        case 'Feature List':
          recommendations.push('Highlight key features and capabilities (at least 3)')
          break
        case 'Has Preview Image':
          recommendations.push('Upload a preview image or screenshot')
          break
        case 'Documentation Provided':
          recommendations.push('Include setup and usage documentation')
          break
        case 'Reasonable Pricing':
          recommendations.push('Set a reasonable price between $1 and $1000')
          break
      }
    }
  }

  return recommendations
}

async function createNotification(userId: string, type: string, title: string, message: string) {
  return await prisma.notification.create({
    data: {
      userId,
      type: type as NotificationType,
      title,
      message
    }
  })
}

// Comprehensive testing function that runs all selected test categories
async function runComprehensiveTests(agent: Agent, testTypes: string[], config: Record<string, unknown>, testId: string) {
  const results: TestResult[] = []

  for (const testType of testTypes) {
    switch (testType) {
      case 'security':
        results.push(...await runSecurityTests(agent))
        break
      case 'performance':
        results.push(...await runPerformanceTests(agent, config))
        break
      case 'functionality':
        results.push(...await runFunctionalityTests(agent))
        break
      case 'quality':
        results.push(...await runQualityTestsNew(agent))
        break
    }
  }

  // Calculate overall score
  const overallScore = results.reduce((sum, r) => sum + (r.score || 0), 0) / results.length

  // In a real implementation, you would store this in a database or cache
  // For demo purposes, we'll just simulate the completion
  console.log(`Test ${testId} completed with score: ${overallScore}`)
}

async function runSecurityTests(agent: Agent): Promise<TestResult[]> {
  const results: TestResult[] = []

  // Simulate async testing with delays
  await new Promise(resolve => setTimeout(resolve, 1000))

  results.push({
    id: `sec_${Date.now()}_1`,
    testType: 'security',
    status: 'passed',
    message: 'Input validation check',
    score: 95,
    details: 'All user inputs are properly validated and sanitized',
    timestamp: new Date().toISOString()
  })

  await new Promise(resolve => setTimeout(resolve, 500))

  results.push({
    id: `sec_${Date.now()}_2`,
    testType: 'security',
    status: 'passed',
    message: 'SQL injection protection',
    score: 90,
    details: 'No SQL injection vulnerabilities detected',
    timestamp: new Date().toISOString()
  })

  results.push({
    id: `sec_${Date.now()}_3`,
    testType: 'security',
    status: 'warning',
    message: 'XSS prevention',
    score: 75,
    details: 'Some XSS protection measures could be improved',
    timestamp: new Date().toISOString()
  })

  return results
}

async function runPerformanceTests(agent: Agent, config: Record<string, unknown>): Promise<TestResult[]> {
  const results: TestResult[] = []

  await new Promise(resolve => setTimeout(resolve, 1500))

  results.push({
    id: `perf_${Date.now()}_1`,
    testType: 'performance',
    status: 'passed',
    message: 'Response time test',
    score: 88,
    details: `Average response time: ${Math.random() * 200 + 100}ms`,
    timestamp: new Date().toISOString()
  })

  results.push({
    id: `perf_${Date.now()}_2`,
    testType: 'performance',
    status: 'passed',
    message: 'Memory usage test',
    score: 92,
    details: `Peak memory usage: ${Math.random() * 50 + 30}MB`,
    timestamp: new Date().toISOString()
  })

  results.push({
    id: `perf_${Date.now()}_3`,
    testType: 'performance',
    status: 'passed',
    message: 'Concurrent requests test',
    score: 85,
    details: `Successfully handled ${config.concurrent} concurrent requests`,
    timestamp: new Date().toISOString()
  })

  return results
}

async function runFunctionalityTests(agent: Agent): Promise<TestResult[]> {
  const results: TestResult[] = []

  await new Promise(resolve => setTimeout(resolve, 1200))

  results.push({
    id: `func_${Date.now()}_1`,
    testType: 'functionality',
    status: 'passed',
    message: 'Core features test',
    score: 90,
    details: 'All core features are working correctly',
    timestamp: new Date().toISOString()
  })

  results.push({
    id: `func_${Date.now()}_2`,
    testType: 'functionality',
    status: 'passed',
    message: 'Error handling test',
    score: 85,
    details: 'Error handling is robust and user-friendly',
    timestamp: new Date().toISOString()
  })

  results.push({
    id: `func_${Date.now()}_3`,
    testType: 'functionality',
    status: 'failed',
    message: 'Integration test',
    score: 40,
    details: 'Some integration endpoints are not responding correctly',
    timestamp: new Date().toISOString()
  })

  return results
}

async function runQualityTestsNew(agent: Agent): Promise<TestResult[]> {
  const results: TestResult[] = []

  await new Promise(resolve => setTimeout(resolve, 800))

  results.push({
    id: `qual_${Date.now()}_1`,
    testType: 'quality',
    status: 'passed',
    message: 'Code structure',
    score: 88,
    details: 'Code follows good structural patterns and conventions',
    timestamp: new Date().toISOString()
  })

  results.push({
    id: `qual_${Date.now()}_2`,
    testType: 'quality',
    status: 'passed',
    message: 'Documentation quality',
    score: 95,
    details: 'Comprehensive documentation provided',
    timestamp: new Date().toISOString()
  })

  results.push({
    id: `qual_${Date.now()}_3`,
    testType: 'quality',
    status: 'warning',
    message: 'Best practices',
    score: 70,
    details: 'Some coding best practices could be improved',
    timestamp: new Date().toISOString()
  })

  return results
}

function generateMockResults(): TestResult[] {
  return [
    {
      id: 'mock_1',
      testType: 'security',
      status: 'passed',
      message: 'Security scan completed',
      score: 88,
      timestamp: new Date().toISOString()
    },
    {
      id: 'mock_2',
      testType: 'performance',
      status: 'passed',
      message: 'Performance tests passed',
      score: 92,
      timestamp: new Date().toISOString()
    },
    {
      id: 'mock_3',
      testType: 'functionality',
      status: 'warning',
      message: 'Minor functionality issues',
      score: 75,
      timestamp: new Date().toISOString()
    }
  ]
}
