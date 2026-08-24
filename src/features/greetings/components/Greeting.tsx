import { AnimatePresence, motion } from 'motion/react';
import { useGreeting } from '../hooks/useGreeting';
import { formatGreeting } from '../utils/formatGreeting';

const Greeting = () => {
  const { bucket, greeting } = useGreeting();

  return (
    <AnimatePresence mode="wait">
      <motion.h1
        key={bucket}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -8 }}
        transition={{
          duration: 0.28,
          ease: 'easeOut',
        }}
        className="text-2xl font-bold tracking-tight"
      >
        {formatGreeting(greeting, 'Bagus')}
      </motion.h1>
    </AnimatePresence>
  );
};

export default Greeting;
