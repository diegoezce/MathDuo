import { useQuery } from "@tanstack/react-query";
import { Link, useLocation } from "wouter";
import { AppLayout } from "@/components/layout";
import { motion } from "framer-motion";
import { Flame, Heart, Zap, Check, Lock, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  useGetMe,
  useGetLessons,
  useGetUserProgress,
  useGetStreak,
} from "@workspace/api-client-react";

export default function Dashboard() {
  const [, setLocation] = useLocation();
  const { data: user, isLoading: isUserLoading } = useGetMe({ query: { retry: false } });
  
  const { data: lessons, isLoading: isLessonsLoading } = useGetLessons({
    query: { enabled: !!user }
  });
  
  const { data: progress, isLoading: isProgressLoading } = useGetUserProgress({
    query: { enabled: !!user }
  });
  
  const { data: streak, isLoading: isStreakLoading } = useGetStreak({
    query: { enabled: !!user }
  });

  if (isUserLoading) {
    return <div className="min-h-screen flex items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  }

  if (!user) {
    setLocation("/login");
    return null;
  }

  const isLoading = isLessonsLoading || isProgressLoading || isStreakLoading;

  if (isLoading) {
    return (
      <AppLayout>
        <div className="flex flex-col items-center justify-center min-h-[50vh]">
          <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
          <p className="text-muted-foreground font-medium">Loading your path...</p>
        </div>
      </AppLayout>
    );
  }

  // Group lessons by category to create sections
  const groupedLessons = lessons?.reduce((acc, lesson) => {
    if (!acc[lesson.category]) {
      acc[lesson.category] = [];
    }
    acc[lesson.category].push(lesson);
    return acc;
  }, {} as Record<string, typeof lessons>) || {};

  // Find user's progress for a specific lesson
  const getLessonStatus = (lessonId: number) => {
    const p = progress?.find((p) => p.lessonId === lessonId);
    return p?.status || "locked";
  };

  return (
    <AppLayout>
      {/* Top Stats Bar */}
      <div className="sticky top-0 z-40 bg-background/80 backdrop-blur-md border-b px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5 font-bold text-orange-500" data-testid="stat-streak">
            <Flame className={cn("h-5 w-5", streak?.currentStreak && streak.currentStreak > 0 ? "fill-orange-500 text-orange-500" : "text-gray-300")} />
            <span>{streak?.currentStreak || 0}</span>
          </div>
          <div className="flex items-center gap-1.5 font-bold text-blue-500" data-testid="stat-xp">
            <Zap className="h-5 w-5 fill-blue-500 text-blue-500" />
            <span>{user.xp}</span>
          </div>
        </div>
        <div className="flex items-center gap-1.5 font-bold text-red-500" data-testid="stat-lives">
          <Heart className="h-5 w-5 fill-red-500 text-red-500" />
          <span>{user.lives}</span>
        </div>
      </div>

      <div className="p-6 pb-24 flex flex-col items-center max-w-lg mx-auto w-full">
        {Object.entries(groupedLessons).map(([category, categoryLessons], sectionIndex) => (
          <div key={category} className="w-full mb-12">
            <div className="bg-primary/10 text-primary rounded-2xl p-4 mb-8 text-center font-bold uppercase tracking-wider text-xl">
              Unit {sectionIndex + 1}: {category}
            </div>

            <div className="flex flex-col items-center gap-8 relative">
              {categoryLessons.map((lesson, index) => {
                const status = getLessonStatus(lesson.id);
                const isLocked = status === "locked";
                const isCompleted = status === "completed" || status === "mastered";
                const isAvailable = status === "available" || status === "in_progress";
                
                // Calculate zigzag positioning (-1, 0, 1, 0)
                const offset = index % 4 === 0 ? 0 : index % 4 === 1 ? -40 : index % 4 === 2 ? 0 : 40;

                return (
                  <div key={lesson.id} className="relative flex flex-col items-center w-full" style={{ marginLeft: `${offset}px` }}>
                    {/* Path line connection (except for last item) */}
                    {index < categoryLessons.length - 1 && (
                      <div className="absolute top-[64px] h-12 w-3 bg-gray-200 -z-10 rounded-full" />
                    )}

                    <div className="relative">
                      {isAvailable && (
                        <motion.div
                          animate={{ scale: [1, 1.1, 1] }}
                          transition={{ repeat: Infinity, duration: 2 }}
                          className="absolute -inset-2 bg-primary/20 rounded-full -z-10"
                        />
                      )}
                      
                      {isLocked ? (
                        <div className="w-16 h-16 rounded-full bg-gray-200 border-b-4 border-gray-300 flex items-center justify-center opacity-80 cursor-not-allowed">
                          <Lock className="h-6 w-6 text-gray-400" />
                        </div>
                      ) : (
                        <Link href={`/lesson/${lesson.id}`} data-testid={`link-lesson-${lesson.id}`}>
                          <motion.div
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className={cn(
                              "w-16 h-16 rounded-full flex flex-col items-center justify-center cursor-pointer shadow-sm relative",
                              isCompleted 
                                ? "bg-yellow-400 border-b-4 border-yellow-500 text-yellow-900" 
                                : "bg-primary border-b-4 border-primary-border text-primary-foreground"
                            )}
                          >
                            {isCompleted ? (
                              <Check className="h-8 w-8 stroke-[3]" />
                            ) : (
                              <span className="text-2xl">{lesson.iconEmoji}</span>
                            )}
                          </motion.div>
                        </Link>
                      )}
                    </div>
                    
                    <span className="text-center font-bold mt-2 text-sm text-gray-500 max-w-[120px] leading-tight">
                      {lesson.title}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </AppLayout>
  );
}
