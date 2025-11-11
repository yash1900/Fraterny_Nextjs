'use client';

import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";

interface PageHeaderProps {
  onNewPostClick: () => void;
}

const PageHeader = ({ onNewPostClick }: PageHeaderProps) => {
  return (
    <div className="flex flex-col mb-8">
      <h2 className="text-3xl font-bold tracking-tight text-gray-900">Blog Management</h2>
      <p className="text-gray-600 mb-4">
        Create and manage your blog posts
      </p>
      
      <div className="flex gap-2">
        <Button 
          onClick={onNewPostClick}
          className="flex items-center justify-center gap-2"
        >
          <PlusCircle className="h-4 w-4" />
          New Post
        </Button>
      </div>
    </div>
  );
};

export default PageHeader;
