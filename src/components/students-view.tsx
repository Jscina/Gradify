import { useState } from "react";
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
import { Skeleton } from "@/components/ui/skeleton";
import { PlusCircle, Pencil, Trash2, Search } from "lucide-react";
import { createStudent, updateStudent, deleteStudent } from "@/api/students";
import type { Student } from "@/api/types";

interface StudentsViewProps {
  students: Student[];
  refreshData: () => Promise<void>;
  loading: boolean;
}

export default function StudentsView({
  students,
  refreshData,
  loading,
}: StudentsViewProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [currentStudent, setCurrentStudent] = useState<Student | null>(null);

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState("");
  const [firstNameError, setFirstNameError] = useState("");
  const [lastNameError, setLastNameError] = useState("");

  const filteredStudents = students.filter((student) => {
    const fullName = `${student.first_name} ${student.last_name}`.toLowerCase();
    const emailLower = student.email?.toLowerCase() || "";
    const query = searchQuery.toLowerCase();

    return fullName.includes(query) || emailLower.includes(query);
  });

  const validateFirstName = (value: string) => {
    if (!value.trim()) {
      setFirstNameError("First name is required");
      return false;
    }
    if (value.length > 50) {
      setFirstNameError("First name cannot exceed 50 characters");
      return false;
    }
    setFirstNameError("");
    return true;
  };

  const validateLastName = (value: string) => {
    if (!value.trim()) {
      setLastNameError("Last name is required");
      return false;
    }
    if (value.length > 50) {
      setLastNameError("Last name cannot exceed 50 characters");
      return false;
    }
    setLastNameError("");
    return true;
  };

  const validateEmail = (emailValue: string, studentId?: number) => {
    if (!emailValue) {
      setEmailError("");
      return true;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(emailValue)) {
      setEmailError("Please enter a valid email address");
      return false;
    }

    const isDuplicate = students.some(
      (student) =>
        student.email?.toLowerCase() === emailValue.toLowerCase() &&
        student.id !== studentId,
    );

    if (isDuplicate) {
      setEmailError("This email is already in use");
      return false;
    }

    setEmailError("");
    return true;
  };

  const openCreateDialog = () => {
    setFirstName("");
    setLastName("");
    setEmail("");
    setEmailError("");
    setFirstNameError("");
    setLastNameError("");
    setIsCreateDialogOpen(true);
  };

  const openEditDialog = (student: Student) => {
    setCurrentStudent(student);
    setFirstName(student.first_name);
    setLastName(student.last_name);
    setEmail(student.email || "");
    setEmailError("");
    setFirstNameError("");
    setLastNameError("");
    setIsEditDialogOpen(true);
  };

  const openDeleteDialog = (student: Student) => {
    setCurrentStudent(student);
    setIsDeleteDialogOpen(true);
  };

  const handleCreateStudent = async () => {
    const isFirstNameValid = validateFirstName(firstName);
    const isLastNameValid = validateLastName(lastName);
    const isEmailValid = validateEmail(email);

    if (!isFirstNameValid || !isLastNameValid || !isEmailValid) return;

    try {
      await createStudent(firstName, lastName, email || undefined);
      await refreshData();
      setIsCreateDialogOpen(false);
    } catch (error) {
      console.error("Error creating student:", error);
    }
  };

  const handleUpdateStudent = async () => {
    if (!currentStudent) return;

    const isFirstNameValid = validateFirstName(firstName);
    const isLastNameValid = validateLastName(lastName);
    const isEmailValid = validateEmail(email, currentStudent.id);

    if (!isFirstNameValid || !isLastNameValid || !isEmailValid) return;

    try {
      await updateStudent(
        currentStudent.id,
        firstName,
        lastName,
        email || undefined,
      );
      await refreshData();
      setIsEditDialogOpen(false);
    } catch (error) {
      console.error("Error updating student:", error);
    }
  };

  const handleDeleteStudent = async () => {
    if (!currentStudent) return;

    try {
      await deleteStudent(currentStudent.id);
      await refreshData();
      setIsDeleteDialogOpen(false);
    } catch (error) {
      console.error("Error deleting student:", error);
    }
  };

  const handleFirstNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setFirstName(value);
    validateFirstName(value);
  };

  const handleLastNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setLastName(value);
    validateLastName(value);
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setEmail(value);
    validateEmail(value, currentStudent?.id);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Students</h2>
        <Button onClick={openCreateDialog}>
          <PlusCircle className="mr-2 h-4 w-4" />
          Add Student
        </Button>
      </div>

      <div className="flex items-center space-x-2">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
          <Input
            type="search"
            placeholder="Search students..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Students</CardTitle>
          <CardDescription>
            Manage your students and their information.
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
                  <TableHead>ID</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredStudents.length > 0 ? (
                  filteredStudents.map((student) => (
                    <TableRow key={student.id}>
                      <TableCell className="font-medium">
                        {student.id}
                      </TableCell>
                      <TableCell>
                        {student.first_name} {student.last_name}
                      </TableCell>
                      <TableCell>{student.email || "-"}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => openEditDialog(student)}
                          >
                            <Pencil className="h-4 w-4" />
                            <span className="sr-only">Edit</span>
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-red-500"
                            onClick={() => openDeleteDialog(student)}
                          >
                            <Trash2 className="h-4 w-4" />
                            <span className="sr-only">Delete</span>
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={4}
                      className="text-center py-4 text-gray-500"
                    >
                      No students found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
        <CardFooter className="border-t px-6 py-4">
          <div className="text-xs text-gray-500">
            Showing {filteredStudents.length} of {students.length} students
          </div>
        </CardFooter>
      </Card>

      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Student</DialogTitle>
            <DialogDescription>
              Enter the information for the new student.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="firstName" className="text-right">
                First Name
              </Label>
              <div className="col-span-3 space-y-1">
                <Input
                  id="firstName"
                  value={firstName}
                  onChange={handleFirstNameChange}
                  className={firstNameError ? "border-red-500" : ""}
                />
                {firstNameError && (
                  <p className="text-xs text-red-500">{firstNameError}</p>
                )}
              </div>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="lastName" className="text-right">
                Last Name
              </Label>
              <div className="col-span-3 space-y-1">
                <Input
                  id="lastName"
                  value={lastName}
                  onChange={handleLastNameChange}
                  className={lastNameError ? "border-red-500" : ""}
                />
                {lastNameError && (
                  <p className="text-xs text-red-500">{lastNameError}</p>
                )}
              </div>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="email" className="text-right">
                Email
              </Label>
              <div className="col-span-3 space-y-1">
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={handleEmailChange}
                  className={emailError ? "border-red-500" : ""}
                />
                {emailError && (
                  <p className="text-xs text-red-500">{emailError}</p>
                )}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsCreateDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={handleCreateStudent}
              disabled={
                !firstName ||
                !lastName ||
                !!firstNameError ||
                !!lastNameError ||
                !!emailError
              }
            >
              Create Student
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Student</DialogTitle>
            <DialogDescription>
              Update the student's information.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-firstName" className="text-right">
                First Name
              </Label>
              <div className="col-span-3 space-y-1">
                <Input
                  id="edit-firstName"
                  value={firstName}
                  onChange={handleFirstNameChange}
                  className={firstNameError ? "border-red-500" : ""}
                />
                {firstNameError && (
                  <p className="text-xs text-red-500">{firstNameError}</p>
                )}
              </div>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-lastName" className="text-right">
                Last Name
              </Label>
              <div className="col-span-3 space-y-1">
                <Input
                  id="edit-lastName"
                  value={lastName}
                  onChange={handleLastNameChange}
                  className={lastNameError ? "border-red-500" : ""}
                />
                {lastNameError && (
                  <p className="text-xs text-red-500">{lastNameError}</p>
                )}
              </div>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-email" className="text-right">
                Email
              </Label>
              <div className="col-span-3 space-y-1">
                <Input
                  id="edit-email"
                  type="email"
                  value={email}
                  onChange={handleEmailChange}
                  className={emailError ? "border-red-500" : ""}
                />
                {emailError && (
                  <p className="text-xs text-red-500">{emailError}</p>
                )}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsEditDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={handleUpdateStudent}
              disabled={
                !firstName ||
                !lastName ||
                !!firstNameError ||
                !!lastNameError ||
                !!emailError
              }
            >
              Update Student
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Student</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this student? This action cannot
              be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            {currentStudent && (
              <p>
                You are about to delete{" "}
                <strong>
                  {currentStudent.first_name} {currentStudent.last_name}
                </strong>
                .
              </p>
            )}
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDeleteDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteStudent}>
              Delete Student
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
