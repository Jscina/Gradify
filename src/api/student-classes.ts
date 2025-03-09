import { invoke } from "@tauri-apps/api/core";
import type { StudentClass } from "./types";

export async function enrollStudent(
  student_id: number,
  class_id: number,
): Promise<StudentClass> {
  return await invoke<StudentClass>("enroll_student", { student_id, class_id });
}

export async function getEnrollments(): Promise<StudentClass[]> {
  return await invoke<StudentClass[]>("get_enrollments");
}

export async function unenrollStudent(
  student_id: number,
  class_id: number,
): Promise<void> {
  return await invoke("unenroll_student", { student_id, class_id });
}
