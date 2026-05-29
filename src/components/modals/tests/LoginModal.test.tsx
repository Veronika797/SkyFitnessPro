import { render, screen, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { LoginModal } from "../LoginModal";
import { vi } from "vitest";

const mockLogin = vi.fn();
const mockClose = vi.fn();
const mockOpenRegister = vi.fn();

vi.mock("@/context/AuthContext", () => ({
  useAuth: () => ({
    login: mockLogin,
    error: null,
    openRegisterModal: mockOpenRegister,
    setReturnUrl: vi.fn(),
  }),
}));

vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useNavigate: () => vi.fn(),
    useLocation: () => ({ state: { from: { pathname: "/" } } }),
  };
});

describe("LoginModal", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("должен отображать поля ввода и кнопку", () => {
    render(<LoginModal onClose={mockClose} />);

    expect(screen.getByPlaceholderText("Логин")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Пароль")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Войти" })).toBeInTheDocument();
  });

  it("кнопка должна быть отключена, если поля пустые", () => {
    render(<LoginModal onClose={mockClose} />);

    const submitButton = screen.getByRole("button", { name: "Войти" });

    expect(submitButton).toBeDisabled();

    fireEvent.click(submitButton);
    expect(mockLogin).not.toHaveBeenCalled();
  });

  it("должен показывать ошибку при попытке сабмита пустой формы", () => {
    render(<LoginModal onClose={mockClose} />);

    const form = screen.getByRole("form", { name: "Форма входа" });
    fireEvent.submit(form);

    expect(mockLogin).not.toHaveBeenCalled();
    expect(screen.getByText("Заполните все поля")).toBeInTheDocument();
  });

  it("должен вызывать login с верными данными", async () => {
    render(<LoginModal onClose={mockClose} />);

    const emailInput = screen.getByPlaceholderText("Логин");
    const passwordInput = screen.getByPlaceholderText("Пароль");
    const submitButton = screen.getByRole("button", { name: "Войти" });

    const user = userEvent.setup();
    await user.type(emailInput, "test@example.com");
    await user.type(passwordInput, "SecurePassword123!");

    expect(submitButton).not.toBeDisabled();

    await user.click(submitButton);

    expect(mockLogin).toHaveBeenCalledWith("test@example.com", "SecurePassword123!");
  });
});
