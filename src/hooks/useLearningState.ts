import { useLocalStorage } from "@/lib/use-local-storage";
import { LearningPath, Quiz, UserProgress } from "@/lib/types";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import { useProgressSync } from "@/hooks/useProgressSync";

export function useLearningState() {
  const { user } = useAuth();

  const [learningPaths, setLearningPaths] = useLocalStorage<
    Record<string, LearningPath>
  >("canvas-learning-paths", {});

  const [quizzes, setQuizzes] = useLocalStorage<Record<string, Quiz>>(
    "canvas-quizzes",
    {},
  );

  const [userProgress, setUserProgress] = useLocalStorage<
    Record<string, UserProgress>
  >("canvas-user-progress", {});

  useProgressSync(user, userProgress, setUserProgress as (p: Record<string, UserProgress>) => void);

  const [showLearningPathEditor, setShowLearningPathEditor] = useState(false);
  const [editingPath, setEditingPath] = useState<LearningPath | null>(null);
  const [activeLearningPath, setActiveLearningPath] =
    useState<LearningPath | null>(null);
  const [showProgressTracker, setShowProgressTracker] = useState(false);

  // Seed defaults on first mount — dynamic import keeps ccna-content out of main bundle
  useEffect(() => {
    import("@/lib/default-learning-content").then(({ DEFAULT_LEARNING_PATHS, DEFAULT_QUIZZES }) => {
      setLearningPaths((prev) => Object.keys(prev).length === 0 ? DEFAULT_LEARNING_PATHS : prev);
      setQuizzes((prev) => ({ ...DEFAULT_QUIZZES, ...prev }));
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSaveLearningPath = useCallback(
    (path: LearningPath) => {
      setLearningPaths((prev) => ({ ...prev, [path.id]: path }));
      setShowLearningPathEditor(false);
      setEditingPath(null);
      toast.success("Lernpfad gespeichert", { duration: 1500 });
    },
    [setLearningPaths],
  );

  const handleDeleteLearningPath = useCallback(
    (pathId: string) => {
      setLearningPaths((prev) => {
        const next = { ...prev };
        delete next[pathId];
        return next;
      });
      setUserProgress((prev) => {
        const next = { ...prev };
        delete next[pathId];
        return next;
      });
      toast.success("Lernpfad gelöscht", { duration: 1500 });
    },
    [setLearningPaths, setUserProgress],
  );

  const handleStartLearningPath = useCallback(
    (path: LearningPath) => {
      setActiveLearningPath(path);
      setShowProgressTracker(true);
      if (!userProgress[path.id]) {
        setUserProgress((prev) => ({
          ...prev,
          [path.id]: {
            pathId: path.id,
            currentStepIndex: 0,
            completedSteps: [],
            quizScores: {},
            hintsUsed: {},
            startedAt: Date.now(),
            lastActivityAt: Date.now(),
            totalTimeSpent: 0,
            overallScore: 0,
          },
        }));
      }
    },
    [userProgress, setUserProgress],
  );

  const handleUpdateProgress = useCallback(
    (newProgress: UserProgress) => {
      setUserProgress((prev) => ({
        ...prev,
        [newProgress.pathId]: newProgress,
      }));
    },
    [setUserProgress],
  );

  return {
    user,
    learningPaths,
    setLearningPaths,
    quizzes,
    setQuizzes,
    userProgress,
    setUserProgress,
    editingPath,
    setEditingPath,
    activeLearningPath,
    setActiveLearningPath,
    showLearningPathEditor,
    setShowLearningPathEditor,
    showProgressTracker,
    setShowProgressTracker,
    handleSaveLearningPath,
    handleDeleteLearningPath,
    handleStartLearningPath,
    handleUpdateProgress,
  };
}
