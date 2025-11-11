'use client';

import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { supabase } from '@/integrations/supabase/client';
import { MessageCircle, AlertCircle } from 'lucide-react';

export interface Comment {
  id: string;
  blog_post_id: string;
  name: string;
  email: string;
  content: string;
  created_at: string;
}

interface CommentSectionProps {
  postId: string;
}

const CommentSection: React.FC<CommentSectionProps> = ({ postId }) => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [content, setContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchComments = async () => {
      setIsLoading(true);
      try {
        const { data, error: fetchError } = await supabase
          .from('blog_comments')
          .select('*')
          .eq('blog_post_id', postId)
          .order('created_at', { ascending: false });
        
        if (fetchError) throw fetchError;
        
        setComments(data as Comment[] || []);
      } catch (err: any) {
        setError(err.message || 'Failed to load comments');
        console.error('Error fetching comments:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchComments();
  }, [postId]);

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim() || !email.trim() || !content.trim()) {
      toast.error("Please fill out all fields to post a comment.");
      return;
    }

    setIsSubmitting(true);
    
    try {
      const { data, error: insertError } = await supabase
        .from('blog_comments')
        .insert([
          { blog_post_id: postId, name, email, content }
        ])
        .select();
      
      if (insertError) throw insertError;
      
      if (data && data.length > 0) {
        setComments([data[0] as Comment, ...comments]);
        setContent('');
        toast.success("Your comment has been published!");
      }
    } catch (err: any) {
      toast.error(err.message || "Something went wrong. Please try again.");
      console.error('Error posting comment:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="mt-12 pt-8 border-t border-gray-200">
      <h3 className="text-2xl font-playfair text-navy flex items-center mb-6">
        <MessageCircle className="mr-2" size={24} />
        Comments {comments.length > 0 && `(${comments.length})`}
      </h3>
      
      <form onSubmit={handleSubmitComment} className="mb-10 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
              Name
            </label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-md border border-input px-3 py-2"
              required
            />
          </div>
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              Email (not published)
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-md border border-input px-3 py-2"
              required
            />
          </div>
        </div>
        <div>
          <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-1">
            Comment
          </label>
          <Textarea
            id="content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="w-full min-h-[100px]"
            required
          />
        </div>
        <Button 
          type="submit" 
          disabled={isSubmitting}
          className="bg-black hover:bg-black/90 text-white"
        >
          {isSubmitting ? 'Posting...' : 'Post Comment'}
        </Button>
      </form>
      
      {isLoading ? (
        <div className="text-center py-8">
          <div className="inline-block h-6 w-6 animate-spin rounded-full border-4 border-solid border-navy border-r-transparent align-[-0.125em]"></div>
          <p className="mt-2 text-gray-600">Loading comments...</p>
        </div>
      ) : error ? (
        <div className="flex items-center justify-center py-8 text-red-600">
          <AlertCircle className="mr-2" />
          {error}
        </div>
      ) : comments.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          No comments yet. Be the first to share your thoughts!
        </div>
      ) : (
        <div className="space-y-8">
          {comments.map((comment) => (
            <div key={comment.id} className="flex gap-4">
              <Avatar className="h-10 w-10 bg-navy text-white">
                <AvatarFallback>{getInitials(comment.name)}</AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <div className="flex items-baseline justify-between">
                  <h4 className="font-medium text-navy">{comment.name}</h4>
                  <span className="text-sm text-gray-500">{formatDate(comment.created_at)}</span>
                </div>
                <p className="mt-2 text-gray-700 whitespace-pre-line">{comment.content}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CommentSection;
