import { render, screen, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { RegisterModal } from "../RegisterModal";
import { vi } from "vitest";

const mockRegister = vi.fn();
const mockClose = vi.fn();
const mockOpenLogin = vi.fn();

vi.mock("@/context/AuthContext", () => ({
  useAuth: () => ({
    register: mockRegister,
    error: null,
    openLoginModal: mockOpenLogin,
  }),
}));

vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useNavigate: () => vi.fn(),
  };
});

vi.mock("@/utils/validatePassword", () => ({
  validatePassword: (pwd: string) => {
    const hasMinLength = pwd.length >= 6;
    const hasUppercase = /[A-Z]/.test(pwd);
    const specialChars = (pwd.match(/[^a-zA-Z0-9]/g) || []).length;
    const hasMinSpecial = specialChars >= 2;

    return {
      isValid: hasMinLength && hasUppercase && hasMinSpecial,
      errors: [],
    };
  },
}));

describe("RegisterModal", () => {
  beforeEach(() => vi.clearAllMocks());

  it("должен показывать ошибку, если пароли не совпадают", async () => {
    render(<RegisterModal onClose={mockClose} />);

    const user = userEvent.setup();
    await user.type(screen.getByPlaceholderText("Эл. почта"), "test@example.com");
    await user.type(screen.getByPlaceholderText("Пароль"), "Secure@123");
    await user.type(screen.getByPlaceholderText("Повторите пароль"), "Different@123");

    fireEvent.click(screen.getByRole("button", { name: "Зарегистрироваться" }));

    expect(screen.getByText("Пароли не совпадают", { exact: false })).toBeInTheDocument();
    expect(screen.getByTestId("error-message")).toHaveTextContent("Пароли не совпадают");
  });
});
