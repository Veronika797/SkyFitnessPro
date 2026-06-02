export interface Exercise {
  _id: string;
  name: string;
  quantity: number;
}

export interface Workout {
  _id: string;
  name: string;
  video: string;
  exercises: Exercise[];
}

export interface Course {
  _id: string;
  nameRU: string;
  nameEN: string;
  description: string;
  directions: string[];
  fitting: string[];
  workouts: string[];
  difficulty: "легкий" | "средний" | "сложный";
  durationInDays: number;
  dailyDurationInMinutes: { from: number; to: number };
}

export interface WorkoutProgress {
  workoutId: string;
  workoutCompleted: boolean;
  progressData: number[];
}

export interface CourseProgress {
  courseId: string;
  courseCompleted: boolean;
  workoutsProgress: WorkoutProgress[];
}

export interface ProgressModalProps {
  exercises: Exercise[];
  onClose: () => void;
  onSave: (progress: Record<string, number>) => void;
  courseName: string;
}
