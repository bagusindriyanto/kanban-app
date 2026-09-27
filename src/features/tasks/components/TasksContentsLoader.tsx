import type { ReactNode } from 'react';
import { Check } from 'lucide-react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';

const columns = ['To Do', 'On Progress', 'Done'];

type TasksContentsLoaderProps = {
  isLoading: boolean;
  children: ReactNode;
};

const TasksContentsLoader = ({
  isLoading,
  children,
}: TasksContentsLoaderProps) => {
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
              duration: reducedMotion ? 0.01 : 0.22,
              delay: reducedMotion ? 0 : 0.34,
            },
          }}
          transition={{ duration: reducedMotion ? 0.01 : 0.3 }}
          className="flex min-h-0 min-w-0 flex-1 flex-col items-center justify-center gap-8 bg-background px-6"
        >
          <motion.div
            aria-hidden="true"
            initial={reducedMotion ? false : { opacity: 0, y: 14, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.35, ease: 'easeOut' }}
            className="rounded-3xl border border-border bg-card p-4 shadow-lg shadow-foreground/5"
          >
            <div className="relative flex gap-3">
              {columns.map((column, index) => (
                <motion.div
                  key={column}
                  initial={reducedMotion ? false : { opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.08 }}
                  className="flex h-28 w-20 flex-col gap-3 rounded-xl border border-border bg-muted/40 p-2"
                >
                  <span className="text-[10px] font-medium text-muted-foreground">
                    {column}
                  </span>
                  <span className="h-1.5 w-10 rounded-full bg-border" />
                  <span className="h-1.5 w-7 rounded-full bg-border/70" />
                </motion.div>
              ))}
              <motion.div
                initial={reducedMotion ? false : { opacity: 0, scale: 0.8 }}
                animate={
                  reducedMotion
                    ? { x: 0, opacity: 1 }
                    : { x: [0, 92, 184, 184], opacity: [0, 1, 1, 0] }
                }
                exit={{
                  x: reducedMotion ? 0 : 184,
                  opacity: 1,
                  transition: {
                    duration: reducedMotion ? 0.01 : 0.24,
                    ease: 'easeOut',
                  },
                }}
                transition={
                  reducedMotion
                    ? { duration: 0 }
                    : {
                        duration: 2.6,
                        times: [0, 0.3, 0.7, 1],
                        repeat: Infinity,
                        ease: 'easeInOut',
                      }
                }
                className="absolute top-12 left-2 flex h-12 w-16 items-center justify-center rounded-lg border border-primary/20 bg-primary text-primary-foreground shadow-md shadow-primary/20"
              >
                <motion.div
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0, transition: { duration: 0.1 } }}
                  className="flex w-full flex-col gap-1.5 px-3"
                >
                  <span className="h-1.5 w-full rounded-full bg-primary-foreground/90" />
                  <span className="h-1.5 w-2/3 rounded-full bg-primary-foreground/60" />
                </motion.div>
                <motion.span
                  initial={{ opacity: 0, scale: 0.6 }}
                  animate={{ opacity: 0, scale: 0.6 }}
                  exit={{
                    opacity: 1,
                    scale: 1,
                    transition: {
                      delay: reducedMotion ? 0 : 0.2,
                      duration: 0.14,
                    },
                  }}
                  className="absolute"
                >
                  <Check className="size-6" strokeWidth={2.5} />
                </motion.span>
              </motion.div>
            </div>
          </motion.div>
          <div className="flex flex-col items-center gap-1 text-center">
            <h3 className="text-lg font-semibold">Menyiapkan Kanban Board</h3>
            <p className="text-sm text-muted-foreground shimmer shimmer-duration-2600">
              Sebentar lagi siap digunakan...
            </p>
          </div>
        </motion.div>
      ) : (
        <motion.div
          key="content"
          className="flex min-h-0 min-w-0 flex-1 flex-col"
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

export default TasksContentsLoader;
