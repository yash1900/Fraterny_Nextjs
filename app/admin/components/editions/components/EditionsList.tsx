'use client';

import { Edit, Trash2, Calendar, Users } from 'lucide-react';
import { VillaEdition } from '../VillaEditionsManagement';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';

interface EditionsListProps {
  editions: VillaEdition[];
  onEdit: (edition: VillaEdition) => void;
  onRefresh: () => void;
}

export default function EditionsList({ editions, onEdit, onRefresh }: EditionsListProps) {
  const handleToggleActive = async (edition: VillaEdition) => {
    try {
      const response = await fetch('/api/settings/editions', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id: edition.id, isActive: !edition.isActive }),
      });

      if (!response.ok) {
        throw new Error('Failed to update edition');
      }

      const result = await response.json();
      
      if (result.success) {
        toast.success(`Edition ${edition.isActive ? 'deactivated' : 'activated'}`);
        onRefresh();
      } else {
        toast.error(result.error || 'Failed to update edition');
      }
    } catch (error) {
      console.error('Error toggling edition:', error);
      toast.error('Failed to update edition');
    }
  };

  const handleDelete = async (edition: VillaEdition) => {
    if (!confirm(`Are you sure you want to delete the edition from ${edition.startDate} to ${edition.endDate}?`)) {
      return;
    }

    try {
      const response = await fetch(`/api/settings/editions?id=${edition.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete edition');
      }

      const result = await response.json();
      
      if (result.success) {
        toast.success('Edition deleted successfully');
        onRefresh();
      } else {
        toast.error(result.error || 'Failed to delete edition');
      }
    } catch (error) {
      console.error('Error deleting edition:', error);
      toast.error('Failed to delete edition');
    }
  };

  const formatDate = (dateStr: string) => {
    try {
      return format(new Date(dateStr), 'do MMM yyyy');
    } catch {
      return dateStr;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available':
        return 'bg-green-100 text-green-800';
      case 'limited':
        return 'bg-yellow-100 text-yellow-800';
      case 'sold_out':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (editions.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-12 text-center">
        <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <h3 className="text-xl font-medium text-gray-900 mb-2">No Editions Yet</h3>
        <p className="text-gray-600">Click &quot;Add New Edition&quot; to create your first villa edition</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Date Range
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Time Frame
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Seats
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Active
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {editions.map((edition) => (
              <tr key={edition.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-gray-400" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {formatDate(edition.startDate)} - {formatDate(edition.endDate)}
                      </p>
                      <p className="text-xs text-gray-500">
                        {Math.ceil((new Date(edition.endDate).getTime() - new Date(edition.startDate).getTime()) / (1000 * 60 * 60 * 24))} days
                      </p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <p className="text-sm text-gray-900">
                    {edition.timeFrame || <span className="text-gray-400 italic">Not specified</span>}
                  </p>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-gray-400" />
                    <span className="text-sm text-gray-900">
                      {edition.allotedSeats} / {edition.totalSeats}
                    </span>
                  </div>
                  {edition.allotedSeats >= edition.totalSeats && (
                    <p className="text-xs text-red-600 mt-1">Full</p>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(edition.allocationStatus)}`}>
                    {edition.allocationStatus.replace('_', ' ')}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <button
                    onClick={() => handleToggleActive(edition)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      edition.isActive ? 'bg-green-600' : 'bg-gray-200'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        edition.isActive ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onEdit(edition)}
                    className="text-navy hover:text-navy/80 mr-2"
                  >
                    <Edit className="w-5 h-5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(edition)}
                    className="text-red-600 hover:text-red-800"
                  >
                    <Trash2 className="w-5 h-5" />
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
