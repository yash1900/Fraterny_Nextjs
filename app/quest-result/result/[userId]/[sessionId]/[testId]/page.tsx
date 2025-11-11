// page.tsx
import { QuestResultClient } from './components/QuestResultClient';
import { validateResultData } from './utils/validations';
import { MOCK_RESULT_DATA } from './utils/constants';

type Props = {
     params: Promise<{  // ← params is now a Promise
       userId: string;
       sessionId: string;
       testId: string;
     }>;
   };

async function getResultData(userId: string, sessionId: string, testId: string) {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/report/${userId}/${sessionId}/${testId}`,
      {
        cache: 'no-store',
      }
    );
    

    if (!response.ok) {
      throw new Error('Failed to fetch result data');
    }

    const data = await response.json();
    
    const validateddata =  validateResultData(data);
    return validateddata;
    
  } catch (error) {
    console.error('Error fetching result data:', error);
    return null;
  }
}

export default async function QuestResultPage({ params }: Props) {
  const { userId, sessionId, testId } = await params;
  console.log('Params:', { userId, sessionId, testId });

  const resultData = await getResultData(userId, sessionId, testId);
  //const resultData = MOCK_RESULT_DATA;

  return (
    <QuestResultClient
      initialData={resultData}
      userId={userId}
      sessionId={sessionId}
      testId={testId}
    />
  );
}