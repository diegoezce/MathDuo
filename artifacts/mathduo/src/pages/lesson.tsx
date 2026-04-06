import { useState, useEffect } from "react";
import { useLocation, useParams } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { X, Heart, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import {
  useGetMe,
  useGetLesson,
  useStartLesson,
  useSubmitAnswer,
  useCompleteLesson
} from "@workspace/api-client-react";
import { cn } from "@/lib/utils";

export default function Lesson() {
  const { lessonId } = useParams();
  const [, setLocation] = useLocation();
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string>("");
  const [textInputAnswer, setTextInputAnswer] = useState("");
  const [feedback, setFeedback] = useState<{ correct: boolean; correctAnswer: string; explanation?: string | null } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { data: user, isLoading: isUserLoading } = useGetMe({ query: { retry: false } });
  
  const { data: lesson, isLoading: isLessonLoading } = useGetLesson(
    Number(lessonId),
    { query: { enabled: !!lessonId && !!user } }
  );

  const startMutation = useStartLesson();
  const submitAnswerMutation = useSubmitAnswer();
  const completeMutation = useCompleteLesson();

  useEffect(() => {
    if (!user && !isUserLoading) {
      setLocation("/login");
    }
  }, [user, isUserLoading, setLocation]);

  useEffect(() => {
    if (lesson && !sessionId && !startMutation.isPending && !startMutation.isSuccess) {
      startMutation.mutate(
        { lessonId: lesson.id },
        {
          onSuccess: (data) => {
            setSessionId(data.sessionId);
          },
          onError: () => {
            setLocation("/dashboard");
          }
        }
      );
    }
  }, [lesson, sessionId, startMutation, setLocation]);

  if (isUserLoading || isLessonLoading || !sessionId || !lesson) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const currentExercise = lesson.exercises[currentExerciseIndex];
  const progress = (currentExerciseIndex / lesson.exercises.length) * 100;

  const handleCheck = () => {
    if (isSubmitting || feedback) return;

    const answerToSubmit = currentExercise.type === "multiple_choice" ? selectedAnswer : textInputAnswer;
    if (!answerToSubmit) return;

    setIsSubmitting(true);
    submitAnswerMutation.mutate(
      { sessionId, data: { exerciseId: currentExercise.id, answer: answerToSubmit } },
      {
        onSuccess: (res) => {
          setFeedback({
            correct: res.correct,
            correctAnswer: res.correctAnswer,
            explanation: res.explanation
          });
          setIsSubmitting(false);
        },
        onError: () => {
          setIsSubmitting(false);
        }
      }
    );
  };

  const handleContinue = () => {
    if (currentExerciseIndex < lesson.exercises.length - 1) {
      setCurrentExerciseIndex(prev => prev + 1);
      setSelectedAnswer("");
      setTextInputAnswer("");
      setFeedback(null);
    } else {
      // Finish lesson
      completeMutation.mutate(
        { sessionId, data: { correctAnswers: 10, totalQuestions: 10, timeSpentSeconds: 60 } }, // Mocked stats for simple frontend
        {
          onSuccess: () => {
            setLocation(`/lesson/${lessonId}/result?sessionId=${sessionId}`);
          },
          onError: () => {
            setLocation("/dashboard");
          }
        }
      );
    }
  };

  return (
    <div className="min-h-[100dvh] flex flex-col bg-background max-w-2xl mx-auto w-full relative overflow-hidden">
      {/* Top Bar */}
      <div className="flex items-center gap-4 p-4 pt-6">
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={() => setLocation("/dashboard")}
          className="text-gray-400 hover:text-gray-600 rounded-full h-10 w-10 flex-shrink-0"
          data-testid="button-lesson-close"
        >
          <X className="h-6 w-6" />
        </Button>
        <Progress value={progress} className="flex-1 h-4 rounded-full bg-gray-200" />
        <div className="flex items-center gap-1.5 font-bold text-red-500 flex-shrink-0" data-testid="stat-lives">
          <Heart className="h-6 w-6 fill-red-500 text-red-500" />
          <span className="text-lg">{user?.lives}</span>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 px-4 py-8 flex flex-col max-w-xl mx-auto w-full">
        <h2 className="text-2xl font-bold mb-8 text-foreground" data-testid="text-question">
          {currentExercise.question}
        </h2>

        {/* Input Area */}
        <div className="w-full flex-1">
          {currentExercise.type === "multiple_choice" && currentExercise.options ? (
            <div className="grid gap-3">
              {currentExercise.options.map((option, i) => (
                <button
                  key={i}
                  disabled={!!feedback}
                  onClick={() => setSelectedAnswer(option)}
                  className={cn(
                    "w-full text-left p-4 rounded-2xl border-2 font-medium text-lg transition-all",
                    selectedAnswer === option 
                      ? "border-primary bg-primary/10 text-primary" 
                      : "border-gray-200 hover:bg-gray-50 active:bg-gray-100",
                    feedback?.correct && selectedAnswer === option && "border-green-500 bg-green-50 text-green-700",
                    feedback && !feedback.correct && selectedAnswer === option && "border-red-500 bg-red-50 text-red-700",
                    feedback && !feedback.correct && option === feedback.correctAnswer && "border-green-500 bg-green-50 text-green-700"
                  )}
                  data-testid={`button-option-${i}`}
                >
                  {option}
                </button>
              ))}
            </div>
          ) : (
            <Input
              value={textInputAnswer}
              onChange={(e) => setTextInputAnswer(e.target.value)}
              disabled={!!feedback}
              className={cn(
                "h-16 text-xl px-4 rounded-2xl border-2",
                feedback?.correct && "border-green-500 bg-green-50 text-green-700 focus-visible:ring-green-500",
                feedback && !feedback.correct && "border-red-500 bg-red-50 text-red-700 focus-visible:ring-red-500"
              )}
              placeholder="Type your answer..."
              autoFocus
              data-testid="input-answer"
            />
          )}
        </div>
      </div>

      {/* Bottom Bar / Feedback */}
      <div className="mt-auto">
        <AnimatePresence>
          {feedback && (
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className={cn(
                "absolute bottom-0 left-0 right-0 p-4 pt-6 pb-safe border-t-2 flex flex-col gap-4",
                feedback.correct ? "bg-green-100 border-green-200 text-green-800" : "bg-red-100 border-red-200 text-red-800"
              )}
              data-testid={`feedback-${feedback.correct ? 'correct' : 'incorrect'}`}
            >
              <div className="flex items-center gap-3">
                <div className={cn(
                  "w-10 h-10 rounded-full flex items-center justify-center",
                  feedback.correct ? "bg-green-500" : "bg-red-500"
                )}>
                  {feedback.correct ? (
                    <CheckIcon className="w-6 h-6 text-white" />
                  ) : (
                    <X className="w-6 h-6 text-white" />
                  )}
                </div>
                <div>
                  <h3 className="font-bold text-2xl">
                    {feedback.correct ? "Excellent!" : "Not quite"}
                  </h3>
                  {!feedback.correct && (
                    <p className="text-sm font-medium mt-1">
                      Correct answer: {feedback.correctAnswer}
                    </p>
                  )}
                </div>
              </div>
              <Button 
                size="lg" 
                className={cn(
                  "w-full h-14 rounded-2xl text-lg font-bold shadow-sm",
                  feedback.correct ? "bg-green-500 hover:bg-green-600 text-white" : "bg-red-500 hover:bg-red-600 text-white"
                )}
                onClick={handleContinue}
                data-testid="button-continue"
                disabled={completeMutation.isPending}
              >
                {completeMutation.isPending ? <Loader2 className="w-6 h-6 animate-spin" /> : "Continue"}
              </Button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Normal Check Button */}
        {!feedback && (
          <div className="p-4 pb-safe border-t bg-background">
            <Button
              size="lg"
              className={cn(
                "w-full h-14 rounded-2xl text-lg font-bold shadow transition-all",
                (!selectedAnswer && !textInputAnswer) ? "bg-gray-200 text-gray-400 hover:bg-gray-200 cursor-not-allowed border-none" : "hover:-translate-y-1"
              )}
              disabled={(!selectedAnswer && !textInputAnswer) || isSubmitting}
              onClick={handleCheck}
              data-testid="button-check"
            >
              {isSubmitting ? <Loader2 className="w-6 h-6 animate-spin" /> : "Check"}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

function CheckIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}
