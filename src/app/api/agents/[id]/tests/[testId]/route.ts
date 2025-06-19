import { type NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

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
  { params }: { params: { id: string; testId: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id: agentId, testId } = params

    // For demo purposes, simulate test progression
    // In a real implementation, you'd fetch from database or cache
    const mockTest: AgentTest = {
      id: testId,
      agentId,
      status: 'completed',
      overallScore: Math.floor(Math.random() * 40) + 60, // Random score between 60-100
      results: generateRandomTestResults(),
      createdAt: new Date(Date.now() - 60000).toISOString(), // 1 minute ago
      completedAt: new Date().toISOString()
    }

    return NextResponse.json(mockTest)

  } catch (error) {
    console.error('Error fetching test status:', error)
    return NextResponse.json(
      { error: 'Failed to fetch test status' },
      { status: 500 }
    )
  }
}

function generateRandomTestResults(): TestResult[] {
  const testTypes = ['security', 'performance', 'functionality', 'quality']
  const statuses: ('passed' | 'failed' | 'warning')[] = ['passed', 'failed', 'warning']
  const results: TestResult[] = []

  testTypes.forEach((type, index) => {
    // Add 2-3 tests per category
    const numTests = Math.floor(Math.random() * 2) + 2
    for (let i = 0; i < numTests; i++) {
      const status = statuses[Math.floor(Math.random() * statuses.length)]
      const score = status === 'passed' ? Math.floor(Math.random() * 20) + 80 :
                   status === 'warning' ? Math.floor(Math.random() * 30) + 50 :
                   Math.floor(Math.random() * 40) + 10

      results.push({
        id: `${type}_${index}_${i}`,
        testType: type,
        status,
        message: getTestMessage(type, i),
        score,
        details: getTestDetails(type, status),
        timestamp: new Date(Date.now() - Math.random() * 30000).toISOString()
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
      'API security assessment'
    ],
    performance: [
      'Response time test',
      'Memory usage analysis',
      'CPU efficiency check',
      'Load testing'
    ],
    functionality: [
      'Core features test',
      'Error handling validation',
      'Integration compatibility',
      'API endpoint verification'
    ],
    quality: [
      'Code structure analysis',
      'Documentation review',
      'Best practices check',
      'Maintainability assessment'
    ]
  }

  return messages[type as keyof typeof messages]?.[index] || `${type} test ${index + 1}`
}

function getTestDetails(type: string, status: string): string {
  if (status === 'passed') {
    return `${type} test completed successfully with no issues found`
  }
  if (status === 'warning') {
    return `${type} test completed with minor issues that should be addressed`
  }
  return `${type} test failed - critical issues found that need immediate attention`
}
