import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(dateString?: string) {
  if (!dateString) return "N/A";
  return new Date(dateString).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function calculateLetterGrade(percentage: number): string {
  if (percentage >= 97) return "A+";
  if (percentage >= 93) return "A";
  if (percentage >= 90) return "A-";
  if (percentage >= 87) return "B+";
  if (percentage >= 83) return "B";
  if (percentage >= 80) return "B-";
  if (percentage >= 77) return "C+";
  if (percentage >= 73) return "C";
  if (percentage >= 70) return "C-";
  if (percentage >= 67) return "D+";
  if (percentage >= 63) return "D";
  if (percentage >= 60) return "D-";
  return "F";
}

export function getLetterGradeColor(letterGrade: string): string {
  switch (letterGrade) {
    case "A+":
    case "A":
      return "bg-green-100 text-green-800";
    case "A-":
    case "B+":
    case "B":
      return "bg-blue-100 text-blue-800";
    case "B-":
    case "C+":
    case "C":
      return "bg-yellow-100 text-yellow-800";
    case "C-":
    case "D+":
    case "D":
      return "bg-orange-100 text-orange-800";
    case "D-":
    case "F":
      return "bg-red-100 text-red-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
}

export function sortByProperty<T>(
  array: T[],
  property: keyof T,
  ascending: boolean = true,
): T[] {
  return [...array].sort((a, b) => {
    if (a[property] < b[property]) return ascending ? -1 : 1;
    if (a[property] > b[property]) return ascending ? 1 : -1;
    return 0;
  });
}

export function filterByText<T>(
  array: T[],
  searchText: string,
  fields: (keyof T)[],
): T[] {
  if (!searchText) return array;

  const searchLower = searchText.toLowerCase();
  return array.filter((item) =>
    fields.some((field) => {
      const value = item[field];
      if (typeof value === "string") {
        return value.toLowerCase().includes(searchLower);
      }
      return false;
    }),
  );
}

export function safeParseInt(value: string | undefined): number | null {
  if (!value) return null;
  const parsed = parseInt(value);
  return isNaN(parsed) ? null : parsed;
}

export function getInitials(firstName: string, lastName: string): string {
  return (firstName.charAt(0) + lastName.charAt(0)).toUpperCase();
}
