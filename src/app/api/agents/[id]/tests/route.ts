import { type NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

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

    // Check if agent exists and user has permission
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
    const mockTests: AgentTest[] = generateMockTestHistory(agentId)

    return NextResponse.json(mockTests)

  } catch (error) {
    console.error('Error fetching test history:', error)
    return NextResponse.json(
      { error: 'Failed to fetch test history' },
      { status: 500 }
    )
  }
}

function generateMockTestHistory(agentId: string): AgentTest[] {
  const tests: AgentTest[] = []

  // Generate 3-5 historical tests
  const numTests = Math.floor(Math.random() * 3) + 3

  for (let i = 0; i < numTests; i++) {
    const daysAgo = i + 1
    const testDate = new Date(Date.now() - (daysAgo * 24 * 60 * 60 * 1000))
    const completedDate = new Date(testDate.getTime() + (Math.random() * 30 * 60 * 1000)) // Completed within 30 minutes

    tests.push({
      id: `test_history_${i + 1}_${Date.now()}`,
      agentId,
      status: 'completed',
      overallScore: Math.floor(Math.random() * 40) + 60,
      results: generateHistoricalTestResults(),
      createdAt: testDate.toISOString(),
      completedAt: completedDate.toISOString()
    })
  }

  return tests.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
}

function generateHistoricalTestResults(): TestResult[] {
  const testTypes = ['security', 'performance', 'functionality', 'quality']
  const results: TestResult[] = []

  testTypes.forEach((type, categoryIndex) => {
    const numTests = Math.floor(Math.random() * 2) + 2

    for (let i = 0; i < numTests; i++) {
      const statuses: ('passed' | 'failed' | 'warning')[] = ['passed', 'warning', 'failed']
      const weights = [0.7, 0.2, 0.1] // 70% passed, 20% warning, 10% failed

      let status: 'passed' | 'failed' | 'warning' = 'passed'
      const random = Math.random()
      let cumulative = 0

      for (let j = 0; j < weights.length; j++) {
        cumulative += weights[j]
        if (random <= cumulative) {
          status = statuses[j]
          break
        }
      }

      const score = status === 'passed' ? Math.floor(Math.random() * 20) + 80 :
                   status === 'warning' ? Math.floor(Math.random() * 30) + 50 :
                   Math.floor(Math.random() * 40) + 10

      results.push({
        id: `hist_${type}_${categoryIndex}_${i}`,
        testType: type,
        status,
        message: getTestMessage(type, i),
        score,
        details: getTestDetails(type, status),
        timestamp: new Date(Date.now() - Math.random() * 60000).toISOString()
      })
    }
  })

  return results
}

function getTestMessage(type: string, index: number): string {
  const messages = {
    security: [
      'Input validation check',
      'SQL injection protection',
      'XSS prevention',
      'Authentication security',
      'Data encryption validation'
    ],
    performance: [
      'Response time analysis',
      'Memory usage optimization',
      'CPU efficiency test',
      'Database query performance',
      'Concurrent load testing'
    ],
    functionality: [
      'Core feature validation',
      'Error handling robustness',
      'API integration testing',
      'User workflow verification',
      'Data processing accuracy'
    ],
    quality: [
      'Code structure analysis',
      'Documentation completeness',
      'Best practices adherence',
      'Maintainability score',
      'Test coverage assessment'
    ]
  }

  const typeMessages = messages[type as keyof typeof messages] || []
  return typeMessages[index] || `${type.charAt(0).toUpperCase() + type.slice(1)} test ${index + 1}`
}

function getTestDetails(type: string, status: string): string {
  const details = {
    passed: {
      security: 'All security checks passed with excellent protection measures',
      performance: 'Performance metrics exceed expectations with optimal resource usage',
      functionality: 'All functional requirements met with robust implementation',
      quality: 'Code quality standards exceeded with excellent documentation'
    },
    warning: {
      security: 'Security measures are adequate but could be strengthened in some areas',
      performance: 'Performance is acceptable but optimization opportunities exist',
      functionality: 'Core functionality works but edge cases need attention',
      quality: 'Code quality is good but some improvements recommended'
    },
    failed: {
      security: 'Critical security vulnerabilities detected that require immediate attention',
      performance: 'Performance issues detected that significantly impact user experience',
      functionality: 'Core functionality failures that prevent proper operation',
      quality: 'Code quality issues that affect maintainability and reliability'
    }
  }

  return details[status as keyof typeof details]?.[type as keyof typeof details.passed] ||
         `${type} test ${status} with standard results`
}
