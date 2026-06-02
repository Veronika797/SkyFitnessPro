import { vi, describe, it, expect, beforeEach, MockedFunction } from "vitest";
import { render, screen, waitFor, act } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { RegisterModal } from "../RegisterModal";
import { createAuthMock } from "@/test/mocks";

vi.mock("@/context/AuthContext", async () => {
  const actual = await vi.importActual("@/context/AuthContext");
  return { ...actual, useAuth: vi.fn() };
});

vi.mock("@/utils/validatePassword", () => ({
  validatePassword: vi.fn(() => ({ isValid: true, errors: [] })),
}));

vi.mock("@/utils/errorUtils", () => ({
  getErrorMessage: vi.fn((err: unknown) => {
    if (err instanceof Error) {
      if (err.message.includes("Duplicate")) return "Пользователь с таким email уже существует";
      return err.message;
    }
    return "Произошла ошибка";
  }),
}));

import * as authContextImported from "@/context/AuthContext";
import * as validatePasswordModule from "@/utils/validatePassword";

const mockUseAuth = authContextImported.useAuth as MockedFunction<
  () => ReturnType<typeof authContextImported.useAuth>
>;

describe("RegisterModal", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    vi.mocked(validatePasswordModule.validatePassword).mockReturnValue({
      isValid: true,
      errors: [],
    });
  });

  it("должен показывать ошибку от бэкенда", async () => {
    const mockRegister = vi.fn().mockRejectedValue(new Error("Duplicate email"));

    mockUseAuth.mockReturnValue(
      createAuthMock({
        user: null,
        register: mockRegister,
        openLoginModal: vi.fn(),
      }),
    );

    await act(async () => {
      render(<RegisterModal onClose={vi.fn()} />);
    });

    const user = userEvent.setup();
    await user.type(screen.getByPlaceholderText("Эл. почта"), "test@example.com");
    await user.type(screen.getByPlaceholderText("Пароль"), "Secure@123");
    await user.type(screen.getByPlaceholderText("Повторите пароль"), "Secure@123");

    await act(async () => {
      await user.click(screen.getByRole("button", { name: "Зарегистрироваться" }));
    });

    await waitFor(() => {
      expect(screen.getByText("Duplicate email")).toBeInTheDocument();
    });
  });

  it("должен отображать поля ввода и кнопку", () => {
    render(<RegisterModal onClose={vi.fn()} />);
    expect(screen.getByPlaceholderText("Эл. почта")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Пароль")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Зарегистрироваться" })).toBeInTheDocument();
  });

  it("кнопка должна быть отключена, если поля пустые", () => {
    render(<RegisterModal onClose={vi.fn()} />);
    expect(screen.getByRole("button", { name: "Зарегистрироваться" })).toBeDisabled();
  });

  it("должен показывать ошибку, если пароли не совпадают", async () => {
    render(<RegisterModal onClose={vi.fn()} />);
    const user = userEvent.setup();

    await user.type(screen.getByPlaceholderText("Эл. почта"), "test@example.com");
    await user.type(screen.getByPlaceholderText("Пароль"), "Secure@123");
    await user.type(screen.getByPlaceholderText("Повторите пароль"), "Different@123");

    await user.click(screen.getByRole("button", { name: "Зарегистрироваться" }));

    await waitFor(() => {
      expect(screen.queryByText(/пароли не совпадают|пароль/i)).toBeInTheDocument();
    });
  });

  it("должен показывать ошибку валидации пароля", async () => {
    const { validatePassword } = await import("@/utils/validatePassword");
    (validatePassword as MockedFunction<typeof validatePassword>).mockReturnValue({
      isValid: false,
      errors: ["Пароль должен содержать не менее 6 символов"],
    });

    render(<RegisterModal onClose={vi.fn()} />);
    const user = userEvent.setup();

    await user.type(screen.getByPlaceholderText("Эл. почта"), "test@example.com");
    await user.type(screen.getByPlaceholderText("Пароль"), "short");
    await user.type(screen.getByPlaceholderText("Повторите пароль"), "short");

    await user.click(screen.getByRole("button", { name: "Зарегистрироваться" }));

    await waitFor(() => {
      expect(
        screen.queryByText(/не менее 6 символов|пароль|ошибка валидации/i),
      ).toBeInTheDocument();
    });
  });

  it("должен вызывать register с верными данными", async () => {
    const mockRegister = vi.fn().mockResolvedValue(undefined);
    const mockClose = vi.fn();

    mockUseAuth.mockReturnValue(
      createAuthMock({
        user: null,
        register: mockRegister,
        openLoginModal: vi.fn(),
      }),
    );

    render(<RegisterModal onClose={mockClose} />);
    const user = userEvent.setup();

    await user.type(screen.getByPlaceholderText("Эл. почта"), "test@example.com");
    await user.type(screen.getByPlaceholderText("Пароль"), "Secure@123");
    await user.type(screen.getByPlaceholderText("Повторите пароль"), "Secure@123");

    await user.click(screen.getByRole("button", { name: "Зарегистрироваться" }));

    await waitFor(() => {
      expect(mockRegister).toHaveBeenCalledWith("test@example.com", "Secure@123");
    });
    expect(mockClose).toHaveBeenCalled();
  });

  it("должен переключать на модалку входа при клике на 'Войти'", async () => {
    const mockOpenLogin = vi.fn();
    mockUseAuth.mockReturnValue(
      createAuthMock({
        user: null,
        register: vi.fn(),
        openLoginModal: mockOpenLogin,
      }),
    );

    render(<RegisterModal onClose={vi.fn()} />);
    await userEvent.click(screen.getByRole("button", { name: "Войти" }));

    await waitFor(() => {
      expect(mockOpenLogin).toHaveBeenCalled();
    });
  });
});
