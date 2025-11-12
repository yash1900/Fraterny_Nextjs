'use client';

import React from 'react';
import {useIsMobile} from '../utils/use-mobile';
import Link from 'next/link';
import BrowserPopup from '../utils/BrowserPopup';

interface HeroProps {
  onAnalyzeClick?: () => void;
  onScreenTransition?: () => void;
  className?: string;
}

const Hero: React.FC<HeroProps> = ({ 
  onAnalyzeClick, 
  onScreenTransition,
  className = ''
}) => {
  const handleAnalyzeClick = () => {
    if (onAnalyzeClick) {
      onAnalyzeClick();
    }
  };

  const isMobile = useIsMobile();
  

  if (isMobile) {
    return(
    <>
      {/* Browser Detection Popup */}
      <BrowserPopup />
      
      <section className='w-screen border-2-red-500 h-full relative'>

      <div 
        className='absolute z-0 w-[554px] h-[554px] rounded-full'
        style={{
          background: 'radial-gradient(ellipse 50% 50% at 50% 50%, #0C45F0 0%, #41D9FF 51%, #48B9D8 100%)',
          left: '-70px',
          top: '47%',
          filter: 'blur(30px)',
          boxShadow: '60px 60px 60px rgba(0, 0, 0, 0.1)',
        }} 
        />



      <div className='h-screen w-screen min-h-screen flex flex-col gap-20 relative top-[8%] pl-5'>

        <div className=' flex flex-col'>
          <div className='justify-start text-neutral-950 text-5xl font-normal font-gilroy-regular'>
            hi there,
          </div>

          <div className='flex gap-2'>
            <div className="">
              <div className='justify-start text-neutral-500 text-7xl font-bold font-gilroy-bold'>
                I'm
              </div>
            </div>
            <div className="flex items-center">
              {/* <img src={img} alt="Logo" className="mt-3" /> */}
              <div>
              <div className='text-7xl font-normal font-gilroy-bold tracking-[-0.5rem]'>
                QUEST
              </div>
              <div className='text-xl font-normal font-gilroy-regular tracking-[0.1rem] pl-5 mt-[-8px]'>
                BY FRATERNY
              </div>
              </div>
            </div>
          </div>

        </div>

        <div className=' flex flex-col gap-0'>
          <div className='justify-start text-neutral-950 text-4xl font-normal font-gilroy-regular'>
            I can
          </div>
          <div className=''>
            <span className='justify-start text-neutral-950 text-4xl font-normal font-gilroy-bold'>
              Analyse Your Brain
            </span>
          </div>
          
          <div className="justify-start text-neutral-950 text-4xl font-normal font-gilroy-regular">
            in 15 minutes
          </div>

        </div>
        
        {/* Link to /assessment for this button */}
        <Link href="/assessment">
          <div className=''>
            <div className="w-40 h-14 mix-blend-luminosity bg-gradient-to-br from-white/20 to-white/20 rounded-[30px] border-2 border-white flex items-center justify-center" >
                <div className="justify-center text-white text-2xl font-gilroy-bold">Start Test</div>
            </div>
          </div>
        </Link>

      </div>

    </section>
    </>
    )
  }
  return (
    <>
      {/* Browser Detection Popup */}
      <BrowserPopup />
      
      <section className='bg-sky-800 gap-1 h-screen flex flex-col items-center justify-center'>
      <div className=' flex flex-col w-full items-center justify-center'>
        <div className='flex gap-2'>
          <div className="">
            <div className='justify-center text-neutral-900 text-[200px] font-normal font-gilroy-bold'>
              I'm
            </div>
          </div>
          <div className="flex items-center">
            <div>
            <div className='text-[180px] text-white font-normal font-gilroy-bold tracking-[-0.5rem]'>
              QUEST
            </div>
            <div className='text-[40px] text-neutral-900 font-normal font-gilroy-regular tracking-[0.1rem] pl-28 mt-[-70px]'>
              BY FRATERNY
            </div>
            </div>
          </div>
        </div>
      
      </div>

      <div className='flex flex-col items-center justify-center w-full pl-5'>
        <img src="/qr-code.png" alt="QR Code" className="w-40 h-40" />
        <div className='text-white text-[25px] font-normal font-gilroy-regular mt-2'>Scan the QR code to get started on your mobile.</div>
      </div>
    </section>

    {/* <HeroDesktop /> */}
    {/* <MaskCard /> */}
    </>
  );
};

export default Hero;
