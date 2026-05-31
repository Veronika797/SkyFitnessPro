import { vi, describe, it, expect, beforeEach } from "vitest";
import { render, screen } from "@/test/test-utils";
import { CourseDescription } from "../CourseDescription";
import * as courseService from "@/api/courseService";

vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useParams: vi.fn(() => ({ id: "yoga_001" })),
    useNavigate: vi.fn(),
  };
});

vi.mock("@/api/courseService");

describe("CourseDescription", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    vi.mocked(courseService.getCourseById).mockResolvedValue({
      _id: "yoga_001",
      nameRU: "Йога",
      nameEN: "Yoga",
      description: "Описание",
      directions: ["Хатха", "Виньяса"],
      fitting: ["Для начинающих", "Для дома"],
      workouts: [],
      difficulty: "легкий",
      durationInDays: 20,
      dailyDurationInMinutes: { from: 20, to: 40 },
    });
  });

  it("должен отображать заголовок курса", async () => {
    render(<CourseDescription />, {
      initialAuth: { user: null },
    });

    const title = await screen.findByText("Йога", {}, { timeout: 2000 });
    expect(title).toBeInTheDocument();
  });

  it("должен показать кнопку 'Войдите' для гостя", async () => {
    render(<CourseDescription />, {
      initialAuth: { user: null },
    });

    const heading = await screen.findByText(
      (content) => content.includes("Начните путь"),
      {},
      { timeout: 2000 },
    );
    expect(heading).toBeInTheDocument();

    const benefit = await screen.findByText("проработка всех групп мышц", {}, { timeout: 2000 });
    expect(benefit).toBeInTheDocument();

    const button = await screen.findByText("Войдите, чтобы добавить курс", {}, { timeout: 2000 });
    expect(button).toBeInTheDocument();
  });

  it("должен загружать и отображать курс", async () => {
    render(<CourseDescription />, {
      initialAuth: { user: null },
    });

    await screen.findByText("Подойдет для вас, если:", {}, { timeout: 2000 });
    await screen.findByText("Направления", {}, { timeout: 2000 });

    await screen.findByText("Войдите, чтобы добавить курс", {}, { timeout: 2000 });
  });

  it("должен показать 'Добавить курс' для авторизованного пользователя", async () => {
    render(<CourseDescription />, {
      initialAuth: {
        user: { email: "test@example.com", selectedCourses: [] },
      },
    });

    const button = await screen.findByText("Добавить курс", {}, { timeout: 2000 });
    expect(button).toBeInTheDocument();
  });
});
