'use client';

import PageHeader from './components/PageHeader';
import LoadingState from './components/LoadingState';
import ErrorState from './components/ErrorState';
import ImageHeader from './components/ImageHeader';
import InfoBanner from './components/InfoBanner';
import ImageContainer from './components/ImageContainer';
import { UploadModal } from './components/upload';
import EditModal from './components/EditModal';
import DeleteModal from './components/DeleteModal';
import { useImageManagement } from './hooks/useImageManagement';
import { CacheVersionControl } from './components/CacheVersionControl';
import { useIsMobile } from '@/app/admin/hooks/use-mobile';

const AdminImages = () => {
  const isMobile = useIsMobile();
  const {
    images,
    totalCount,
    categories,
    selectedCategory,
    setSelectedCategory,
    searchTerm,
    setSearchTerm,
    page,
    pageSize,
    isLoading,
    error,
    selectedImage,
    isUploadModalOpen,
    setIsUploadModalOpen,
    isEditModalOpen,
    setIsEditModalOpen,
    isDeleteModalOpen,
    setIsDeleteModalOpen,
    openEditModal,
    openDeleteModal,
    handlePageChange,
    handleSearch,
    clearFilters
  } = useImageManagement();
  
  if (isLoading) {
    return <LoadingState />;
  }
  
  if (error) {
    return <ErrorState />;
  }
  
  return (
    <div className="p-8">
      <PageHeader onUploadClick={() => setIsUploadModalOpen(true)} />
        
        <div className="grid gap-6 mb-8">
          {/* Cache Version Control Card */}
          <CacheVersionControl />
          
          <div className="bg-white shadow rounded-lg overflow-hidden">
            <ImageHeader 
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
              onSearch={handleSearch}
              categories={categories}
              selectedCategory={selectedCategory}
              setSelectedCategory={setSelectedCategory}
            />
            
            <InfoBanner />
            
            <ImageContainer 
              images={images}
              selectedCategory={selectedCategory}
              searchTerm={searchTerm}
              onClearFilter={clearFilters}
              onUploadClick={() => setIsUploadModalOpen(true)}
              onEdit={openEditModal}
              onDelete={openDeleteModal}
              page={page}
              pageSize={pageSize}
              totalCount={totalCount}
              onPageChange={handlePageChange}
            />
          </div>
        </div>
        
        <UploadModal 
          isOpen={isUploadModalOpen} 
          onClose={() => setIsUploadModalOpen(false)} 
        />
        
        {selectedImage && (
          <>
            <EditModal 
              isOpen={isEditModalOpen} 
              onClose={() => setIsEditModalOpen(false)} 
              image={selectedImage} 
            />
            
            <DeleteModal 
              isOpen={isDeleteModalOpen} 
              onClose={() => setIsDeleteModalOpen(false)} 
              image={selectedImage} 
            />
          </>
        )}
    </div>
  );
};

export default AdminImages;
