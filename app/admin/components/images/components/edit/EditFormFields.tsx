'use client';

import { WebsiteImage } from '../../hooks/useImageManagement';
import SEOFieldsSection from '../upload/SEOFieldsSection';

const IMAGE_CATEGORIES = ['website', 'blog', 'product', 'profile', 'other'];

type EditFormType = {
  key: string;
  description: string;
  alt_text: string;
  category: string;
};

interface EditFormFieldsProps {
  editForm: EditFormType;
  setEditForm: React.Dispatch<React.SetStateAction<EditFormType>>;
  image: WebsiteImage;
}

const EditFormFields = ({ editForm, setEditForm, image }: EditFormFieldsProps) => {
  return (
    <>
      <div>
        <label htmlFor="edit_key" className="block text-sm font-medium text-gray-700 mb-1">
          Image Key <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          id="edit_key"
          value={editForm.key}
          onChange={(e) => setEditForm(prev => ({ ...prev, key: e.target.value }))}
          className="w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-navy focus:border-navy"
          required
        />
        <p className="mt-1 text-xs text-gray-500">
          Changing this key can break website image references.
        </p>
      </div>

      <div>
        <label htmlFor="edit_category" className="block text-sm font-medium text-gray-700 mb-1">
          Category
        </label>
        <select
          id="edit_category"
          value={editForm.category}
          onChange={(e) => setEditForm(prev => ({ ...prev, category: e.target.value }))}
          className="w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-navy focus:border-navy"
        >
          <option value="">Select a category</option>
          {IMAGE_CATEGORIES.map(category => (
            <option key={category} value={category}>{category}</option>
          ))}
        </select>
      </div>
      
      <div>
        <label htmlFor="edit_description" className="block text-sm font-medium text-gray-700 mb-1">
          Description <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          id="edit_description"
          value={editForm.description}
          onChange={(e) => setEditForm(prev => ({ ...prev, description: e.target.value }))}
          className="w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-navy focus:border-navy"
          required
        />
      </div>
      
      <div>
        <label htmlFor="edit_alt_text" className="block text-sm font-medium text-gray-700 mb-1">
          Alt Text <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          id="edit_alt_text"
          value={editForm.alt_text}
          onChange={(e) => setEditForm(prev => ({ ...prev, alt_text: e.target.value }))}
          className="w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-navy focus:border-navy"
          required
        />
      </div>

      {(image.width && image.height) && (
        <div className="text-sm text-gray-600">
          Image dimensions: {image.width} × {image.height}px
        </div>
      )}
    </>
  );
};

export default EditFormFields;


