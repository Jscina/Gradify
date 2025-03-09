export interface Student {
  id: number;
  first_name: string;
  last_name: string;
  email?: string;
}

export interface Grade {
  student_id: number;
  assignment_id: number;
  score: number;
}

export interface Class {
  id: number;
  class_name: string;
  description?: string;
}

export interface Assignment {
  id: number;
  class_id: number;
  assignment_name: string;
  assignment_type: string;
  maximum_score: number;
  // Represent due_date as a string in ISO8601 format, or undefined if not set.
  due_date?: string;
}

export interface StudentClass {
  student_id: number;
  class_id: number;
}

export interface OverallGrade {
  student_id: number;
  class_id: number;
  percentage: number;
  letter_grade: string;
}
