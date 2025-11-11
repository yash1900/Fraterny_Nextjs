// 'use client'

// import { useRouter, usePathname, useSearchParams } from 'next/navigation';
// import { cn } from '@/lib/utils';

// interface ProfileNavigationProps {
//   activeTab: string;
// }

// /**
//  * Navigation tabs for the profile page
//  */
// const ProfileNavigation = ({ activeTab }: ProfileNavigationProps) => {
//   const router = useRouter();
// const pathname = usePathname();
// const searchParams = useSearchParams();

  
//   const tabs = [
//     { id: 'overview', label: 'Overview' },
//     { id: 'history', label: 'Quest History' },
//     { id: 'application', label: 'Application' },
//     { id: 'security', label: 'Manage Your Account' },
//   ];
  
//   const handleTabChange = (tabId: string) => {
//   const params = new URLSearchParams(searchParams.toString());
//   params.set('tab', tabId);
//   router.replace(`${pathname}?${params.toString()}`);
// };
  
//   return (
//     <div className="bg-gradient-to-r from-cyan-600 to-blue-800 border-b border-gray-200 overflow-x-auto sm:px-20">
//       <nav className="container mx-auto px-6" aria-label="Profile navigation">
//         {tabs.map(tab => (
//           <button
//             key={tab.id}
//             onClick={() => handleTabChange(tab.id)}
//             className={cn(
//               "py-4 px-3 text-lg font-gilroy-regular border-b-2 whitespace-nowrap transition-colors",
//               activeTab === tab.id
//                 ? "border-navy text-black"
//                 : "border-transparent text-white hover:border-gray-300"
//             )}
//             aria-current={activeTab === tab.id ? "page" : undefined}
//           >
//             {tab.label}
//           </button>
//         ))}
//       </nav>
//     </div>
//   );
// };

// export default ProfileNavigation;



'use client';

import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import { cn } from '@/lib/utils';

interface ProfileNavigationProps {
  activeTab: string;
}

/**
 * Navigation tabs for the profile page
 */
const ProfileNavigation = ({ activeTab }: ProfileNavigationProps) => {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  
  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'history', label: 'Quest History' },
    { id: 'application', label: 'Application' },
    { id: 'security', label: 'Manage Your Account' },
  ];
  
  return (
    <div className="bg-gradient-to-r from-cyan-600 to-blue-800 border-b border-gray-200 overflow-x-auto sm:px-20">
      <nav className="container mx-auto px-6" aria-label="Profile navigation">
        {tabs.map(tab => {
          const params = new URLSearchParams(searchParams.toString());
          params.set('tab', tab.id);
          const href = `${pathname}?${params.toString()}`;
          
          return (
            <Link
              key={tab.id}
              href={href}
              replace
              className={cn(
                "inline-block py-4 px-3 text-lg font-gilroy-regular border-b-2 whitespace-nowrap transition-colors",
                activeTab === tab.id
                  ? "border-navy text-black"
                  : "border-transparent text-white hover:border-gray-300"
              )}
              aria-current={activeTab === tab.id ? "page" : undefined}
            >
              {tab.label}
            </Link>
          );
        })}
      </nav>
    </div>
  );
};

export default ProfileNavigation;