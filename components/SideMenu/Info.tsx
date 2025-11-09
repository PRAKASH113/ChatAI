"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X, Github, Linkedin, Instagram, Twitter } from "lucide-react";
import Image from "next/image";

interface InfoOverlayProps {
  onClose: () => void;
}

export default function InfoOverlay({ onClose }: InfoOverlayProps) {
  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 bg-black/50 backdrop-blur-md z-[999] flex items-center justify-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <motion.div
          className="relative bg-background-sec/90 backdrop-blur-xl rounded-2xl shadow-2xl w-[90%] max-w-2xl overflow-hidden flex flex-col md:flex-row items-center justify-between p-8"
          initial={{ scale: 0.9, opacity: 0, y: 40 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 40 }}
          transition={{ type: "spring", duration: 0.6 }}
        >
          {/* ❌ Close Button */}
          <button
            onClick={onClose}
            aria-label="Close Info"
            title="Close"
            className="absolute top-4 right-4 p-2 text-foreground-sec hover:text-accent transition"
          >
            <X className="w-5 h-5" />
          </button>

          {/* 🧠 Left Section: Info Text */}
          <div className="flex flex-col text-left max-w-md space-y-3">
            <motion.h2
              className="text-3xl font-bold text-foreground"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              Prakash
            </motion.h2>

            <motion.p
              className="text-accent-sec font-medium text-sm tracking-wide uppercase flex flex-wrap gap-2"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              Web Dev • Game Dev • Creator
            </motion.p>

            <motion.p
              className="text-foreground-sec text-sm leading-relaxed mt-2"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <span className="font-semibold text-foreground">ChatAI</span> is a
              smart assignment project built by me as part of a development
              challenge — combining creativity, AI, and clean code to craft a
              complete interactive experience.
            </motion.p>

            {/* 🌐 Social Links */}
            <motion.div
              className="flex gap-4 mt-4"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <a
                href="https://github.com/PRAKASH113"
                target="_blank"
                rel="noopener noreferrer"
                className="text-foreground-sec hover:text-accent transition"
                aria-label="GitHub"
                title="GitHub"
              >
                <Github className="w-5 h-5" />
              </a>
              <a
                href="https://www.linkedin.com/in/prakash-na-b7b108233/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-foreground-sec hover:text-accent transition"
                aria-label="LinkedIn"
                title="LinkedIn"
              >
                <Linkedin className="w-5 h-5" />
              </a>
              <a
                href="https://www.instagram.com/exotickhatri?igsh=MTc1NHk5YmRkOGNxMg=="
                target="_blank"
                rel="noopener noreferrer"
                className="text-foreground-sec hover:text-accent transition"
                aria-label="Instagram"
                title="Instagram"
              >
                <Instagram className="w-5 h-5" />
              </a>
              <a
                href="https://x.com/PPPP_Prakash?t=wk2Egj5MqoR5fKsXh2OCfA&s=08"
                target="_blank"
                rel="noopener noreferrer"
                className="text-foreground-sec hover:text-accent transition"
                aria-label="Twitter"
                title="Twitter"
              >
                <Twitter className="w-5 h-5" />
              </a>
            </motion.div>
          </div>

          {/* 🖼️ Right Section: Profile Image */}
          <motion.div
            className="relative mt-6 md:mt-0 md:ml-6"
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
          >
            <div className="relative w-36 h-36 md:w-40 md:h-40 rounded-full bg-gradient-to-tr from-accent to-accent-sec p-[2px] shadow-lg">
              <div className="w-full h-full rounded-full overflow-hidden bg-background-sec">
                <Image
                  src="/me.png"
                  alt="Prakash"
                  width={160}
                  height={160}
                  className="object-cover w-full h-full rounded-full"
                />
              </div>
            </div>
          </motion.div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
