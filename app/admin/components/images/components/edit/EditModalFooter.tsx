'use client';


import { Check } from 'lucide-react';

interface EditModalFooterProps {
  onClose: () => void;
  isPending: boolean;
}

const EditModalFooter = ({ onClose, isPending }: EditModalFooterProps) => {
  return (
    <div className="flex justify-end gap-3">
      <button
        type="button"
        onClick={onClose}
        className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors"
      >
        Cancel
      </button>
      <button
        type="submit"
        className="px-4 py-2 bg-navy text-white rounded-md hover:bg-opacity-90 transition-colors flex items-center gap-2"
        disabled={isPending}
      >
        {isPending ? (
          <>
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-solid border-white border-r-transparent"></div>
            Updating...
          </>
        ) : (
          <>
            <Check className="w-4 h-4" />
            Save Changes
          </>
        )}
      </button>
    </div>
  );
};

export default EditModalFooter;


