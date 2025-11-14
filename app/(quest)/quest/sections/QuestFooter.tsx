

import React from 'react'
import img from '../../../../public/Vector.svg';
import { Facebook, Instagram, Mail, Twitter, Youtube } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

function QuestFooter() {
  return (
    <div>
        <div className='flex-col items-start justify-start pl-6 pt-4 mb-4'>
            <div className='pb-4'>
            <Image src='/Vector.svg' alt="Quest Footer" height={96} width={96} />
            </div>
            <div className="w-80 pb-5 justify-start text-gray-400 text-lg font-normal font-gilroy-regular leading-none">
                AI-powered psychoanalysis tool that generates a personalized mindset and personality report based on your responses. Built to go beyond traditional personality tests, Quest reveals emotional patterns, blind spots, and growth pathways unique to you.
            </div>
            {/* social media icons in flex row */}
            <div className='flex space-x-8 pb-4'>
                <Link href="mailto:quest@fratery.in?subject=Refund Request" aria-label="Facebook">
                    <Mail className='h-6 w-6 text-blue-600' />
                </Link>
                <Link href="https://www.instagram.com/quest.fraterny/" aria-label="Instagram">
                    <Instagram className='h-6 w-6 text-pink-600' />
                </Link >
                <Link href="https://x.com/frat_erny" aria-label="Youtube">
                    <Twitter className='h-6 w-6 text-black' />
                </Link>
            </div>
            <div className=" flex justify-between w-full pr-10">
                <div className='flex-col gap-2 '>
                    <h2 className='text-[#0284c7] text-2xl pb-2'>Fraterny</h2>
                    <div className='flex flex-col gap-1'>
                        <Link href="/quest" className="text-[#292929] text-sm font-normal font-['Inter'] leading-tight">Home</Link>
                        <Link href="https://www.instagram.com/quest.fraterny/" className="text-[#292929] text-sm font-normal font-['Inter'] leading-tight">Instagram</Link>
                        <Link href="https://www.linkedin.com/company/fraterny/" className="text-[#292929] text-sm font-normal font-['Inter'] leading-tight">LinkedIn</Link>
                        <Link href="/blog" className="text-[#292929] text-sm font-normal font-['Inter'] leading-tight">Blog</Link>
                    </div>
                </div>
                <div className='flex-col gap-2 '>
                    <h2 className='text-[#0284c7] text-2xl pb-2'>Support</h2>
                    <div className='flex flex-col gap-1'>
                        <Link href="/privacy-policy" className="text-[#292929] text-sm font-normal font-['Inter'] leading-tight">Data Privacy</Link>
                        <Link href="/terms-and-conditions" className="text-[#292929] text-sm font-normal font-['Inter'] leading-tight">Terms  & Conditions</Link>
                        <Link href="mailto:quest@fratery.in?subject=Refund Request" className="text-[#292929] text-sm font-normal font-['Inter'] leading-tight">Refund</Link>
                        <Link href="mailto:quest@fratery.in?subject=Internship Opportunity" className="text-[#292929] text-sm font-normal font-['Inter'] leading-tight">Internships</Link>
                        <Link href="/assessment" className="text-[#292929] text-sm font-normal font-['Inter'] leading-tight">Start Test</Link>
                    </div>
                </div>

            </div>

        </div>      
    </div>
  )
}

export default QuestFooter