import React from 'react';
import { Editor } from '@tinymce/tinymce-react';

interface TextEditorProps {
  content: string;
  onChange: (value: string) => void;
}

const TextEditor: React.FC<TextEditorProps> = ({ content, onChange }) => {
  return (
    <div className="w-full border rounded-lg overflow-hidden">
      <Editor
        apiKey={process.env.NEXT_PUBLIC_TINYMCE_API_KEY || 'no-api-key'}
        value={content}
        onEditorChange={(value: string) => onChange(value)}
        init={{
          height: 200,
          menubar: false,
          plugins: [
            'lists', 'link', 'image', 'charmap', 'preview',
            'searchreplace', 'visualblocks', 'code', 'fullscreen',
            'insertdatetime', 'media', 'table', 'help', 'wordcount'
          ],
          toolbar: 'bold italic underline | alignleft aligncenter alignright | bullist numlist | link',
          content_css: 'default'
        }}
      />
    </div>
  );
};

export default TextEditor;
