import { invoke } from "@tauri-apps/api/core";
import type { Class } from "./types";

export async function createClass(
  class_name: string,
  description?: string,
): Promise<Class> {
  return await invoke<Class>("create_class", { class_name, description });
}

export async function getClass(id: number): Promise<Class> {
  return await invoke<Class>("get_class", { id });
}

export async function getAllClasses(): Promise<Class[]> {
  return await invoke<Class[]>("get_all_classes");
}

export async function updateClass(
  id: number,
  class_name: string,
  description?: string,
): Promise<Class> {
  return await invoke<Class>("update_class", { id, class_name, description });
}

export async function deleteClass(id: number): Promise<void> {
  return await invoke("delete_class", { id });
}
