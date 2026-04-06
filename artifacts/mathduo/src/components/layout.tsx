import { Link, useLocation } from "wouter";
import { BookOpen, User, Trophy, Play } from "lucide-react";
import { cn } from "@/lib/utils";

export function BottomNav() {
  const [location] = useLocation();

  const navItems = [
    { href: "/dashboard", icon: BookOpen, label: "Learn" },
    { href: "/leaderboard", icon: Trophy, label: "Leaderboard" },
    { href: "/profile", icon: User, label: "Profile" },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 border-t bg-background pb-safe md:hidden">
      <div className="flex h-16 items-center justify-around px-4">
        {navItems.map((item) => {
          const isActive = location === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center justify-center space-y-1 w-full h-full",
                isActive ? "text-primary" : "text-muted-foreground hover:text-foreground"
              )}
            >
              <item.icon
                className={cn(
                  "h-6 w-6 transition-all duration-200",
                  isActive ? "scale-110" : ""
                )}
                strokeWidth={isActive ? 2.5 : 2}
              />
            </Link>
          );
        })}
      </div>
    </div>
  );
}

export function DesktopSidebar() {
  const [location] = useLocation();

  const navItems = [
    { href: "/dashboard", icon: BookOpen, label: "LEARN" },
    { href: "/leaderboard", icon: Trophy, label: "LEADERBOARD" },
    { href: "/profile", icon: User, label: "PROFILE" },
  ];

  return (
    <div className="hidden md:flex flex-col w-64 border-r bg-card min-h-screen p-4 sticky top-0">
      <div className="flex items-center gap-2 px-4 py-6 mb-8">
        <div className="w-8 h-8 rounded-xl bg-primary flex items-center justify-center text-primary-foreground font-bold text-xl">
          M
        </div>
        <span className="font-bold text-2xl tracking-tight text-primary">mathduo</span>
      </div>

      <nav className="flex flex-col space-y-2 flex-1">
        {navItems.map((item) => {
          const isActive = location === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-4 px-4 py-3 rounded-2xl font-bold tracking-wide transition-all",
                isActive 
                  ? "bg-primary/10 text-primary border-2 border-primary/20" 
                  : "text-muted-foreground hover:bg-secondary hover:text-foreground border-2 border-transparent"
              )}
            >
              <item.icon className="h-6 w-6" strokeWidth={isActive ? 2.5 : 2} />
              {item.label}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}

export function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-background md:bg-gray-50 dark:bg-background">
      <DesktopSidebar />
      <main className="flex-1 flex justify-center pb-16 md:pb-0">
        <div className="w-full max-w-2xl bg-background min-h-screen shadow-sm md:border-x">
          {children}
        </div>
      </main>
      <BottomNav />
    </div>
  );
}
