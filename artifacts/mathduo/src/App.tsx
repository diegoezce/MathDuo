import { useEffect } from "react";
import { Switch, Route, Router as WouterRouter, useLocation } from "wouter";
import { QueryClient, QueryClientProvider, useQueryClient } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";

import Onboarding from "@/pages/onboarding";
import Login from "@/pages/login";
import Register from "@/pages/register";
import Dashboard from "@/pages/dashboard";
import Lesson from "@/pages/lesson";
import Result from "@/pages/result";
import Profile from "@/pages/profile";
import Leaderboard from "@/pages/leaderboard";
import { getGetMeQueryKey } from "@workspace/api-client-react";

const queryClient = new QueryClient();

function GoogleTokenHandler() {
  const [, setLocation] = useLocation();
  const qc = useQueryClient();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get("google_token");
    const error = params.get("google_error");

    if (token) {
      localStorage.setItem("mathduo_token", token);
      qc.invalidateQueries({ queryKey: getGetMeQueryKey() });
      // Clean URL then go to dashboard
      window.history.replaceState({}, "", "/");
      setLocation("/dashboard");
    } else if (error) {
      window.history.replaceState({}, "", "/login");
      setLocation("/login");
    }
  }, []);

  return null;
}

function Router() {
  return (
    <>
      <GoogleTokenHandler />
      <Switch>
        <Route path="/" component={Onboarding} />
        <Route path="/onboarding" component={Onboarding} />
        <Route path="/login" component={Login} />
        <Route path="/register" component={Register} />
        <Route path="/dashboard" component={Dashboard} />
        <Route path="/lesson/:lessonId" component={Lesson} />
        <Route path="/lesson/:lessonId/result" component={Result} />
        <Route path="/profile" component={Profile} />
        <Route path="/leaderboard" component={Leaderboard} />
        <Route component={NotFound} />
      </Switch>
    </>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
          <Router />
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
