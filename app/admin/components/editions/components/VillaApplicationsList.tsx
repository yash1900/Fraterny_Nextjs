'use client';

import { useState, useEffect } from 'react';
import { Eye, Check, X, Loader2, User, Mail, Phone, Calendar, MapPin, AlertCircle, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';

interface VillaApplication {
  application_id: string;
  user_id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  location: string;
  dob?: string;
  current_occupation_status: string;
  company?: string;
  emergency_contact_name: string;
  emergency_contact_phone: string;
  social_platform: string;
  social_link: string;
  selected_test_id: string;
  test_session_id?: string;
  test_taken_date?: string;
  quest_pdf_url?: string;
  quest_status?: string;
  selected_edition_id: string;
  edition_start_date?: string;
  edition_end_date?: string;
  edition_time_frame?: string;
  number_of_accompanying_persons: number;
  accompanying_persons?: any;
  number_of_guests: number;
  number_of_rooms: number;
  purpose_of_visit: string;
  special_requests?: string;
  dietary_requirements?: string;
  referral_source?: string;
  approval_status: 'pending' | 'approved' | 'rejected';
  terms_accepted: boolean;
  submitted_at: string;
  updated_at: string;
}

export default function VillaApplicationsList() {
  const [applications, setApplications] = useState<VillaApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedApplication, setSelectedApplication] = useState<VillaApplication | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    loadApplications();
  }, []);

  const loadApplications = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/admin/villa/applications');
      const result = await response.json();

      if (result.success && result.data) {
        setApplications(result.data);
      } else {
        toast.error('Failed to load applications');
      }
    } catch (error) {
      console.error('Error loading applications:', error);
      toast.error('Failed to load applications');
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = (application: VillaApplication) => {
    setSelectedApplication(application);
    setShowDetailsModal(true);
  };

  const handleUpdateStatus = async (applicationId: string, status: 'approved' | 'rejected') => {
    setUpdating(true);
    try {
      const response = await fetch('/api/admin/villa/applications', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ applicationId, status }),
      });

      const result = await response.json();

      if (result.success) {
        toast.success(`Application ${status}`);
        loadApplications();
        setShowDetailsModal(false);
      } else {
        toast.error(result.error || 'Failed to update status');
      }
    } catch (error) {
      console.error('Error updating status:', error);
      toast.error('Failed to update status');
    } finally {
      setUpdating(false);
    }
  };

  const handleDelete = async (applicationId: string, approved: boolean) => {
    const message = approved 
      ? 'This application is approved. Deleting it will free up the allocated seats. Are you sure?'
      : 'Are you sure you want to delete this application?';
    
    if (!confirm(message)) return;

    setUpdating(true);
    try {
      const response = await fetch(`/api/admin/villa/applications?id=${applicationId}`, {
        method: 'DELETE',
      });

      const result = await response.json();

      if (result.success) {
        toast.success('Application deleted successfully');
        loadApplications();
        setShowDetailsModal(false);
      } else {
        toast.error(result.error || 'Failed to delete application');
      }
    } catch (error) {
      console.error('Error deleting application:', error);
      toast.error('Failed to delete application');
    } finally {
      setUpdating(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateStr: string) => {
    try {
      return format(new Date(dateStr), 'do MMM yyyy, h:mm a');
    } catch {
      return dateStr;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-navy" />
      </div>
    );
  }

  if (applications.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-12 text-center">
        <AlertCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <h3 className="text-xl font-medium text-gray-900 mb-2">No Applications Yet</h3>
        <p className="text-gray-600">Applications will appear here once users submit them</p>
      </div>
    );
  }

  return (
    <>
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Applicant
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Contact
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Edition Dates
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Submitted
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {applications.map((application) => (
                <tr key={application.application_id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4 text-gray-400" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {application.first_name} {application.last_name}
                        </p>
                        <p className="text-xs text-gray-500">{application.location}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      <div className="flex items-center gap-1">
                        <Mail className="w-3 h-3 text-gray-400" />
                        <span className="text-xs">{application.email}</span>
                      </div>
                      <div className="flex items-center gap-1 mt-1">
                        <Phone className="w-3 h-3 text-gray-400" />
                        <span className="text-xs">{application.phone}</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {application.edition_start_date && application.edition_end_date ? (
                      <div className="text-sm text-gray-900">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-3 h-3 text-gray-400" />
                          <span className="text-xs">
                            {format(new Date(application.edition_start_date), 'do MMM')} - {format(new Date(application.edition_end_date), 'do MMM yyyy')}
                          </span>
                        </div>
                      </div>
                    ) : (
                      <span className="text-xs text-gray-400">N/A</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatDate(application.submitted_at)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(application.approval_status)}`}>
                      {application.approval_status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center justify-end gap-2">
                      {application.approval_status === 'pending' && (
                        <>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleUpdateStatus(application.application_id, 'approved')}
                            className="text-green-600 hover:text-green-800 hover:bg-green-50"
                            disabled={updating}
                          >
                            <Check className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleUpdateStatus(application.application_id, 'rejected')}
                            className="text-red-600 hover:text-red-800 hover:bg-red-50"
                            disabled={updating}
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleViewDetails(application)}
                        className="text-navy hover:text-navy/80"
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(application.application_id, application.approval_status === 'approved')}
                        className="text-red-600 hover:text-red-800 hover:bg-red-50"
                        disabled={updating}
                        title="Delete application"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Details Modal */}
      {showDetailsModal && selectedApplication && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-navy">Application Details</h2>
                <p className="text-sm text-gray-600 mt-1">
                  Submitted {formatDate(selectedApplication.submitted_at)}
                </p>
              </div>
              <button
                onClick={() => setShowDetailsModal(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 space-y-6">
              {/* Personal Details */}
              <div className="border rounded-lg p-4">
                <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
                  <User className="w-5 h-5 text-navy" />
                  Personal Details
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Full Name</p>
                    <p className="font-medium">{selectedApplication.first_name} {selectedApplication.last_name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Email</p>
                    <p className="font-medium">{selectedApplication.email}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Phone</p>
                    <p className="font-medium">{selectedApplication.phone}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Location</p>
                    <p className="font-medium">{selectedApplication.location}</p>
                  </div>
                  {selectedApplication.dob && (
                    <div>
                      <p className="text-sm text-gray-600">Date of Birth</p>
                      <p className="font-medium">{selectedApplication.dob}</p>
                    </div>
                  )}
                  <div>
                    <p className="text-sm text-gray-600">Occupation Status</p>
                    <p className="font-medium">{selectedApplication.current_occupation_status}</p>
                  </div>
                  {selectedApplication.company && (
                    <div>
                      <p className="text-sm text-gray-600">Company</p>
                      <p className="font-medium">{selectedApplication.company}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Emergency Contact */}
              <div className="border rounded-lg p-4">
                <h3 className="font-semibold text-lg mb-3">Emergency Contact</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Name</p>
                    <p className="font-medium">{selectedApplication.emergency_contact_name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Phone</p>
                    <p className="font-medium">{selectedApplication.emergency_contact_phone}</p>
                  </div>
                </div>
              </div>

              {/* Social Media */}
              <div className="border rounded-lg p-4">
                <h3 className="font-semibold text-lg mb-3">Social Media</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Platform</p>
                    <p className="font-medium">{selectedApplication.social_platform}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Link</p>
                    <a href={selectedApplication.social_link} target="_blank" rel="noopener noreferrer" className="font-medium text-blue-600 hover:underline">
                      View Profile
                    </a>
                  </div>
                </div>
              </div>

              {/* Villa Edition */}
              <div className="border rounded-lg p-4">
                <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-navy" />
                  Villa Edition
                </h3>
                {selectedApplication.edition_start_date && selectedApplication.edition_end_date ? (
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-600">Dates</p>
                      <p className="font-medium">
                        {format(new Date(selectedApplication.edition_start_date), 'do MMMM')} - {format(new Date(selectedApplication.edition_end_date), 'do MMMM yyyy')}
                      </p>
                    </div>
                    {selectedApplication.edition_time_frame && (
                      <div>
                        <p className="text-sm text-gray-600">Time Frame</p>
                        <p className="font-medium">{selectedApplication.edition_time_frame}</p>
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="text-gray-500">Edition details not available</p>
                )}
              </div>

              {/* Booking Details */}
              <div className="border rounded-lg p-4">
                <h3 className="font-semibold text-lg mb-3">Booking Details</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Number of Accompanying Persons</p>
                    <p className="font-medium">{selectedApplication.number_of_accompanying_persons}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Purpose of Visit</p>
                    <p className="font-medium capitalize">{selectedApplication.purpose_of_visit}</p>
                  </div>
                  {selectedApplication.referral_source && (
                    <div className="col-span-2">
                      <p className="text-sm text-gray-600">How did you hear about us?</p>
                      <p className="font-medium capitalize">{selectedApplication.referral_source.replace('_', ' ')}</p>
                    </div>
                  )}
                  {selectedApplication.special_requests && (
                    <div className="col-span-2">
                      <p className="text-sm text-gray-600">Special Requests</p>
                      <p className="font-medium">{selectedApplication.special_requests}</p>
                    </div>
                  )}
                  {selectedApplication.dietary_requirements && (
                    <div className="col-span-2">
                      <p className="text-sm text-gray-600">Dietary Requirements</p>
                      <p className="font-medium">{selectedApplication.dietary_requirements}</p>
                    </div>
                  )}
                </div>

                {/* Accompanying Persons Details */}
                {selectedApplication.accompanying_persons && selectedApplication.number_of_accompanying_persons > 0 && (
                  <div className="mt-4 pt-4 border-t">
                    <h4 className="font-semibold mb-3">Accompanying Persons Details</h4>
                    <div className="space-y-3">
                      {(() => {
                        try {
                          const persons = typeof selectedApplication.accompanying_persons === 'string' 
                            ? JSON.parse(selectedApplication.accompanying_persons)
                            : selectedApplication.accompanying_persons;
                          return persons.map((person: any, index: number) => (
                            <div key={index} className="bg-gray-50 p-3 rounded-lg">
                              <p className="font-medium text-sm mb-2">Person {index + 1}</p>
                              <div className="grid grid-cols-3 gap-2 text-sm">
                                <div>
                                  <span className="text-gray-600">Name: </span>
                                  <span className="font-medium">{person.name}</span>
                                </div>
                                <div>
                                  <span className="text-gray-600">DOB: </span>
                                  <span className="font-medium">{person.dob}</span>
                                </div>
                                <div>
                                  <span className="text-gray-600">Social: </span>
                                  <a href={person.socialLink} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                                    View Profile
                                  </a>
                                </div>
                              </div>
                            </div>
                          ));
                        } catch {
                          return <p className="text-sm text-gray-500">Unable to display accompanying persons details</p>;
                        }
                      })()}
                    </div>
                  </div>
                )}
              </div>

              {/* Quest Assessment */}
              <div className="border rounded-lg p-4">
                <h3 className="font-semibold text-lg mb-3">Quest Assessment</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <p className="text-sm text-gray-600">Test ID</p>
                    <p className="font-medium text-xs break-all">{selectedApplication.selected_test_id}</p>
                  </div>
                  {selectedApplication.test_session_id && (
                    <div>
                      <p className="text-sm text-gray-600">Session ID</p>
                      <p className="font-medium text-xs break-all">{selectedApplication.test_session_id}</p>
                    </div>
                  )}
                  {selectedApplication.test_taken_date && (
                    <div>
                      <p className="text-sm text-gray-600">Test Taken Date</p>
                      <p className="font-medium">{formatDate(selectedApplication.test_taken_date)}</p>
                    </div>
                  )}
                  {selectedApplication.quest_status && (
                    <div>
                      <p className="text-sm text-gray-600">Quest Status</p>
                      <p className="font-medium capitalize">{selectedApplication.quest_status}</p>
                    </div>
                  )}
                  {selectedApplication.quest_pdf_url && (
                    <div>
                      <p className="text-sm text-gray-600">Quest PDF</p>
                      <a href={selectedApplication.quest_pdf_url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline text-sm">
                        View PDF ↗
                      </a>
                    </div>
                  )}
                </div>
              </div>

              {/* Actions */}
              {selectedApplication.approval_status === 'pending' && (
                <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200">
                  <Button
                    variant="outline"
                    onClick={() => handleUpdateStatus(selectedApplication.application_id, 'rejected')}
                    disabled={updating}
                    className="text-red-600 border-red-600 hover:bg-red-50"
                  >
                    {updating ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <X className="w-4 h-4 mr-2" />}
                    Reject
                  </Button>
                  <Button
                    onClick={() => handleUpdateStatus(selectedApplication.application_id, 'approved')}
                    disabled={updating}
                    className="bg-green-600 hover:bg-green-700 text-white"
                  >
                    {updating ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Check className="w-4 h-4 mr-2" />}
                    Approve
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
