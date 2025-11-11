'use client';

import React from 'react';
import { MessageCircle, Star, TrendingUp } from 'lucide-react';

export interface FeedbackStatsData {
  totalFeedbacks: number;
  averageRating: number;
  ratingDistribution: {
    rating1: number;
    rating2: number;
    rating3: number;
    rating4: number;
    rating5: number;
  };
  feedbacksWithTestId: number;
  feedbacksWithoutTestId: number;
  recentFeedbacks: number;
}

interface FeedbackStatsProps {
  stats: FeedbackStatsData;
}

const StarRating: React.FC<{ rating: number; size?: string }> = ({ rating, size = 'h-4 w-4' }) => {
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star 
          key={star} 
          className={`${size} ${
            star <= rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
          }`} 
        />
      ))}
      <span className="text-sm text-gray-600 ml-1">({rating})</span>
    </div>
  );
};

export default function FeedbackStats({ stats }: FeedbackStatsProps) {
  return (
    <>
      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {/* Total Feedbacks Card */}
        <div className="flex flex-col gap-2 rounded-xl p-6 border border-gray-200 bg-white">
          <div className="flex items-center justify-between">
            <p className="text-gray-600 text-base font-medium leading-normal">Total Feedbacks</p>
            <MessageCircle className="h-6 w-6 text-blue-500" />
          </div>
          <p className="text-gray-900 tracking-tight text-4xl font-bold leading-tight">
            {stats.totalFeedbacks.toLocaleString()}
          </p>
        </div>

        {/* Average Rating Card */}
        <div className="flex flex-col gap-2 rounded-xl p-6 border border-gray-200 bg-white">
          <div className="flex items-center justify-between">
            <p className="text-gray-600 text-base font-medium leading-normal">Average Rating</p>
            <Star className="h-6 w-6 text-yellow-500" />
          </div>
          <div className="flex items-center gap-2">
            <p className="text-gray-900 tracking-tight text-4xl font-bold leading-tight">
              {stats.averageRating}
            </p>
            <StarRating rating={Math.round(stats.averageRating)} size="h-5 w-5" />
          </div>
        </div>

        {/* Recent Feedbacks Card */}
        <div className="flex flex-col gap-2 rounded-xl p-6 border border-gray-200 bg-white">
          <div className="flex items-center justify-between">
            <p className="text-gray-600 text-base font-medium leading-normal">Recent (7 days)</p>
            <TrendingUp className="h-6 w-6 text-purple-500" />
          </div>
          <p className="text-gray-900 tracking-tight text-4xl font-bold leading-tight">
            {stats.recentFeedbacks.toLocaleString()}
          </p>
        </div>
      </div>

      {/* Rating Distribution */}
      <div className="bg-white rounded-xl p-6 border border-gray-200 mb-8">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Rating Distribution</h3>
        <div className="grid grid-cols-5 gap-4">
          {[5, 4, 3, 2, 1].map((rating) => {
            const count = stats.ratingDistribution[`rating${rating}` as keyof typeof stats.ratingDistribution];
            const percentage = stats.totalFeedbacks > 0 ? (count / stats.totalFeedbacks) * 100 : 0;
            return (
              <div key={rating} className="text-center">
                <div className="flex items-center justify-center mb-2">
                  <span className="text-sm font-medium mr-1">{rating}</span>
                  <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                  <div 
                    className="bg-yellow-400 h-2 rounded-full transition-all duration-300" 
                    style={{ width: `${percentage}%` }}
                  ></div>
                </div>
                <p className="text-sm text-gray-600">{count} ({percentage.toFixed(1)}%)</p>
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
}
