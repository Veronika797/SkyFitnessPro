import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { WorkoutPage } from "../WorkoutPage";
import { vi, MockedFunction } from "vitest";

vi.mock("@/api/courseService");
vi.mock("@/context/AuthContext");
vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useParams: vi.fn(),
    useNavigate: vi.fn(),
  };
});
vi.mock("react-toastify", () => ({
  toast: { error: vi.fn(), success: vi.fn() },
}));
vi.mock("@/utils/errorUtils", () => ({
  getErrorMessage: vi.fn((err: unknown) =>
    err instanceof Error ? err.message : "Произошла ошибка",
  ),
}));

import type { Course, Workout, CourseProgress } from "@/types";
import * as courseService from "@/api/courseService";
import * as authContext from "@/context/AuthContext";
import * as router from "react-router-dom";
import { getErrorMessage } from "@/utils/errorUtils";

import {
  createAuthMock,
  createMockUser,
  createMockCourse,
  createMockWorkout,
  createMockProgress,
} from "@/test/mocks";

const mockGetCourseById = courseService.getCourseById as MockedFunction<
  typeof courseService.getCourseById
>;
const mockGetWorkoutById = courseService.getWorkoutById as MockedFunction<
  typeof courseService.getWorkoutById
>;
const mockGetCourseProgress = courseService.getCourseProgress as MockedFunction<
  typeof courseService.getCourseProgress
>;
const mockSaveWorkoutProgress = courseService.saveWorkoutProgress as MockedFunction<
  typeof courseService.saveWorkoutProgress
>;

const mockUseAuth = authContext.useAuth as MockedFunction<typeof authContext.useAuth>;
const mockUseParams = router.useParams as MockedFunction<typeof router.useParams>;
const mockUseNavigate = router.useNavigate as MockedFunction<typeof router.useNavigate>;

const mockCourse: Course = createMockCourse({
  _id: "yoga_001",
  nameRU: "Йога",
  workouts: ["w1"],
});

const mockWorkout: Workout = createMockWorkout({
  _id: "w1",
  name: "Урок 1. Введение",
  video: "https://www.youtube.com/embed/test",
  exercises: [
    { _id: "ex1", name: "Собака мордой вниз", quantity: 10 },
    { _id: "ex2", name: "Поза ребёнка", quantity: 15 },
  ],
});

const mockProgress: CourseProgress = createMockProgress({
  courseId: "yoga_001",
  workoutsProgress: [
    {
      workoutId: "w1",
      workoutCompleted: false,
      progressData: [5, 10],
    },
  ],
});

describe("WorkoutPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    mockUseParams.mockReturnValue({ courseId: "yoga_001", workoutId: "w1" });
    mockUseAuth.mockReturnValue(
      createAuthMock({
        user: createMockUser(),
      }),
    );

    mockGetCourseById.mockResolvedValue(mockCourse);
    mockGetWorkoutById.mockResolvedValue(mockWorkout);
    mockGetCourseProgress.mockResolvedValue(mockProgress);
    (getErrorMessage as MockedFunction<typeof getErrorMessage>).mockImplementation(
      (err: unknown) => (err instanceof Error ? err.message : "Произошла ошибка"),
    );
  });

  it("должен отображать загрузку", async () => {
    await waitFor(() => {
      render(<WorkoutPage />);
      expect(screen.getByText("Загрузка тренировки...")).toBeInTheDocument();
    });
  });

  it("должен отображать видео и упражнения после загрузки", async () => {
    render(<WorkoutPage />);
    await waitFor(() => {
      expect(screen.getByText("Йога")).toBeInTheDocument();
      expect(screen.getByText("Урок 1. Введение")).toBeInTheDocument();
    });
    const iframe = screen.getByTitle("Урок 1. Введение") as HTMLIFrameElement;
    expect(iframe.src).toContain("youtube.com/embed/test");
  });

  it("должен показывать ошибку при неудачной загрузке", async () => {
    (getErrorMessage as MockedFunction<typeof getErrorMessage>).mockReturnValue(
      "Тренировка не найдена",
    );

    mockGetWorkoutById.mockRejectedValue(new Error("Not found"));

    render(<WorkoutPage />);

    await waitFor(() => {
      expect(screen.getByText("Тренировка не найдена")).toBeInTheDocument();
    });
  });

  it("должен открывать модалку прогресса при клике на кнопку", async () => {
    render(<WorkoutPage />);
    await waitFor(() => screen.getByText("Обновить свой прогресс"));

    fireEvent.click(screen.getByRole("button", { name: /обновить свой прогресс/i }));

    await waitFor(() => {
      expect(screen.getByText("Мой прогресс")).toBeInTheDocument();
    });
  });

  it("должен сохранять прогресс через модалку", async () => {
    mockSaveWorkoutProgress.mockResolvedValue({ message: "OK" });

    render(<WorkoutPage />);
    await waitFor(() => screen.getByText("Обновить свой прогресс"));

    fireEvent.click(screen.getByRole("button", { name: /обновить свой прогресс/i }));
    await waitFor(() => screen.getByText("Мой прогресс"));

    const inputs = screen.getAllByRole("spinbutton");
    await userEvent.clear(inputs[0]);
    await userEvent.type(inputs[0], "8");
    await userEvent.clear(inputs[1]);
    await userEvent.type(inputs[1], "12");

    fireEvent.click(screen.getByRole("button", { name: "Сохранить" }));

    await waitFor(() => {
      expect(mockSaveWorkoutProgress).toHaveBeenCalledWith("yoga_001", "w1", [8, 12]);
    });
  });

  it("должен возвращать в профиль при клике на 'Назад'", async () => {
    const mockNavigate = vi.fn();
    mockUseNavigate.mockReturnValue(mockNavigate);

    render(<WorkoutPage />);
    await waitFor(() => screen.getByText("← Назад к курсам"));

    fireEvent.click(screen.getByText("← Назад к курсам"));
    expect(mockNavigate).toHaveBeenCalledWith("/profile");
  });
});
