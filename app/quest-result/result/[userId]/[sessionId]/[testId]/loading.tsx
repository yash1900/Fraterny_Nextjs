// loading.tsx
export default function Loading() {
  return (
    <div className="h-screen bg-[#004A7F] max-h-screen relative overflow-hidden flex items-center justify-center">
      <div className="text-center px-4">
        <h2 className="text-4xl font-gilroy-bold text-white mb-4">
          Loading your results...
        </h2>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
        </div>
      </div>
    </div>
  );
}