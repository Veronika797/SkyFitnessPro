import { vi, MockedFunction } from "vitest";
import type { User, AuthContextType } from "@/context/AuthContext";
import type { Course, Workout, CourseProgress, Exercise } from "@/types";

export const mockFn = <TArgs extends readonly unknown[], TReturn = unknown>(
  implementation?: (...args: TArgs) => TReturn,
): MockedFunction<(...args: TArgs) => TReturn> => {
  return vi.fn(implementation) as MockedFunction<(...args: TArgs) => TReturn>;
};

export const createAuthMock = (
  overrides?: Partial<Omit<AuthContextType, "user">> & { user?: User | null },
): AuthContextType => {
  const base: AuthContextType = {
    user: null,
    isLoading: false,
    error: null,
    clearError: vi.fn(),
    login: mockFn<[string, string], Promise<void>>(),
    register: mockFn<[string, string], Promise<void>>(),
    logout: mockFn<[], void>(),
    fetchUser: mockFn<[], Promise<void>>(),
    isLoginOpen: false,
    isRegisterOpen: false,
    openLoginModal: mockFn<[], void>(),
    openRegisterModal: mockFn<[], void>(),
    closeModals: mockFn<[], void>(),
    returnTo: null,
    setReturnUrl: mockFn<[string], void>(),
    addCourseLocally: mockFn<[string], void>(),
    removeCourseLocally: mockFn<[string], void>(),
  };

  return { ...base, ...overrides };
};

export const createMockUser = (overrides?: Partial<User>): User => ({
  email: "test@example.com",
  selectedCourses: [],
  ...overrides,
});

export const createMockCourse = (overrides?: Partial<Course>): Course => ({
  _id: "course_001",
  nameRU: "Йога",
  nameEN: "Yoga",
  description: "",
  directions: [],
  fitting: [],
  workouts: [],
  difficulty: "легкий",
  durationInDays: 20,
  dailyDurationInMinutes: { from: 20, to: 40 },
  ...overrides,
});

export const createMockWorkout = (overrides?: Partial<Workout>): Workout => ({
  _id: "workout_001",
  name: "Урок 1",
  video: "https://youtube.com/embed/test",
  exercises: [],
  ...overrides,
});

export const createMockExercise = (overrides?: Partial<Exercise>): Exercise => ({
  _id: "ex_001",
  name: "Упражнение",
  quantity: 10,
  ...overrides,
});

export const createMockProgress = (overrides?: Partial<CourseProgress>): CourseProgress => ({
  courseId: "course_001",
  courseCompleted: false,
  workoutsProgress: [],
  ...overrides,
});
