import { vi, describe, it, expect, beforeEach, MockedFunction } from "vitest";
import { render, screen, fireEvent, waitFor, act } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { BrowserRouter } from "react-router-dom";
import { CardsGrid } from "../CardsGrid";
import * as courseService from "@/api/courseService";
import { createAuthMock, createMockUser } from "@/test/mocks";
import * as authContext from "@/context/AuthContext";

vi.mock("react-toastify", () => ({
  toast: { success: vi.fn(), info: vi.fn(), error: vi.fn() },
}));

vi.mock("@/api/courseService");

vi.mock("@/context/AuthContext", async () => {
  const actual = await vi.importActual("@/context/AuthContext");
  return { ...actual, useAuth: vi.fn() };
});

const mockNavigate = vi.fn();
vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    useParams: vi.fn(() => ({})),
    useLocation: vi.fn(() => ({ pathname: "/" })),
  };
});

import { toast } from "react-toastify";

const mockUseAuth = authContext.useAuth as MockedFunction<typeof authContext.useAuth>;
const mockGetAllCourses = vi.mocked(courseService.getAllCourses);
const mockAddCourseToUser = vi.mocked(courseService.addCourseToUser);
const mockRemoveUserCourse = vi.mocked(courseService.removeUserCourse);
const mockToast = toast as unknown as {
  success: MockedFunction<typeof toast.success>;
  info: MockedFunction<typeof toast.info>;
  error: MockedFunction<typeof toast.error>;
};

describe("CardsGrid", () => {
  const mockCourses = [
    {
      _id: "yoga_001",
      nameRU: "Йога",
      nameEN: "Yoga",
      description: "",
      directions: [],
      fitting: [],
      workouts: [],
      difficulty: "легкий" as const,
      durationInDays: 20,
      dailyDurationInMinutes: { from: 20, to: 40 },
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    mockGetAllCourses.mockResolvedValue(mockCourses);
    mockUseAuth.mockReturnValue(createAuthMock({ user: null }));
  });

  it("должен отображать загрузку при первом рендере", () => {
    render(
      <BrowserRouter>
        <CardsGrid />
      </BrowserRouter>,
    );
    expect(screen.getByText("Загрузка курсов...")).toBeInTheDocument();
  });

  it("должен отображать курсы после загрузки", async () => {
    await act(async () => {
      render(
        <BrowserRouter>
          <CardsGrid />
        </BrowserRouter>,
      );
    });
    await screen.findByText("Йога");
    expect(screen.getByText("Йога")).toBeInTheDocument();
  });

  it("должен показывать ошибку при неудачной загрузке", async () => {
    mockGetAllCourses.mockRejectedValue(new Error("Network error"));

    await act(async () => {
      render(
        <BrowserRouter>
          <CardsGrid />
        </BrowserRouter>,
      );
    });

    await waitFor(() => {
      expect(screen.getByText("Не удалось загрузить курсы")).toBeInTheDocument();
    });
  });

  it("должен переходить на страницу курса при клике на карточку", async () => {
    await act(async () => {
      render(
        <BrowserRouter>
          <CardsGrid />
        </BrowserRouter>,
      );
    });
    await screen.findByText("Йога");

    const yogaCard = screen.getByText("Йога").closest('[class*="cardWrapper"]');
    await act(async () => {
      fireEvent.click(yogaCard!);
    });

    expect(mockNavigate).toHaveBeenCalledWith("/courses/yoga_001");
  });

  it("должен перенаправлять на логин при попытке добавить курс без авторизации", async () => {
    await act(async () => {
      render(
        <BrowserRouter>
          <CardsGrid />
        </BrowserRouter>,
      );
    });
    await screen.findByText("Йога");

    const addButton = screen.getByLabelText(/добавить курс|плюс|\+/i);
    await act(async () => {
      fireEvent.click(addButton);
    });

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith("/login", expect.any(Object));
    });
  });

  it("должен добавлять курс при клике на кнопку '+'", async () => {
    mockUseAuth.mockReturnValue(
      createAuthMock({
        user: createMockUser({ selectedCourses: [] }),
        addCourseLocally: vi.fn(),
      }),
    );
    mockAddCourseToUser.mockResolvedValue({ message: "OK" });

    await act(async () => {
      render(
        <BrowserRouter>
          <CardsGrid />
        </BrowserRouter>,
      );
    });
    await screen.findByText("Йога");

    const addButton = screen.getByLabelText(/добавить курс|плюс|\+/i);
    await act(async () => {
      await userEvent.click(addButton);
    });

    await waitFor(() => {
      expect(mockAddCourseToUser).toHaveBeenCalledWith("yoga_001");
    });
    expect(mockToast.success).toHaveBeenCalled();
  });

  it("должен удалять курс при клике на кнопку '✓'", async () => {
    mockUseAuth.mockReturnValue(
      createAuthMock({
        user: createMockUser({ selectedCourses: ["yoga_001"] }),
        removeCourseLocally: vi.fn(),
      }),
    );
    mockRemoveUserCourse.mockResolvedValue({ message: "OK" });

    await act(async () => {
      render(
        <BrowserRouter>
          <CardsGrid />
        </BrowserRouter>,
      );
    });
    await screen.findByText("Йога");

    const removeButton = screen.getByLabelText(/удалить курс|галочка|✓/i);
    await act(async () => {
      await userEvent.click(removeButton);
    });

    await waitFor(() => {
      expect(mockRemoveUserCourse).toHaveBeenCalledWith("yoga_001");
    });
    expect(mockToast.info).toHaveBeenCalled();
  });
});
