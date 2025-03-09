import { invoke } from "@tauri-apps/api/core";
import type { Grade } from "./types";

export async function createGrade(
  student_id: number,
  assignment_id: number,
  score: number,
): Promise<Grade> {
  return await invoke<Grade>("create_grade", {
    student_id,
    assignment_id,
    score,
  });
}

export async function getGrade(
  student_id: number,
  assignment_id: number,
): Promise<Grade> {
  return await invoke<Grade>("get_grade", { student_id, assignment_id });
}

export async function getAllGrades(): Promise<Grade[]> {
  return await invoke<Grade[]>("get_all_grades");
}

export async function updateGrade(
  student_id: number,
  assignment_id: number,
  score: number,
): Promise<Grade> {
  return await invoke<Grade>("update_grade", {
    student_id,
    assignment_id,
    score,
  });
}

export async function deleteGrade(
  student_id: number,
  assignment_id: number,
): Promise<void> {
  return await invoke("delete_grade", { student_id, assignment_id });
}
