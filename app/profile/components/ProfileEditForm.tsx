// src/components/profile/forms/ProfileEditForm.tsx

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  UserCog, CheckCircle, AlertTriangle, Loader2, 
  Save, User, Mail, Phone, MapPin, Briefcase, 
  Building, Bell, FileText
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Textarea } from '@/components/ui/textarea';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { useAuth } from '@/app/auth/cotexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface ProfileEditFormProps {
  className?: string;
  id?: string;
}

interface ProfileFormData {
  firstName: string;
  lastName: string;
  phone: string;
  bio: string;
  location: string;
  currentOccupationStatus: string;
  company: string;
  notificationPreference: 'all' | 'important' | 'none';
}

const ProfileEditForm: React.FC<ProfileEditFormProps> = ({ 
  className = '',
  id = 'profile-edit-section'
}) => {
  const { user } = useAuth();
  const userMetadata = user?.user_metadata || {};
  
  // Form state
  const [formData, setFormData] = useState<ProfileFormData>({
    firstName: '',
    lastName: '',
    phone: '',
    bio: '',
    location: '',
    currentOccupationStatus: '',
    company: '',
    notificationPreference: 'all'
  });
  
  const [isLoading, setIsLoading] = useState(false);
  const [formSuccess, setFormSuccess] = useState(false);
  const [formError, setFormError] = useState('');
  const [profileLoading, setProfileLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("personal");

  // Animation variants matching our design system
  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0, 
      transition: { 
        duration: 0.5,
        staggerChildren: 0.1
      } 
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { 
      opacity: 1, 
      y: 0, 
      transition: { 
        duration: 0.5
      } 
    }
  };

  // Load user profile data
  useEffect(() => {
    const loadProfileData = async () => {
      if (!user) return;
      
      setProfileLoading(true);
      try {
        // Get user metadata from auth
        setFormData({
          firstName: userMetadata.first_name || '',
          lastName: userMetadata.last_name || '',
          phone: userMetadata.phone || '',
          bio: userMetadata.bio || '',
          location: userMetadata.location || '',
          currentOccupationStatus: userMetadata.job_title || '',
          company: userMetadata.company || '',
          notificationPreference: userMetadata.notification_preference || 'all'
        });
        
        // Get extended profile from user_profiles table
        type UserProfileRow = {
          id: string;
          user_id: string;
          subscription_type: "free" | "paid";
          subscription_start_date: string | null;
          subscription_end_date: string | null;
          payment_status: "active" | "cancelled" | "expired" | "pending";
          created_at: string;
          updated_at: string;
          bio?: string;
          location?: string;
          job_title?: string;
          company?: string;
          notification_preference?: 'all' | 'important' | 'none';
        };

        // const { data: profileData, error } = await supabase
        //   .from('user_profiles')
        //   .select('*')
        //   .eq('user_id', user.id)
        //   .single<UserProfileRow>();
          
        // if (error && error.code !== 'PGRST116') {
        //   console.error('Error fetching profile:', error);
        // }
        
        // if (profileData) {
        //   // Update form with additional profile data
        //   setFormData(prev => ({
        //     ...prev,
        //     bio: profileData.bio || prev.bio,
        //     location: profileData.location || prev.location,
        //     jobTitle: profileData.job_title || prev.jobTitle,
        //     company: profileData.company || prev.company,
        //     notificationPreference: profileData.notification_preference || prev.notificationPreference
        //   }));
        // }
      } catch (err) {
        console.error('Error loading profile data:', err);
      } finally {
        setProfileLoading(false);
      }
    };
    
    loadProfileData();
  }, [user, userMetadata]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setFormError('');
    setFormSuccess(false);
  };
  
  const handleSelectChange = (value: string, name: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
    setFormError('');
    setFormSuccess(false);
  };

  const validateForm = (): string | null => {
    // Validate required fields
    if (!formData.firstName.trim()) {
      return 'First name is required';
    }
    if (!formData.lastName.trim()) {
      return 'Last name is required';
    }
    
    // Phone validation (optional)
    if (formData.phone && !/^\+?[0-9\s-()]{8,20}$/.test(formData.phone)) {
      return 'Please enter a valid phone number';
    }
    
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const validationError = validateForm();
    if (validationError) {
      setFormError(validationError);
      return;
    }
    
    setIsLoading(true);
    setFormError('');
    
    try {
      // Update auth user metadata
      const { error: authError } = await supabase.auth.updateUser({
        data: {
          first_name: formData.firstName,
          last_name: formData.lastName,
          phone: formData.phone,
          bio: formData.bio,
          location: formData.location,
          job_title: formData.currentOccupationStatus,
          company: formData.company,
          notification_preference: formData.notificationPreference
        }
      });

      if (authError) throw authError;

      // Ensure user_id is defined and a string
      if (!user?.id) {
        throw new Error('User ID is missing. Please re-login and try again.');
      }

      // Upsert extended profile data
      // const { error: profileError } = await supabase
      //   .from('user_profiles')
      //   .upsert({
      //     user_id: user.id,
      //     bio: formData.bio,
      //     location: formData.location,
      //     job_title: formData.jobTitle,
      //     company: formData.company,
      //     notification_preference: formData.notificationPreference,
      //     updated_at: new Date().toISOString()
      //   });

      //if (profileError) throw profileError;

      setFormSuccess(true);
      toast.success('Profile updated successfully');

      // Reset success message after 3 seconds
      setTimeout(() => setFormSuccess(false), 3000);

    } catch (err: any) {
      const errorMessage = err.message || 'Failed to update profile. Please try again.';
      setFormError(errorMessage);
      toast.error(errorMessage);
      console.error('Profile update error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  if (profileLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-cyan-600" />
        <span className="ml-3 text-gray-600 font-gilroy-semibold">Loading profile data...</span>
      </div>
    );
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      id={id}
      className={className}
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {formSuccess && (
          <motion.div variants={itemVariants}>
            <Alert className="border-green-200 bg-green-50">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-800 font-gilroy-semibold">
                Profile updated successfully!
              </AlertDescription>
            </Alert>
          </motion.div>
        )}

        {formError && (
          <motion.div variants={itemVariants}>
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription className="font-gilroy-semibold">
                {formError}
              </AlertDescription>
            </Alert>
          </motion.div>
        )}

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid grid-cols-3 mb-6 bg-slate-100 dark:bg-slate-800">
            <TabsTrigger 
              value="personal" 
              className="flex items-center gap-2 font-gilroy-semibold data-[state=active]:bg-gradient-to-br data-[state=active]:from-cyan-600 data-[state=active]:to-blue-700 data-[state=active]:text-white"
            >
              <User className="h-4 w-4" />
              <span className="hidden sm:inline">Personal</span>
            </TabsTrigger>
            <TabsTrigger 
              value="professional" 
              className="flex items-center gap-2 font-gilroy-semibold data-[state=active]:bg-gradient-to-br data-[state=active]:from-cyan-600 data-[state=active]:to-blue-700 data-[state=active]:text-white"
            >
              <Briefcase className="h-4 w-4" />
              <span className="hidden sm:inline">Professional</span>
            </TabsTrigger>
            <TabsTrigger 
              value="preferences" 
              className="flex items-center gap-2 font-gilroy-semibold data-[state=active]:bg-gradient-to-br data-[state=active]:from-cyan-600 data-[state=active]:to-blue-700 data-[state=active]:text-white"
            >
              <Bell className="h-4 w-4" />
              <span className="hidden sm:inline">Preferences</span>
            </TabsTrigger>
          </TabsList>
          
          {/* Personal Information Tab */}
          <TabsContent value="personal" className="space-y-6">
            <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* First Name */}
              <div className="space-y-2">
                <Label htmlFor="firstName" className="flex items-center gap-2 font-gilroy-bold text-base">
                  <User className="h-4 w-4 text-cyan-600" />
                  First Name *
                </Label>
                <Input
                  id="firstName"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleInputChange}
                  placeholder="Enter first name"
                  disabled={isLoading}
                  required
                  className="border-slate-300 focus:border-cyan-600 font-gilroy-regular"
                />
              </div>

              {/* Last Name */}
              <div className="space-y-2">
                <Label htmlFor="lastName" className="flex items-center gap-2 font-gilroy-bold text-base">
                  <User className="h-4 w-4 text-cyan-600" />
                  Last Name *
                </Label>
                <Input
                  id="lastName"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleInputChange}
                  placeholder="Enter last name"
                  disabled={isLoading}
                  required
                  className="border-slate-300 focus:border-cyan-600 font-gilroy-regular"
                />
              </div>
            </motion.div>

            <motion.div variants={itemVariants}>
              {/* Phone */}
              <div className="space-y-2">
                <Label htmlFor="phone" className="flex items-center gap-2 font-gilroy-bold text-base">
                  <Phone className="h-4 w-4 text-cyan-600" />
                  Phone Number
                </Label>
                <Input
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  placeholder="+1 234 567 8900 (optional)"
                  disabled={isLoading}
                  className="border-slate-300 focus:border-cyan-600 font-gilroy-regular"
                />
                <p className="text-sm text-gray-600 font-gilroy-regular">
                  Include country code for international numbers
                </p>
              </div>
            </motion.div>

            <motion.div variants={itemVariants}>
              {/* Bio */}
              <div className="space-y-2">
                <Label htmlFor="bio" className="flex items-center gap-2 font-gilroy-bold text-base">
                  <FileText className="h-4 w-4 text-cyan-600" />
                  Bio
                </Label>
                <Textarea
                  id="bio"
                  name="bio"
                  value={formData.bio}
                  onChange={handleInputChange}
                  placeholder="Tell us about yourself (optional)"
                  disabled={isLoading}
                  className="min-h-[120px] border-slate-300 focus:border-cyan-600 font-gilroy-regular"
                />
                <p className="text-sm text-gray-600 font-gilroy-regular">
                  Share a brief introduction about yourself
                </p>
              </div>
            </motion.div>
          </TabsContent>
          
          {/* Professional Information Tab */}
          <TabsContent value="professional" className="space-y-6">
            <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Location */}
              <div className="space-y-2">
                <Label htmlFor="location" className="flex items-center gap-2 font-gilroy-bold text-base">
                  <MapPin className="h-4 w-4 text-emerald-600" />
                  Location
                </Label>
                <Input
                  id="location"
                  name="location"
                  value={formData.location}
                  onChange={handleInputChange}
                  placeholder="City, Country (optional)"
                  disabled={isLoading}
                  className="border-slate-300 focus:border-cyan-600 font-gilroy-regular"
                />
              </div>

              {/* Job Title */}
              <div className="space-y-2">
                <Label htmlFor="jobTitle" className="flex items-center gap-2 font-gilroy-bold text-base">
                  <Briefcase className="h-4 w-4 text-purple-600" />
                  Job Title
                </Label>
                <Input
                  id="jobTitle"
                  name="jobTitle"
                  value={formData.currentOccupationStatus}
                  onChange={handleInputChange}
                  placeholder="Your job title (optional)"
                  disabled={isLoading}
                  className="border-slate-300 focus:border-cyan-600 font-gilroy-regular"
                />
              </div>
            </motion.div>

            <motion.div variants={itemVariants}>
              {/* Company */}
              <div className="space-y-2">
                <Label htmlFor="company" className="flex items-center gap-2 font-gilroy-bold text-base">
                  <Building className="h-4 w-4 text-blue-600" />
                  Company
                </Label>
                <Input
                  id="company"
                  name="company"
                  value={formData.company}
                  onChange={handleInputChange}
                  placeholder="Your company (optional)"
                  disabled={isLoading}
                  className="border-slate-300 focus:border-cyan-600 font-gilroy-regular"
                />
              </div>
            </motion.div>

            <motion.div variants={itemVariants} className="pt-4">
              <div className="bg-cyan-50 dark:bg-cyan-900/20 rounded-lg p-4 border border-cyan-200 dark:border-cyan-800">
                <h4 className="font-gilroy-bold text-cyan-900 dark:text-cyan-100 mb-2 flex items-center gap-2">
                  <Briefcase className="h-4 w-4" />
                  Professional Profile
                </h4>
                <p className="text-sm text-cyan-800 dark:text-cyan-200 font-gilroy-regular">
                  Your professional information helps us personalize your experience and connect you with relevant opportunities.
                </p>
              </div>
            </motion.div>
          </TabsContent>
          
          {/* Preferences Tab */}
          <TabsContent value="preferences" className="space-y-6">
            <motion.div variants={itemVariants}>
              {/* Notification Preference */}
              <div className="space-y-2">
                <Label htmlFor="notificationPreference" className="flex items-center gap-2 font-gilroy-bold text-base">
                  <Bell className="h-4 w-4 text-amber-600" />
                  Email Notifications
                </Label>
                <Select
                  value={formData.notificationPreference}
                  onValueChange={(value) => handleSelectChange(value, 'notificationPreference')}
                  disabled={isLoading}
                >
                  <SelectTrigger id="notificationPreference" className="w-full border-slate-300 focus:border-cyan-600 font-gilroy-regular">
                    <SelectValue placeholder="Select notification preference" />
                  </SelectTrigger>
                  <SelectContent className="font-gilroy-regular">
                    <SelectItem value="all">All Notifications</SelectItem>
                    <SelectItem value="important">Important Only</SelectItem>
                    <SelectItem value="none">No Notifications</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-sm text-gray-600 font-gilroy-regular">
                  Choose how often you'd like to receive email notifications
                </p>
              </div>
            </motion.div>
            
            <motion.div variants={itemVariants}>
              <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-4 border border-slate-200 dark:border-slate-700">
                <h4 className="font-gilroy-bold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-amber-500" />
                  Privacy & Security
                </h4>
                <p className="text-sm text-gray-600 dark:text-gray-400 font-gilroy-regular mb-3">
                  For password changes and account deletion, please visit the other sections in Account Security.
                </p>
                <ul className="text-sm text-gray-600 dark:text-gray-400 font-gilroy-regular space-y-1">
                  <li>• Your data is encrypted and securely stored</li>
                  <li>• We never share your personal information</li>
                  <li>• You can download or delete your data anytime</li>
                </ul>
              </div>
            </motion.div>
          </TabsContent>
        </Tabs>

        {/* Save Button */}
        <motion.div variants={itemVariants} className="flex justify-end pt-6 border-t border-slate-200 dark:border-slate-700">
          <Button 
            type="submit" 
            disabled={isLoading}
            className="bg-gradient-to-r from-cyan-600 to-blue-700 hover:from-cyan-700 hover:to-blue-800 text-white font-gilroy-bold shadow-md hover:shadow-lg px-8"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving Changes...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Save Changes
              </>
            )}
          </Button>
        </motion.div>
      </form>
    </motion.div>
  );
};

export default ProfileEditForm;