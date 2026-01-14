'use client';
import { useState } from 'react';
import { Send, Star, ChevronRight, Calendar, SkipForward } from 'lucide-react';
import Image from 'next/image';
import img from "@/public/profile.jpg"
export default function ReviewForm() {
  const [overallRating, setOverallRating] = useState(5);
  const [ratings, setRatings] = useState({
    quality: 5,
    communication: 5,
    timeliness: 5,
    valueForMoney: 5
  });
  const [review, setReview] = useState('');
  const [hoveredStar, setHoveredStar] = useState<{ category: string; value: number } | null>(null);

  const handleSubmit = () => {
    // In your Next.js app, you would use: router.push('/pages/findServiceProvider');
    window.location.href = '/pages/findServiceProvider';
  };

  const handleSkip = () => {
    // In your Next.js app, you would use: router.push('/pages/findServiceProvider');
    window.location.href = '/pages/findServiceProvider';
  };

  const StarRating = ({ 
    value, 
    onChange, 
    category 
  }: { 
    value: number; 
    onChange: (val: number) => void; 
    category: string;
  }) => {
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => onChange(star)}
            onMouseEnter={() => setHoveredStar({ category, value: star })}
            onMouseLeave={() => setHoveredStar(null)}
            className="transition-transform hover:scale-110 focus:outline-none"
          >
            <Star
              className={`w-6 h-6 md:w-7 md:h-7 transition-colors ${
                star <= (hoveredStar?.category === category ? hoveredStar.value : value)
                  ? 'fill-yellow-400 text-yellow-400'
                  : 'fill-gray-300 text-gray-300'
              }`}
              strokeWidth={star <= (hoveredStar?.category === category ? hoveredStar.value : value) ? 0 : 1.5}
            />
          </button>
        ))}
      </div>
    );
  };

  return (
    <div className="min-h-screen px-[32px] md:px-[104px] py-[32px] md:py-[38px]">
      <div className="">
      

        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-[20px] ">
          Rate Your Experience
        </h1>

        {/* Venue Info Card */}
        <div className="bg-white rounded-lg border border-[#E5E7EB] p-[16px] md:p-[25px] mb-[20px]">
          <div className="flex items-start gap-4">
            <div className="relative">
              <Image
  src={img}
  alt="Grand Palace Event Center"
  width={80} // or 100 for md:w-20
  height={80} // or 100 for md:h-20
  className="rounded-lg object-cover flex-shrink-0"
/>
             
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="text-lg md:text-xl font-semibold text-gray-900 truncate">
                    Grand Palace Event Center
                  </h2>
                  <p className="text-sm md:text-base text-gray-600 mt-1">
                    Wedding Reception Venue
                  </p>
                </div>
               
              </div>
              <div className="flex items-center text-gray-500 mt-2">
                <Calendar className="w-4 h-4 mr-2" />
                <p className="text-xs md:text-sm">
                  Booking Date: December 15, 2024
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Rating Section */}
        <div className="space-y-6">
          {/* Overall Rating */}
          <div className="bg-white rounded-lg border border-[#E5E7EB] p-[16px] md:p-[25px] mb-[20px]">
            <h3 className="text-base md:text-lg font-semibold text-gray-900 mb-4">
              Overall Rating
            </h3>
            
            <div className="flex flex-col items-center py-6">
              <div className="flex gap-2 mb-4">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setOverallRating(star)}
                    onMouseEnter={() => setHoveredStar({ category: 'overall', value: star })}
                    onMouseLeave={() => setHoveredStar(null)}
                    className="transition-transform hover:scale-110 focus:outline-none"
                  >
                    <Star
                      className={`w-10 h-10 md:w-12 md:h-12 transition-colors ${
                        star <= (hoveredStar?.category === 'overall' ? hoveredStar.value : overallRating)
                          ? 'fill-yellow-400 text-yellow-400'
                          : 'fill-gray-300 text-gray-300'
                      }`}
                      strokeWidth={star <= (hoveredStar?.category === 'overall' ? hoveredStar.value : overallRating) ? 0 : 1.5}
                    />
                  </button>
                ))}
              </div>
              <div className="text-2xl md:text-3xl font-bold text-gray-900">
                {overallRating} / 5
              </div>
              <div className="mt-2 text-sm text-gray-500">
                Tap a star to rate
              </div>
            </div>

            {/* Category Ratings */}
            <div className="space-y-4 md:space-y-5 mt-6">
              <div className="flex items-center justify-between">
                <span className="text-sm md:text-base text-gray-700 font-medium">Quality</span>
                <StarRating
                  value={ratings.quality}
                  onChange={(val) => setRatings({ ...ratings, quality: val })}
                  category="quality"
                />
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm md:text-base text-gray-700 font-medium">Communication</span>
                <StarRating
                  value={ratings.communication}
                  onChange={(val) => setRatings({ ...ratings, communication: val })}
                  category="communication"
                />
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm md:text-base text-gray-700 font-medium">Timeliness</span>
                <StarRating
                  value={ratings.timeliness}
                  onChange={(val) => setRatings({ ...ratings, timeliness: val })}
                  category="timeliness"
                />
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm md:text-base text-gray-700 font-medium">Value for Money</span>
                <StarRating
                  value={ratings.valueForMoney}
                  onChange={(val) => setRatings({ ...ratings, valueForMoney: val })}
                  category="valueForMoney"
                />
              </div>
            </div>
          </div>

          {/* Review Text */}
          <div className="bg-white rounded-lg border border-[#E5E7EB] p-[16px] md:p-[25px] mb-[20px]">
            <h3 className="text-base md:text-lg font-semibold text-gray-900 mb-4">
              Write a Review
            </h3>
            
            <textarea
              value={review}
              onChange={(e) => setReview(e.target.value)}
              placeholder="Share your experience... what did you like? What could be better?"
              className="w-full min-h-[120px] md:min-h-[150px] p-4 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-[#B74140] focus:border-transparent outline-none text-sm md:text-base"
              maxLength={500}
            />
            
            <div className="flex items-center justify-between mt-2 text-xs md:text-sm text-gray-500">
              <span>Minimum 20 characters</span>
              <span>{review.length} / 500</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col-reverse md:flex-row gap-[20px] md:justify-between md:items-center pb-6">
            <button
              type="button"
              onClick={handleSkip}
              className="text-gray-600 hover:text-gray-800 font-medium py-[16px]  text-sm md:text-base transition-colors flex items-center rounded-lg border border-[#E5E7EB] w-full justify-center "
            >
              
              Skip for now
            </button>
            
            <button
              type="button"
              onClick={handleSubmit}
              className="bg-[#B74140] hover:bg-[#862b2a] text-white font-semibold py-[16px] px-8 rounded-lg flex items-center justify-center gap-2 transition-colors text-sm md:text-base w-full"
            >
              <Send className="w-4 h-4 md:w-5 md:h-5" />
              Submit Review
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}