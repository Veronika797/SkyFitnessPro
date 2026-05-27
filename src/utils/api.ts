const BASE_URL = "http://localhost:3006/api/fitness";

export const getCourseById = async (id: string): Promise<any> => {
  try {
    const response = await fetch(`${BASE_URL}/courses/${id}`);

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.message || "Ошибка загрузки курса");
    }

    return response.json();
  } catch (err: any) {
    console.error("API Error:", err);
    throw new Error(err.message || "Не удалось подключиться к серверу");
  }
};

export const addCourseToUser = async (courseId: string): Promise<void> => {
  const token = localStorage.getItem("token");

  const response = await fetch(`${BASE_URL}/users/me/courses`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ courseId }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Не удалось добавить курс");
  }
};
