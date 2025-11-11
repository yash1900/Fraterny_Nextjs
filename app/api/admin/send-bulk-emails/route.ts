/**
 * API Route: /api/admin/send-bulk-emails
 * Methods: POST
 * Description: Send bulk emails to recipients using Nodemailer (Admin only)
 */
import { NextRequest, NextResponse } from 'next/server';
import nodemailer from 'nodemailer';
import { requireAdminAuth } from '@/lib/admin-auth';

interface Recipient {
  email: string;
  name?: string;
}

interface BulkEmailRequest {
  recipients: Recipient[];
  subject: string;
  body: string;
  isHtml: boolean;
  replyTo: string;
  fromName?: string;
}

interface EmailResult {
  email: string;
  success: boolean;
  error?: string;
}

// Helper function to replace variables in text
function replaceVariables(
  text: string,
  recipient: Recipient
): string {
  return text
    .replace(/\{\{name\}\}/gi, recipient.name || recipient.email)
    .replace(/\{\{email\}\}/gi, recipient.email);
}

// Validate email address
function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export async function POST(request: NextRequest) {
  try {
    // Verify admin authentication
    const authResult = await requireAdminAuth(request);
    if (authResult instanceof Response) {
      return authResult;
    }

    // Parse request body
    const body: BulkEmailRequest = await request.json();
    const { recipients, subject, body: emailBody, isHtml, replyTo, fromName } = body;

    // Validate required fields
    if (!recipients || !Array.isArray(recipients) || recipients.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: 'Recipients array is required and must not be empty',
        },
        { status: 400 }
      );
    }

    if (!subject || !subject.trim()) {
      return NextResponse.json(
        {
          success: false,
          error: 'Subject is required',
        },
        { status: 400 }
      );
    }

    if (!emailBody || !emailBody.trim()) {
      return NextResponse.json(
        {
          success: false,
          error: 'Email body is required',
        },
        { status: 400 }
      );
    }

    if (!replyTo || !isValidEmail(replyTo)) {
      return NextResponse.json(
        {
          success: false,
          error: 'Valid reply-to email address is required',
        },
        { status: 400 }
      );
    }

    // Validate environment variables
    const smtpHost = process.env.MAILTRAP_HOST;
    const smtpPort = process.env.MAILTRAP_PORT;
    const smtpUser = process.env.MAILTRAP_USERNAME;
    const smtpPass = process.env.MAILTRAP_PASSWORD;
    const fromEmail = process.env.FROM_EMAIL;
    const defaultFromName = process.env.FROM_NAME || 'Fraterny';

    if (!smtpHost || !smtpPort || !smtpUser || !smtpPass || !fromEmail) {
      console.error('Missing SMTP configuration');
      return NextResponse.json(
        {
          success: false,
          error: 'Server email configuration is incomplete',
        },
        { status: 500 }
      );
    }

    // Create Nodemailer transporter
    const transporter = nodemailer.createTransport({
      host: smtpHost,
      port: parseInt(smtpPort),
      secure: false, // Use false for ports 587, 2525 (STARTTLS), true only for port 465 (SSL/TLS)
      auth: {
        user: smtpUser,
        pass: smtpPass,
      },
      tls: {
        // Do not fail on invalid certs (for development with Mailtrap)
        rejectUnauthorized: false
      }
    });

    // Verify transporter connection
    try {
      await transporter.verify();
    } catch (error: any) {
      console.error('SMTP connection error:', error);
      return NextResponse.json(
        {
          success: false,
          error: 'Failed to connect to email server',
          details: error.message,
        },
        { status: 500 }
      );
    }

    // Send emails to each recipient
    const results: EmailResult[] = [];
    const finalFromName = fromName || defaultFromName;

    for (const recipient of recipients) {
      // Validate recipient email
      if (!isValidEmail(recipient.email)) {
        results.push({
          email: recipient.email,
          success: false,
          error: 'Invalid email address',
        });
        continue;
      }

      try {
        // Replace variables in subject and body
        const personalizedSubject = replaceVariables(subject, recipient);
        const personalizedBody = replaceVariables(emailBody, recipient);

        // Send email
        await transporter.sendMail({
          from: `"${finalFromName}" <${fromEmail}>`,
          to: recipient.email,
          replyTo: replyTo,
          subject: personalizedSubject,
          ...(isHtml ? { html: personalizedBody } : { text: personalizedBody }),
        });

        results.push({
          email: recipient.email,
          success: true,
        });
      } catch (error: any) {
        console.error(`Failed to send email to ${recipient.email}:`, error);
        results.push({
          email: recipient.email,
          success: false,
          error: error.message || 'Failed to send email',
        });
      }
    }

    // Calculate statistics
    const successCount = results.filter((r) => r.success).length;
    const failureCount = results.filter((r) => !r.success).length;
    const failedEmails = results.filter((r) => !r.success);

    return NextResponse.json({
      success: true,
      data: {
        totalSent: successCount,
        totalFailed: failureCount,
        total: results.length,
        results,
        failedEmails: failedEmails.length > 0 ? failedEmails : undefined,
      },
    });
  } catch (error: any) {
    console.error('Error in /api/admin/send-bulk-emails:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error',
        details: error.message,
      },
      { status: 500 }
    );
  }
}
