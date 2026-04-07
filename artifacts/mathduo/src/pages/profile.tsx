import { useEffect } from "react";
import { useLocation } from "wouter";
import { AppLayout } from "@/components/layout";
import { useGetMe, useGetUserStats, useGetAchievements, useLogoutUser, getGetMeQueryKey } from "@workspace/api-client-react";
import { Loader2, Settings, Flame, Zap, Target, LogOut, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useQueryClient } from "@tanstack/react-query";
import { cn } from "@/lib/utils";

export default function Profile() {
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();
  const { data: user, isLoading: isUserLoading } = useGetMe({ query: { retry: false, queryKey: ['/api/auth/me'] } });

  const { data: stats, isLoading: isStatsLoading } = useGetUserStats(
    user?.id as number,
    { query: { enabled: !!user?.id, queryKey: [`/api/users/${user?.id}/stats`] } }
  );

  const { data: achievements, isLoading: isAchievementsLoading } = useGetAchievements({
    query: { enabled: !!user?.id, queryKey: ['/api/gamification/achievements'] }
  });

  const logoutMutation = useLogoutUser();

  useEffect(() => {
    if (!user && !isUserLoading) {
      setLocation("/login");
    }
  }, [user, isUserLoading, setLocation]);

  const handleLogout = () => {
    logoutMutation.mutate(undefined, {
      onSuccess: () => {
        localStorage.removeItem("mathduo_token");
        queryClient.setQueryData(getGetMeQueryKey(), null);
        setLocation("/onboarding");
      }
    });
  };

  if (isUserLoading || isStatsLoading || isAchievementsLoading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center min-h-screen">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </AppLayout>
    );
  }

  if (!user || !stats) return null;

  return (
    <AppLayout>
      <div className="p-6 max-w-lg mx-auto space-y-8 pb-24">
        
        {/* Header / Profile Info */}
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Profile</h1>
          <Button variant="ghost" size="icon" className="rounded-full">
            <Settings className="w-6 h-6 text-gray-400" />
          </Button>
        </div>

        <div className="flex flex-col items-center space-y-4">
          <Avatar className="w-24 h-24 border-4 border-gray-100">
            <AvatarFallback className="bg-primary/10 text-primary text-2xl font-bold uppercase">
              {user.username.slice(0, 2)}
            </AvatarFallback>
          </Avatar>
          <div className="text-center">
            <h2 className="text-2xl font-bold" data-testid="text-username">{user.displayName || user.username}</h2>
            <p className="text-muted-foreground font-medium">@{user.username}</p>
          </div>
        </div>

        <hr className="border-gray-200" />

        {/* Stats */}
        <div className="space-y-4">
          <h3 className="text-xl font-bold">Statistics</h3>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="border-2 border-gray-200 rounded-2xl p-4 flex items-center gap-4">
              <Flame className="w-8 h-8 text-orange-500 fill-orange-500" />
              <div>
                <div className="text-2xl font-bold" data-testid="stat-streak">{stats.streakDays}</div>
                <div className="text-xs font-bold text-gray-400 uppercase">Day Streak</div>
              </div>
            </div>
            
            <div className="border-2 border-gray-200 rounded-2xl p-4 flex items-center gap-4">
              <Zap className="w-8 h-8 text-blue-500 fill-blue-500" />
              <div>
                <div className="text-2xl font-bold" data-testid="stat-xp">{stats.totalXp}</div>
                <div className="text-xs font-bold text-gray-400 uppercase">Total XP</div>
              </div>
            </div>

            <div className="border-2 border-gray-200 rounded-2xl p-4 flex items-center gap-4">
              <Target className="w-8 h-8 text-green-500" />
              <div>
                <div className="text-2xl font-bold" data-testid="stat-accuracy">{stats.accuracy}%</div>
                <div className="text-xs font-bold text-gray-400 uppercase">Accuracy</div>
              </div>
            </div>

            <div className="border-2 border-gray-200 rounded-2xl p-4 flex items-center gap-4">
              <div className="w-8 h-8 flex items-center justify-center bg-gray-100 rounded-full font-bold text-gray-500 text-lg">
                #
              </div>
              <div>
                <div className="text-2xl font-bold">{stats.lessonsCompleted}</div>
                <div className="text-xs font-bold text-gray-400 uppercase">Lessons</div>
              </div>
            </div>
          </div>
        </div>

        {/* Achievements */}
        {achievements && achievements.length > 0 && (
          <div className="space-y-4 pt-4">
            <h3 className="text-xl font-bold">Achievements</h3>
            <div className="grid grid-cols-1 gap-3">
              {achievements.map((achievement) => (
                <div 
                  key={achievement.id}
                  className={cn(
                    "border-2 rounded-2xl p-4 flex items-center gap-4 transition-all",
                    achievement.unlocked 
                      ? "border-yellow-200 bg-yellow-50" 
                      : "border-gray-200 bg-gray-50 grayscale opacity-60"
                  )}
                  data-testid={`achievement-${achievement.id}`}
                >
                  <div className="w-14 h-14 bg-white rounded-full flex items-center justify-center shadow-sm text-3xl border-2 border-gray-100 relative">
                    {!achievement.unlocked && (
                      <div className="absolute inset-0 bg-gray-100/80 rounded-full flex items-center justify-center">
                        <Lock className="w-5 h-5 text-gray-400" />
                      </div>
                    )}
                    {achievement.iconEmoji}
                  </div>
                  <div className="flex-1">
                    <h4 className="font-bold text-[17px] text-gray-900">{achievement.title}</h4>
                    <p className="text-sm text-gray-500 font-medium leading-snug mt-0.5">{achievement.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="pt-8">
          <Button 
            variant="ghost" 
            className="w-full text-red-500 hover:text-red-600 hover:bg-red-50 font-bold h-14 rounded-2xl text-lg"
            onClick={handleLogout}
            disabled={logoutMutation.isPending}
            data-testid="button-logout"
          >
            <LogOut className="w-5 h-5 mr-2" />
            {logoutMutation.isPending ? "Logging out..." : "Log Out"}
          </Button>
        </div>

      </div>
    </AppLayout>
  );
}
