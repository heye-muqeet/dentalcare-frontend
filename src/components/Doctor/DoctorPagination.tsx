export function DoctorPagination() {
  return (
    <div className="flex justify-between items-center mt-6">
      <button className="border px-4 py-2 rounded text-sm text-gray-700 hover:bg-gray-100">Previous</button>
      <div className="flex space-x-2">
        {[1, 2, 3, '...', 8, 9, 10].map((page, idx) => (
          <button
            key={idx}
            className={`px-3 py-1 rounded text-sm ${page === 1 ? 'bg-indigo-700 text-white' : 'text-gray-700 hover:bg-gray-100'}`}
          >
            {page}
          </button>
        ))}
      </div>
      <button className="border px-4 py-2 rounded text-sm text-gray-700 hover:bg-gray-100">Next</button>
    </div>
  );
} 