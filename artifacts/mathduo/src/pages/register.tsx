import { useEffect } from "react";
import { Link, useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useRegisterUser, useGetMe, getGetMeQueryKey } from "@workspace/api-client-react";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { GoogleButton } from "@/components/GoogleButton";

const registerSchema = z.object({
  username: z.string().min(3, { message: "Username must be at least 3 characters" }),
  email: z.string().email({ message: "Invalid email address" }),
  password: z.string().min(6, { message: "Password must be at least 6 characters" }),
  displayName: z.string().optional(),
});

type RegisterFormValues = z.infer<typeof registerSchema>;

export default function Register() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { data: user, isLoading: isUserLoading } = useGetMe({ query: { retry: false, queryKey: ['/api/auth/me'] } });

  const registerMutation = useRegisterUser();

  const form = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      username: "",
      email: "",
      password: "",
      displayName: "",
    },
  });

  useEffect(() => {
    if (user && !isUserLoading) {
      setLocation("/dashboard");
    }
  }, [user, isUserLoading, setLocation]);

  const onSubmit = (data: RegisterFormValues) => {
    registerMutation.mutate(
      { data },
      {
        onSuccess: (response) => {
          localStorage.setItem("mathduo_token", response.token);
          queryClient.invalidateQueries({ queryKey: getGetMeQueryKey() });
          toast({ title: "Welcome to MathDuo!", description: "Your account has been created." });
          setLocation("/dashboard");
        },
        onError: (error: any) => {
          toast({
            variant: "destructive",
            title: "Registration failed",
            description: error?.message || "There was a problem creating your account.",
          });
        },
      }
    );
  };

  if (isUserLoading) return null;

  return (
    <div className="min-h-[100dvh] flex flex-col bg-background p-6">
      <div className="flex-1 flex flex-col items-center justify-center w-full max-w-sm mx-auto space-y-6 py-8">

        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="text-center space-y-2"
        >
          <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center shadow-lg mx-auto mb-4 transform -rotate-3">
            <span className="text-3xl font-bold text-white">±</span>
          </div>
          <h1 className="text-3xl font-bold tracking-tight">Create your profile</h1>
          <p className="text-muted-foreground">Start learning math today</p>
        </motion.div>

        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="w-full space-y-4"
        >
          <GoogleButton label="Sign up with Google" />

          <div className="flex items-center gap-3">
            <div className="flex-1 h-px bg-border" />
            <span className="text-xs text-muted-foreground font-medium">or create account with email</span>
            <div className="flex-1 h-px bg-border" />
          </div>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="username"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Username</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="mathwizard"
                        className="h-12 rounded-xl"
                        data-testid="input-register-username"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="displayName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Display Name (optional)</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Math Wizard"
                        className="h-12 rounded-xl"
                        data-testid="input-register-displayname"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        placeholder="your@email.com"
                        className="h-12 rounded-xl"
                        data-testid="input-register-email"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        placeholder="••••••••"
                        className="h-12 rounded-xl"
                        data-testid="input-register-password"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="pt-1">
                <Button
                  type="submit"
                  size="lg"
                  className="w-full h-14 rounded-2xl text-lg font-bold shadow hover:-translate-y-1 transition-transform"
                  disabled={registerMutation.isPending}
                  data-testid="button-register-submit"
                >
                  {registerMutation.isPending ? "Creating account..." : "Create account"}
                </Button>
              </div>
            </form>
          </Form>
        </motion.div>

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}>
          <p className="text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link href="/login" className="font-bold text-primary hover:underline" data-testid="link-register-login">
              Log in
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
