/**
 * API Route: /api/media/upload
 * Methods: POST
 */
import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { Database } from '@/integrations/supabase/types';



export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const key = formData.get('key') as string;
    const description = formData.get('description') as string;
    const alt_text = formData.get('alt_text') as string;
    const category = formData.get('category') as string | null;

    if (!file || !key || !description || !alt_text) {
      return NextResponse.json(
        {
          success: false,
          error: 'Missing required fields: file, key, description, alt_text',
        },
        { status: 400 }
      );
    }

    console.log(`Starting upload for image with key: ${key}`);

    // Generate a unique filename
    const timestamp = Date.now();
    const sanitizedFilename = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
    const filename = `${timestamp}-${sanitizedFilename}`;
    const storagePath = filename;

    // Check if an image with this key already exists
    const { data: existingImage } = await supabaseAdmin
      .from('website_images')
      .select('*')
      .eq('key', key)
      .maybeSingle();

    if (existingImage) {
      console.log(`Found existing image with key: ${key}, will replace it`);
      // Delete existing files from storage
      if (existingImage.storage_path) {
        await supabaseAdmin.storage.from('website-images').remove([existingImage.storage_path]);
      }
      // Delete existing database record
      await supabaseAdmin.from('website_images').delete().eq('key', key);
    }

    // Upload the file to storage
    console.log(`Uploading file to storage: ${storagePath}`);
    const { error: uploadError } = await supabaseAdmin.storage
      .from('website-images')
      .upload(storagePath, file, {
        cacheControl: '31536000', // 1 year cache
        upsert: true,
      });

    if (uploadError) {
      console.error('Upload error:', uploadError);
      return NextResponse.json(
        {
          success: false,
          error: `Error uploading image: ${uploadError.message}`,
        },
        { status: 500 }
      );
    }

    // Create database entry
    const { data, error: insertError } = await supabaseAdmin
      .from('website_images')
      .insert({
        key,
        description,
        storage_path: storagePath,
        alt_text,
        category: category || null,
        metadata: {
          lastModified: new Date().toISOString(),
          originalFilename: file.name,
        },
      })
      .select()
      .single();

    if (insertError) {
      console.error('Insert error:', insertError);

      // Clean up the uploaded file
      await supabaseAdmin.storage.from('website-images').remove([storagePath]);

      return NextResponse.json(
        {
          success: false,
          error: `Error creating image record: ${insertError.message}`,
        },
        { status: 500 }
      );
    }

    console.log(`Successfully uploaded and created record for image with key: ${key}`);
    return NextResponse.json({
      success: true,
      data,
    });
  } catch (error: any) {
    console.error('Error in upload process:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'An unexpected error occurred',
      },
      { status: 500 }
    );
  }
}

