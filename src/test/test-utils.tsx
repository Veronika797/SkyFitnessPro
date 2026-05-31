import React, { ReactElement } from "react";
import { render, RenderOptions } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import { vi } from "vitest";
import { AuthContext, AuthContextType } from "@/context/AuthContext";

interface TestProviderProps {
  children: React.ReactNode;
  initialAuth?: Partial<AuthContextType>;
}

function TestProviders({ children, initialAuth = {} }: TestProviderProps) {
  return (
    <BrowserRouter>
      <AuthContextMock value={initialAuth}>{children}</AuthContextMock>
    </BrowserRouter>
  );
}

const AuthContextMock = ({
  value,
  children,
}: {
  value: Partial<AuthContextType>;
  children: React.ReactNode;
}) => {
  const defaultValue: AuthContextType = {
    user: null,
    isLoading: false,
    error: null,
    clearError: vi.fn(),
    login: vi.fn().mockResolvedValue(undefined),
    register: vi.fn().mockResolvedValue(undefined),
    logout: vi.fn(),
    fetchUser: vi.fn().mockResolvedValue(undefined),
    addCourseLocally: vi.fn(),
    removeCourseLocally: vi.fn(),
    isLoginOpen: false,
    isRegisterOpen: false,
    openLoginModal: vi.fn(),
    openRegisterModal: vi.fn(),
    closeModals: vi.fn(),
    returnTo: null,
    setReturnUrl: vi.fn(),
    ...value,
  };

  return <AuthContext.Provider value={defaultValue}>{children}</AuthContext.Provider>;
};

function customRender(
  ui: ReactElement,
  options?: Omit<RenderOptions, "wrapper"> & { initialAuth?: Partial<AuthContextType> },
) {
  return render(ui, {
    wrapper: (props) => <TestProviders {...props} initialAuth={options?.initialAuth} />,
    ...options,
  });
}

export * from "@testing-library/react";
export { customRender as render };
