import type { ReactNode } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import logo from '@/assets/logo.png';

type AppLoaderProps = {
  isLoading: boolean;
  children: ReactNode;
};

const AppLoader = ({ isLoading, children }: AppLoaderProps) => {
  const reducedMotion = useReducedMotion();

  return (
    <AnimatePresence mode="wait">
      {isLoading ? (
        <motion.div
          key="loader"
          role="status"
          aria-live="polite"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{
            opacity: 0,
            transition: {
              delay: reducedMotion ? 0 : 0.42,
              duration: reducedMotion ? 0.01 : 0.2,
            },
          }}
          transition={{ duration: reducedMotion ? 0.01 : 0.28 }}
          className="relative isolate flex min-h-dvh items-center justify-center overflow-hidden bg-background px-6"
        >
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 flex items-center justify-center"
          >
            <motion.div
              initial={reducedMotion ? false : { opacity: 0, scale: 0.6 }}
              animate={
                reducedMotion
                  ? { opacity: 0.4, scale: 1 }
                  : { opacity: [0.25, 0.5, 0.25], scale: [0.9, 1.15, 0.9] }
              }
              exit={{
                opacity: 0,
                scale: 1.4,
                transition: { duration: reducedMotion ? 0.01 : 0.35 },
              }}
              transition={
                reducedMotion
                  ? { duration: 0 }
                  : { duration: 3.6, repeat: Infinity, ease: 'easeInOut' }
              }
              className="size-96 rounded-full bg-primary/20 blur-3xl"
            />
          </div>

          <div className="relative flex flex-col items-center gap-6 text-center">
            <div
              aria-hidden="true"
              className="relative flex size-56 items-center justify-center"
            >
              <motion.div
                initial={reducedMotion ? false : { opacity: 0, scale: 0.65 }}
                animate={
                  reducedMotion
                    ? { opacity: 1, rotate: 0, scale: 1 }
                    : { opacity: 1, rotate: 360, scale: 1 }
                }
                exit={{
                  opacity: 0,
                  rotate: reducedMotion ? 0 : 360,
                  scale: 0.6,
                  transition: {
                    duration: reducedMotion ? 0.01 : 0.35,
                    ease: 'easeIn',
                  },
                }}
                transition={
                  reducedMotion
                    ? { duration: 0 }
                    : {
                        opacity: { duration: 0.35 },
                        scale: { duration: 0.4 },
                        rotate: {
                          duration: 2.8,
                          repeat: Infinity,
                          ease: 'linear',
                        },
                      }
                }
                className="absolute size-44 rounded-full border-2 border-primary/15 border-t-primary border-l-primary/60"
              />
              <motion.div
                initial={reducedMotion ? false : { opacity: 0, scale: 0.75 }}
                animate={
                  reducedMotion
                    ? { opacity: 1, rotate: 0, scale: 1 }
                    : { opacity: 1, rotate: -360, scale: 1 }
                }
                exit={{
                  opacity: 0,
                  rotate: reducedMotion ? 0 : -360,
                  scale: 0.55,
                  transition: {
                    duration: reducedMotion ? 0.01 : 0.35,
                    ease: 'easeIn',
                  },
                }}
                transition={
                  reducedMotion
                    ? { duration: 0 }
                    : {
                        opacity: { duration: 0.45 },
                        scale: { duration: 0.45 },
                        rotate: {
                          duration: 3.7,
                          repeat: Infinity,
                          ease: 'linear',
                        },
                      }
                }
                className="absolute size-56 rounded-full border border-primary/25 border-r-primary/80 border-b-primary/50"
              />
              <motion.img
                src={logo}
                alt=""
                initial={
                  reducedMotion
                    ? false
                    : { opacity: 0, scale: 0.65, rotate: -12 }
                }
                animate={{ opacity: 1, scale: 1, rotate: 0 }}
                exit={{
                  scale: reducedMotion ? 1 : 1.12,
                  transition: {
                    duration: reducedMotion ? 0.01 : 0.35,
                    ease: 'easeOut',
                  },
                }}
                transition={
                  reducedMotion
                    ? { duration: 0 }
                    : {
                        type: 'spring',
                        stiffness: 220,
                        damping: 16,
                        delay: 0.1,
                      }
                }
                className="relative size-20 rounded-3xl shadow-xl shadow-primary/20"
              />
            </div>

            <div className="flex flex-col items-center gap-2">
              <motion.h1
                initial={reducedMotion ? false : { opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  duration: reducedMotion ? 0 : 0.35,
                  delay: reducedMotion ? 0 : 0.24,
                }}
                className="font-heading text-2xl font-semibold tracking-tight text-foreground"
              >
                Kanban App
              </motion.h1>
              <div className="relative h-5 min-w-48 text-sm text-muted-foreground">
                <motion.p
                  initial={reducedMotion ? false : { opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{
                    opacity: 0,
                    y: reducedMotion ? 0 : -6,
                    transition: { duration: reducedMotion ? 0.01 : 0.12 },
                  }}
                  transition={{
                    duration: reducedMotion ? 0 : 0.3,
                    delay: reducedMotion ? 0 : 0.36,
                  }}
                >
                  Menyiapkan aplikasi...
                </motion.p>
                <motion.p
                  aria-hidden="true"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 0 }}
                  exit={{
                    opacity: 1,
                    transition: {
                      delay: reducedMotion ? 0 : 0.15,
                      duration: reducedMotion ? 0.01 : 0.18,
                    },
                  }}
                  className="absolute inset-0"
                >
                  Siap digunakan
                </motion.p>
              </div>
              <div
                aria-hidden="true"
                className="flex h-4 items-center gap-2 pt-4"
              >
                {[0, 1, 2].map((index) => (
                  <motion.span
                    key={index}
                    initial={reducedMotion ? false : { opacity: 0, y: 4 }}
                    animate={
                      reducedMotion
                        ? { opacity: 0.6, y: 0 }
                        : { opacity: [0.35, 1, 0.35], y: [0, -5, 0] }
                    }
                    exit={{
                      opacity: 0,
                      transition: { duration: reducedMotion ? 0.01 : 0.12 },
                    }}
                    transition={
                      reducedMotion
                        ? { duration: 0 }
                        : {
                            duration: 1.2,
                            delay: index * 0.16,
                            repeat: Infinity,
                            ease: 'easeInOut',
                          }
                    }
                    className="size-1.5 rounded-full bg-primary"
                  />
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      ) : (
        <motion.div
          key="content"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: reducedMotion ? 0.01 : 0.2 }}
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default AppLoader;
