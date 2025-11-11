// Temporary placeholder components for admin modules
// These will be replaced with full migrations later

import React from 'react';

// Import migrated components
import MigratedAdminUserManagement from './users/AdminUserManagement';
import MigratedAdminSummaryManagement from './summaries/AdminSummaryManagement';
import MigratedAdminQuestPayment from './payments/AdminQuestPayment';
import MigratedAdminBlog from './blog';
import MigratedWebsiteSettings from './settings/WebsiteSettings';
import MigratedAdminEmailManagement from './emails/AdminEmailManagement';
import MigratedVillaEditionsManagement from './editions/VillaEditionsManagement';
import MigratedAdminPricingManagement from './pricing/AdminPricingManagement';
import MigratedAdminFeedbackManagement from './feedback/AdminFeedbackManagement';
import MigratedAdminInfluencerManagement from './influencers/AdminInfluencerManagement';
import MigratedAnalytics from './analytics/Analytics';
import MigratedAdminBulkEmailManagement from './emails/AdminBulkEmailManagement';

// Migrated components
export const AdminUserManagement = MigratedAdminUserManagement;
export const AdminSummaryManagement = MigratedAdminSummaryManagement;
export const AdminQuestPayment = MigratedAdminQuestPayment;
export const AdminBlog = MigratedAdminBlog;
export const WebsiteSettings = MigratedWebsiteSettings;
export const AdminEmailManagement = MigratedAdminEmailManagement;
export const AdminFeedbackManagement = MigratedAdminFeedbackManagement;
export const Analytics = MigratedAnalytics;
export { default as AdminImages } from './images/AdminImages';
export { default as NewsletterSubscribers } from './newsletter/NewsletterSubscribers';
export const AdminInfluencerManagement = MigratedAdminInfluencerManagement;
export const AdminPricingManagement = MigratedAdminPricingManagement;
export const VillaEditionsManagement = MigratedVillaEditionsManagement;
export const AdminBulkEmailManagement = MigratedAdminBulkEmailManagement;
