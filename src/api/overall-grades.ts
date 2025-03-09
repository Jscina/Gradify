import { invoke } from "@tauri-apps/api/core";
import type { OverallGrade } from "./types";

export async function getOverallGrades(): Promise<OverallGrade[]> {
  return await invoke<OverallGrade[]>("get_overall_grades");
}
