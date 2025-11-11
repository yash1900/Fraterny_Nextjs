'use client';

import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { FileText } from 'lucide-react';
// import { DualGatewayPricingData } from '../../../../../components/pricing/DualGatewayPricingData';





interface PDFImageViewerProps {
  paymentSuccess: boolean;
  onUnlockClick: () => void;
  paymentStatus: {
    ispaymentdone: "success" | null;
    quest_pdf: string;
    quest_status: "generated" | "working" | null;
  } | null;
  onPDFDownload: () => void;
  pricing: {
    razorpay: {
      main: string;
      original: string;
    };
    isLoading: boolean;
  };
}

export const PDFImageViewer: React.FC<PDFImageViewerProps> = ({ paymentSuccess, onUnlockClick, paymentStatus, onPDFDownload, pricing }) => {
  const [zoom, setZoom] = useState(1);
  const [dragStart, setDragStart] = useState<{ x: number; y: number } | null>(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  const images = ['sample1.jpg', 'sample2.jpg', 'sample3.jpg', 'sample4.jpg', 'sample5.png'];

  const handleZoomIn = () => {
    setZoom(prev => Math.min(prev + 0.2, 3)); // Max zoom 3x
  };

  const handleZoomOut = () => {
    setZoom(prev => Math.max(prev - 0.2, 1.0)); // Min zoom 1.0x (100%)
  };

  const handleReset = () => {
    setZoom(1);
    setPosition({ x: 0, y: 0 });
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (zoom > 1) {
      setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y });
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (dragStart && zoom > 1) {
      setPosition({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y
      });
    }
  };

  const handleMouseUp = () => {
    setDragStart(null);
  };

  return (
    <div className="relative">
      {/* Image Viewer Container */}
      <div className="h-[calc(100dvh-320px)] w-full rounded-xl overflow-hidden shadow-lg bg-gray-100 relative">
        <div
          ref={containerRef}
          className="w-full h-full overflow-auto scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-200"
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          style={{
            cursor: zoom > 1 ? (dragStart ? 'grabbing' : 'grab') : 'default'
          }}
        >
          <div
            className="flex flex-col items-center transition-transform duration-200"
            style={{
              transform: `translate(${position.x}px, ${position.y}px) scale(${zoom})`,
              transformOrigin: '0 0'
            }}
          >
            {images.map((image, index) => (
              <img
                key={index}
                src={`/${image}`}
                alt={`PDF Page ${index + 1}`}
                className="w-full pb-1 max-w-full h-auto select-none"
                draggable={false}
                onError={(e) => {
                  console.error(`Failed to load ${image}`);
                  const target = e.target as HTMLImageElement;
                  target.src = '/placeholder-page.jpg'; // Fallback image
                }}
              />
            ))}
          </div>
        </div>

        {/* Zoom Controls */}
        <div className="absolute top-4 right-4 flex flex-col gap-2 z-10">
          <motion.button
            onClick={handleZoomIn}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            className="bg-white/90 backdrop-blur-sm rounded-full p-2 shadow-lg hover:bg-white transition-colors"
            aria-label="Zoom In"
          >
            <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
          </motion.button>
          
          <motion.button
            onClick={handleZoomOut}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            className="bg-white/90 backdrop-blur-sm rounded-full p-2 shadow-lg hover:bg-white transition-colors"
            aria-label="Zoom Out"
          >
            <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 12H6" />
            </svg>
          </motion.button>
          
          <motion.button
            onClick={handleReset}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            className="bg-white/90 backdrop-blur-sm rounded-full p-2 shadow-lg hover:bg-white transition-colors"
            aria-label="Reset Zoom"
          >
            <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </motion.button>
        </div>

        {/* Zoom Indicator */}
        <div className="absolute bottom-4 right-4 bg-black/70 text-white px-3 py-1 rounded-full text-sm font-gilroy-regular">
          {Math.round(zoom * 100)}%
        </div>
      </div>

      {/* Unlock Overlay with Blue Gradient */}
      <div className="absolute inset-x-0 bottom-0">
        <div className="relative rounded-t-2xl border-t border-blue-300/30 p-6" style={{
          background: 'linear-gradient(135deg, rgba(12,69,240,1) 0%, rgba(72,185,216,0.95) 100%)'
        }}>

          <div className="relative z-10">
            {/* Pricing Section - Only show when payment not done */}
            {paymentStatus?.ispaymentdone !== "success" && (
              <div className="flex items-center justify-center gap-3 mb-2">
                <span className="text-4xl font-gilroy-bold text-white">
                  {pricing.isLoading ? '...' : pricing.razorpay.main}
                </span>
                <span className="text-xl font-gilroy-regular line-through text-white/70">
                  {pricing.isLoading ? '...' : pricing.razorpay.original}
                </span>
              </div>
            )}

            {/* 35+ Pages PDF Label - Always visible */}
            <div className="flex items-center justify-center gap-1 text-sm text-white/90 mb-4">
              <FileText className="h-4 w-4 text-white/90" />
              <span className="font-gilroy-regular">35+ Pages PDF</span>
            </div>

            {/* Centered Button */}
            <div className="flex justify-center">
              {paymentStatus?.ispaymentdone === "success" ? (
                paymentStatus.quest_status === "generated" ? (
                  // Payment done and PDF ready - show download button
                  <motion.button
                    onClick={onPDFDownload}
                    whileTap={{ scale: 0.98 }}
                    className="font-gilroy-semibold flex items-center bg-black justify-center rounded-full px-6 py-2.5 text-[14px] font-[700] text-white gap-2"
                    style={{
                      width: '280px'
                    }}
                    aria-label="Download PDF report"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    Get Your PDF
                  </motion.button>
                ) : (
                  // Payment done but PDF still generating
                  <div className="flex items-center justify-center rounded-full px-6 py-2.5 text-[14px] font-[700] text-white bg-white/20 gap-2" style={{ width: '280px' }}>
                    PDF Generating...
                  </div>
                )
              ) : (
                // Payment not done - show unlock button
                <motion.button
                  onClick={onUnlockClick}
                  whileTap={{ scale: 0.98 }}
                  className="font-gilroy-semibold flex items-center justify-center rounded-full px-6 py-2.5 text-[14px] font-[700] text-black"
                  style={{
                    background: 'rgba(255,255,255,0.95)',
                    boxShadow: "0 10px 20px rgba(255,255,255,0.20)",
                    width: '280px'
                  }}
                  aria-label="Unlock full PDF report"
                >
                  Unlock Full PDF Report
                </motion.button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Page Indicator */}
      <div className="mt-4 text-center">
        <p className="text-gray-600 text-sm font-gilroy-regular">Sample PDF Report Preview</p>
      </div>
    </div>
  );
};