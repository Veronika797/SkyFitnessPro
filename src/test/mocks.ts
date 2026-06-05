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
  _id: "6a1ecd7d896b70976c059bfc",
  email: "test@example.com",
  selectedCourses: ["6i67sm", "q02a6i"],
  courseProgress: [],
  ...overrides,
});

export const createMockCourse = (overrides?: Partial<Course>): Course => ({
  _id: "6i67sm",
  nameRU: "Йога",
  nameEN: "Yoga",
  description: "Курс йоги для начинающих",
  directions: ["Хатха", "Виньяса"],
  fitting: ["Для начинающих", "Для дома", "Для здоровья"],
  workouts: ["kfpq8e", "abc123", "def456", "ghi789"],
  difficulty: "легкий",
  durationInDays: 20,
  dailyDurationInMinutes: { from: 20, to: 40 },
  ...overrides,
});

export const createMockWorkout = (overrides?: Partial<Workout>): Workout => ({
  _id: "kfpq8e",
  name: "Урок 1. Введение в йогу",
  video: "https://www.youtube.com/embed/gJPs7b8SpVw",
  exercises: [
    { _id: "ex1", name: "Собака мордой вниз", quantity: 10 },
    { _id: "ex2", name: "Поза ребёнка", quantity: 15 },
    { _id: "ex3", name: "Поза кобры", quantity: 8 },
  ],
  ...overrides,
});

export const createMockExercise = (overrides?: Partial<Exercise>): Exercise => ({
  _id: "ex1",
  name: "Собака мордой вниз",
  quantity: 10,
  ...overrides,
});

export const createMockProgress = (overrides?: Partial<CourseProgress>): CourseProgress => ({
  courseId: "6i67sm",
  courseCompleted: false,
  workoutsProgress: [
    {
      workoutId: "kfpq8e",
      workoutCompleted: true,
      progressData: [10, 15, 8],
    },
    {
      workoutId: "abc123",
      workoutCompleted: false,
      progressData: [5, 10, 0],
    },
  ],
  ...overrides,
});

export const mockApiResponse = {
  login: {
    token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  },
  register: {
    message: "Регистрация прошла успешно!",
  },
  usersMe: {
    user: {
      _id: "6a1ecd7d896b70976c059bfc",
      email: "test@example.com",
      selectedCourses: ["6i67sm", "q02a6i"],
      courseProgress: [],
    },
  },
  courses: [
    {
      _id: "6i67sm",
      nameRU: "Йога",
      nameEN: "Yoga",
      description: "Курс йоги для начинающих",
      directions: ["Хатха", "Виньяса"],
      fitting: ["Для начинающих", "Для дома"],
      workouts: ["kfpq8e", "abc123"],
      difficulty: "легкий",
      durationInDays: 20,
      dailyDurationInMinutes: { from: 20, to: 40 },
    },
    {
      _id: "q02a6i",
      nameRU: "Стретчинг",
      nameEN: "Stretching",
      description: "Курс стретчинга",
      directions: ["Гибкость"],
      fitting: ["Для всех"],
      workouts: ["xyz789"],
      difficulty: "средний",
      durationInDays: 30,
      dailyDurationInMinutes: { from: 30, to: 50 },
    },
  ],
  addCourse: {
    message: "Курс успешно добавлен!",
  },
  removeCourse: {
    message: "Курс успешно удален!",
  },
  resetProgress: {
    message: "Прогресс курса удалён!",
  },
};
