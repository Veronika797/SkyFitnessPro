import { vi, describe, it, expect, beforeEach, MockedFunction } from "vitest";
import { render, screen, fireEvent, waitFor, act } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { LoginModal } from "../LoginModal";
import { createAuthMock } from "@/test/mocks";

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
    useLocation: vi.fn(() => ({ state: { from: { pathname: "/" } } })),
  };
});

vi.mock("@/utils/errorUtils", () => ({
  getErrorMessage: vi.fn((err: unknown) =>
    err instanceof Error ? err.message : "Произошла ошибка",
  ),
}));

import * as authContextImported from "@/context/AuthContext";
const mockUseAuth = authContextImported.useAuth as MockedFunction<
  () => ReturnType<typeof authContextImported.useAuth>
>;

describe("LoginModal", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("должен вызывать login с верными данными", async () => {
    const mockLogin = vi.fn().mockResolvedValue(undefined);
    const mockClose = vi.fn();

    mockUseAuth.mockReturnValue(
      createAuthMock({
        user: null,
        login: mockLogin,
        openRegisterModal: vi.fn(),
      }),
    );

    await act(async () => {
      render(<LoginModal onClose={mockClose} />);
    });

    const user = userEvent.setup();
    await user.type(screen.getByPlaceholderText("Логин"), "test@example.com");
    await user.type(screen.getByPlaceholderText("Пароль"), "SecurePassword123!");

    await act(async () => {
      await user.click(screen.getByRole("button", { name: "Войти" }));
    });

    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith("test@example.com", "SecurePassword123!");
    });

    expect(mockNavigate).toHaveBeenCalledWith("/");
  });

  it("должен отображать поля ввода и кнопку", () => {
    render(<LoginModal onClose={vi.fn()} />);
    expect(screen.getByPlaceholderText("Логин")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Пароль")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Войти" })).toBeInTheDocument();
  });

  it("кнопка должна быть отключена, если поля пустые", () => {
    render(<LoginModal onClose={vi.fn()} />);
    expect(screen.getByRole("button", { name: "Войти" })).toBeDisabled();
  });

  it("должен показывать ошибку при попытке сабмита пустой формы", async () => {
    render(<LoginModal onClose={vi.fn()} />);
    fireEvent.submit(screen.getByRole("form"));
    await waitFor(() => {
      expect(screen.getByText("Заполните все поля")).toBeInTheDocument();
    });
  });

  it("должен показывать ошибку от бэкенда", async () => {
    const mockLogin = vi.fn().mockRejectedValue(new Error("Invalid password"));

    mockUseAuth.mockReturnValue(
      createAuthMock({
        user: null,
        login: mockLogin,
        openRegisterModal: vi.fn(),
      }),
    );

    render(<LoginModal onClose={vi.fn()} />);

    const user = userEvent.setup();
    await user.type(screen.getByPlaceholderText("Логин"), "test@example.com");
    await user.type(screen.getByPlaceholderText("Пароль"), "wrong");

    await user.click(screen.getByRole("button", { name: "Войти" }));

    await waitFor(() => {
      expect(screen.queryByText(/неверный пароль|ошибка|произошла ошибка/i)).toBeInTheDocument();
    });
  });

  it("должен переключать на модалку регистрации при клике на 'Зарегистрироваться'", async () => {
    const mockOpenRegister = vi.fn();
    mockUseAuth.mockReturnValue(
      createAuthMock({
        user: null,
        login: vi.fn(),
        openRegisterModal: mockOpenRegister,
      }),
    );

    render(<LoginModal onClose={vi.fn()} />);
    await userEvent.click(screen.getByRole("button", { name: "Зарегистрироваться" }));

    await waitFor(() => {
      expect(mockOpenRegister).toHaveBeenCalled();
    });
  });
});
