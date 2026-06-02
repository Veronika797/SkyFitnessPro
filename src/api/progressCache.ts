import { CourseProgress } from "@/types";

interface ProgressCache {
  [courseId: string]: {
    data: CourseProgress;
    timestamp: number;
  };
}

class ProgressCacheManager {
  private cache: ProgressCache = {};
  private readonly TTL = 5 * 60 * 1000;

  get(courseId: string) {
    const item = this.cache[courseId];
    if (!item) return null;

    if (Date.now() - item.timestamp > this.TTL) {
      delete this.cache[courseId];
      return null;
    }

    return item.data;
  }

  set(courseId: string, data: CourseProgress) {
    this.cache[courseId] = {
      data,
      timestamp: Date.now(),
    };
  }

  clear() {
    this.cache = {};
  }

  clearCourse(courseId: string) {
    delete this.cache[courseId];
  }
}

export const progressCache = new ProgressCacheManager();
