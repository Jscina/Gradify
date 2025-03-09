import { invoke } from "@tauri-apps/api/core";
import type { Student } from "./types";

export async function createStudent(
  first_name: string,
  last_name: string,
  email?: string,
): Promise<Student> {
  return await invoke<Student>("create_student", {
    first_name,
    last_name,
    email,
  });
}

export async function getStudent(id: number): Promise<Student> {
  return await invoke<Student>("get_student", { id });
}

export async function getAllStudents(): Promise<Student[]> {
  return await invoke<Student[]>("get_all_students");
}

export async function updateStudent(
  id: number,
  first_name: string,
  last_name: string,
  email?: string,
): Promise<Student> {
  return await invoke<Student>("update_student", {
    id,
    first_name,
    last_name,
    email,
  });
}

export async function deleteStudent(id: number): Promise<void> {
  return await invoke("delete_student", { id });
}
