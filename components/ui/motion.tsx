"use client"

import { motion, AnimatePresence } from "framer-motion"

export { motion, AnimatePresence }

export const fadeIn = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
}

export const slideUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 },
}

export const slideDown = {
  initial: { opacity: 0, y: -20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: 20 },
}

export const scale = {
  initial: { opacity: 0, scale: 0.9 },
  animate: { opacity: 1, scale: 1 },
  exit: { opacity: 0, scale: 0.9 },
}

export const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.1,
    },
  },
}

export const textReveal = {
  initial: { width: "0%" },
  animate: { width: "100%" },
  exit: { width: "0%" },
}

export const glowPulse = {
  animate: {
    boxShadow: [
      "0 0 5px rgba(249, 115, 22, 0.5)",
      "0 0 15px rgba(249, 115, 22, 0.8)",
      "0 0 5px rgba(249, 115, 22, 0.5)",
    ],
    transition: {
      duration: 2,
      repeat: Number.POSITIVE_INFINITY,
      ease: "easeInOut",
    },
  },
}
