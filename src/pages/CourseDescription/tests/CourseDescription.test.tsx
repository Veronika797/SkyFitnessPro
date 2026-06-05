import { vi, describe, it, expect, beforeEach } from "vitest";
import { render, screen } from "@/test/test-utils";
import { CourseDescription } from "../CourseDescription";
import * as courseService from "@/api/courseService";
import { createMockCourse, createMockUser } from "@/test/mocks";

vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useParams: vi.fn(() => ({ id: "6i67sm" })),
    useNavigate: vi.fn(),
  };
});

vi.mock("@/api/courseService");

describe("CourseDescription", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    vi.mocked(courseService.getCourseById).mockResolvedValue(
      createMockCourse({
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
      }),
    );

    vi.mocked(courseService.getCourseProgress).mockResolvedValue({
      courseId: "6i67sm",
      courseCompleted: false,
      workoutsProgress: [],
    });
  });

  it("должен отображать название курса в направлениях", async () => {
    render(<CourseDescription />, {
      initialAuth: { user: null },
    });

    const direction = await screen.findByText("Хатха", {}, { timeout: 5000 });
    expect(direction).toBeInTheDocument();
  });

  it("должен показать кнопку 'Войдите' для гостя", async () => {
    render(<CourseDescription />, {
      initialAuth: { user: null },
    });

    const heading = await screen.findByText(
      (content) => content.includes("Начните путь"),
      {},
      { timeout: 5000 },
    );

    expect(heading).toBeInTheDocument();

    const benefit = await screen.findByText("проработка всех групп мышц", {}, { timeout: 5000 });
    expect(benefit).toBeInTheDocument();

    const button = await screen.findByText("Войдите, чтобы добавить курс", {}, { timeout: 5000 });
    expect(button).toBeInTheDocument();
  });

  it("должен загружать и отображать курс", async () => {
    render(<CourseDescription />, {
      initialAuth: { user: null },
    });

    await screen.findByText("Подойдет для вас, если:", {}, { timeout: 5000 });
    await screen.findByText("Направления", {}, { timeout: 5000 });

    await screen.findByText("Войдите, чтобы добавить курс", {}, { timeout: 5000 });
  });

  it("должен показать 'Добавить курс' для авторизованного пользователя", async () => {
    const mockUser = createMockUser({
      email: "test@example.com",
      selectedCourses: [],
    });

    render(<CourseDescription />, {
      initialAuth: { user: mockUser },
    });

    const button = await screen.findByText("Добавить курс", {}, { timeout: 5000 });
    expect(button).toBeInTheDocument();
  });

  it("должен показать 'Курс добавлен ✓' если курс уже в профиле", async () => {
    const mockUser = createMockUser({
      email: "test@example.com",
      selectedCourses: ["6i67sm"],
    });

    render(<CourseDescription />, {
      initialAuth: { user: mockUser },
    });

    const button = await screen.findByText("Курс добавлен ✓", {}, { timeout: 5000 });
    expect(button).toBeInTheDocument();
  });
});
