'use client'

import { useProfileContext } from './contexts/profile-client'; 

// Import profile components
import ProfileStatsCard from './components/ProfileStatsCard';
import AccountSettings from './components/AccountSettings';
import QuestHistory from './components/QuestHistory';
import VillaApplicationSection from './components/VillaApplicationSection';

const UserProfile = () => {
  const { activeTab } = useProfileContext();
  
  
  // This is a helper function to render the appropriate content based on the active tab
  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return (
          <div className="">
            <ProfileStatsCard />
          </div>
        );
      case 'application':
        return (
          <VillaApplicationSection />
        );
      case 'history':
        return <QuestHistory />;
      case 'security':
        return <AccountSettings />;
      default:
        return <div>Select a tab to view content</div>;
    }
  };
  
  return (
    <div className="min-h-screen bg-gray-100">
      <div className="container p-6">
        {renderTabContent()}
      </div>
    </div>
  );
};

export default UserProfile;