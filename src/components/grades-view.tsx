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
import { PlusCircle, Search, ChevronDown, AlertCircle } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { createGrade, updateGrade, getGrade } from "@/api/grades";
import { enrollStudent, unenrollStudent } from "@/api/student-classes";
import type { OverallGrade, Student, Class, Assignment } from "@/api/types";

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
  // State for filters
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedClass, setSelectedClass] = useState<number | null>(null);

  // Dialog states
  const [isGradeDialogOpen, setIsGradeDialogOpen] = useState(false);
  const [isEnrollDialogOpen, setIsEnrollDialogOpen] = useState(false);
  const [isUnenrollDialogOpen, setIsUnenrollDialogOpen] = useState(false);

  // Form states
  const [selectedStudent, setSelectedStudent] = useState<number | null>(null);
  const [selectedAssignment, setSelectedAssignment] = useState<number | null>(
    null,
  );
  const [score, setScore] = useState<number>(0);
  const [enrollStudentId, setEnrollStudentId] = useState<number | null>(null);
  const [enrollClassId, setEnrollClassId] = useState<number | null>(null);

  // Unenroll states
  const [studentToUnenroll, setStudentToUnenroll] = useState<{
    id: number;
    name: string;
  } | null>(null);
  const [classToUnenroll, setClassToUnenroll] = useState<{
    id: number;
    name: string;
  } | null>(null);

  // Error state
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Update enrollment class ID when selected class changes
  useEffect(() => {
    if (selectedClass) {
      setEnrollClassId(selectedClass);
    }
  }, [selectedClass]);

  // Filter grades based on search query and selected class
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

  // Get student name by ID
  const getStudentName = (studentId: number): string => {
    const student = students.find((s) => s.id === studentId);
    return student ? `${student.first_name} ${student.last_name}` : "Unknown";
  };

  // Get class name by ID
  const getClassName = (classId: number): string => {
    const classItem = classes.find((c) => c.id === classId);
    return classItem ? classItem.class_name : "Unknown";
  };

  // Get letter grade color
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

  // Get assignments for a class
  const getAssignmentsForClass = (classId: number) => {
    return assignments.filter((a) => a.class_id === classId);
  };

  // Get students enrolled in a class
  const getStudentsInClass = (classId: number) => {
    return students.filter((student) =>
      grades.some(
        (grade) =>
          grade.student_id === student.id && grade.class_id === classId,
      ),
    );
  };

  // Get students not enrolled in a class
  const getStudentsNotInClass = (classId: number) => {
    const enrolledStudentIds = grades
      .filter((grade) => grade.class_id === classId)
      .map((grade) => grade.student_id);

    return students.filter(
      (student) => !enrolledStudentIds.includes(student.id),
    );
  };

  // Reset form and open grade dialog
  const openGradeDialog = () => {
    setSelectedStudent(null);
    setSelectedAssignment(null);
    setScore(0);
    setError(null);
    setIsGradeDialogOpen(true);
  };

  // Open enroll dialog
  const openEnrollDialog = () => {
    if (!selectedClass) {
      return;
    }

    setEnrollStudentId(null);
    setEnrollClassId(selectedClass);
    setError(null);
    setIsEnrollDialogOpen(true);
  };

  // Open unenroll dialog for a specific student
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

  // Handle add/update grade
  const handleGradeSubmit = async () => {
    if (!selectedStudent || !selectedAssignment) return;

    setIsSubmitting(true);
    setError(null);

    try {
      // Try to check if grade exists
      try {
        await getGrade(selectedStudent, selectedAssignment);
        // If we get here, the grade exists, so update it
        await updateGrade(selectedStudent, selectedAssignment, score);
      } catch (error) {
        // Grade doesn't exist, create a new one
        await createGrade(selectedStudent, selectedAssignment, score);
      }

      await refreshData();
      setIsGradeDialogOpen(false);
    } catch (error) {
      console.error("Error saving grade:", error);
      setError("Failed to save grade. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle enroll student
  const handleEnrollStudent = async () => {
    if (!enrollStudentId || !enrollClassId) return;

    setIsSubmitting(true);
    setError(null);

    try {
      await enrollStudent(enrollStudentId, enrollClassId);
      await refreshData();
      setIsEnrollDialogOpen(false);
    } catch (error) {
      console.error("Error enrolling student:", error);
      setError("Failed to enroll student. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle unenroll student
  const handleUnenrollStudent = async () => {
    if (!studentToUnenroll || !classToUnenroll) return;

    setIsSubmitting(true);
    setError(null);

    try {
      await unenrollStudent(studentToUnenroll.id, classToUnenroll.id);
      await refreshData();
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

      {/* Filters */}
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
          value={selectedClass?.toString() || ""}
          onValueChange={(value) =>
            setSelectedClass(value ? parseInt(value) : null)
          }
        >
          <SelectTrigger className="w-full sm:w-[200px]">
            <SelectValue placeholder="All Classes" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">All Classes</SelectItem>
            {classes.map((classItem) => (
              <SelectItem key={classItem.id} value={classItem.id.toString()}>
                {classItem.class_name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Grades Table */}
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
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              Actions <ChevronDown className="ml-2 h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Grade Options</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() =>
                                openUnenrollDialog(
                                  grade.student_id,
                                  grade.class_id,
                                )
                              }
                            >
                              Unenroll from Class
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
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

      {/* Add Grade Dialog */}
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
                value={selectedClass?.toString() || ""}
                onValueChange={(value) => {
                  const classId = parseInt(value);
                  setSelectedClass(classId);
                  // Reset dependent fields
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
                value={selectedStudent?.toString() || ""}
                onValueChange={(value) => setSelectedStudent(parseInt(value))}
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
                value={selectedAssignment?.toString() || ""}
                onValueChange={(value) =>
                  setSelectedAssignment(parseInt(value))
                }
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
                value={score}
                onChange={(e) => setScore(Number(e.target.value))}
                className="col-span-3"
                min={0}
                step={0.1}
                required
              />
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

      {/* Enroll Student Dialog */}
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
                value={enrollStudentId?.toString() || ""}
                onValueChange={(value) => setEnrollStudentId(parseInt(value))}
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

      {/* Unenroll Student Dialog */}
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
