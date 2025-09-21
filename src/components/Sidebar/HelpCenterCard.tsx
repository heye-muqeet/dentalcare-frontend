export function HelpCenterCard() {
  return (
    <div className="bg-indigo-50 rounded-lg p-4 flex flex-col items-start">
      <div className="font-semibold text-gray-700 mb-1">Help center</div>
      <div className="text-xs text-gray-500 mb-3">
        Etiam porta sem malesuada magna mollis euismod.
      </div>
      <button className="bg-indigo-700 text-white text-xs px-4 py-2 rounded hover:bg-indigo-800 transition">
        Go to help center
      </button>
    </div>
  );
} 