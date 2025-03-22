
const AddAppointmentModal = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/30 bg-opacity-30 backdrop-blur-md flex justify-center items-center">
      <div className="bg-white p-5 rounded-lg shadow-lg w-[500px] max-h-[80vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center border-b pb-2 mb-3">
          <h2 className="text-lg font-semibold">Add Appointment</h2>
          <button className="text-gray-500 hover:text-gray-700 text-xl" onClick={onClose}>✕</button>
        </div>

        {/* Patient Name Input */}
        <div className="mb-3">
          <label className="text-sm font-medium">Patient Name</label>
          <div className="flex items-center border rounded-md px-3 py-2 mt-1">
            <input type="text" placeholder="Enter name & number" className="flex-1 outline-none text-base" />
            <button className="text-blue-600 text-lg">🔍</button>
          </div>
        </div>

        {/* About the Patient */}
        <div className="mb-3">
          <label className="text-sm font-medium">About the Patient</label>
          <div className="flex space-x-2 mt-2">
            <select className="border rounded-md px-3 py-2 text-sm w-1/2">
              <option>Select source</option>
            </select>
            <label className="flex items-center space-x-1 text-sm">
              <input type="radio" name="visitType" />
              <span>First-Time Visit</span>
            </label>
            <label className="flex items-center space-x-1 text-sm">
              <input type="radio" name="visitType" />
              <span>Re-Visit</span>
            </label>
          </div>
          <label className="flex items-center mt-2 text-sm">
            <input type="checkbox" className="mr-2" />
            International Patient
          </label>
        </div>

        {/* Doctor Selection */}
        <div className="grid grid-cols-3 gap-3 mb-3">
          <select className="border rounded-md px-3 py-2 text-sm">
            <option>Select doctor</option>
          </select>
          <select className="border rounded-md px-3 py-2 text-sm">
            <option>Select visit type</option>
          </select>
          <input type="text" placeholder="Enter slot number" className="border rounded-md px-3 py-2 text-sm" />
        </div>

        {/* Time Selection */}
        <div className="mb-3">
          <label className="text-sm font-medium">Time</label>
          <div className="flex items-center space-x-2 mt-2">
            <input type="text" value="25/05/2022 03:00 PM" className="border rounded-md px-3 py-2 text-sm w-1/2" readOnly />
            <button className="text-blue-600 text-sm">Change Time</button>
          </div>
          <div className="flex flex-wrap space-x-3 mt-2 text-sm">
            <label className="flex items-center space-x-2">
              <input type="checkbox" />
              <span>Mark as Arrived</span>
            </label>
            <label className="flex items-center space-x-2">
              <input type="checkbox" />
              <span>Is Walk-in</span>
            </label>
            <label className="flex items-center space-x-2">
              <input type="checkbox" />
              <span>Needs Attention</span>
            </label>
          </div>
        </div>

        {/* Review Notes */}
        <div className="mb-3">
          <label className="text-sm font-medium">Review Notes</label>
          <textarea placeholder="Enter patient details..." className="w-full border rounded-md px-3 py-2 text-sm"></textarea>
          <label className="flex items-center mt-2 text-sm">
            <input type="checkbox" className="mr-2" />
            Enable repeat patient
          </label>
        </div>

        {/* Footer */}
        <div className="flex justify-end">
          <button className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm hover:bg-blue-700 transition">
            Add Appointment →
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddAppointmentModal;
