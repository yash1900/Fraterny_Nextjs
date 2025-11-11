'use client';

import { useState, useEffect } from 'react';
import { Calendar, Plus, Loader2, FileText, Settings } from 'lucide-react';
import { toast } from 'sonner';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import EditionsList from './components/EditionsList';
import EditionModal from './components/EditionModal';
import VillaApplicationsList from './components/VillaApplicationsList';

export interface VillaEdition {
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

export default function VillaEditionsManagement() {
  const [activeTab, setActiveTab] = useState<'applications' | 'settings'>('applications');
  const [editions, setEditions] = useState<VillaEdition[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEdition, setEditingEdition] = useState<VillaEdition | null>(null);

  // Fetch editions on mount
  useEffect(() => {
    loadEditions();
  }, []);

  const loadEditions = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/settings/editions');
      
      if (!response.ok) {
        throw new Error('Failed to fetch editions');
      }

      const result = await response.json();
      
      if (result.success && result.data) {
        setEditions(result.data.sort((a: VillaEdition, b: VillaEdition) => a.displayOrder - b.displayOrder));
      } else {
        toast.error('Failed to load editions');
      }
    } catch (error) {
      console.error('Error loading editions:', error);
      toast.error('Failed to load editions');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (edition?: VillaEdition) => {
    setEditingEdition(edition || null);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingEdition(null);
  };

  const handleSuccess = () => {
    loadEditions();
    handleCloseModal();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-navy" />
      </div>
    );
  }

  return (
    <div className="p-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Calendar className="w-8 h-8 text-navy" />
              <h1 className="text-3xl font-bold text-navy">Villa Management</h1>
            </div>
            {activeTab === 'settings' && (
              <Button
                onClick={() => handleOpenModal()}
                className="flex items-center gap-2"
              >
                <Plus className="w-5 h-5" />
                Add New Edition
              </Button>
            )}
          </div>
          
          {/* Tabs */}
          <div className="mt-6">
            <div className="border-b border-gray-200">
              <nav className="-mb-px flex space-x-8">
                <button
                  onClick={() => setActiveTab('applications')}
                  className={`${
                    activeTab === 'applications'
                      ? 'border-navy text-navy'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors`}
                >
                  Applications
                </button>
                <button
                  onClick={() => setActiveTab('settings')}
                  className={`${
                    activeTab === 'settings'
                      ? 'border-navy text-navy'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors`}
                >
                  Settings
                </button>
              </nav>
            </div>
          </div>
          
          {/* Stats - Only show for settings tab */}
          {activeTab === 'settings' && (
            <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="p-4">
                <p className="text-sm text-gray-600">Total Editions</p>
                <p className="text-2xl font-bold text-navy">{editions.length}</p>
              </Card>
              <Card className="p-4">
                <p className="text-sm text-gray-600">Active Editions</p>
                <p className="text-2xl font-bold text-green-600">
                  {editions.filter(e => e.isActive).length}
                </p>
              </Card>
              <Card className="p-4">
                <p className="text-sm text-gray-600">Total Seats</p>
                <p className="text-2xl font-bold text-navy">
                  {editions.reduce((sum, e) => sum + e.totalSeats, 0)}
                </p>
              </Card>
            </div>
          )}
        </div>

        {/* Content based on active tab */}
        {activeTab === 'applications' ? (
          <VillaApplicationsList />
        ) : (
          <>
            {/* Editions List */}
            <EditionsList 
              editions={editions}
              onEdit={handleOpenModal}
              onRefresh={loadEditions}
            />

            {/* Modal */}
            <EditionModal
              isOpen={isModalOpen}
              onClose={handleCloseModal}
              onSuccess={handleSuccess}
              edition={editingEdition}
            />
          </>
        )}
    </div>
  );
}
