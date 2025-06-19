"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import {
  Star,
  ThumbsUp,
  ThumbsDown,
  Flag,
  Filter,
  MoreHorizontal,
  MessageSquare,
  TrendingUp,
  Calendar,
  User
} from "lucide-react";
import { toast } from "sonner";

interface Review {
  id: number;
  user: string;
  avatar: string;
  rating: number;
  date: string;
  comment: string;
  helpful: number;
  unhelpful: number;
  verified: boolean;
  userLiked?: boolean;
  userDisliked?: boolean;
}

interface ReviewsSectionProps {
  agentId: string;
  agentName: string;
  reviews: Review[];
  averageRating: number;
  totalReviews: number;
}

export default function ReviewsSection({
  agentId,
  agentName,
  reviews: initialReviews,
  averageRating,
  totalReviews
}: ReviewsSectionProps) {
  const [reviews, setReviews] = useState<Review[]>(initialReviews);
  const [sortBy, setSortBy] = useState("newest");
  const [filterBy, setFilterBy] = useState("all");
  const [showWriteReview, setShowWriteReview] = useState(false);
  const [newReviewRating, setNewReviewRating] = useState(0);
  const [newReviewComment, setNewReviewComment] = useState("");
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);

  // Calculate rating distribution
  const ratingDistribution = [5, 4, 3, 2, 1].map(rating => ({
    rating,
    count: reviews.filter(r => r.rating === rating).length,
    percentage: Math.round((reviews.filter(r => r.rating === rating).length / reviews.length) * 100)
  }));

  // Filter and sort reviews
  const filteredAndSortedReviews = reviews
    .filter(review => {
      if (filterBy === "all") return true;
      if (filterBy === "verified") return review.verified;
      if (filterBy === "recent") return new Date(review.date) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      return Number.parseInt(filterBy) === review.rating;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "newest":
          return new Date(b.date).getTime() - new Date(a.date).getTime();
        case "oldest":
          return new Date(a.date).getTime() - new Date(b.date).getTime();
        case "highest":
          return b.rating - a.rating;
        case "lowest":
          return a.rating - b.rating;
        case "helpful":
          return b.helpful - a.helpful;
        default:
          return 0;
      }
    });

  const handleRatingClick = (rating: number) => {
    setNewReviewRating(rating);
  };

  const handleReviewSubmit = async () => {
    if (newReviewRating === 0) {
      toast.error("Please select a rating");
      return;
    }
    if (newReviewComment.trim().length < 10) {
      toast.error("Please write at least 10 characters");
      return;
    }

    setIsSubmittingReview(true);

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));

    const newReview: Review = {
      id: Date.now(),
      user: "You", // In real app, get from auth
      avatar: "YU",
      rating: newReviewRating,
      date: new Date().toISOString().split('T')[0],
      comment: newReviewComment,
      helpful: 0,
      unhelpful: 0,
      verified: true,
      userLiked: false,
      userDisliked: false
    };

    setReviews(prev => [newReview, ...prev]);
    setNewReviewRating(0);
    setNewReviewComment("");
    setShowWriteReview(false);
    setIsSubmittingReview(false);

    toast.success("Review submitted successfully!");
  };

  const handleHelpfulClick = (reviewId: number, isHelpful: boolean) => {
    setReviews(prev => prev.map(review => {
      if (review.id === reviewId) {
        const wasLiked = review.userLiked;
        const wasDisliked = review.userDisliked;

        if (isHelpful) {
          return {
            ...review,
            helpful: wasLiked ? review.helpful - 1 : review.helpful + 1,
            unhelpful: wasDisliked ? review.unhelpful - 1 : review.unhelpful,
            userLiked: !wasLiked,
            userDisliked: false
          };
        }
        return {
          ...review,
          unhelpful: wasDisliked ? review.unhelpful - 1 : review.unhelpful + 1,
          helpful: wasLiked ? review.helpful - 1 : review.helpful,
          userDisliked: !wasDisliked,
          userLiked: false
        };
      }
      return review;
    }));
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Customer Reviews</CardTitle>
            <CardDescription>
              What customers are saying about {agentName}
            </CardDescription>
          </div>
          <Dialog open={showWriteReview} onOpenChange={setShowWriteReview}>
            <DialogTrigger asChild>
              <Button>
                <MessageSquare className="h-4 w-4 mr-2" />
                Write Review
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[525px]">
              <DialogHeader>
                <DialogTitle>Write a Review</DialogTitle>
                <DialogDescription>
                  Share your experience with {agentName}
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Rating</label>
                  <div className="flex items-center space-x-1">
                    {[1, 2, 3, 4, 5].map((rating) => (
                      <button
                        key={rating}
                        onClick={() => handleRatingClick(rating)}
                        className="p-1"
                      >
                        <Star
                          className={`h-6 w-6 transition-colors ${
                            rating <= newReviewRating
                              ? "fill-yellow-400 text-yellow-400"
                              : "text-gray-300 hover:text-yellow-400"
                          }`}
                        />
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Review</label>
                  <Textarea
                    placeholder="Share your thoughts about this agent..."
                    value={newReviewComment}
                    onChange={(e) => setNewReviewComment(e.target.value)}
                    className="min-h-[100px]"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    {newReviewComment.length}/500 characters
                  </p>
                </div>
                <div className="flex justify-end space-x-2">
                  <Button variant="outline" onClick={() => setShowWriteReview(false)}>
                    Cancel
                  </Button>
                  <Button
                    onClick={handleReviewSubmit}
                    disabled={isSubmittingReview || newReviewRating === 0 || newReviewComment.trim().length < 10}
                  >
                    {isSubmittingReview ? "Submitting..." : "Submit Review"}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Rating Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4 bg-gray-50 rounded-lg">
          <div className="text-center">
            <div className="text-4xl font-bold text-gray-900 mb-1">{averageRating}</div>
            <div className="flex items-center justify-center space-x-1 mb-2">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={`overview-star-${Date.now()}-${i}`}
                  className={`h-5 w-5 ${
                    i < Math.floor(averageRating) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
                  }`}
                />
              ))}
            </div>
            <p className="text-sm text-gray-600">{totalReviews} reviews</p>
          </div>
          <div className="space-y-2">
            {ratingDistribution.map(({ rating, count, percentage }) => (
              <div key={rating} className="flex items-center space-x-2 text-sm">
                <span className="w-3">{rating}</span>
                <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                <div className="flex-1 bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-yellow-400 h-2 rounded-full"
                    style={{ width: `${percentage}%` }}
                  />
                </div>
                <span className="w-8 text-gray-600">{count}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Filters and Sort */}
        <div className="flex flex-wrap gap-4 items-center">
          <div className="flex items-center space-x-2">
            <Filter className="h-4 w-4 text-gray-500" />
            <Select value={filterBy} onValueChange={setFilterBy}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Filter by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Reviews</SelectItem>
                <SelectItem value="5">5 Stars</SelectItem>
                <SelectItem value="4">4 Stars</SelectItem>
                <SelectItem value="3">3 Stars</SelectItem>
                <SelectItem value="2">2 Stars</SelectItem>
                <SelectItem value="1">1 Star</SelectItem>
                <SelectItem value="verified">Verified Only</SelectItem>
                <SelectItem value="recent">Recent (30 days)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center space-x-2">
            <TrendingUp className="h-4 w-4 text-gray-500" />
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">Newest First</SelectItem>
                <SelectItem value="oldest">Oldest First</SelectItem>
                <SelectItem value="highest">Highest Rated</SelectItem>
                <SelectItem value="lowest">Lowest Rated</SelectItem>
                <SelectItem value="helpful">Most Helpful</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Reviews List */}
        <div className="space-y-6">
          {filteredAndSortedReviews.map((review) => (
            <div key={review.id} className="border-b border-gray-200 pb-6 last:border-b-0">
              <div className="flex items-start space-x-3">
                <Avatar className="w-10 h-10">
                  <AvatarFallback className="text-sm">{review.avatar}</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <span className="font-semibold">{review.user}</span>
                      {review.verified && (
                        <Badge variant="secondary" className="text-xs">
                          Verified Purchase
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center space-x-2 text-sm text-gray-500">
                      <Calendar className="h-3 w-3" />
                      <span>{review.date}</span>
                    </div>
                  </div>

                  <div className="flex items-center space-x-1 mb-3">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={`review-${review.id}-star-${i}`}
                        className={`h-4 w-4 ${
                          i < review.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
                        }`}
                      />
                    ))}
                  </div>

                  <p className="text-gray-700 mb-4 leading-relaxed">{review.comment}</p>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <button
                        onClick={() => handleHelpfulClick(review.id, true)}
                        className={`flex items-center space-x-1 text-sm transition-colors ${
                          review.userLiked ? 'text-green-600' : 'text-gray-500 hover:text-green-600'
                        }`}
                      >
                        <ThumbsUp className="h-4 w-4" />
                        <span>Helpful ({review.helpful})</span>
                      </button>
                      <button
                        onClick={() => handleHelpfulClick(review.id, false)}
                        className={`flex items-center space-x-1 text-sm transition-colors ${
                          review.userDisliked ? 'text-red-600' : 'text-gray-500 hover:text-red-600'
                        }`}
                      >
                        <ThumbsDown className="h-4 w-4" />
                        <span>({review.unhelpful})</span>
                      </button>
                    </div>
                    <button className="text-gray-400 hover:text-gray-600">
                      <Flag className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredAndSortedReviews.length === 0 && (
          <div className="text-center py-8">
            <MessageSquare className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No reviews found</h3>
            <p className="text-gray-600 mb-4">
              {filterBy === "all" ? "Be the first to review this agent!" : "Try adjusting your filters"}
            </p>
            {filterBy !== "all" && (
              <Button variant="outline" onClick={() => setFilterBy("all")}>
                Clear Filters
              </Button>
            )}
          </div>
        )}

        {/* Load More */}
        {filteredAndSortedReviews.length >= 10 && (
          <div className="text-center">
            <Button variant="outline">
              Load More Reviews
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
