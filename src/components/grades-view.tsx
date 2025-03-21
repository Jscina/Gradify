import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { PlusCircle, Search, Pencil, AlertCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { createGrade, updateGrade, getGrade, getAllGrades } from "@/api/grades";
import {
  enrollStudent,
  unenrollStudent,
  getEnrollments,
} from "@/api/student-classes";
import type {
  OverallGrade,
  Student,
  Class,
  Assignment,
  StudentClass,
  Grade,
} from "@/api/types";

interface GradesViewProps {
  grades: OverallGrade[];
  students: Student[];
  classes: Class[];
  assignments: Assignment[];
  refreshData: () => Promise<void>;
  loading: boolean;
}

export default function GradesView({
  grades,
  students,
  classes,
  assignments,
  refreshData,
  loading,
}: GradesViewProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedClass, setSelectedClass] = useState<number | null>(null);

  const [isGradeDialogOpen, setIsGradeDialogOpen] = useState(false);
  const [isEnrollDialogOpen, setIsEnrollDialogOpen] = useState(false);
  const [isUnenrollDialogOpen, setIsUnenrollDialogOpen] = useState(false);
  const [isEditGradeDialogOpen, setIsEditGradeDialogOpen] = useState(false);

  const [selectedStudent, setSelectedStudent] = useState<number | null>(null);
  const [selectedAssignment, setSelectedAssignment] = useState<number | null>(
    null,
  );
  const [score, setScore] = useState<number>(0);
  const [enrollStudentId, setEnrollStudentId] = useState<number | null>(null);
  const [enrollClassId, setEnrollClassId] = useState<number | null>(null);
  const [editingGrades, setEditingGrades] = useState<Grade[]>([]);
  const [allGrades, setAllGrades] = useState<Grade[]>([]);

  const [studentToUnenroll, setStudentToUnenroll] = useState<{
    id: number;
    name: string;
  } | null>(null);
  const [classToUnenroll, setClassToUnenroll] = useState<{
    id: number;
    name: string;
  } | null>(null);

  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [enrollments, setEnrollments] = useState<StudentClass[]>([]);

  const loadEnrollments = async () => {
    try {
      const allEnrollments = await getEnrollments();
      setEnrollments(allEnrollments);
    } catch (error) {
      console.error("Error loading enrollments:", error);
    }
  };

  const loadAllGrades = async () => {
    try {
      const grades = await getAllGrades();
      setAllGrades(grades);
    } catch (error) {
      console.error("Error loading grades:", error);
    }
  };

  useEffect(() => {
    loadEnrollments();
    loadAllGrades();
  }, []);

  useEffect(() => {
    if (selectedClass) {
      setEnrollClassId(selectedClass);
    }
  }, [selectedClass]);

  const filteredGrades = grades.filter((grade) => {
    const student = students.find((s) => s.id === grade.student_id);
    const classItem = classes.find((c) => c.id === grade.class_id);

    if (!student || !classItem) return false;

    const studentName =
      `${student.first_name} ${student.last_name}`.toLowerCase();
    const className = classItem.class_name.toLowerCase();
    const query = searchQuery.toLowerCase();

    const matchesSearch =
      studentName.includes(query) || className.includes(query);
    const matchesClass = selectedClass
      ? grade.class_id === selectedClass
      : true;

    return matchesSearch && matchesClass;
  });

  const getStudentName = (studentId: number): string => {
    const student = students.find((s) => s.id === studentId);
    return student ? `${student.first_name} ${student.last_name}` : "Unknown";
  };

  const getClassName = (classId: number): string => {
    const classItem = classes.find((c) => c.id === classId);
    return classItem ? classItem.class_name : "Unknown";
  };

  const getAssignmentName = (assignmentId: number): string => {
    const assignment = assignments.find((a) => a.id === assignmentId);
    return assignment ? assignment.assignment_name : "Unknown";
  };

  const getAssignmentMaxScore = (assignmentId: number): number => {
    const assignment = assignments.find((a) => a.id === assignmentId);
    return assignment ? assignment.maximum_score : 0;
  };

  const getLetterGradeColor = (letterGrade: string): string => {
    switch (letterGrade) {
      case "A":
      case "A+":
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
  };

  const getAssignmentsForClass = (classId: number) => {
    return assignments.filter((a) => a.class_id === classId);
  };

  const getStudentGrades = (studentId: number, classId: number) => {
    const classAssignments = getAssignmentsForClass(classId);
    const studentGrades: Grade[] = [];

    for (const assignment of classAssignments) {
      const existingGrade = allGrades.find(
        (g) => g.student_id === studentId && g.assignment_id === assignment.id,
      );

      if (existingGrade) {
        studentGrades.push(existingGrade);
      }
    }

    return studentGrades;
  };

  const getStudentsInClass = (classId: number) => {
    const enrolledStudentIds = enrollments
      .filter((enrollment) => enrollment.class_id === classId)
      .map((enrollment) => enrollment.student_id);

    return students.filter((student) =>
      enrolledStudentIds.includes(student.id),
    );
  };

  const getStudentsNotInClass = (classId: number) => {
    const enrolledStudentIds = enrollments
      .filter((enrollment) => enrollment.class_id === classId)
      .map((enrollment) => enrollment.student_id);

    return students.filter(
      (student) => !enrolledStudentIds.includes(student.id),
    );
  };

  const openGradeDialog = () => {
    setSelectedStudent(null);
    setSelectedAssignment(null);
    setScore(0);
    setError(null);
    setIsGradeDialogOpen(true);
  };

  const openEditGradesDialog = (studentId: number, classId: number) => {
    const studentGrades = getStudentGrades(studentId, classId);
    setEditingGrades(studentGrades);
    setSelectedStudent(studentId);
    setSelectedClass(classId);
    setError(null);
    setIsEditGradeDialogOpen(true);
  };

  const openEnrollDialog = () => {
    if (!selectedClass) {
      return;
    }

    setEnrollStudentId(null);
    setEnrollClassId(selectedClass);
    setError(null);
    setIsEnrollDialogOpen(true);
  };

  const openUnenrollDialog = (studentId: number, classId: number) => {
    const student = students.find((s) => s.id === studentId);
    const classItem = classes.find((c) => c.id === classId);

    if (!student || !classItem) {
      console.error("Student or class not found");
      return;
    }

    setStudentToUnenroll({
      id: studentId,
      name: `${student.first_name} ${student.last_name}`,
    });

    setClassToUnenroll({
      id: classId,
      name: classItem.class_name,
    });

    setError(null);
    setIsUnenrollDialogOpen(true);
  };

  const handleGradeSubmit = async () => {
    if (!selectedStudent || !selectedAssignment) return;

    setIsSubmitting(true);
    setError(null);

    try {
      try {
        await getGrade(selectedStudent, selectedAssignment);
        await updateGrade(selectedStudent, selectedAssignment, score);
      } catch (error) {
        await createGrade(selectedStudent, selectedAssignment, score);
      }

      await refreshData();
      await loadAllGrades();
      setIsGradeDialogOpen(false);
    } catch (error) {
      console.error("Error saving grade:", error);
      setError("Failed to save grade. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGradeChange = (index: number, newScore: number) => {
    const updatedGrades = [...editingGrades];
    updatedGrades[index] = { ...updatedGrades[index], score: newScore };
    setEditingGrades(updatedGrades);
  };

  const handleUpdateGrades = async () => {
    setIsSubmitting(true);
    setError(null);

    try {
      for (const grade of editingGrades) {
        await updateGrade(grade.student_id, grade.assignment_id, grade.score);
      }
      await refreshData();
      await loadAllGrades();
      setIsEditGradeDialogOpen(false);
    } catch (error) {
      console.error("Error updating grades:", error);
      setError("Failed to update grades. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEnrollStudent = async () => {
    if (!enrollStudentId || !enrollClassId) return;

    setIsSubmitting(true);
    setError(null);

    try {
      await enrollStudent(enrollStudentId, enrollClassId);
      await refreshData();
      await loadEnrollments();
      setIsEnrollDialogOpen(false);
    } catch (error) {
      console.error("Error enrolling student:", error);
      setError("Failed to enroll student. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUnenrollStudent = async () => {
    if (!studentToUnenroll || !classToUnenroll) return;

    setIsSubmitting(true);
    setError(null);

    try {
      await unenrollStudent(studentToUnenroll.id, classToUnenroll.id);
      await refreshData();
      await loadEnrollments();
      setIsUnenrollDialogOpen(false);
    } catch (error) {
      console.error("Error unenrolling student:", error);
      setError("Failed to unenroll student. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Grades</h2>
        <div className="flex gap-2">
          <Button onClick={openGradeDialog}>
            <PlusCircle className="mr-2 h-4 w-4" />
            Add Grade
          </Button>
          <Button
            variant="outline"
            onClick={openEnrollDialog}
            disabled={!selectedClass}
          >
            Enroll Student
          </Button>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
          <Input
            type="search"
            placeholder="Search grades..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Select
          value={selectedClass?.toString() || "all"}
          onValueChange={(value) =>
            setSelectedClass(value === "all" ? null : parseInt(value))
          }
        >
          <SelectTrigger className="w-full sm:w-[200px]">
            <SelectValue placeholder="All Classes" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Classes</SelectItem>
            {classes.map((classItem) => (
              <SelectItem key={classItem.id} value={classItem.id.toString()}>
                {classItem.class_name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Student Grades</CardTitle>
          <CardDescription>
            {selectedClass
              ? `Viewing grades for ${getClassName(selectedClass)}`
              : "Viewing grades for all classes"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-2">
              <Skeleton className="h-8 w-full" />
              <Skeleton className="h-8 w-full" />
              <Skeleton className="h-8 w-full" />
              <Skeleton className="h-8 w-full" />
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Student</TableHead>
                  <TableHead>Class</TableHead>
                  <TableHead>Percentage</TableHead>
                  <TableHead>Letter Grade</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredGrades.length > 0 ? (
                  filteredGrades.map((grade) => (
                    <TableRow key={`${grade.student_id}-${grade.class_id}`}>
                      <TableCell className="font-medium">
                        {getStudentName(grade.student_id)}
                      </TableCell>
                      <TableCell>{getClassName(grade.class_id)}</TableCell>
                      <TableCell>{grade.percentage.toFixed(1)}%</TableCell>
                      <TableCell>
                        <Badge
                          className={getLetterGradeColor(grade.letter_grade)}
                        >
                          {grade.letter_grade}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              openEditGradesDialog(
                                grade.student_id,
                                grade.class_id,
                              )
                            }
                          >
                            <Pencil className="mr-1 h-3 w-3" />
                            Edit Grades
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              openUnenrollDialog(
                                grade.student_id,
                                grade.class_id,
                              )
                            }
                          >
                            Unenroll
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={5}
                      className="text-center py-4 text-gray-500"
                    >
                      {searchQuery || selectedClass
                        ? "No matching grades found."
                        : "No grades found. Add grades to see them here."}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
        <CardFooter className="border-t px-6 py-4">
          <div className="text-xs text-gray-500">
            Showing {filteredGrades.length} of {grades.length} grade records
          </div>
        </CardFooter>
      </Card>

      <Dialog open={isGradeDialogOpen} onOpenChange={setIsGradeDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add/Update Grade</DialogTitle>
            <DialogDescription>
              Enter or update a grade for a student assignment.
            </DialogDescription>
          </DialogHeader>

          {error && (
            <Alert variant="destructive" className="mt-4">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="gradeClass" className="text-right">
                Class
              </Label>
              <Select
                value={selectedClass?.toString() || "selectClass"}
                onValueChange={(value) => {
                  if (value === "selectClass") return;
                  const classId = parseInt(value);
                  setSelectedClass(classId);
                  setSelectedStudent(null);
                  setSelectedAssignment(null);
                }}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select a class" />
                </SelectTrigger>
                <SelectContent>
                  {classes.map((classItem) => (
                    <SelectItem
                      key={classItem.id}
                      value={classItem.id.toString()}
                    >
                      {classItem.class_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="gradeStudent" className="text-right">
                Student
              </Label>
              <Select
                value={selectedStudent?.toString() || "selectStudent"}
                onValueChange={(value) => {
                  if (value === "selectStudent" || value === "no-students")
                    return;
                  setSelectedStudent(parseInt(value));
                }}
                disabled={!selectedClass}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select a student" />
                </SelectTrigger>
                <SelectContent>
                  {selectedClass &&
                  getStudentsInClass(selectedClass).length > 0 ? (
                    getStudentsInClass(selectedClass).map((student) => (
                      <SelectItem
                        key={student.id}
                        value={student.id.toString()}
                      >
                        {student.first_name} {student.last_name}
                      </SelectItem>
                    ))
                  ) : (
                    <SelectItem value="no-students" disabled>
                      No students enrolled in this class
                    </SelectItem>
                  )}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="gradeAssignment" className="text-right">
                Assignment
              </Label>
              <Select
                value={selectedAssignment?.toString() || "selectAssignment"}
                onValueChange={(value) => {
                  if (
                    value === "selectAssignment" ||
                    value === "no-assignments"
                  )
                    return;
                  setSelectedAssignment(parseInt(value));
                }}
                disabled={!selectedClass}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select an assignment" />
                </SelectTrigger>
                <SelectContent>
                  {selectedClass &&
                  getAssignmentsForClass(selectedClass).length > 0 ? (
                    getAssignmentsForClass(selectedClass).map((assignment) => (
                      <SelectItem
                        key={assignment.id}
                        value={assignment.id.toString()}
                      >
                        {assignment.assignment_name}
                      </SelectItem>
                    ))
                  ) : (
                    <SelectItem value="no-assignments" disabled>
                      No assignments for this class
                    </SelectItem>
                  )}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="gradeScore" className="text-right">
                Score
              </Label>
              <Input
                id="gradeScore"
                type="number"
                value={score === 0 ? "" : score}
                onChange={(e) => setScore(Number(e.target.value))}
                className="col-span-3"
                min={0}
                step={0.1}
                required
              />
              {selectedAssignment && (
                <div className="col-span-4 text-right text-sm text-gray-500">
                  Maximum score: {getAssignmentMaxScore(selectedAssignment)}
                </div>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsGradeDialogOpen(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              onClick={handleGradeSubmit}
              disabled={!selectedStudent || !selectedAssignment || isSubmitting}
            >
              {isSubmitting ? "Saving..." : "Save Grade"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={isEditGradeDialogOpen}
        onOpenChange={setIsEditGradeDialogOpen}
      >
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Edit Student Grades</DialogTitle>
            <DialogDescription>
              {selectedStudent && selectedClass
                ? `Editing grades for ${getStudentName(selectedStudent)} in ${getClassName(selectedClass)}`
                : "Edit grades for this student"}
            </DialogDescription>
          </DialogHeader>

          {error && (
            <Alert variant="destructive" className="mt-4">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-4 py-4 max-h-[300px] overflow-y-auto">
            {editingGrades.length > 0 ? (
              editingGrades.map((grade, index) => {
                const maxScore = getAssignmentMaxScore(grade.assignment_id);
                const percentage =
                  maxScore > 0 ? (grade.score / maxScore) * 100 : 0;

                return (
                  <div
                    key={grade.assignment_id}
                    className="grid grid-cols-12 items-center gap-4"
                  >
                    <div className="col-span-5">
                      <Label htmlFor={`grade-${index}`} className="font-medium">
                        {getAssignmentName(grade.assignment_id)}
                      </Label>
                    </div>
                    <div className="col-span-3">
                      <Input
                        id={`grade-${index}`}
                        type="number"
                        value={grade.score === 0 ? "" : grade.score}
                        onChange={(e) =>
                          handleGradeChange(index, Number(e.target.value))
                        }
                        min={0}
                        step={0.1}
                        required
                      />
                    </div>
                    <div className="col-span-4 text-gray-500 text-sm">
                      / {maxScore} ({percentage.toFixed(1)}%)
                    </div>
                  </div>
                );
              })
            ) : (
              <p className="text-center text-gray-500">
                No grades found for this student in this class.
              </p>
            )}
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsEditGradeDialogOpen(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              onClick={handleUpdateGrades}
              disabled={editingGrades.length === 0 || isSubmitting}
            >
              {isSubmitting ? "Updating..." : "Update Grades"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isEnrollDialogOpen} onOpenChange={setIsEnrollDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Enroll Student</DialogTitle>
            <DialogDescription>
              Enroll a student in{" "}
              {selectedClass ? getClassName(selectedClass) : "a class"}.
            </DialogDescription>
          </DialogHeader>

          {error && (
            <Alert variant="destructive" className="mt-4">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="enrollStudent" className="text-right">
                Student
              </Label>
              <Select
                value={enrollStudentId?.toString() || "selectEnrollStudent"}
                onValueChange={(value) => {
                  if (
                    value === "selectEnrollStudent" ||
                    value === "all-enrolled"
                  )
                    return;
                  setEnrollStudentId(parseInt(value));
                }}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select a student" />
                </SelectTrigger>
                <SelectContent>
                  {selectedClass &&
                  getStudentsNotInClass(selectedClass).length > 0 ? (
                    getStudentsNotInClass(selectedClass).map((student) => (
                      <SelectItem
                        key={student.id}
                        value={student.id.toString()}
                      >
                        {student.first_name} {student.last_name}
                      </SelectItem>
                    ))
                  ) : (
                    <SelectItem value="all-enrolled" disabled>
                      All students are already enrolled
                    </SelectItem>
                  )}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsEnrollDialogOpen(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              onClick={handleEnrollStudent}
              disabled={!enrollStudentId || !enrollClassId || isSubmitting}
            >
              {isSubmitting ? "Enrolling..." : "Enroll Student"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={isUnenrollDialogOpen}
        onOpenChange={setIsUnenrollDialogOpen}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Unenroll Student</DialogTitle>
            <DialogDescription>
              Are you sure you want to unenroll this student from the class?
              This action cannot be undone.
            </DialogDescription>
          </DialogHeader>

          {error && (
            <Alert variant="destructive" className="mt-4">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="py-4">
            {studentToUnenroll && classToUnenroll && (
              <p>
                You are about to unenroll{" "}
                <strong>{studentToUnenroll.name}</strong> from{" "}
                <strong>{classToUnenroll.name}</strong>.
              </p>
            )}
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsUnenrollDialogOpen(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleUnenrollStudent}
              disabled={isSubmitting}
            >
              {isSubmitting ? "Unenrolling..." : "Unenroll Student"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
