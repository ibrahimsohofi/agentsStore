"use client"

import { useSession } from "next-auth/react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Checkbox } from "@/components/ui/checkbox"
import Navigation from "@/components/Navigation"
import {
  User,
  Building2,
  CreditCard,
  FileText,
  CheckCircle,
  ArrowRight,
  ArrowLeft,
  Upload,
  DollarSign,
  Shield,
  Star,
  Zap,
  TrendingUp,
  Users,
  AlertCircle,
  Globe,
  Mail,
  Phone
} from "lucide-react"
import { toast } from "sonner"
import Link from "next/link"

interface OnboardingData {
  personalInfo: {
    fullName: string
    bio: string
    profileImage: string
  }
  businessInfo: {
    businessName: string
    businessType: string
    website: string
    address: string
    phoneNumber: string
    taxId: string
  }
  sellerInfo: {
    experience: string
    specialization: string[]
    portfolio: string
    expectedRevenue: string
  }
  documents: {
    idVerification: File | null
    businessLicense: File | null
    portfolioSamples: File[]
  }
  agreements: {
    termsOfService: boolean
    sellerAgreement: boolean
    taxCompliance: boolean
    qualityStandards: boolean
  }
}

const SPECIALIZATION_OPTIONS = [
  "Customer Service Automation",
  "Sales & Marketing",
  "Data Analysis & Reporting",
  "Content Creation",
  "Process Automation",
  "Integration & API",
  "Machine Learning Models",
  "Chatbots & Conversational AI",
  "Business Intelligence",
  "Other"
]

export default function SellerOnboardingPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(1)
  const [isLoading, setIsLoading] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const [onboardingData, setOnboardingData] = useState<OnboardingData>({
    personalInfo: {
      fullName: "",
      bio: "",
      profileImage: ""
    },
    businessInfo: {
      businessName: "",
      businessType: "",
      website: "",
      address: "",
      phoneNumber: "",
      taxId: ""
    },
    sellerInfo: {
      experience: "",
      specialization: [],
      portfolio: "",
      expectedRevenue: ""
    },
    documents: {
      idVerification: null,
      businessLicense: null,
      portfolioSamples: []
    },
    agreements: {
      termsOfService: false,
      sellerAgreement: false,
      taxCompliance: false,
      qualityStandards: false
    }
  })

  useEffect(() => {
    if (session?.user) {
      setOnboardingData(prev => ({
        ...prev,
        personalInfo: {
          ...prev.personalInfo,
          fullName: session.user.name || "",
          profileImage: session.user.image || ""
        }
      }))
    }
  }, [session])

  const updateData = (section: keyof OnboardingData, data: Partial<OnboardingData[keyof OnboardingData]>) => {
    setOnboardingData(prev => ({
      ...prev,
      [section]: { ...prev[section], ...data }
    }))
  }

  const nextStep = () => {
    if (currentStep < 5) {
      setCurrentStep(currentStep + 1)
    }
  }

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleSubmit = async () => {
    setIsSubmitting(true)
    try {
      const response = await fetch('/api/profile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'seller-onboarding',
          data: onboardingData
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to submit application')
      }

      const data = await response.json()
      toast.success("Application submitted successfully!")
      router.push("/profile?success=seller-application")
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to submit application")
    } finally {
      setIsSubmitting(false)
    }
  }

  const toggleSpecialization = (spec: string) => {
    const current = onboardingData.sellerInfo.specialization
    const updated = current.includes(spec)
      ? current.filter(s => s !== spec)
      : [...current, spec]

    updateData('sellerInfo', { specialization: updated })
  }

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4" />
            <p className="text-gray-600">Loading...</p>
          </div>
        </div>
      </div>
    )
  }

  if (status === "unauthenticated") {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <User className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Sign In Required</h1>
            <p className="text-gray-600 mb-6">
              Please sign in to start the seller onboarding process
            </p>
            <Link href="/auth/signin">
              <Button>Sign In</Button>
            </Link>
          </div>
        </div>
      </div>
    )
  }

  if (session?.user?.role === "SELLER") {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-900 mb-2">You're Already a Seller!</h1>
            <p className="text-gray-600 mb-6">
              You have seller access. Visit your dashboard to manage your agents.
            </p>
            <Link href="/dashboard">
              <Button>Go to Dashboard</Button>
            </Link>
          </div>
        </div>
      </div>
    )
  }

  const steps = [
    { number: 1, title: "Personal Info", description: "Basic profile information" },
    { number: 2, title: "Business Details", description: "Company and business information" },
    { number: 3, title: "Seller Profile", description: "Expertise and experience" },
    { number: 4, title: "Documents", description: "Verification documents" },
    { number: 5, title: "Review", description: "Review and submit" }
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Become a Seller</h1>
          <p className="text-gray-600">
            Join our marketplace and start selling your AI agents to thousands of customers
          </p>
        </div>

        {/* Benefits Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="text-center">
            <CardContent className="pt-6">
              <DollarSign className="h-8 w-8 text-green-500 mx-auto mb-3" />
              <h3 className="font-semibold mb-2">Earn Revenue</h3>
              <p className="text-sm text-gray-600">
                Set your own prices and earn up to 85% on each sale
              </p>
            </CardContent>
          </Card>
          <Card className="text-center">
            <CardContent className="pt-6">
              <Users className="h-8 w-8 text-blue-500 mx-auto mb-3" />
              <h3 className="font-semibold mb-2">Global Reach</h3>
              <p className="text-sm text-gray-600">
                Access thousands of potential customers worldwide
              </p>
            </CardContent>
          </Card>
          <Card className="text-center">
            <CardContent className="pt-6">
              <Zap className="h-8 w-8 text-purple-500 mx-auto mb-3" />
              <h3 className="font-semibold mb-2">Easy Management</h3>
              <p className="text-sm text-gray-600">
                Powerful dashboard to manage your agents and analytics
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => (
              <div key={step.number} className="flex items-center">
                <div className={`flex items-center ${index < steps.length - 1 ? 'flex-1' : ''}`}>
                  <div className={`
                    w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium
                    ${currentStep >= step.number
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-200 text-gray-600'
                    }
                  `}>
                    {currentStep > step.number ? <CheckCircle className="h-5 w-5" /> : step.number}
                  </div>
                  <div className="ml-3 hidden sm:block">
                    <p className={`text-sm font-medium ${
                      currentStep >= step.number ? 'text-blue-600' : 'text-gray-500'
                    }`}>
                      {step.title}
                    </p>
                    <p className="text-xs text-gray-500">{step.description}</p>
                  </div>
                </div>
                {index < steps.length - 1 && (
                  <div className={`flex-1 h-0.5 mx-4 ${
                    currentStep > step.number ? 'bg-blue-600' : 'bg-gray-200'
                  }`} />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Step Content */}
        <Card>
          <CardContent className="p-8">
            {currentStep === 1 && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-xl font-semibold mb-2">Personal Information</h2>
                  <p className="text-gray-600 mb-6">
                    Let's start with your basic profile information
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="fullName">Full Name *</Label>
                    <Input
                      id="fullName"
                      value={onboardingData.personalInfo.fullName}
                      onChange={(e) => updateData('personalInfo', { fullName: e.target.value })}
                      placeholder="Enter your full legal name"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>
                    <Input
                      id="email"
                      value={session?.user?.email || ""}
                      disabled
                      className="bg-gray-50"
                    />
                    <p className="text-xs text-gray-500">
                      This is your registered email address
                    </p>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bio">Professional Bio *</Label>
                  <Textarea
                    id="bio"
                    value={onboardingData.personalInfo.bio}
                    onChange={(e) => updateData('personalInfo', { bio: e.target.value })}
                    placeholder="Tell us about your professional background and expertise..."
                    rows={4}
                  />
                  <p className="text-xs text-gray-500">
                    This will be displayed on your seller profile (minimum 100 characters)
                  </p>
                </div>
              </div>
            )}

            {currentStep === 2 && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-xl font-semibold mb-2">Business Information</h2>
                  <p className="text-gray-600 mb-6">
                    Provide your business details for verification and tax purposes
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="businessName">Business/Company Name</Label>
                    <Input
                      id="businessName"
                      value={onboardingData.businessInfo.businessName}
                      onChange={(e) => updateData('businessInfo', { businessName: e.target.value })}
                      placeholder="Your company or business name"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="businessType">Business Type</Label>
                    <select
                      id="businessType"
                      value={onboardingData.businessInfo.businessType}
                      onChange={(e) => updateData('businessInfo', { businessType: e.target.value })}
                      className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">Select business type</option>
                      <option value="individual">Individual/Sole Proprietor</option>
                      <option value="llc">LLC</option>
                      <option value="corporation">Corporation</option>
                      <option value="partnership">Partnership</option>
                      <option value="other">Other</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="website">Website</Label>
                    <Input
                      id="website"
                      value={onboardingData.businessInfo.website}
                      onChange={(e) => updateData('businessInfo', { website: e.target.value })}
                      placeholder="https://yourwebsite.com"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phoneNumber">Phone Number</Label>
                    <Input
                      id="phoneNumber"
                      value={onboardingData.businessInfo.phoneNumber}
                      onChange={(e) => updateData('businessInfo', { phoneNumber: e.target.value })}
                      placeholder="+1 (555) 123-4567"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="address">Business Address *</Label>
                  <Textarea
                    id="address"
                    value={onboardingData.businessInfo.address}
                    onChange={(e) => updateData('businessInfo', { address: e.target.value })}
                    placeholder="Enter your complete business address"
                    rows={3}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="taxId">Tax ID/EIN (Optional)</Label>
                  <Input
                    id="taxId"
                    value={onboardingData.businessInfo.taxId}
                    onChange={(e) => updateData('businessInfo', { taxId: e.target.value })}
                    placeholder="12-3456789"
                  />
                  <p className="text-xs text-gray-500">
                    Required for tax reporting if earnings exceed $600/year
                  </p>
                </div>
              </div>
            )}

            {currentStep === 3 && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-xl font-semibold mb-2">Seller Profile</h2>
                  <p className="text-gray-600 mb-6">
                    Tell us about your expertise and what types of agents you'll create
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="experience">Experience Level *</Label>
                  <select
                    id="experience"
                    value={onboardingData.sellerInfo.experience}
                    onChange={(e) => updateData('sellerInfo', { experience: e.target.value })}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Select your experience level</option>
                    <option value="beginner">Beginner (0-1 years)</option>
                    <option value="intermediate">Intermediate (1-3 years)</option>
                    <option value="advanced">Advanced (3-5 years)</option>
                    <option value="expert">Expert (5+ years)</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <Label>Specialization Areas * (Select all that apply)</Label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-3">
                    {SPECIALIZATION_OPTIONS.map((spec) => (
                      <div key={spec} className="flex items-center space-x-2">
                        <Checkbox
                          id={spec}
                          checked={onboardingData.sellerInfo.specialization.includes(spec)}
                          onCheckedChange={() => toggleSpecialization(spec)}
                        />
                        <Label htmlFor={spec} className="text-sm">
                          {spec}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="portfolio">Portfolio/Previous Work</Label>
                  <Textarea
                    id="portfolio"
                    value={onboardingData.sellerInfo.portfolio}
                    onChange={(e) => updateData('sellerInfo', { portfolio: e.target.value })}
                    placeholder="Describe your previous work, projects, or provide links to your portfolio..."
                    rows={4}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="expectedRevenue">Expected Monthly Revenue Goal</Label>
                  <select
                    id="expectedRevenue"
                    value={onboardingData.sellerInfo.expectedRevenue}
                    onChange={(e) => updateData('sellerInfo', { expectedRevenue: e.target.value })}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Select revenue goal</option>
                    <option value="under-500">Under $500</option>
                    <option value="500-1000">$500 - $1,000</option>
                    <option value="1000-2500">$1,000 - $2,500</option>
                    <option value="2500-5000">$2,500 - $5,000</option>
                    <option value="over-5000">Over $5,000</option>
                  </select>
                </div>
              </div>
            )}

            {currentStep === 4 && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-xl font-semibold mb-2">Document Verification</h2>
                  <p className="text-gray-600 mb-6">
                    Upload required documents for identity and business verification
                  </p>
                </div>

                <div className="space-y-6">
                  <div className="p-4 border-2 border-dashed border-gray-300 rounded-lg">
                    <div className="text-center">
                      <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                      <h3 className="font-medium mb-1">ID Verification *</h3>
                      <p className="text-sm text-gray-600 mb-3">
                        Upload a government-issued photo ID (passport, driver's license, etc.)
                      </p>
                      <Button variant="outline" size="sm">
                        Choose File
                      </Button>
                    </div>
                  </div>

                  <div className="p-4 border-2 border-dashed border-gray-300 rounded-lg">
                    <div className="text-center">
                      <FileText className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                      <h3 className="font-medium mb-1">Business License (Optional)</h3>
                      <p className="text-sm text-gray-600 mb-3">
                        Upload business registration or license documents
                      </p>
                      <Button variant="outline" size="sm">
                        Choose File
                      </Button>
                    </div>
                  </div>

                  <div className="p-4 border-2 border-dashed border-gray-300 rounded-lg">
                    <div className="text-center">
                      <Star className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                      <h3 className="font-medium mb-1">Portfolio Samples (Optional)</h3>
                      <p className="text-sm text-gray-600 mb-3">
                        Upload examples of your work or agent screenshots
                      </p>
                      <Button variant="outline" size="sm">
                        Choose Files
                      </Button>
                    </div>
                  </div>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex">
                    <Shield className="h-5 w-5 text-blue-500 mt-0.5 mr-3" />
                    <div>
                      <h4 className="font-medium text-blue-900">Your documents are secure</h4>
                      <p className="text-sm text-blue-700">
                        All uploaded documents are encrypted and only used for verification purposes.
                        We never share your personal information with third parties.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {currentStep === 5 && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-xl font-semibold mb-2">Review & Submit</h2>
                  <p className="text-gray-600 mb-6">
                    Review your information and agree to our terms to complete your application
                  </p>
                </div>

                {/* Summary */}
                <div className="space-y-4">
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h3 className="font-medium mb-2">Personal Information</h3>
                    <p className="text-sm text-gray-600">
                      {onboardingData.personalInfo.fullName} • {session?.user?.email}
                    </p>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-4">
                    <h3 className="font-medium mb-2">Business Information</h3>
                    <p className="text-sm text-gray-600">
                      {onboardingData.businessInfo.businessName || "Individual"} •
                      {onboardingData.businessInfo.businessType || "Not specified"}
                    </p>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-4">
                    <h3 className="font-medium mb-2">Specialization</h3>
                    <div className="flex flex-wrap gap-2">
                      {onboardingData.sellerInfo.specialization.map((spec) => (
                        <Badge key={spec} variant="secondary">{spec}</Badge>
                      ))}
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Agreements */}
                <div className="space-y-4">
                  <h3 className="font-medium">Terms & Agreements</h3>

                  <div className="space-y-3">
                    <div className="flex items-start space-x-3">
                      <Checkbox
                        id="terms"
                        checked={onboardingData.agreements.termsOfService}
                        onCheckedChange={(checked) =>
                          updateData('agreements', { termsOfService: checked })
                        }
                      />
                      <Label htmlFor="terms" className="text-sm leading-5">
                        I agree to the <Link href="/terms" className="text-blue-600 hover:underline">Terms of Service</Link> and <Link href="/privacy" className="text-blue-600 hover:underline">Privacy Policy</Link>
                      </Label>
                    </div>

                    <div className="flex items-start space-x-3">
                      <Checkbox
                        id="seller-agreement"
                        checked={onboardingData.agreements.sellerAgreement}
                        onCheckedChange={(checked) =>
                          updateData('agreements', { sellerAgreement: checked })
                        }
                      />
                      <Label htmlFor="seller-agreement" className="text-sm leading-5">
                        I agree to the <Link href="/seller-agreement" className="text-blue-600 hover:underline">Seller Agreement</Link> and understand the commission structure
                      </Label>
                    </div>

                    <div className="flex items-start space-x-3">
                      <Checkbox
                        id="tax-compliance"
                        checked={onboardingData.agreements.taxCompliance}
                        onCheckedChange={(checked) =>
                          updateData('agreements', { taxCompliance: checked })
                        }
                      />
                      <Label htmlFor="tax-compliance" className="text-sm leading-5">
                        I understand my tax obligations and will comply with applicable tax laws
                      </Label>
                    </div>

                    <div className="flex items-start space-x-3">
                      <Checkbox
                        id="quality-standards"
                        checked={onboardingData.agreements.qualityStandards}
                        onCheckedChange={(checked) =>
                          updateData('agreements', { qualityStandards: checked })
                        }
                      />
                      <Label htmlFor="quality-standards" className="text-sm leading-5">
                        I commit to maintaining high-quality standards and providing excellent customer support
                      </Label>
                    </div>
                  </div>
                </div>

                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex">
                    <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 mr-3" />
                    <div>
                      <h4 className="font-medium text-green-900">Application Review Process</h4>
                      <p className="text-sm text-green-700">
                        Your application will be reviewed within 2-3 business days. You'll receive an email notification once approved.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Navigation */}
            <div className="flex justify-between pt-8 border-t">
              <Button
                onClick={prevStep}
                variant="outline"
                disabled={currentStep === 1}
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Previous
              </Button>

              {currentStep < 5 ? (
                <Button onClick={nextStep}>
                  Next
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              ) : (
                <Button
                  onClick={handleSubmit}
                  disabled={
                    isSubmitting ||
                    !onboardingData.agreements.termsOfService ||
                    !onboardingData.agreements.sellerAgreement ||
                    !onboardingData.agreements.taxCompliance ||
                    !onboardingData.agreements.qualityStandards
                  }
                >
                  {isSubmitting ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                  ) : (
                    <CheckCircle className="h-4 w-4 mr-2" />
                  )}
                  Submit Application
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
