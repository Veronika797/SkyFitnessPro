export const getErrorMessage = (error: unknown): string => {
  if (!error) return "Неизвестная ошибка";

  if (typeof error === "object" && error !== null && "response" in error) {
    const axiosError = error as {
      response?: { status?: number; data?: { message?: string } };
    };

    if (axiosError.response?.status === 401) {
      return "Сессия истекла. Пожалуйста, войдите снова.";
    }

    return axiosError.response?.data?.message || "Ошибка сервера";
  }

  if (error instanceof Error) {
    return error.message;
  }

  return String(error);
};

export const isUnauthorizedError = (error: unknown): boolean => {
  return (
    typeof error === "object" &&
    error !== null &&
    "response" in error &&
    (error as { response?: { status?: number } }).response?.status === 401
  );
};
