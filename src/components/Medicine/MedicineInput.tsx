export interface Medicine {
  name: string;
  dosage: string;
  frequency: string;
  duration: string;
}

interface MedicineInputProps {
  medicines: Medicine[];
  onChange: (medicines: Medicine[]) => void;
  disabled?: boolean;
}

export function MedicineInput({ medicines, onChange, disabled = false }: MedicineInputProps) {
  const addMedicine = () => {
    onChange([...medicines, { name: '', dosage: '', frequency: '', duration: '' }]);
  };

  const removeMedicine = (index: number) => {
    onChange(medicines.filter((_, i) => i !== index));
  };

  const updateMedicine = (index: number, field: keyof Medicine, value: string) => {
    const updated = [...medicines];
    updated[index] = { ...updated[index], [field]: value };
    onChange(updated);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <label className="block text-sm font-bold text-[#232360]">Medicines</label>
        <button
          type="button"
          onClick={addMedicine}
          disabled={disabled}
          className="text-[#0A0F56] text-sm hover:underline flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <span className="mr-1">+</span> Add Medicine
        </button>
      </div>

      <div className="bg-[#F8F7FF] p-1 rounded-lg space-y-3">
        {medicines.map((medicine, index) => (
          <div key={index} className="bg-white p-4 rounded-lg border border-gray-200 space-y-3">
            <div className="flex justify-between items-start">
              <div className="flex-1 grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Medicine Name</label>
                  <input
                    type="text"
                    value={medicine.name}
                    onChange={(e) => updateMedicine(index, 'name', e.target.value)}
                    disabled={disabled}
                    placeholder="e.g., Amoxicillin"
                    className="w-full border border-[#B6C3E6] rounded-lg p-2 text-sm bg-[#F7F8FA] font-semibold text-[#232360] disabled:opacity-50 disabled:cursor-not-allowed"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Dosage</label>
                  <input
                    type="text"
                    value={medicine.dosage}
                    onChange={(e) => updateMedicine(index, 'dosage', e.target.value)}
                    disabled={disabled}
                    placeholder="e.g., 500mg"
                    className="w-full border border-[#B6C3E6] rounded-lg p-2 text-sm bg-[#F7F8FA] font-semibold text-[#232360] disabled:opacity-50 disabled:cursor-not-allowed"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Frequency</label>
                  <input
                    type="text"
                    value={medicine.frequency}
                    onChange={(e) => updateMedicine(index, 'frequency', e.target.value)}
                    disabled={disabled}
                    placeholder="e.g., Twice daily"
                    className="w-full border border-[#B6C3E6] rounded-lg p-2 text-sm bg-[#F7F8FA] font-semibold text-[#232360] disabled:opacity-50 disabled:cursor-not-allowed"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Duration</label>
                  <input
                    type="text"
                    value={medicine.duration}
                    onChange={(e) => updateMedicine(index, 'duration', e.target.value)}
                    disabled={disabled}
                    placeholder="e.g., 7 days"
                    className="w-full border border-[#B6C3E6] rounded-lg p-2 text-sm bg-[#F7F8FA] font-semibold text-[#232360] disabled:opacity-50 disabled:cursor-not-allowed"
                  />
                </div>
              </div>
              {medicines.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeMedicine(index)}
                  disabled={disabled}
                  className="text-red-500 hover:text-red-700 p-1 ml-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  aria-label="Remove medicine"
                >
                  ✕
                </button>
              )}
            </div>
          </div>
        ))}
        {medicines.length === 0 && (
          <p className="text-sm text-gray-500 text-center py-4">No medicines added yet.</p>
        )}
      </div>
    </div>
  );
} 