"use client"

import { useSession } from "next-auth/react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import Navigation from "@/components/Navigation"
import {
  User,
  Mail,
  Building2,
  Globe,
  Calendar,
  Shield,
  Edit,
  Save,
  X,
  Star,
  Package,
  ShoppingBag,
  Settings,
  CheckCircle,
  AlertCircle
} from "lucide-react"
import { toast } from "sonner"
import Link from "next/link"
import UserPreferences from "@/components/UserPreferences"

export default function ProfilePage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [isEditing, setIsEditing] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [userStats, setUserStats] = useState({
    totalPurchases: 12,
    totalSpent: 847,
    agentsSold: 5,
    totalRevenue: 2847,
    averageRating: 4.7,
    reviewCount: 156
  })

  const [profileData, setProfileData] = useState({
    name: "",
    email: "",
    bio: "",
    company: "",
    website: "",
    image: ""
  })

  const [editedData, setEditedData] = useState(profileData)

  useEffect(() => {
    if (session?.user) {
      const userData = {
        name: session.user.name || "",
        email: session.user.email || "",
        bio: session.user.bio || "",
        company: session.user.company || "",
        website: session.user.website || "",
        image: session.user.image || ""
      }
      setProfileData(userData)
      setEditedData(userData)
    }
  }, [session])

  const handleSave = async () => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(editedData)
      })

      if (!response.ok) {
        throw new Error('Failed to update profile')
      }

      const data = await response.json()
      setProfileData(editedData)
      setIsEditing(false)
      toast.success("Profile updated successfully!")
    } catch (error) {
      toast.error("Failed to update profile")
    } finally {
      setIsLoading(false)
    }
  }

  const handleCancel = () => {
    setEditedData(profileData)
    setIsEditing(false)
  }

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map(n => n[0])
      .join("")
      .toUpperCase()
  }

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4" />
            <p className="text-gray-600">Loading profile...</p>
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
              Please sign in to view your profile
            </p>
            <Link href="/auth/signin">
              <Button>Sign In</Button>
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Profile Settings</h1>
          <p className="text-gray-600">Manage your account and preferences</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile Overview */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader className="text-center">
                <div className="flex justify-center mb-4">
                  <Avatar className="h-24 w-24">
                    <AvatarImage src={profileData.image} alt={profileData.name} />
                    <AvatarFallback className="text-lg">
                      {getInitials(profileData.name || "User")}
                    </AvatarFallback>
                  </Avatar>
                </div>
                <CardTitle className="text-xl">{profileData.name || "User"}</CardTitle>
                <CardDescription className="flex items-center justify-center gap-2">
                  <Mail className="h-4 w-4" />
                  {profileData.email}
                </CardDescription>
                <div className="flex justify-center gap-2 mt-3">
                  <Badge variant={session?.user?.role === "SELLER" ? "default" : "secondary"}>
                    {session?.user?.role === "SELLER" ? "Seller" : "Buyer"}
                  </Badge>
                  {session?.user?.verified && (
                    <Badge variant="outline" className="text-green-600 border-green-200">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Verified
                    </Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center text-sm text-gray-600">
                  <p>Member since {new Date().toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long'
                  })}</p>
                </div>

                {session?.user?.role === "SELLER" ? (
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Total Revenue</span>
                      <span className="font-medium">${userStats.totalRevenue}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Agents Sold</span>
                      <span className="font-medium">{userStats.agentsSold}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Average Rating</span>
                      <div className="flex items-center">
                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400 mr-1" />
                        <span className="font-medium">{userStats.averageRating}</span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Total Purchases</span>
                      <span className="font-medium">{userStats.totalPurchases}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Total Spent</span>
                      <span className="font-medium">${userStats.totalSpent}</span>
                    </div>
                  </div>
                )}

                <Separator />

                <div className="space-y-2">
                  <Link href="/dashboard">
                    <Button variant="outline" className="w-full justify-start">
                      <Package className="h-4 w-4 mr-2" />
                      {session?.user?.role === "SELLER" ? "Seller Dashboard" : "My Agents"}
                    </Button>
                  </Link>
                  <Link href="/orders">
                    <Button variant="outline" className="w-full justify-start">
                      <ShoppingBag className="h-4 w-4 mr-2" />
                      Order History
                    </Button>
                  </Link>
                  {session?.user?.role !== "SELLER" && (
                    <Link href="/profile/seller-onboarding">
                      <Button variant="outline" className="w-full justify-start">
                        <Settings className="h-4 w-4 mr-2" />
                        Become a Seller
                      </Button>
                    </Link>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Profile Details */}
          <div className="lg:col-span-2">
            <Tabs defaultValue="personal" className="space-y-6">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="personal">Personal Info</TabsTrigger>
                <TabsTrigger value="security">Security</TabsTrigger>
                <TabsTrigger value="preferences">Preferences</TabsTrigger>
              </TabsList>

              <TabsContent value="personal">
                <Card>
                  <CardHeader>
                    <div className="flex justify-between items-center">
                      <div>
                        <CardTitle>Personal Information</CardTitle>
                        <CardDescription>
                          Update your personal details and public profile
                        </CardDescription>
                      </div>
                      {!isEditing && (
                        <Button onClick={() => setIsEditing(true)} variant="outline">
                          <Edit className="h-4 w-4 mr-2" />
                          Edit
                        </Button>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="name">Full Name</Label>
                        {isEditing ? (
                          <Input
                            id="name"
                            value={editedData.name}
                            onChange={(e) => setEditedData({ ...editedData, name: e.target.value })}
                            placeholder="Enter your full name"
                          />
                        ) : (
                          <p className="text-sm py-2">{profileData.name || "Not provided"}</p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="email">Email Address</Label>
                        <p className="text-sm py-2 text-gray-600">
                          {profileData.email}
                          <span className="text-xs text-gray-500 block">
                            Contact support to change email
                          </span>
                        </p>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="company">Company</Label>
                        {isEditing ? (
                          <Input
                            id="company"
                            value={editedData.company}
                            onChange={(e) => setEditedData({ ...editedData, company: e.target.value })}
                            placeholder="Your company name"
                          />
                        ) : (
                          <p className="text-sm py-2">{profileData.company || "Not provided"}</p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="website">Website</Label>
                        {isEditing ? (
                          <Input
                            id="website"
                            value={editedData.website}
                            onChange={(e) => setEditedData({ ...editedData, website: e.target.value })}
                            placeholder="https://yourwebsite.com"
                          />
                        ) : (
                          <p className="text-sm py-2">
                            {profileData.website ? (
                              <a href={profileData.website} target="_blank" rel="noopener noreferrer"
                                 className="text-blue-600 hover:underline">
                                {profileData.website}
                              </a>
                            ) : (
                              "Not provided"
                            )}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="bio">Bio</Label>
                      {isEditing ? (
                        <Textarea
                          id="bio"
                          value={editedData.bio}
                          onChange={(e) => setEditedData({ ...editedData, bio: e.target.value })}
                          placeholder="Tell us about yourself..."
                          rows={4}
                        />
                      ) : (
                        <p className="text-sm py-2">{profileData.bio || "No bio provided"}</p>
                      )}
                    </div>

                    {isEditing && (
                      <div className="flex gap-3">
                        <Button onClick={handleSave} disabled={isLoading}>
                          {isLoading ? (
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                          ) : (
                            <Save className="h-4 w-4 mr-2" />
                          )}
                          Save Changes
                        </Button>
                        <Button onClick={handleCancel} variant="outline">
                          <X className="h-4 w-4 mr-2" />
                          Cancel
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="security">
                <Card>
                  <CardHeader>
                    <CardTitle>Security Settings</CardTitle>
                    <CardDescription>
                      Manage your account security and authentication
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-4">
                      <div className="flex justify-between items-center p-4 border rounded-lg">
                        <div>
                          <h4 className="font-medium">Account Verification</h4>
                          <p className="text-sm text-gray-600">
                            {session?.user?.verified
                              ? "Your account is verified"
                              : "Verify your account for enhanced security"
                            }
                          </p>
                        </div>
                        <div className="flex items-center">
                          {session?.user?.verified ? (
                            <Badge variant="outline" className="text-green-600 border-green-200">
                              <CheckCircle className="h-4 w-4 mr-1" />
                              Verified
                            </Badge>
                          ) : (
                            <Button variant="outline" size="sm">
                              Verify Account
                            </Button>
                          )}
                        </div>
                      </div>

                      <div className="flex justify-between items-center p-4 border rounded-lg">
                        <div>
                          <h4 className="font-medium">Two-Factor Authentication</h4>
                          <p className="text-sm text-gray-600">
                            Add an extra layer of security to your account
                          </p>
                        </div>
                        <Button variant="outline" size="sm">
                          Enable 2FA
                        </Button>
                      </div>

                      <div className="flex justify-between items-center p-4 border rounded-lg">
                        <div>
                          <h4 className="font-medium">Connected Accounts</h4>
                          <p className="text-sm text-gray-600">
                            Manage your OAuth connections
                          </p>
                        </div>
                        <Button variant="outline" size="sm">
                          Manage
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="preferences">
                <UserPreferences />
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  )
}
