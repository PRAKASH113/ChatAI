'use client';

import React from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { MessageType } from '@/types/notifications';

export interface Notification {
  id: string;
  message: string;
  type: MessageType;
}

type Position =
  | 'top-left' | 'top-center' | 'top-right'
  | 'middle-left' | 'middle-center' | 'middle-right'
  | 'bottom-left' | 'bottom-center' | 'bottom-right';

type AnimationDirection = 'left' | 'right' | 'up' | 'down';

interface NotificationContainerProps {
  notifications: Notification[];
  removeNotification: (id: string) => void;
  position?: Position;
  animationDirection?: AnimationDirection;
  autoClose?: boolean;
  autoCloseDelay?: number;
}

const typeStyles: Record<MessageType, { bg: string; border: string; text: string; icon: string }> = {
  success: {
    bg: 'bg-green-500/10',
    border: 'border-green-500/20',
    text: 'text-green-400',
    icon: 'M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
  },
  warning: {
    bg: 'bg-yellow-500/10',
    border: 'border-yellow-500/20',
    text: 'text-yellow-400',
    icon: 'M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z',
  },
  error: {
    bg: 'bg-red-500/10',
    border: 'border-red-500/20',
    text: 'text-red-400',
    icon: 'M6.115 5.019L18.885 18.881m0-13.862L6.115 18.881M21 7.5a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm0 9a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5-9a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm0 9a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z',
  },
  info: {
    bg: 'bg-blue-500/10',
    border: 'border-blue-500/20',
    text: 'text-blue-400',
    icon: 'M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z',
  },
};

const getPositionClasses = (position: Position) => {
  const positions = {
    'top-left': 'top-16 sm:top-20 left-4 items-start',
    'top-center': 'top-16 sm:top-20 left-1/2 -translate-x-1/2 items-center',
    'top-right': 'top-16 sm:top-20 right-4 items-end',
    'middle-left': 'top-1/2 left-4 -translate-y-1/2 items-start',
    'middle-center': 'top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 items-center',
    'middle-right': 'top-1/2 right-4 -translate-y-1/2 items-end',
    'bottom-left': 'bottom-4 left-4 items-start',
    'bottom-center': 'bottom-4 left-1/2 -translate-x-1/2 items-center',
    'bottom-right': 'bottom-4 right-4 items-end',
  };
  
  return `fixed z-50 flex flex-col gap-2 max-w-xs sm:max-w-sm md:max-w-md w-[calc(100%-2rem)] sm:w-80 md:w-96 ${positions[position]}`;
};

const getDefaultAnimationDirection = (position: Position): AnimationDirection => {
  if (position.includes('left')) return 'left';
  if (position.includes('right')) return 'right';
  if (position.includes('top')) return 'up';
  if (position.includes('bottom')) return 'down';
  return 'right';
};

const getAnimationVariants = (direction: AnimationDirection) => {
  const variants = {
    left: {
      initial: { opacity: 0, x: -50, scale: 0.95 },
      animate: { opacity: 1, x: 0, scale: 1 },
      exit: { opacity: 0, x: -50, scale: 0.95 },
    },
    right: {
      initial: { opacity: 0, x: 50, scale: 0.95 },
      animate: { opacity: 1, x: 0, scale: 1 },
      exit: { opacity: 0, x: 50, scale: 0.95 },
    },
    up: {
      initial: { opacity: 0, y: -50, scale: 0.95 },
      animate: { opacity: 1, y: 0, scale: 1 },
      exit: { opacity: 0, y: -50, scale: 0.95 },
    },
    down: {
      initial: { opacity: 0, y: 50, scale: 0.95 },
      animate: { opacity: 1, y: 0, scale: 1 },
      exit: { opacity: 0, y: 50, scale: 0.95 },
    },
  };
  
  return variants[direction];
};

const NotificationContainer: React.FC<NotificationContainerProps> = ({
  notifications,
  removeNotification,
  position = 'top-right',
  animationDirection,
  autoClose = true,
  autoCloseDelay = 5000,
}) => {
  const defaultDirection = getDefaultAnimationDirection(position);
  const direction = animationDirection || defaultDirection;
  const animationVariants = getAnimationVariants(direction);

  React.useEffect(() => {
    if (!autoClose) return;

    const timers = notifications.map((notification) => {
      return setTimeout(() => {
        removeNotification(notification.id);
      }, autoCloseDelay);
    });

    return () => {
      timers.forEach(clearTimeout);
    };
  }, [notifications, removeNotification, autoClose, autoCloseDelay]);

  return (
    <div className={getPositionClasses(position)}>
      <AnimatePresence mode="popLayout">
        {notifications.map((notification) => {
          const { bg, border, text, icon } = typeStyles[notification.type];

          return (
            <motion.div
              key={notification.id}
              layout
              initial={animationVariants.initial}
              animate={animationVariants.animate}
              exit={animationVariants.exit}
              transition={{ 
                duration: 0.3, 
                ease: [0.4, 0, 0.2, 1],
                layout: { duration: 0.2 }
              }}
              className={`
                flex items-center gap-3 w-full
                rounded-lg border backdrop-blur-md shadow-lg
                p-3 sm:p-4
                ${bg} ${border} ${text}
                hover:shadow-xl transition-shadow duration-200
              `}
            >
              {/* Icon */}
              <div className="shrink-0 mt-0.5">
                <svg 
                  className="w-4 h-4 sm:w-5 sm:h-5" 
                  fill="none" 
                  stroke="currentColor" 
                  strokeWidth={1.5} 
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d={icon}
                  />
                </svg>
              </div>

              {/* Message */}
              <div className="flex-1 min-w-0 leading-relaxed">
                <p className="text-xs sm:text-sm font-medium wrap-break-words">
                  {notification.message}
                </p>
              </div>

              {/* Close Button */}
              <button
                onClick={() => removeNotification(notification.id)}
                className="
                  shrink-0 mt-0.5 p-1 rounded-md
                  opacity-60 hover:opacity-100 
                  hover:bg-white/10 active:bg-white/20
                  transition-all duration-150
                  focus:outline-none focus:ring-2 focus:ring-current focus:ring-opacity-50
                "
                aria-label="Close notification"
              >
                <svg 
                  className="w-3 h-3 sm:w-4 sm:h-4" 
                  fill="none" 
                  viewBox="0 0 24 24" 
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    d="M6 18L18 6M6 6l12 12" 
                  />
                </svg>
              </button>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
};

export default NotificationContainer;