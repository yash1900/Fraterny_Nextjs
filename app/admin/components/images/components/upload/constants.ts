// Image categories for organizing uploads
export const IMAGE_CATEGORIES = [
  'Hero',
  'Designed for depth',
  'VillaLab',
  'Your tribe awaits',
  'Experience'
];

// Common website image keys that replace placeholders
export const IMAGE_KEYS = [
  { key: 'hero-background', description: 'Main Hero Section - Homepage' },
  { key: 'hero-background-mobile', description: 'Main Hero Section - Homepage (Mobile)' },
  { key: 'experience-hero', description: 'Experience Page - Hero Section' },
  { key: 'experience-hero-mobile', description: 'Experience Page - Hero Section (Mobile)' },
  { key: 'villalab-social', description: 'Villa Lab Section - Social Events' },
  { key: 'villalab-social-mobile', description: 'Villa Lab Section - Social Events (Mobile)' },
  { key: 'villalab-mentorship', description: 'Villa Lab Section - Mentorship' },
  { key: 'villalab-mentorship-mobile', description: 'Villa Lab Section - Mentorship (Mobile)' },
  { key: 'villalab-brainstorm', description: 'Villa Lab Section - Brainstorming' },
  { key: 'villalab-brainstorm-mobile', description: 'Villa Lab Section - Brainstorming (Mobile)' },
  { key: 'villalab-group', description: 'Villa Lab Section - Group Activities' },
  { key: 'villalab-group-mobile', description: 'Villa Lab Section - Group Activities (Mobile)' },
  { key: 'villalab-networking', description: 'Villa Lab Section - Networking' },
  { key: 'villalab-networking-mobile', description: 'Villa Lab Section - Networking (Mobile)' },
  { key: 'villalab-candid', description: 'Villa Lab Section - Candid Interactions' },
  { key: 'villalab-candid-mobile', description: 'Villa Lab Section - Candid Interactions (Mobile)' },
  { key: 'villalab-gourmet', description: 'Villa Lab Section - Gourmet Meals' },
  { key: 'villalab-gourmet-mobile', description: 'Villa Lab Section - Gourmet Meals (Mobile)' },
  { key: 'villalab-workshop', description: 'Villa Lab Section - Workshops' },
  { key: 'villalab-workshop-mobile', description: 'Villa Lab Section - Workshops (Mobile)' },
  { key: 'villalab-evening', description: 'Villa Lab Section - Evening Sessions' },
  { key: 'villalab-evening-mobile', description: 'Villa Lab Section - Evening Sessions (Mobile)' },
  { key: 'experience-villa-retreat', description: 'Experience Page - Villa Retreat' },
  { key: 'experience-villa-retreat-mobile', description: 'Experience Page - Villa Retreat (Mobile)' },
  { key: 'experience-workshop', description: 'Experience Page - Workshop' },
  { key: 'experience-workshop-mobile', description: 'Experience Page - Workshop (Mobile)' },
  { key: 'experience-networking', description: 'Experience Page - Networking' },
  { key: 'experience-networking-mobile', description: 'Experience Page - Networking (Mobile)' },
  { key: 'experience-collaboration', description: 'Experience Page - Collaboration' },
  { key: 'experience-collaboration-mobile', description: 'Experience Page - Collaboration (Mobile)' },
  { key: 'experience-evening-session', description: 'Experience Page - Evening Session' },
  { key: 'experience-evening-session-mobile', description: 'Experience Page - Evening Session (Mobile)' },
  { key: 'experience-gourmet-dining', description: 'Experience Page - Gourmet Dining' },
  { key: 'experience-gourmet-dining-mobile', description: 'Experience Page - Gourmet Dining (Mobile)' },
  { key: 'tribe-visionary', description: 'Experience Page - Tribe Section - Visionary' },
  { key: 'tribe-visionary-mobile', description: 'Experience Page - Tribe Section - Visionary (Mobile)' },
  { key: 'tribe-hustler', description: 'Experience Page - Tribe Section - Hustler' },
  { key: 'tribe-hustler-mobile', description: 'Experience Page - Tribe Section - Hustler (Mobile)' },
  { key: 'tribe-workaholic', description: 'Experience Page - Tribe Section - Workaholic' },
  { key: 'tribe-workaholic-mobile', description: 'Experience Page - Tribe Section - Workaholic (Mobile)' },
  { key: 'tribe-experienced', description: 'Experience Page - Tribe Section - Experienced' },
  { key: 'tribe-experienced-mobile', description: 'Experience Page - Tribe Section - Experienced (Mobile)' },
  { key: 'tribe-optimist', description: 'Experience Page - Tribe Section - Optimist' },
  { key: 'tribe-optimist-mobile', description: 'Experience Page - Tribe Section - Optimist (Mobile)' },
  { key: 'tribe-guardian', description: 'Experience Page - Tribe Section - Guardian' },
  { key: 'tribe-guardian-mobile', description: 'Experience Page - Tribe Section - Guardian (Mobile)' },
  { key: 'depth-house-code', description: 'Experience Page - Depth Section - House Code' },
  { key: 'depth-house-code-mobile', description: 'Experience Page - Depth Section - House Code (Mobile)' },
  { key: 'depth-startup', description: 'Experience Page - Depth Section - Startup Simulations' },
  { key: 'depth-startup-mobile', description: 'Experience Page - Depth Section - Startup Simulations (Mobile)' },
  { key: 'depth-learning', description: 'Experience Page - Depth Section - Learning Experience' },
  { key: 'depth-learning-mobile', description: 'Experience Page - Depth Section - Learning Experience (Mobile)' },
  { key: 'depth-frameworks', description: 'Experience Page - Depth Section - Frameworks & Templates' },
  { key: 'depth-frameworks-mobile', description: 'Experience Page - Depth Section - Frameworks & Templates (Mobile)' },
  { key: 'depth-group-think', description: 'Experience Page - Depth Section - Group Think' },
  { key: 'depth-group-think-mobile', description: 'Experience Page - Depth Section - Group Think (Mobile)' },
  { key: 'depth-memories', description: 'Experience Page - Depth Section - Lifelong Memories' },
  { key: 'depth-memories-mobile', description: 'Experience Page - Depth Section - Lifelong Memories (Mobile)' },
  { key: 'depth-food', description: 'Experience Page - Depth Section - Food & Coffee' },
  { key: 'depth-food-mobile', description: 'Experience Page - Depth Section - Food & Coffee (Mobile)' },
  { key: 'depth-community', description: 'Experience Page - Depth Section - Community' },
  { key: 'depth-community-mobile', description: 'Experience Page - Depth Section - Community (Mobile)' },
  { key: 'depth-soft-skills', description: 'Experience Page - Depth Section - Soft Skills' },
  { key: 'depth-soft-skills-mobile', description: 'Experience Page - Depth Section - Soft Skills (Mobile)' },
  { key: 'pricing-hero', description: 'Pricing Page - Hero Section' },
  { key: 'pricing-hero-mobile', description: 'Pricing Page - Hero Section (Mobile)' },
  { key: 'faq-hero', description: 'FAQ Page - Hero Section' },
  { key: 'faq-hero-mobile', description: 'FAQ Page - Hero Section (Mobile)' },
  { key: 'process-hero', description: 'Process Page - Hero Section' },
  { key: 'process-hero-mobile', description: 'Process Page - Hero Section (Mobile)' },
  { key: 'blog-hero', description: 'Blog Page - Hero Section' },
  { key: 'blog-hero-mobile', description: 'Blog Page - Hero Section (Mobile)' },
];

// Map of image keys to usage descriptions
export const IMAGE_USAGE_MAP: Record<string, string> = IMAGE_KEYS.reduce((acc, { key, description }) => {
  acc[key] = description;
  return acc;
}, {} as Record<string, string>);

// Recommended aspect ratios and descriptions
export const getRecommendedAspectRatio = (imageKey: string) => {
  if (imageKey.includes('hero')) {
    return { ratio: 16/9, label: 'Hero Section (16:9)' };
  } else if (imageKey.includes('banner')) {
    return { ratio: 3/1, label: 'Banner (3:1)' };
  } else if (imageKey.includes('profile')) {
    return { ratio: 1/1, label: 'Profile (1:1)' };
  } else if (imageKey.includes('thumbnail')) {
    return { ratio: 4/3, label: 'Thumbnail (4:3)' };
  } else if (imageKey.includes('villalab')) {
    return { ratio: 3/2, label: 'Villa Lab Gallery (3:2)' };
  } else if (imageKey.includes('experience')) {
    return { ratio: 16/9, label: 'Experience Section (16:9)' };
  } else if (imageKey.includes('tribe')) {
    return { ratio: 1/1, label: 'Tribe Section (1:1)' };
  } else if (imageKey.includes('depth')) {
    return { ratio: 16/9, label: 'Depth Section (16:9)' };
  }
  
  return { ratio: 16/9, label: 'Standard (16:9)' };
};

// Form validation schema
import { z } from 'zod';

export const uploadFormSchema = z.object({
  key: z.string().min(1, { message: "Image key is required" }),
  description: z.string().min(1, { message: "Description is required" }),
  alt_text: z.string().min(1, { message: "Alt text is required" }),
  category: z.string().optional(),
  // New SEO fields
  seo_title: z.string().optional(),
  seo_caption: z.string().optional(),
  focus_keywords: z.string().optional(),
  copyright: z.string().optional(),
  image_location: z.string().optional(),
  og_title: z.string().optional(),
  og_description: z.string().optional(),
  schema_type: z.string().optional(),
});

// SEO Schema Types for dropdown
export const SEO_SCHEMA_TYPES = [
  { value: 'ImageObject', label: 'Image Object (Default)' },
  { value: 'Photograph', label: 'Photograph' },
  { value: 'Artwork', label: 'Artwork' }
];


