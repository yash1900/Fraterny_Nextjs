/**
 * API Route: /api/villa/application
 * Methods: POST, GET
 */
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

/**
 * POST - Submit a new villa application
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Extract data from submission
    const {
      userId,
      userEmail,
      personalDetails,
      emergencyContact,
      socialMedia,
      questAssessment,
      villaEdition,
      accompanyingPersons,
      bookingDetails,
      metadata,
    } = body;

    // Validate required fields
    if (!userId || !userEmail) {
      return NextResponse.json(
        {
          success: false,
          error: 'User ID and email are required',
        },
        { status: 400 }
      );
    }

    // Prepare data for insertion
    const applicationData = {
      user_id: userId,
      
      // Personal Details
      first_name: personalDetails.firstName,
      last_name: personalDetails.lastName,
      email: personalDetails.email,
      phone: personalDetails.phone,
      location: personalDetails.location,
      dob: personalDetails.dob,
      current_occupation_status: personalDetails.currentOccupationStatus,
      company: personalDetails.company,
      
      // Emergency Contact
      emergency_contact_name: emergencyContact.name,
      emergency_contact_phone: emergencyContact.phone,
      
      // Social Media
      social_platform: socialMedia.platform,
      social_link: socialMedia.link,
      
      // Quest Assessment
      selected_test_id: questAssessment.selectedTestId,
      test_session_id: questAssessment.testDetails?.sessionId || null,
      test_taken_date: questAssessment.testDetails?.testTaken || null,
      quest_pdf_url: questAssessment.testDetails?.questPdf || null,
      quest_status: questAssessment.testDetails?.questStatus || null,
      
      // Villa Edition
      selected_edition_id: villaEdition.selectedEditionId,
      edition_start_date: villaEdition.editionDetails?.startDate || null,
      edition_end_date: villaEdition.editionDetails?.endDate || null,
      edition_time_frame: villaEdition.editionDetails?.timeFrame || null,
      
      // Accompanying Persons
      number_of_accompanying_persons: accompanyingPersons.count,
      accompanying_persons: accompanyingPersons.persons.length > 0 
        ? JSON.stringify(accompanyingPersons.persons) 
        : null,
      
      // Booking Details
      number_of_guests: bookingDetails.numberOfGuests,
      number_of_rooms: bookingDetails.numberOfRooms,
      purpose_of_visit: bookingDetails.purposeOfVisit,
      special_requests: bookingDetails.specialRequests,
      dietary_requirements: bookingDetails.dietaryRequirements,
      referral_source: bookingDetails.referralSource,
      
      // Metadata
      approval_status: metadata.status || 'pending',
      terms_accepted: true,
    };

    // Insert into database
    const { data, error } = await supabase
      .from('villa_applications')
      .insert([applicationData])
      .select()
      .single();

    if (error) {
      console.error('Error inserting villa application:', error);
      return NextResponse.json(
        {
          success: false,
          error: error.message,
        },
        { status: 500 }
      );
    }

    console.log('Villa application submitted successfully:', data);

    return NextResponse.json({
      success: true,
      data: {
        applicationId: data.application_id,
        message: 'Application submitted successfully',
      },
      error: null,
    });
  } catch (error: any) {
    console.error('Unexpected error in villa application submission:', error);
    return NextResponse.json(
      {
        success: false,
        error: error?.message || 'An unexpected error occurred',
      },
      { status: 500 }
    );
  }
}

/**
 * GET - Retrieve villa applications for a user
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        {
          success: false,
          error: 'User ID is required',
        },
        { status: 400 }
      );
    }

    // Fetch user's applications
    const { data, error } = await supabase
      .from('villa_applications')
      .select('*')
      .eq('user_id', userId)
      .order('submitted_at', { ascending: false });

    if (error) {
      console.error('Error fetching villa applications:', error);
      return NextResponse.json(
        {
          success: false,
          error: error.message,
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: data || [],
      error: null,
    });
  } catch (error: any) {
    console.error('Unexpected error in fetching villa applications:', error);
    return NextResponse.json(
      {
        success: false,
        error: error?.message || 'An unexpected error occurred',
      },
      { status: 500 }
    );
  }
}
