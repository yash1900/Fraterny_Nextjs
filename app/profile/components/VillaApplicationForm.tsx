// src/components/profile/VillaApplicationForm.tsx

import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion, AnimatePresence } from 'framer-motion';
import {
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Users,
  Home,
  ClipboardList,
  Check,
  Copy,
  ChevronLeft,
  ChevronRight,
  Loader2,
  AlertCircle,
  CheckCircle2,
  FileText,
  Briefcase
} from 'lucide-react';
import { useAuth } from '@/app/auth/cotexts/AuthContext';
import axios from 'axios';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from '@/components/ui/form';

// import { fetchUpcomingEditions, VillaEdition } from '@/services/website-settings';
import { format } from 'date-fns';

// Types
interface DashboardTest {
  userid: string;
  testid: string;
  sessionid: string;
  testtaken: string;
  ispaymentdone: "success" | null;
  quest_pdf: string;
  quest_status: "generated" | "working";
}

interface DashboardApiResponse {
  status: number;
  data: DashboardTest[];
}

// Zod Schema
const villaApplicationSchema = z.object({
  // Personal Details
  firstName: z.string().min(2, 'First name must be at least 2 characters'),
  lastName: z.string().min(2, 'Last name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  phone: z.string().min(10, 'Phone number must be at least 10 digits'),
  location: z.string().min(2, 'Location is required'),
  dob: z.string().optional(),
  currentOccupationStatus: z.string().min(1, 'Current Occupation Status is required'),
  company: z.string().optional(),
  
  // Emergency Contact
  emergencyName: z.string().min(0, 'Emergency contact name is required'),
  emergencyPhone: z.string().min(0, 'Emergency contact phone is required'),

  // social media
  socialPlatform: z.string().min(1, 'Please select a platform'),
  socialLink: z.string().min(1, 'Social link is required'),
  
  // Quest Data
  selectedTestId: z.string().min(1, 'Please select a Quest assessment'),
  
  // Villa Booking Details
  // checkInDate: z.string().min(1, 'Check-in date is required'),
  // checkOutDate: z.string().min(1, 'Check-out date is required'),
  numberOfGuests: z.number().min(1, 'At least 1 guest is required').max(20, 'Maximum 20 guests'),
  numberOfRooms: z.number().min(1, 'At least 1 room is required').max(10, 'Maximum 10 rooms'),
  selectedEditionId: z.string().min(1, 'Please select a villa edition'),
  numberOfAccompanyingPersons: z.number().min(0).max(10),
  accompanyingPersons: z.array(
    z.object({
      name: z.string().min(1, 'Name is required'),
      dob: z.string().min(1, 'Date of birth is required'),
      socialLink: z.string().url('Please enter a valid URL')
    })
  ).optional(),
  
  // Additional Info
  purposeOfVisit: z.string().min(1, 'Purpose of visit is required'),
  specialRequests: z.string().optional(),
  dietaryRequirements: z.string().optional(),
  referralSource: z.string().optional(),

  termsAccepted: z.boolean().refine((val) => val === true, {
    message: 'You must accept the terms and conditions',
  }),
})
// .refine((data) => {
//   const checkIn = new Date(data.checkInDate);
//   const checkOut = new Date(data.checkOutDate);
//   return checkOut > checkIn;
// }, {
//   message: 'Check-out date must be after check-in date',
//   path: ['checkOutDate'],
// });

type VillaApplicationFormData = z.infer<typeof villaApplicationSchema>;

interface VillaApplicationFormProps {
  className?: string;
  onSuccess?: () => void;
}

interface VillaEdition {
  id: string;
  startDate: string;
  endDate: string;
  timeFrame?: string | null;
  isActive: boolean;
  allocationStatus: 'available' | 'limited' | 'sold_out';
  allotedSeats: number;
  totalSeats: number;
  displayOrder: number;
  createdAt?: string;
}

export function VillaApplicationForm({ className = '', onSuccess }: VillaApplicationFormProps) {
  const { user } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const [questData, setQuestData] = useState<DashboardTest[]>([]);
  const [loadingQuestData, setLoadingQuestData] = useState(true);
  const [selectedTest, setSelectedTest] = useState<DashboardTest | null>(null);
  const [copiedTestId, setCopiedTestId] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editions, setEditions] = useState<VillaEdition[]>([]);
  const [loadingEditions, setLoadingEditions] = useState(true);
  const [selectedEdition, setSelectedEdition] = useState<VillaEdition | null>(null);
  const [accompanyingCount, setAccompanyingCount] = useState(0);
  const [isSuccess, setIsSuccess] = useState(false);
  const [submissionError, setSubmissionError] = useState<string | null>(null);

  const totalSteps = 4;

  // Initialize form with react-hook-form
  const form = useForm<VillaApplicationFormData>({
    resolver: zodResolver(villaApplicationSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      location: '',
      dob: '',
      currentOccupationStatus: '',
      company: '',
      emergencyName: '',
      emergencyPhone: '',
      socialPlatform: '',
      socialLink: '',
      selectedTestId: '',
      // checkInDate: '',
      // checkOutDate: '',
      selectedEditionId: '',
      numberOfAccompanyingPersons: 0,
      accompanyingPersons: [],
      numberOfGuests: 1,
      numberOfRooms: 1,
      purposeOfVisit: '',
      specialRequests: '',
      dietaryRequirements: '',
      referralSource: '',
      termsAccepted: false,
    },
  });

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
      },
    },
  };

  // Fetch user Quest data
  useEffect(() => {
    const fetchQuestData = async () => {
      if (!user?.id) {
        setLoadingQuestData(false);
        return;
      }

      try {
        const response = await axios.get<DashboardApiResponse>(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/userdashboard/${user.id}`,
          {
            headers: {
              'Content-Type': 'application/json',
            },
          }
        );
        console.log('Quest data fetched successfully:', response.data.data);

        if (response.data.status === 200) {
          // Filter only completed and paid assessments
          const completedTests = response.data.data
          
          // Sort by date (latest first)
          const sortedTests = completedTests.sort((a, b) => {
            return new Date(b.testtaken).getTime() - new Date(a.testtaken).getTime();
          });
          
          setQuestData(sortedTests);
          console.log('Filtered and sorted Quest data:', sortedTests);
          
        }
      } catch (error) {
        console.error('Failed to fetch Quest data:', error);
        toast.error('Failed to load your Quest assessments');
      } finally {
        setLoadingQuestData(false);
      }
    };

    fetchQuestData();
  }, [user?.id]);

  // Fetch available villa editions
  useEffect(() => {
    const loadEditions = async () => {
      setLoadingEditions(true);
      try {
        const response = await fetch('/api/settings/editions?operation=filter&isActive=true');
        const result = await response.json();

        if (!result.success) {
        throw new Error(result.error || 'Failed to fetch editions');
        }

        const data = result.data; 
        console.log('Fetched villa editions:', data);
        
        // Filter only active editions that are not sold out and are in the future
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const availableEditions = data.filter((edition: VillaEdition) => {
          const isActive = edition.isActive;
          const notSoldOut = edition.allocationStatus !== 'sold_out';

          console.log('Edition check:', {
            dates: `${edition.startDate} to ${edition.endDate}`,
            isActive,
            notSoldOut,
            passed: isActive && notSoldOut
        });
  
        // Removed date check for now - showing all active editions
        return isActive && notSoldOut;
        }).sort((a: VillaEdition, b: VillaEdition) => a.displayOrder - b.displayOrder);

        console.log('Filtered available editions:', availableEditions);
        
        setEditions(availableEditions);
      } catch (error) {
        console.error('Error loading editions:', error);
        toast.error('Failed to load available editions');
      } finally {
        setLoadingEditions(false);
      }
    };

    loadEditions();
  }, []);

  // Auto-populate user data
  useEffect(() => {
    if (user) {
      const metadata = user.user_metadata || {};
      form.reset({
        ...form.getValues(),
        firstName: metadata.first_name || '',
        lastName: metadata.last_name || '',
        email: user.email || '',
        phone: metadata.phone || '',
        location: metadata.location || '',
        dob: metadata.dob || '',
        currentOccupationStatus: '',
        company: metadata.company || '',
      });
    }
  }, [user]);

  // Format date for display
  const formatDate = (dateString: string): string => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
    } catch {
      return dateString;
    }
  };

  // Handle test selection
  const handleTestSelect = (test: DashboardTest) => {
    setSelectedTest(test);
    form.setValue('selectedTestId', test.testid);
  };

  // Copy Test ID
  const handleCopyTestId = (testId: string) => {
    navigator.clipboard.writeText(testId);
    setCopiedTestId(true);
    toast.success('Test ID copied to clipboard');
    setTimeout(() => setCopiedTestId(false), 2000);
  };

  // Navigation
  const nextStep = async () => {
    let fieldsToValidate: (keyof VillaApplicationFormData)[] = [];

    switch (currentStep) {
      case 1:
        fieldsToValidate = ['firstName', 'lastName', 'email', 'phone', 'location', 'currentOccupationStatus', 'socialPlatform', 'socialLink', 'emergencyName', 'emergencyPhone'];
        break;
      case 2:
        fieldsToValidate = ['selectedTestId'];
        break;
      case 3:
        fieldsToValidate = ['selectedEditionId', 'numberOfAccompanyingPersons', 'numberOfGuests', 'numberOfRooms', 'purposeOfVisit'];
        break;
      case 4:
        fieldsToValidate = ['termsAccepted'];
      break;
    }

    const isValid = await form.trigger(fieldsToValidate);
    if (isValid) {
      setCurrentStep((prev) => Math.min(prev + 1, totalSteps));
    }
  };

  const prevStep = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  // Form submission
  const onSubmit = async (data: VillaApplicationFormData) => {
  setIsSubmitting(true);

  try {
    // Prepare comprehensive submission data
    const submissionData = {
      // User Information
      userId: user?.id,
      userEmail: user?.email,
      
      // Personal Details
      personalDetails: {
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        phone: data.phone,
        location: data.location,
        dob: data.dob || null,
        currentOccupationStatus: data.currentOccupationStatus,
        company: data.company || null,
      },
      
      // Emergency Contact
      emergencyContact: {
        name: data.emergencyName,
        phone: data.emergencyPhone,
      },
      
      // Social Media
      socialMedia: {
        platform: data.socialPlatform,
        link: data.socialLink,
      },
      
      // Quest Assessment
      questAssessment: {
        selectedTestId: data.selectedTestId,
        testDetails: selectedTest ? {
          testId: selectedTest.testid,
          sessionId: selectedTest.sessionid,
          testTaken: selectedTest.testtaken,
          paymentStatus: selectedTest.ispaymentdone,
          questPdf: selectedTest.quest_pdf,
          questStatus: selectedTest.quest_status,
        } : null,
      },
      
      // Villa Edition Selection
      villaEdition: {
        selectedEditionId: data.selectedEditionId,
        editionDetails: selectedEdition ? {
          id: selectedEdition.id,
          startDate: selectedEdition.startDate,
          endDate: selectedEdition.endDate,
          timeFrame: selectedEdition.timeFrame,
          allocationStatus: selectedEdition.allocationStatus,
          totalSeats: selectedEdition.totalSeats,
          allotedSeats: selectedEdition.allotedSeats,
        } : null,
      },
      
      // Accompanying Persons
      accompanyingPersons: {
        count: data.numberOfAccompanyingPersons,
        persons: data.accompanyingPersons || [],
      },
      
      // Booking Details
      bookingDetails: {
        numberOfGuests: data.numberOfGuests,
        numberOfRooms: data.numberOfRooms,
        purposeOfVisit: data.purposeOfVisit,
        specialRequests: data.specialRequests || null,
        dietaryRequirements: data.dietaryRequirements || null,
        referralSource: data.referralSource || null,
      },
      
      // Metadata
      metadata: {
        submittedAt: new Date().toISOString(),
        status: 'pending',
        applicationVersion: '1.0',
        submissionSource: 'web',
      },
    };

    // Console log formatted JSON
    console.log('='.repeat(80));
    console.log('VILLA APPLICATION SUBMISSION DATA');
    console.log('='.repeat(80));
    console.log(JSON.stringify(submissionData, null, 2));
    console.log('='.repeat(80));
    
    // Also log as a single line for easy copying
    console.log('JSON (single line):', JSON.stringify(submissionData));
    console.log('='.repeat(80));

    // Submit to API
    const [response] = await Promise.all([
      axios.post('/api/villa/application', submissionData),
      new Promise(resolve => setTimeout(resolve, 1500)) // 1.5 second minimum
    ]);

    if (!response.data.success) {
      throw new Error(response.data.error || 'Submission failed');
    }
    console.log('Application ID:', response.data.data.applicationId);
    setIsSuccess(true);
    
    // if (onSuccess) {
    //   onSuccess();
    // }

    // Reset form
    // form.reset();
    // setCurrentStep(1);
    // setSelectedTest(null);
    // setSelectedEdition(null);
    // setAccompanyingCount(0);
    
  } catch (error) {
    console.error('Application submission error:', error);
    setSubmissionError(error instanceof Error ? error.message : 'Failed to submit application. Please try again.');
  } finally {
    setIsSubmitting(false);
  }
};

  // Step content renderer
  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return renderPersonalDetailsStep();
      case 2:
        return renderQuestSelectionStep();
      case 3:
        return renderVillaDetailsStep();
      case 4:
        return renderReviewStep();
      default:
        return null;
    }
  };

  // Step 1: Personal Details
  const renderPersonalDetailsStep = () => (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-6"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField
          control={form.control}
          name="firstName"
          render={({ field }) => (
            <FormItem>
              <FormLabel className='font-gilroy-bold text-lg'>First Name *</FormLabel>
              <FormControl>
                <div className="relative font-gilroy-regular">
                  <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input {...field} className="pl-10" placeholder="John" />
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="lastName"
          render={({ field }) => (
            <FormItem>
              <FormLabel className='font-gilroy-bold text-lg'>Last Name *</FormLabel>
              <FormControl>
                <div className="relative font-gilroy-regular">
                  <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input {...field} className="pl-10" placeholder="Doe" />
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <FormField
        control={form.control}
        name="email"
        render={({ field }) => (
          <FormItem>
            <FormLabel className='font-gilroy-bold text-lg'>Email Address *</FormLabel>
            <FormControl>
              <div className="relative font-gilroy-regular">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input {...field} type="email" className="pl-10" placeholder="john@example.com" />
              </div>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField
          control={form.control}
          name="phone"
          render={({ field }) => (
            <FormItem>
              <FormLabel className='font-gilroy-bold text-lg'>Phone Number *</FormLabel>
              <FormControl>
                <div className="relative font-gilroy-regular">
                  <Phone className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input {...field} className="pl-10" placeholder="+1 234 567 8900" />
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="location"
          render={({ field }) => (
            <FormItem>
              <FormLabel className='font-gilroy-bold text-lg'>Location/City *</FormLabel>
              <FormControl>
                <div className="relative font-gilroy-regular">
                  <MapPin className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input {...field} className="pl-10" placeholder="New York" />
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* <FormField
          control={form.control}
          name="dob"
          render={({ field }) => (
            <FormItem>
              <FormLabel className='font-gilroy-bold text-lg'>Date of Birth</FormLabel>
              <FormControl>
                <div className="relative font-gilroy-regular">
                  <Calendar className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input {...field} type="date" className="pl-10" />
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        /> */}

        <FormField
          control={form.control}
          name="currentOccupationStatus"
          render={({ field }) => (
            <FormItem>
              <FormLabel className='font-gilroy-bold text-lg'>Current Occupation Status <span className="text-red-500">*</span></FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl className='relative font-gilroy-regular'>
                  <SelectTrigger>
                    <SelectValue placeholder="Select your occupation status" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent className='font-gilroy-regular'>
                  <SelectItem value="Running/Starting a Business">Running/Starting a Business</SelectItem>
                  <SelectItem value="Self Employed/Freelancer">Self Employed/Freelancer</SelectItem>
                  <SelectItem value="Student">Student</SelectItem>
                  <SelectItem value="Employed">Employed</SelectItem>
                  <SelectItem value="Looking for Employment">Looking for Employment</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="socialPlatform"
            render={({ field }) => (
              <FormItem>
                <FormLabel className='font-gilroy-bold text-lg'>Social Platform <span className="text-red-500">*</span></FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl className="relative font-gilroy-regular">
                    <SelectTrigger>
                      <SelectValue placeholder="Select platform" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent className='font-gilroy-regular'>
                    <SelectItem value="LinkedIn">LinkedIn</SelectItem>
                    <SelectItem value="Instagram">Instagram</SelectItem>
                    <SelectItem value="Twitter/X">Twitter/X</SelectItem>
                    <SelectItem value="Facebook">Facebook</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="socialLink"
            render={({ field }) => (
              <FormItem>
                <FormLabel className='font-gilroy-bold text-lg'>Profile Link <span className="text-red-500">*</span></FormLabel>
                <FormControl className='relative font-gilroy-regular'>
                  <Input 
                    {...field} 
                    type="url"
                    placeholder="https://..." 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="company"
          render={({ field }) => (
            <FormItem>
              <FormLabel className='font-gilroy-bold text-lg'>Company</FormLabel>
              <FormControl>
                <Input {...field} className='font-gilroy-regular' placeholder="Company Name" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <div className="pt-4 border-t">
        <h3 className="text-lg font-semibold mb-4">Emergency Contact</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="emergencyName"
            render={({ field }) => (
              <FormItem>
                <FormLabel className='font-gilroy-bold text-lg'>Emergency Contact Name *</FormLabel>
                <FormControl>
                  <div className="relative">
                    <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input {...field} className="pl-10" placeholder="Jane Doe" />
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="emergencyPhone"
            render={({ field }) => (
              <FormItem>
                <FormLabel className='font-gilroy-bold text-lg'>Emergency Contact Phone *</FormLabel>
                <FormControl>
                  <div className="relative">
                    <Phone className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input {...field} className="pl-10" placeholder="+1 234 567 8900" />
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      </div>
    </motion.div>
  );

  // Step 2: Quest Selection
  const renderQuestSelectionStep = () => (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-6"
    >
      <div>
        <h3 className="text-lg font-gilroy-bold mb-2">Select Your Quest Assessment *</h3>
        <p className="text-sm text-gray-600 mb-4 font-gilroy-semibold">
          Choose from your completed Quest assessments to include with your villa application.
        </p>
      </div>

      {loadingQuestData ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-cyan-600" />
        </div>
      ) : questData.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
          <FileText className="h-12 w-12 text-gray-400 mx-auto mb-3" />
          <p className="text-gray-600 mb-2">No completed Quest assessments found</p>
          <p className="text-sm text-gray-500">
            You need a completed Quest assessment to apply for the villa.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {questData.map((test) => (
            <motion.div
              key={test.testid}
              whileTap={{ scale: 0.98 }}
              onClick={() => handleTestSelect(test)}
              className={`p-4 rounded-lg border-2 cursor-pointer transition-all shadow-sky-400 ${
                selectedTest?.testid === test.testid
                  ? 'border-sky-200 bg-cyan-50 bg-gradient-to-br from-cyan-600 to-blue-900 shadow-md hover:shadow-lg text-white'
                  : 'border-gray-200 hover:border-sky-700 bg-gradient-to-br from-cyan-500 to-blue-500 shadow-md hover:shadow-lg text-white'
              }`}
              
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    {selectedTest?.testid === test.testid ? (
                      <CheckCircle2 className="h-5 w-5 text-cyan-600" />
                    ) : (
                      <div className="h-5 w-5 rounded-full border-2 border-gray-300" />
                    )}
                    <div>
                      <p className="font-semibold text-white">
                        Assessment - {formatDate(test.testtaken)}
                      </p>
                      <p className="text-sm text-white/60">
                        Test ID: {test.testid.substring(0, 16)}...
                      </p>
                    </div>
                  </div>
                  {/* <div className="flex items-center space-x-2 ml-8">
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      ✓ Completed
                    </span>
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      Report Ready
                    </span>
                  </div> */}
                </div>
                {/* <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleCopyTestId(test.testid);
                  }}
                  className="ml-4"
                >
                  {copiedTestId ? (
                    <>
                      <Check className="h-4 w-4 mr-1" />
                      Copied
                    </>
                  ) : (
                    <>
                      <Copy className="h-4 w-4 mr-1" />
                      Copy ID
                    </>
                  )}
                </Button> */}
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {form.formState.errors.selectedTestId && (
        <p className="text-sm text-red-600">{form.formState.errors.selectedTestId.message}</p>
      )}
    </motion.div>
  );

  // Step 3: Villa Booking Details
  const renderVillaDetailsStep = () => (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-6"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* <FormField
          control={form.control}
          name="checkInDate"
          render={({ field }) => (
            <FormItem>
              <FormLabel className='font-gilroy-bold text-lg'>Check-in Date *</FormLabel>
              <FormControl>
                <div className="relative font-gilroy-regular">
                  <Calendar className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    {...field}
                    type="date"
                    className="pl-10"
                    min={new Date().toISOString().split('T')[0]}
                  />
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="checkOutDate"
          render={({ field }) => (
            <FormItem>
              <FormLabel className='font-gilroy-bold text-lg'>Check-out Date *</FormLabel>
              <FormControl>
                <div className="relative font-gilroy-regular">
                  <Calendar className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    {...field}
                    type="date"
                    className="pl-10"
                    min={form.watch('checkInDate') || new Date().toISOString().split('T')[0]}
                  />
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        /> */}

        {/* Villa Edition Selection */}
        {loadingEditions ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin text-navy" />
            <span className="ml-2 text-gray-600">Loading available editions...</span>
          </div>
        ) : editions.length === 0 ? (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
            <AlertCircle className="w-12 h-12 text-yellow-600 mx-auto mb-3" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Editions Available</h3>
            <p className="text-gray-600">
              No villa editions are currently available. Please check back later or contact support.
            </p>
          </div>
        ) : (
          <FormField
            control={form.control}
            name="selectedEditionId"
            render={({ field }) => (
              <FormItem>
                <FormLabel className='font-gilroy-bold text-lg'>
                  Select Villa Edition <span className="text-red-500">*</span>
                </FormLabel>
                <FormControl className="mb-2 relative font-gilroy-regular">
                  <div className="space-y-3">
                    {editions.map((edition) => {
                      const isSelected = field.value === edition.id;
                      const daysCount = Math.ceil(
                        (new Date(edition.endDate).getTime() - new Date(edition.startDate).getTime()) / 
                        (1000 * 60 * 60 * 24)
                      );
                      const seatsLeft = edition.totalSeats - edition.allotedSeats;
                      
                      return (
                        <div
                          key={edition.id}
                          onClick={() => {
                            field.onChange(edition.id);
                            setSelectedEdition(edition);
                          }}
                          className={`
                            relative border-2 rounded-lg p-4 cursor-pointer transition-all
                            ${isSelected 
                              ? 'border-navy bg-navy/5' 
                              : 'border-gray-200 hover:border-navy/50 bg-white'
                            }
                          `}
                        >
                          <div className="flex items-start gap-3">
                            <div className="flex items-center h-6 mt-1">
                              <input
                                type="radio"
                                checked={isSelected}
                                onChange={() => {
                                  field.onChange(edition.id);
                                  setSelectedEdition(edition);
                                }}
                                className="w-4 h-4 text-navy border-gray-300 focus:ring-navy"
                              />
                            </div>
                            
                            <div className="flex-1">
                              <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center gap-2">
                                  <Calendar className="w-4 h-4 text-gray-500" />
                                  <h4 className="font-medium text-gray-900">
                                    {format(new Date(edition.startDate), 'do MMMM')} - {format(new Date(edition.endDate), 'do MMMM yyyy')}
                                  </h4>
                                </div>
                                <span className="text-sm text-gray-500">({daysCount} days)</span>
                              </div>
                              
                              {edition.timeFrame && (
                                <p className="text-sm text-gray-600 mb-2">
                                  {edition.timeFrame}
                                </p>
                              )}
                              
                              <div className="flex items-center gap-3">
                                <span className={`
                                  px-2 py-1 text-xs font-medium rounded-full
                                  ${edition.allocationStatus === 'available' 
                                    ? 'bg-green-100 text-green-800' 
                                    : 'bg-yellow-100 text-yellow-800'
                                  }
                                `}>
                                  {edition.allocationStatus === 'available' ? 'Available' : 'Limited'}
                                </span>
                                
                                <span className="text-sm text-gray-600 flex items-center gap-1">
                                  <Users className="w-4 h-4" />
                                  {seatsLeft} seats remaining
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )}
      </div>

      {/* Number of Accompanying Persons */}
      <FormField
        control={form.control}
        name="numberOfAccompanyingPersons"
        render={({ field }) => (
          <FormItem>
            <FormLabel className='font-gilroy-bold text-lg'>
              Number of Accompanying Persons <span className="text-red-500">*</span>
            </FormLabel>
            <Select 
              onValueChange={(value) => {
                const count = parseInt(value);
                field.onChange(count);
                setAccompanyingCount(count);
                
                // Initialize empty array for accompanying persons
                if (count > 0) {
                  const emptyPersons = Array.from({ length: count }, () => ({
                    name: '',
                    dob: '',
                    socialLink: ''
                  }));
                  form.setValue('accompanyingPersons', emptyPersons);
                } else {
                  form.setValue('accompanyingPersons', []);
                }
              }} 
              value={field.value?.toString()}
            >
              <FormControl className='relative font-gilroy-regular'>
                <SelectTrigger>
                  <SelectValue placeholder="Select number of persons" />
                </SelectTrigger>
              </FormControl>
              <SelectContent className='absolute z-10 mt-1 w-full bg-white border border-gray-200 rounded-md shadow-lg font-gilroy-regular'>
                <SelectItem value="0">0 (Just me)</SelectItem>
                <SelectItem value="1">1 person</SelectItem>
                <SelectItem value="2">2 people</SelectItem>
                <SelectItem value="3">3 people</SelectItem>
                <SelectItem value="4">4 people</SelectItem>
                <SelectItem value="5">5 people</SelectItem>
                <SelectItem value="6">6 people</SelectItem>
                <SelectItem value="7">7 people</SelectItem>
                <SelectItem value="8">8 people</SelectItem>
                <SelectItem value="9">9 people</SelectItem>
                <SelectItem value="10">10 people</SelectItem>
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* Dynamic Forms for Accompanying Persons */}
      {accompanyingCount > 0 && (
        <div className="space-y-6 mt-6">
          <div className="border-t pt-6">
            <h3 className="text-lg font-gilroy-bold mb-2">
              Accompanying Persons Details
            </h3>
            <p className="text-sm text-gray-600 font-gilroy-semibold">
              Please provide details for each person accompanying you
            </p>
          </div>
          
          {Array.from({ length: accompanyingCount }).map((_, index) => (
            <div 
              key={index} 
              className="border border-gray-200 rounded-lg p-6 bg-gray-50"
            >
              <h4 className="text-md font-gilroy-bold text-navy mb-4 flex items-center gap-2">
                <User className="w-5 h-5" />
                Accompanying Person {index + 1}
              </h4>
              
              <div className="space-y-4">
                {/* Name Field */}
                <FormField
                  control={form.control}
                  name={`accompanyingPersons.${index}.name`}

                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className='font-gilroy-bold'>
                        Full Name <span className="text-red-500">*</span>
                      </FormLabel>
                      <FormControl>
                        <Input 
                          className='font-gilroy-regular'
                          {...field} 
                          placeholder="Enter full name"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                {/* Date of Birth Field */}
                <FormField
                  control={form.control}
                  name={`accompanyingPersons.${index}.dob`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className='font-gilroy-bold'>
                        Date of Birth <span className="text-red-500">*</span>
                      </FormLabel>
                      <FormControl>
                        <Input 
                          className='font-gilroy-regular'
                          {...field} 
                          type="date"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                {/* Social Link Field */}
                <FormField
                  control={form.control}
                  name={`accompanyingPersons.${index}.socialLink`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className='font-gilroy-bold'>
                        Public Social Link <span className="text-red-500">*</span>
                      </FormLabel>
                      <FormControl>
                        <Input 
                          {...field} 
                          type="url"
                          placeholder="https://linkedin.com/in/... or https://instagram.com/..."
                          className='font-gilroy-regular'
                        />
                      </FormControl>
                      <FormDescription className="text-xs text-gray-500">
                        LinkedIn, Instagram, Twitter, or any other public social profile
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>
          ))}
        </div>
      )}

      
      {/* <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField
          control={form.control}
          name="numberOfGuests"
          render={({ field }) => (
            <FormItem>
              <FormLabel className='font-gilroy-bold text-lg'>Number of Guests *</FormLabel>
              <FormControl>
                <div className="relative font-gilroy-regular">
                  <Users className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    {...field}
                    type="number"
                    min="1"
                    max="20"
                    className="pl-10"
                    onChange={(e) => field.onChange(parseInt(e.target.value) || 1)}
                  />
                </div>
              </FormControl>
              <FormDescription>Maximum 20 guests</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="numberOfRooms"
          render={({ field }) => (
            <FormItem>
              <FormLabel className='font-gilroy-bold text-lg'>Number of Rooms *</FormLabel>
              <FormControl>
                <div className="relative font-gilroy-regular">
                  <Home className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    {...field}
                    type="number"
                    min="1"
                    max="10"
                    className="pl-10"
                    onChange={(e) => field.onChange(parseInt(e.target.value) || 1)}
                  />
                </div>
              </FormControl>
              <FormDescription>Maximum 10 rooms</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />        
      </div> */}

      <FormField
        control={form.control}
        name="purposeOfVisit"
        render={({ field }) => (
          <FormItem>
            <FormLabel className='font-gilroy-bold text-lg'>Purpose of Visit *</FormLabel>
            <Select onValueChange={field.onChange} defaultValue={field.value}>
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Select purpose" />
                </SelectTrigger>
              </FormControl>
              <SelectContent className='font-gilroy-regular'>
                <SelectItem value="vacation">Vacation</SelectItem>
                <SelectItem value="retreat">Personal Retreat</SelectItem>
                <SelectItem value="corporate">Corporate Event</SelectItem>
                <SelectItem value="celebration">Celebration</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="specialRequests"
        render={({ field }) => (
          <FormItem>
            <FormLabel className='font-gilroy-bold text-lg'>Special Requests</FormLabel>
            <FormControl>
              <Textarea
                {...field}
                placeholder="Any special accommodations or requests..."
                rows={3}
                className='font-gilroy-regular'
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="dietaryRequirements"
        render={({ field }) => (
          <FormItem>
            <FormLabel className='font-gilroy-bold text-lg'>Dietary Requirements</FormLabel>
            <FormControl>
              <Textarea
                {...field}
                placeholder="Any dietary restrictions or preferences..."
                rows={3}
                className='font-gilroy-regular'
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="referralSource"
        render={({ field }) => (
          <FormItem>
            <FormLabel className='font-gilroy-bold text-lg'>How did you hear about us?</FormLabel>
            <Select onValueChange={field.onChange} defaultValue={field.value}>
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Select source" />
                </SelectTrigger>
              </FormControl>
              <SelectContent className='font-gilroy-regular'>
                <SelectItem value="website">Website</SelectItem>
                <SelectItem value="social_media">Social Media</SelectItem>
                <SelectItem value="friend">Friend/Family</SelectItem>
                <SelectItem value="quest">Quest Assessment</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />
    </motion.div>
  );

  // Step 4: Review
  const renderReviewStep = () => {
    const values = form.getValues();
    return (
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -20 }}
        className="space-y-6"
      >
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <div className="flex items-start space-x-3">
            <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5" />
            <div>
              <h4 className="font-gilroy-bold text-blue-900 mb-1">Review Your Application</h4>
              <p className="text-sm font-gilroy-semibold text-blue-700">
                Please review all details carefully before submitting your villa application.
              </p>
            </div>
          </div>
        </div>

        {/* Personal Details */}
        <div className="bg-white rounded-lg border p-4">
          <h3 className="font-gilroy-bold text-lg mb-3 flex items-center">
            <User className="h-5 w-5 mr-2 text-cyan-600" />
            Personal Details
          </h3>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <span className="text-gray-600 font-gilroy-regular">Name:</span>
              <p className="font-gilroy-semibold">{values.firstName} {values.lastName}</p>
            </div>
            <div>
              <span className="text-gray-600 font-gilroy-regular">Email:</span>
              <p className="font-gilroy-semibold">{values.email}</p>
            </div>
            <div>
              <span className="text-gray-600 font-gilroy-regular">Phone:</span>
              <p className="font-gilroy-semibold">{values.phone}</p>
            </div>
            <div>
              <span className="text-gray-600 font-gilroy-regular">Location:</span>
              <p className="font-gilroy-semibold">{values.location}</p>
            </div>
            {values.currentOccupationStatus && (
              <div>
                <span className="text-gray-600 font-gilroy-regular">Current Occupation Status:</span>
                <p className="font-gilroy-semibold">{values.currentOccupationStatus}</p>
              </div>
            )}
            {values.company && (
              <div>
                <span className="text-gray-600 font-gilroy-regular">Company:</span>
                <p className="font-gilroy-semibold">{values.company}</p>
              </div>
            )}
          </div>
          <div className="mt-3 pt-3 border-t">
            <span className="text-gray-600 text-sm">Emergency Contact:</span>
            <p className="font-medium">{values.emergencyName} - {values.emergencyPhone}</p>
          </div>
        </div>

        {/* Quest Assessment */}
        <div className="bg-white rounded-lg border p-4">
          <h3 className="font-gilroy-bold text-lg mb-3 flex items-center">
            <FileText className="h-5 w-5 mr-2 text-cyan-600" />
            Quest Assessment
          </h3>
          <div className="text-sm">
            <span className="text-gray-600 font-gilroy-regular">Selected Test ID:</span>
            <p className="font-gilroy-semibold mt-1">{values.selectedTestId}</p>
            {selectedTest && (
              <p className="text-gray-500 mt-1 font-gilroy-regular">
                Assessment Date: {formatDate(selectedTest.testtaken)}
              </p>
            )}
          </div>
        </div>

        {/* Villa Booking Details */}
        <div className="bg-white rounded-lg border p-4">
          <h3 className="font-gilroy-bold text-lg mb-3 flex items-center">
            <Home className="h-5 w-5 mr-2 text-cyan-600" />
            Booking Details
          </h3>
          <div className="grid grid-cols-2 gap-3 text-sm">
            {/* <div>
              <span className="text-gray-600 font-gilroy-regular">Check-in:</span>
              <p className="font-gilroy-semibold">{new Date(values.checkInDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
            </div>
            <div>
              <span className="text-gray-600 font-gilroy-regular">Check-out:</span>
              <p className="font-gilroy-semibold">{new Date(values.checkOutDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
            </div> */}
            {selectedEdition && (
              <div className="col-span-2">
                <span className="text-gray-600 font-gilroy-regular">Selected Edition:</span>
                <p className="font-gilroy-semibold">
                  {format(new Date(selectedEdition.startDate), 'do MMMM')} - {format(new Date(selectedEdition.endDate), 'do MMMM yyyy')}
                </p>
                {selectedEdition.timeFrame && (
                  <p className="text-sm text-gray-600 mt-1">{selectedEdition.timeFrame}</p>
                )}
              </div>
            )}
            {values.numberOfAccompanyingPersons > 0 && (
              <div className="col-span-2 mt-3 pt-3 border-t">
                <span className="text-gray-600 font-gilroy-regular">Accompanying Persons:</span>
                <p className="font-gilroy-semibold">{values.numberOfAccompanyingPersons} person(s)</p>
                {values.accompanyingPersons && values.accompanyingPersons.length > 0 && (
                  <div className="mt-2 space-y-2">
                    {values.accompanyingPersons.map((person, index) => (
                      <div key={index} className="text-sm bg-gray-50 p-2 rounded">
                        <p className="font-medium">{index + 1}. {person.name}</p>
                        <p className="text-gray-600 text-xs">DOB: {person.dob}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
            <div>
              <span className="text-gray-600 font-gilroy-regular">Number of Guests:</span>
              <p className="font-gilroy-semibold">{values.numberOfGuests}</p>
            </div>
            <div>
              <span className="text-gray-600 font-gilroy-regular">Number of Rooms:</span>
              <p className="font-gilroy-semibold">{values.numberOfRooms}</p>
            </div>
            <div className="col-span-2">
              <span className="text-gray-600 font-gilroy-regular">Purpose of Visit:</span>
              <p className="font-gilroy-semibold capitalize">{values.purposeOfVisit}</p>
            </div>
          </div>
          {values.specialRequests && (
            <div className="mt-3 pt-3 border-t">
              <span className="text-gray-600 text-sm">Special Requests:</span>
              <p className="text-sm mt-1">{values.specialRequests}</p>
            </div>
          )}
          {values.dietaryRequirements && (
            <div className="mt-3 pt-3 border-t">
              <span className="text-gray-600 text-sm">Dietary Requirements:</span>
              <p className="text-sm mt-1">{values.dietaryRequirements}</p>
            </div>
          )}
          {values.referralSource && (
            <div className="mt-3 pt-3 border-t">
              <span className="text-gray-600 text-sm">Referral Source:</span>
              <p className="text-sm mt-1 capitalize">{values.referralSource.replace('_', ' ')}</p>
            </div>
          )}
        </div>

        {/* Terms & Conditions */}
        {/* Terms & Conditions */}
        <FormField
          control={form.control}
          name="termsAccepted"
          render={({ field }) => (
            <FormItem className="bg-gray-50 rounded-lg border p-4">
              <div className="flex items-start space-x-3">
                <FormControl>
                  <input
                    type="checkbox"
                    id="terms"
                    checked={field.value}
                    onChange={field.onChange}
                    className="mt-1 h-4 w-4 text-cyan-600 border-gray-300 rounded focus:ring-cyan-500"
                  />
                </FormControl>
                <label htmlFor="terms" className="text-sm text-gray-700 font-gilroy-bold">
                  I confirm that all the information provided is accurate and I agree to the{' '}
                  <a href="/terms" className="text-cyan-600 hover:underline" target="_blank">
                    terms and conditions
                  </a>{' '}
                  of Fratvilla.
                </label>
              </div>
              <FormMessage />
            </FormItem>
          )}
        />
      </motion.div>
    );
  };

  return (
    <div className={`max-w-7xl w-full mx-auto ${className}`}>
      <div className="bg-white rounded-lg shadow-lg p-6 md:p-8">

      {isSubmitting && (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-8 max-w-md mx-4 text-center">
          <Loader2 className="h-12 w-12 animate-spin text-cyan-600 mx-auto mb-4" />
          <h3 className="text-xl font-gilroy-bold text-gray-900 mb-2">
            Submitting Your Application
          </h3>
          <p className="text-gray-600 font-gilroy-regular">
            Please wait while we process your application...
          </p>
        </div>
      </div>
    )}

    {/* Success Screen */}
    {isSuccess && (
      <div className="text-center py-12">
        <div className="mb-6">
          <CheckCircle2 className="h-20 w-20 text-green-500 mx-auto mb-4" />
          <h2 className="text-3xl font-gilroy-bold text-gray-900 mb-2">
            Application Submitted Successfully!
          </h2>
          <p className="text-gray-600 font-gilroy-regular text-lg">
            Thank you for applying to Fratvilla. We'll review your application and get back to you soon.
          </p>
        </div>
      </div>
    )}

    {/* Error Screen */}
    {submissionError && (
      <div className="text-center py-12">
        <div className="mb-6">
          <AlertCircle className="h-20 w-20 text-red-500 mx-auto mb-4" />
          <h2 className="text-3xl font-gilroy-bold text-gray-900 mb-2">
            Submission Failed
          </h2>
          <p className="text-gray-600 font-gilroy-regular text-lg mb-4">
            {submissionError}
          </p>
        </div>
        <Button
          onClick={() => setSubmissionError(null)}
          className="font-gilroy-semibold bg-gradient-to-r from-sky-500 to-cyan-500"
        >
          Try Again
        </Button>
      </div>
    )}

      {!isSuccess && !submissionError && (
        <>

        {/* Progress Steps */}
        <motion.div variants={itemVariants} className="mb-8">
          <div className="flex items-center justify-between mb-4">
            {[1, 2, 3, 4].map((step) => (
              <React.Fragment key={step}>
                <div className="flex flex-col items-center">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-colors ${
                      currentStep > step
                        ? 'bg-sky-600 text-white'
                        : currentStep === step
                        ? 'bg-cyan-600 text-white'
                        : 'bg-gray-200 text-gray-600'
                    }`}
                  >
                    {currentStep > step ? <Check className="h-5 w-5" /> : step}
                  </div>
                  <span className="text-xs font-gilroy-regular mt-2 text-gray-600 text-center">
                    {step === 1 && 'Personal'}
                    {step === 2 && 'Quest'}
                    {step === 3 && 'Villa'}
                    {step === 4 && 'Review'}
                  </span>
                </div>
                {step < 4 && (
                  <div
                    className={`flex-1 h-1 mx-2 transition-colors ${
                      currentStep > step ? 'bg-sky-600' : 'bg-gray-200'
                    }`}
                  />
                )}
              </React.Fragment>
            ))}
          </div>
        </motion.div>

        {/* Form */}
        <motion.div variants={itemVariants}>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <AnimatePresence mode="wait">{renderStepContent()}</AnimatePresence>

              {/* Navigation Buttons */}
              <div className="flex items-center justify-between pt-6 border-t">
                {currentStep > 1 ? (
                <Button
                  type="button"
                  variant="outline"
                  onClick={prevStep}
                  disabled={currentStep === 1}
                  className={`flex items-center font-gilroy-semibold tracking-[-1px] text-black hover:bg-gray-100 hover:shadow-lg cursor-pointer ${currentStep === 1 ? 'opacity-10 cursor-not-allowed' : ''}
                  ${currentStep === totalSteps ? '' : ''}`}
                >
                  <ChevronLeft className="h-4 w-4" />
                  Previous
                </Button>
                ):(
                  <div></div>
                )}

                {/* <div className="text-sm text-gray-600 font-gilroy-regular">
                  Step {currentStep} of {totalSteps}
                </div> */}

                {currentStep < totalSteps ? (
                  <Button
                    type="button"
                    onClick={nextStep}
                    className="flex items-center font-gilroy-semibold tracking-[-1px] bg-gradient-to-r from-sky-500 to-cyan-500 shadow-md border-amber-500 hover:bg-amber-400 hover:shadow-xl text-white"
                  >
                    Next
                    <ChevronRight className="h-4 w-4 ml-1" />
                  </Button>
                ) : (
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    onClick={() => {
                      console.log('Submit button clicked!');
                      console.log('Current form values:', form.getValues());
                      console.log('Form errors:', form.formState.errors);
                    }}
                    className="flex items-center font-gilroy-semibold tracking-[-1px] bg-gradient-to-r from-sky-500 to-cyan-500 shadow-md border-amber-500 hover:bg-amber-400 hover:shadow-xl text-white"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Submitting...
                      </>
                    ) : (
                      <>
                        <Check className="h-4 w-4" />
                        Submit 
                      </>
                    )}
                  </Button>
                )}
              </div>
            </form>
          </Form>
        </motion.div>

        </>
      )}
      </div>
    </div>
  );
}

export default VillaApplicationForm;