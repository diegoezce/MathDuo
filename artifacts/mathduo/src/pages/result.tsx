import { useEffect } from "react";
import { Link, useLocation } from "wouter";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Trophy, Target, Flame } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { getGetMeQueryKey, getGetUserProgressQueryKey, getGetStreakQueryKey } from "@workspace/api-client-react";

export default function Result() {
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();

  useEffect(() => {
    // Invalidate user queries to refresh XP and progress on dashboard
    queryClient.invalidateQueries({ queryKey: getGetMeQueryKey() });
    queryClient.invalidateQueries({ queryKey: getGetUserProgressQueryKey() });
    queryClient.invalidateQueries({ queryKey: getGetStreakQueryKey() });
  }, [queryClient]);

  // We don't have the result endpoint built into hooks, so we'll mock the display data based on a successful finish
  // In a real scenario we'd fetch the lessonResult based on sessionId

  return (
    <div className="min-h-[100dvh] flex flex-col bg-background p-6 max-w-md mx-auto w-full">
      <div className="flex-1 flex flex-col items-center justify-center text-center space-y-12">
        
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", bounce: 0.6, duration: 0.8 }}
          className="relative"
        >
          <div className="absolute inset-0 bg-yellow-400 rounded-full blur-3xl opacity-30 animate-pulse" />
          <div className="w-32 h-32 bg-yellow-400 rounded-full border-b-[6px] border-yellow-500 flex items-center justify-center shadow-lg relative z-10 mx-auto">
            <Trophy className="w-16 h-16 text-yellow-900" />
          </div>
        </motion.div>

        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="space-y-2"
        >
          <h1 className="text-3xl font-extrabold text-yellow-500">Lesson Complete!</h1>
          <p className="text-lg text-muted-foreground font-bold">You're doing great!</p>
        </motion.div>

        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="grid grid-cols-2 gap-4 w-full"
        >
          <div className="bg-blue-50 border-2 border-blue-100 rounded-2xl p-4 flex flex-col items-center justify-center">
            <div className="text-blue-500 mb-1">
              <Trophy className="w-6 h-6" />
            </div>
            <div className="text-2xl font-bold text-blue-600">+10</div>
            <div className="text-xs font-bold text-blue-400 uppercase tracking-wider">Total XP</div>
          </div>
          <div className="bg-green-50 border-2 border-green-100 rounded-2xl p-4 flex flex-col items-center justify-center">
            <div className="text-green-500 mb-1">
              <Target className="w-6 h-6" />
            </div>
            <div className="text-2xl font-bold text-green-600">100%</div>
            <div className="text-xs font-bold text-green-400 uppercase tracking-wider">Accuracy</div>
          </div>
        </motion.div>
      </div>

      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.7 }}
        className="w-full pt-8 pb-safe space-y-4"
      >
        <Link href="/dashboard" className="w-full">
          <Button size="lg" className="w-full rounded-2xl h-14 text-lg font-bold shadow hover:-translate-y-1 transition-transform" data-testid="button-result-continue">
            Continue
          </Button>
        </Link>
      </motion.div>
    </div>
  );
}
