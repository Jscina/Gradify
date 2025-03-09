import { invoke } from "@tauri-apps/api/core";
import type { Assignment } from "./types";

export async function createAssignment(
  class_id: number,
  assignment_name: string,
  assignment_type: string,
  maximum_score: number,
  due_date?: string,
): Promise<Assignment> {
  return await invoke<Assignment>("create_assignment", {
    class_id,
    assignment_name,
    assignment_type,
    maximum_score,
    due_date,
  });
}

export async function getAssignment(id: number): Promise<Assignment> {
  return await invoke<Assignment>("get_assignment", { id });
}

export async function getAllAssignments(): Promise<Assignment[]> {
  return await invoke<Assignment[]>("get_all_assignments");
}

export async function updateAssignment(
  id: number,
  class_id: number,
  assignment_name: string,
  assignment_type: string,
  maximum_score: number,
  due_date?: string,
): Promise<Assignment> {
  return await invoke<Assignment>("update_assignment", {
    id,
    class_id,
    assignment_name,
    assignment_type,
    maximum_score,
    due_date,
  });
}

export async function deleteAssignment(id: number): Promise<void> {
  return await invoke("delete_assignment", { id });
}
