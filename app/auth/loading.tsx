import { Skeleton } from "@/components/ui/skeleton";

export default function AuthLoading() {
  return (
    <div className="w-full max-w-6xl bg-white rounded-2xl shadow-xl overflow-hidden" style={{ height: '800px' }}>
      <div className="h-full relative">
        
        {/* Mobile View - Stacked Skeleton */}
        <div className="md:hidden h-full overflow-y-auto p-8">
          <div className="space-y-8">
            {/* Header Skeleton */}
            <div className="text-center space-y-3">
              <Skeleton className="h-8 w-48 mx-auto" />
              <Skeleton className="h-4 w-64 mx-auto" />
            </div>

            {/* Form Fields Skeleton */}
            <div className="space-y-4">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-12 w-full" />
            </div>

            {/* Toggle Link Skeleton */}
            <Skeleton className="h-4 w-56 mx-auto" />
          </div>
        </div>

        {/* Desktop View - Split Panel Skeleton */}
        <div className="hidden md:flex h-full">
          {/* Brand Panel Skeleton - Left Side */}
          <div className="w-1/2 h-full bg-gradient-to-br from-cyan-700 to-blue-900 p-12 flex flex-col justify-center">
            <div className="space-y-8">
              <Skeleton className="h-10 w-3/4 bg-white/20" />
              <Skeleton className="h-6 w-full bg-white/10" />
              
              <div className="space-y-6 mt-12">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex items-start space-x-4">
                    <Skeleton className="h-12 w-12 rounded-full bg-white/20" />
                    <div className="space-y-2 flex-1">
                      <Skeleton className="h-5 w-3/4 bg-white/20" />
                      <Skeleton className="h-4 w-full bg-white/10" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Form Panel Skeleton - Right Side */}
          <div className="w-1/2 h-full bg-white flex items-center justify-center p-8">
            <div className="w-full max-w-md space-y-8">
              {/* Form Header Skeleton */}
              <div className="text-center space-y-3">
                <Skeleton className="h-9 w-48 mx-auto" />
                <Skeleton className="h-5 w-64 mx-auto" />
              </div>

              {/* Form Fields Skeleton */}
              <div className="space-y-6">
                {/* Email Field */}
                <div className="space-y-2">
                  <Skeleton className="h-4 w-16" />
                  <Skeleton className="h-10 w-full" />
                </div>

                {/* Password Field */}
                <div className="space-y-2">
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-10 w-full" />
                </div>

                {/* Submit Button */}
                <Skeleton className="h-11 w-full" />
              </div>

              {/* Toggle Link Skeleton */}
              <Skeleton className="h-4 w-56 mx-auto" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}