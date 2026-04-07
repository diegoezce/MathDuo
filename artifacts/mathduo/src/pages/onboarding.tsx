import { useEffect } from "react";
import { Link, useLocation } from "wouter";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useGetMe } from "@workspace/api-client-react";
import { Loader2 } from "lucide-react";

export default function Onboarding() {
  const [, setLocation] = useLocation();
  const { data: user, isLoading } = useGetMe({ query: { retry: false, queryKey: ['/api/auth/me'] } });

  useEffect(() => {
    if (user && !isLoading) {
      setLocation("/dashboard");
    }
  }, [user, isLoading, setLocation]);

  if (isLoading) {
    return (
      <div className="min-h-[100dvh] flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-[100dvh] flex flex-col bg-background p-6">
      <div className="flex-1 flex flex-col items-center justify-center text-center space-y-8">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", bounce: 0.5 }}
          className="w-32 h-32 bg-primary rounded-3xl flex items-center justify-center shadow-lg transform rotate-3"
        >
          <span className="text-6xl font-bold text-white">±</span>
        </motion.div>

        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="space-y-4"
        >
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-foreground">
            mathduo
          </h1>
          <p className="text-xl text-muted-foreground max-w-[280px] mx-auto">
            The fun, free, and effective way to learn math!
          </p>
        </motion.div>
      </div>

      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="w-full max-w-sm mx-auto space-y-4 mb-8"
      >
        <Link href="/register" className="w-full">
          <Button size="lg" className="w-full rounded-2xl h-14 text-lg font-bold shadow hover:bg-primary/90 hover:-translate-y-1 transition-transform">
            Get Started
          </Button>
        </Link>
        <Link href="/login" className="w-full">
          <Button variant="outline" size="lg" className="w-full rounded-2xl h-14 text-lg font-bold shadow-sm border-2 hover:bg-secondary/50 transition-colors">
            I already have an account
          </Button>
        </Link>
      </motion.div>
    </div>
  );
}
