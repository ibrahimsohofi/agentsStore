import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Start seeding...')

  // Create sample users
  const hashedPassword = await bcrypt.hash('password123', 10)

  const seller1 = await prisma.user.upsert({
    where: { email: 'seller1@example.com' },
    update: {},
    create: {
      email: 'seller1@example.com',
      name: 'Alex Johnson',
      role: 'SELLER',
      bio: 'Expert AI developer specializing in automation workflows and customer service bots.',
      company: 'AI Solutions Inc.',
      website: 'https://aisolutions.com',
      verified: true,
      rating: 4.8,
      reviewCount: 127,
      totalSales: 45,
      totalRevenue: 12750.00,
    },
  })

  const seller2 = await prisma.user.upsert({
    where: { email: 'seller2@example.com' },
    update: {},
    create: {
      email: 'seller2@example.com',
      name: 'Sarah Chen',
      role: 'SELLER',
      bio: 'Data scientist and AI consultant with 8+ years of experience in machine learning.',
      company: 'DataFlow Systems',
      website: 'https://dataflow.io',
      verified: true,
      rating: 4.9,
      reviewCount: 89,
      totalSales: 32,
      totalRevenue: 8960.00,
    },
  })

  const buyer1 = await prisma.user.upsert({
    where: { email: 'buyer1@example.com' },
    update: {},
    create: {
      email: 'buyer1@example.com',
      name: 'Michael Rodriguez',
      role: 'BUYER',
      bio: 'Small business owner looking for automation solutions.',
      company: 'Rodriguez Marketing',
    },
  })

  const buyer2 = await prisma.user.upsert({
    where: { email: 'buyer2@example.com' },
    update: {},
    create: {
      email: 'buyer2@example.com',
      name: 'Emily Davis',
      role: 'BUYER',
      bio: 'Digital marketing specialist seeking AI tools for content creation.',
      company: 'Creative Digital Agency',
    },
  })

  const admin = await prisma.user.upsert({
    where: { email: 'admin@example.com' },
    update: {},
    create: {
      email: 'admin@example.com',
      name: 'Admin User',
      role: 'ADMIN',
      bio: 'Platform administrator',
      verified: true,
    },
  })

  // Create sample agents
  const agent1 = await prisma.agent.create({
    data: {
      name: 'Customer Support AI Assistant',
      description: 'Intelligent customer support bot that handles common inquiries, ticket routing, and provides 24/7 assistance.',
      longDescription: 'This comprehensive customer support AI assistant revolutionizes how businesses handle customer inquiries. Built with advanced natural language processing, it can understand customer intent, provide relevant solutions, escalate complex issues to human agents, and maintain conversation context. The bot integrates seamlessly with popular help desk platforms and can be customized for different industries.',
      price: 299.99,
      category: 'Customer Support',
      tags: JSON.stringify(['customer-service', 'chatbot', 'automation', 'nlp', 'support-desk']),
      requirements: JSON.stringify(['n8n workspace', 'OpenAI API key', 'Webhook endpoint']),
      integrations: JSON.stringify(['Zendesk', 'Intercom', 'Slack', 'Discord', 'Website chat']),
      features: JSON.stringify([
        '24/7 automated responses',
        'Multi-language support',
        'Ticket escalation logic',
        'Customer satisfaction tracking',
        'Integration with CRM systems',
        'Conversation analytics'
      ]),
      image: 'https://images.unsplash.com/photo-1531746790731-6c087fecd65a?w=400',
      preview: JSON.stringify({
        images: [
          'https://images.unsplash.com/photo-1531746790731-6c087fecd65a?w=600',
          'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=600'
        ],
        video: 'https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4'
      }),
      documentation: 'Complete setup guide with API documentation and customization instructions.',
      demo: 'https://demo.customer-support-ai.com',
      status: 'APPROVED',
      featured: true,
      verified: true,
      rating: 4.7,
      reviewCount: 23,
      totalSales: 18,
      totalRevenue: 5399.82,
      sellerId: seller1.id,
    },
  })

  const agent2 = await prisma.agent.create({
    data: {
      name: 'Social Media Content Generator',
      description: 'AI-powered tool that creates engaging social media posts, captions, and hashtags for multiple platforms.',
      longDescription: 'Transform your social media strategy with this intelligent content generation system. Using advanced AI models, it analyzes your brand voice, target audience, and trending topics to create compelling posts across Instagram, Twitter, LinkedIn, and Facebook. The tool includes A/B testing capabilities, optimal posting time suggestions, and performance analytics.',
      price: 149.99,
      category: 'Content Creation',
      tags: JSON.stringify(['social-media', 'content-creation', 'marketing', 'automation', 'ai-writing']),
      requirements: JSON.stringify(['n8n workspace', 'Social media APIs', 'OpenAI API key']),
      integrations: JSON.stringify(['Instagram', 'Twitter', 'LinkedIn', 'Facebook', 'Buffer', 'Hootsuite']),
      features: JSON.stringify([
        'Multi-platform content creation',
        'Brand voice matching',
        'Hashtag optimization',
        'Image caption generation',
        'Posting schedule optimization',
        'Performance analytics'
      ]),
      image: 'https://images.unsplash.com/photo-1611224923853-80b023f02d71?w=400',
      preview: JSON.stringify({
        images: [
          'https://images.unsplash.com/photo-1611224923853-80b023f02d71?w=600',
          'https://images.unsplash.com/photo-1432888622747-4eb9a8efeb07?w=600'
        ]
      }),
      documentation: 'Step-by-step setup guide with examples and best practices.',
      demo: 'https://demo.social-content-ai.com',
      status: 'APPROVED',
      featured: true,
      verified: true,
      rating: 4.9,
      reviewCount: 31,
      totalSales: 27,
      totalRevenue: 4049.73,
      sellerId: seller2.id,
    },
  })

  const agent3 = await prisma.agent.create({
    data: {
      name: 'Data Analysis & Reporting Bot',
      description: 'Automated data analysis tool that generates insights, charts, and reports from your business data.',
      longDescription: 'Streamline your data analysis workflow with this powerful AI-driven reporting system. It connects to various data sources, performs complex analysis, identifies trends and anomalies, and generates professional reports. Perfect for businesses that need regular data insights without hiring a full-time analyst.',
      price: 399.99,
      category: 'Data Analysis',
      tags: JSON.stringify(['data-analysis', 'reporting', 'business-intelligence', 'automation', 'insights']),
      requirements: JSON.stringify(['n8n workspace', 'Database access', 'Chart.js or similar']),
      integrations: JSON.stringify(['Google Sheets', 'MySQL', 'PostgreSQL', 'MongoDB', 'Salesforce', 'HubSpot']),
      features: JSON.stringify([
        'Automated data collection',
        'Statistical analysis',
        'Interactive charts and graphs',
        'Scheduled reporting',
        'Anomaly detection',
        'Export to multiple formats'
      ]),
      image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400',
      preview: JSON.stringify({
        images: [
          'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=600',
          'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=600'
        ]
      }),
      documentation: 'Comprehensive guide with data source setup and customization options.',
      demo: 'https://demo.data-analysis-ai.com',
      status: 'APPROVED',
      featured: false,
      verified: true,
      rating: 4.6,
      reviewCount: 15,
      totalSales: 12,
      totalRevenue: 4799.88,
      sellerId: seller1.id,
    },
  })

  const agent4 = await prisma.agent.create({
    data: {
      name: 'Email Marketing Automation',
      description: 'Smart email campaign manager that personalizes content, optimizes send times, and tracks performance.',
      longDescription: 'Revolutionize your email marketing with AI-powered automation. This system analyzes subscriber behavior, personalizes email content, determines optimal send times, and automatically segments your audience for maximum engagement. Includes A/B testing, deliverability optimization, and detailed analytics.',
      price: 199.99,
      category: 'Marketing Automation',
      tags: JSON.stringify(['email-marketing', 'automation', 'personalization', 'campaigns', 'analytics']),
      requirements: JSON.stringify(['n8n workspace', 'Email service API', 'Customer database']),
      integrations: JSON.stringify(['Mailchimp', 'SendGrid', 'Constant Contact', 'HubSpot', 'Klaviyo']),
      features: JSON.stringify([
        'Behavioral email triggers',
        'Dynamic content personalization',
        'Send time optimization',
        'Automated A/B testing',
        'Deliverability monitoring',
        'Advanced segmentation'
      ]),
      image: 'https://images.unsplash.com/photo-1596526131083-e8c633c948d2?w=400',
      preview: JSON.stringify({
        images: [
          'https://images.unsplash.com/photo-1596526131083-e8c633c948d2?w=600'
        ]
      }),
      documentation: 'Complete email marketing automation guide with templates.',
      demo: 'https://demo.email-marketing-ai.com',
      status: 'APPROVED',
      featured: false,
      verified: true,
      rating: 4.5,
      reviewCount: 19,
      totalSales: 21,
      totalRevenue: 4199.79,
      sellerId: seller2.id,
    },
  })

  // Create sample orders
  await prisma.order.create({
    data: {
      status: 'COMPLETED',
      totalAmount: 299.99,
      paymentStatus: 'SUCCEEDED',
      downloadCount: 2,
      buyerId: buyer1.id,
      agentId: agent1.id,
    },
  })

  await prisma.order.create({
    data: {
      status: 'COMPLETED',
      totalAmount: 149.99,
      paymentStatus: 'SUCCEEDED',
      downloadCount: 1,
      buyerId: buyer2.id,
      agentId: agent2.id,
    },
  })

  // Create sample reviews
  await prisma.review.create({
    data: {
      rating: 5,
      comment: 'Absolutely fantastic! This customer support bot has transformed our business. Setup was straightforward and the results are incredible. Our response time improved by 80% and customer satisfaction scores are through the roof.',
      helpful: 12,
      unhelpful: 1,
      verified: true,
      userId: buyer1.id,
      agentId: agent1.id,
    },
  })

  await prisma.review.create({
    data: {
      rating: 4,
      comment: 'Great tool for social media automation. The content quality is impressive and it saves me hours every week. Would love to see more customization options for different industries.',
      helpful: 8,
      unhelpful: 0,
      verified: true,
      userId: buyer2.id,
      agentId: agent2.id,
    },
  })

  await prisma.review.create({
    data: {
      rating: 5,
      comment: 'The customer support AI is a game-changer! Easy to set up and incredibly effective. Our team loves how it handles routine inquiries automatically.',
      helpful: 15,
      unhelpful: 0,
      verified: true,
      userId: buyer2.id,
      agentId: agent1.id,
    },
  })

  console.log('✅ Seeding finished.')
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
