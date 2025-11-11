'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ThumbsUp, ThumbsDown } from 'lucide-react';
import axios from 'axios';
import { toast } from 'sonner';
import Image from 'next/image';


async function shareText(title: string, text: string): Promise<boolean> {
  try {
    if (navigator.share) {
      await navigator.share({ title, text });
      return true;
    }
  } catch { }
  try {
    await navigator.clipboard.writeText(`${title}\n\n${text}`);
    return true;
  } catch {
    return false;
  }
}




interface SectionActionsProps {
  title: string;
  share: string;
  textColor: string;
  inputClassName?: string;
  buttonClassName?: string;
  sessionId?: string;
  testId?: string;
  sectionId?: string;
  onToast?: (msg: string) => void;
}

export const SectionActions: React.FC<SectionActionsProps> = ({ title, share, textColor, onToast, inputClassName, buttonClassName, sessionId, testId, sectionId }) => {
  const [reacted, setReacted] = useState<"up" | "down" | null>(null);
  const [feedbackOpen, setFeedbackOpen] = useState(false);
  const [feedback, setFeedback] = useState("");
  const [shared, setShared] = useState(false);

  // Replace the existing sendFeedback function with this updated version:

  const sendFeedback = async () => {
    console.log("sendFeedback called with:", { sessionId, testId, sectionId });
    // if (!sessionId || !testId || !sectionId) return;

    try {
      // Determine reaction value based on reacted state
      let reaction = "none";
      if (reacted === "up") reaction = "like";
      if (reacted === "down") reaction = "dislike";

      console.log("Sending feedback:", { sessionId, testId, feedback, sectionId });

      const reactions = await axios.post(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/quest/feedback`, {
        sessionId,
        testId,
        reaction,
        feedback,
        sectionId: sectionId
      });

      console.log("Feedback response:", reactions);
      toast.success("Thank you for the feedback", {
        position: "top-right"
      });
    } catch (error) {
      toast.error("Failed to send feedback", {
        position: "top-right"
      });
    }
  };


  const sendReaction = async (reactionType: "like" | "dislike") => {
    console.log("sendReaction called with:", { sessionId, testId, sectionId, reactionType });

    try {
      console.log("Sending reaction:", { sessionId, testId, reactionType, sectionId });

      const res = await axios.post(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/quest/like_feedback`, {
        sessionId,
        testId,
        reaction: reactionType,
        sectionId: sectionId
      });
      console.log("Reaction response:", res);
    } catch (error) {
      console.error("Failed to send reaction:", error);
    }
  };



  const onShare = async () => {
    const ok = await shareText(title, share);
  };

  return (
    <div className="pointer-events-auto">
      <div className="mt-4 flex items-center justify-between">
        <div className="flex items-center gap-2">

          <div className="flex items-center gap-2">
            <motion.button
              onClick={() => {
                const newReaction = reacted === "up" ? null : "up";
                setReacted(newReaction);
                if (newReaction === "up") {
                  sendReaction("like");
                }
              }}
              className="flex items-center gap-1 rounded-full px-3 py-1 text-[12px] relative overflow-hidden"
              style={{ background: "rgba(255,255,255,0.25)", color: textColor }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {/* Background fill animation */}
              <motion.div
                className="absolute inset-0"
                initial={{ scale: 0, opacity: 0 }}
                animate={{
                  scale: reacted === "up" ? 1 : 0,
                  opacity: reacted === "up" ? 0.3 : 0,
                }}
                transition={{
                  type: "spring",
                  stiffness: 300,
                  damping: 20,
                }}
                style={{ borderRadius: "inherit" }}
              />

              {/* Icon with animation */}
              <motion.div
                animate={{
                  rotate: reacted === "up" ? [0, -10, 10, 0] : 0,
                  scale: reacted === "up" ? [1, 1.2, 1] : 1,
                }}
                transition={{
                  duration: 0.5,
                  ease: "easeOut"
                }}
              >
                <ThumbsUp
                  className="h-4 w-4 relative z-10"
                  fill={reacted === "up" ? "currentColor" : "none"}
                  style={{
                    transition: "fill 0.3s ease"
                  }}
                />
              </motion.div>

              {/* Ripple effect */}
              {reacted === "up" && (
                <motion.div
                  className="absolute inset-0 border-2 border-green-400 rounded-full"
                  initial={{ scale: 0.8, opacity: 0.8 }}
                  animate={{ scale: 2, opacity: 0 }}
                  transition={{ duration: 0.6, ease: "easeOut" }}
                />
              )}
            </motion.button>

            <motion.button
              onClick={() => {
                const newReaction = reacted === "down" ? null : "down";
                setReacted(newReaction);
                if (newReaction === "down") {
                  sendReaction("dislike");
                }
              }}
              className="flex items-center gap-1 rounded-full px-3 py-1 text-[12px] relative overflow-hidden"
              style={{ background: "rgba(255,255,255,0.25)", color: textColor }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {/* Background fill animation */}
              <motion.div
                className="absolute inset-0"
                initial={{ scale: 0, opacity: 0 }}
                animate={{
                  scale: reacted === "down" ? 1 : 0,
                  opacity: reacted === "down" ? 0.3 : 0,
                }}
                transition={{
                  type: "spring",
                  stiffness: 300,
                  damping: 20,
                }}
                style={{ borderRadius: "inherit" }}
              />

              {/* Icon with animation */}
              <motion.div
                animate={{
                  rotate: reacted === "down" ? [0, 10, -10, 0] : 0,
                  scale: reacted === "down" ? [1, 1.2, 1] : 1,
                }}
                transition={{
                  duration: 0.5,
                  ease: "easeOut"
                }}
              >
                <ThumbsDown
                  className="h-4 w-4 relative z-10"
                  fill={reacted === "down" ? "currentColor" : "none"}
                  style={{
                    transition: "fill 0.3s ease"
                  }}
                />
              </motion.div>

              {/* Ripple effect */}
              {reacted === "down" && (
                <motion.div
                  className="absolute inset-0 border-2 border-red-400 rounded-full"
                  initial={{ scale: 0.8, opacity: 0.8 }}
                  animate={{ scale: 2, opacity: 0 }}
                  transition={{ duration: 0.6, ease: "easeOut" }}
                />
              )}
            </motion.button>
            <button
              onClick={onShare}
              className="rounded-full px-3 active:scale-95 font-gilroy-regular tracking-tighter"
              style={{ background: "rgba(255,255,255,0.25)", color: textColor }}
              aria-label="Share"
            >
              Share
            </button>
          </div>
        </div>
        {/* <button
          onClick={onShare}
          className="rounded-full p-2 active:scale-95"
          style={{ background: "rgba(255,255,255,0.25)", color: textColor }}
          aria-label="Share"
        >
          <Share2 className="h-5 w-5" />
        </button> */}
      </div>

      <AnimatePresence initial={false}>
        {feedbackOpen && (
          <motion.form
            onSubmit={(e) => {
              e.preventDefault();
              sendFeedback();
              setFeedback("");
              setFeedbackOpen(false);
            }}
            className="mt-2 flex items-center gap-2"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
          >
            <input
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              placeholder="Tell us something specific…"
              className={`w-full rounded-xl px-3 py-2 text-[14px] outline-none placeholder:italic placeholder:font-gilroy-regular ${inputClassName || 'text-[#e2e8f0] placeholder:text-[#e2e8f0] bg-white/25'}`}
            />
            <button
              type="submit"
              className={`rounded-xl px-3 py-2 text-[13px] font-[600] ${buttonClassName || 'bg-white/25 text-white'}`}
            >
              <Image src='/message.png' alt='send' width={20} height={20} />
            </button>
          </motion.form>
        )}
      </AnimatePresence>

      <div className="mt-2 text-[12px] underline opacity-90 font-gilroy-regular">
        <button onClick={() => setFeedbackOpen((s) => !s)} style={{ color: textColor }}>
          {feedbackOpen ? "Close" : "Add a thought…"}
        </button>
      </div>

      <AnimatePresence>
        {shared && (
          <motion.div
            className="pointer-events-none absolute right-3 top-3 rounded-lg px-2 py-1 text-[12px]"
            style={{ background: "#0A0A0A", color: "#fff" }}
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
          >
            Shared ✓
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};