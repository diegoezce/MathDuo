import { useEffect } from "react";
import { useLocation } from "wouter";
import { AppLayout } from "@/components/layout";
import { useGetMe, useGetLeaderboard } from "@workspace/api-client-react";
import { Loader2, Trophy } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

export default function Leaderboard() {
  const [, setLocation] = useLocation();
  const { data: user, isLoading: isUserLoading } = useGetMe({ query: { retry: false, queryKey: ['/api/auth/me'] } });

  const { data: leaderboard, isLoading: isLeaderboardLoading } = useGetLeaderboard({
    query: { enabled: !!user, queryKey: ['/api/gamification/leaderboard'] }
  });

  useEffect(() => {
    if (!user && !isUserLoading) {
      setLocation("/login");
    }
  }, [user, isUserLoading, setLocation]);

  if (isUserLoading || isLeaderboardLoading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center min-h-screen">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </AppLayout>
    );
  }

  if (!user || !leaderboard) return null;

  return (
    <AppLayout>
      <div className="flex flex-col h-full min-h-screen">
        <div className="bg-primary pt-12 pb-8 px-6 rounded-b-[40px] text-primary-foreground mb-8 text-center shadow-sm">
          <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4 backdrop-blur-sm">
            <Trophy className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-extrabold mb-2">Leaderboard</h1>
          <p className="text-primary-foreground/80 font-medium">Top MathDuo learners</p>
        </div>

        <div className="px-4 pb-24 space-y-3 max-w-lg mx-auto w-full">
          {leaderboard.map((entry, i) => {
            const isMe = entry.userId === user.id;
            
            return (
              <div 
                key={entry.userId}
                className={cn(
                  "flex items-center p-4 rounded-2xl border-2 transition-all",
                  isMe 
                    ? "bg-blue-50 border-blue-200 shadow-sm" 
                    : "bg-white border-gray-100",
                  i === 0 && "border-yellow-200 bg-yellow-50/50"
                )}
                data-testid={`row-leaderboard-${entry.userId}`}
              >
                <div className="w-8 font-bold text-lg flex justify-center mr-2">
                  {i === 0 ? <span className="text-yellow-500 text-2xl">🥇</span> : 
                   i === 1 ? <span className="text-gray-400 text-2xl">🥈</span> : 
                   i === 2 ? <span className="text-amber-600 text-2xl">🥉</span> : 
                   <span className="text-gray-400">{entry.rank}</span>}
                </div>
                
                <Avatar className="w-12 h-12 border-2 border-gray-200 mr-4">
                  <AvatarFallback className={cn(
                    "font-bold uppercase",
                    isMe ? "bg-primary/20 text-primary" : "bg-gray-100 text-gray-500"
                  )}>
                    {entry.username.slice(0, 2)}
                  </AvatarFallback>
                </Avatar>
                
                <div className="flex-1 min-w-0">
                  <div className="font-bold truncate text-[17px]">
                    {entry.displayName || entry.username}
                  </div>
                  {isMe && <div className="text-xs font-bold text-primary">YOU</div>}
                </div>
                
                <div className="text-right ml-4">
                  <div className="font-extrabold text-blue-500 text-[17px]">{entry.xp} XP</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </AppLayout>
  );
}
