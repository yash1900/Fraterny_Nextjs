export default function QuestLoading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="flex flex-col items-center gap-4">
        <div className="w-10 h-10 rounded-full border-4 border-blue-500 border-t-transparent animate-spin"></div>
        <p className="text-gray-700 font-medium">Welcome to the Quest!</p>
      </div>
    </div>
  );
}