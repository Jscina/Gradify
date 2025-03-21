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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { PlusCircle, Pencil, Trash2, Search } from "lucide-react";
import { format } from "date-fns";
import {
  createAssignment,
  updateAssignment,
  deleteAssignment,
} from "@/api/assignments";
import type { Assignment, Class } from "@/api/types";
import { DatePicker } from "./date-picker";

interface AssignmentsViewProps {
  assignments: Assignment[];
  classes: Class[];
  refreshData: () => Promise<void>;
  loading: boolean;
}

export default function AssignmentsView({
  assignments,
  classes,
  refreshData,
  loading,
}: AssignmentsViewProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [currentAssignment, setCurrentAssignment] = useState<Assignment | null>(
    null,
  );

  const [assignmentName, setAssignmentName] = useState("");
  const [assignmentType, setAssignmentType] = useState<string>("Homework");
  const [classId, setClassId] = useState<number | null>(null);
  const [maximumScore, setMaximumScore] = useState<number>(100);
  const [dueDate, setDueDate] = useState<Date | undefined>(undefined);

  const assignmentTypes = ["Homework", "Test"];

  const filteredAssignments = assignments.filter((assignment) => {
    const assignmentNameLower = assignment.assignment_name.toLowerCase();
    const assignmentTypeLower = assignment.assignment_type.toLowerCase();
    const query = searchQuery.toLowerCase();

    return (
      assignmentNameLower.includes(query) || assignmentTypeLower.includes(query)
    );
  });

  const getClassName = (classId: number) => {
    const foundClass = classes.find((c) => c.id === classId);
    return foundClass ? foundClass.class_name : "Unknown";
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return "No due date";
    try {
      return format(new Date(dateString), "PPP");
    } catch (error) {
      return "Invalid date";
    }
  };

  const openCreateDialog = () => {
    setAssignmentName("");
    setAssignmentType("Homework");
    setClassId(null);
    setMaximumScore(100);
    setDueDate(undefined);
    setIsCreateDialogOpen(true);
  };

  const openEditDialog = (assignment: Assignment) => {
    setCurrentAssignment(assignment);
    setAssignmentName(assignment.assignment_name);
    setAssignmentType(assignment.assignment_type);
    setClassId(assignment.class_id);
    setMaximumScore(assignment.maximum_score);
    setDueDate(assignment.due_date ? new Date(assignment.due_date) : undefined);
    setIsEditDialogOpen(true);
  };

  const openDeleteDialog = (assignment: Assignment) => {
    setCurrentAssignment(assignment);
    setIsDeleteDialogOpen(true);
  };

  const handleCreateAssignment = async () => {
    if (!classId) return;

    try {
      let dueDateString = undefined;
      if (dueDate) {
        dueDateString = dueDate.toISOString().replace("Z", "");
      }

      await createAssignment(
        classId,
        assignmentName,
        assignmentType,
        maximumScore,
        dueDateString,
      );
      await refreshData();
      setIsCreateDialogOpen(false);
    } catch (error) {
      console.error("Error creating assignment:", error);
    }
  };

  const handleUpdateAssignment = async () => {
    if (!currentAssignment || !classId) return;

    try {
      let dueDateString = undefined;
      if (dueDate) {
        dueDateString = dueDate.toISOString().replace("Z", "");
      }

      await updateAssignment(
        currentAssignment.id,
        classId,
        assignmentName,
        assignmentType,
        maximumScore,
        dueDateString,
      );
      await refreshData();
      setIsEditDialogOpen(false);
    } catch (error) {
      console.error("Error updating assignment:", error);
    }
  };

  const handleDeleteAssignment = async () => {
    if (!currentAssignment) return;

    try {
      await deleteAssignment(currentAssignment.id);
      await refreshData();
      setIsDeleteDialogOpen(false);
    } catch (error) {
      console.error("Error deleting assignment:", error);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Assignments</h2>
        <Button onClick={openCreateDialog}>
          <PlusCircle className="mr-2 h-4 w-4" />
          Add Assignment
        </Button>
      </div>

      {/* Search */}
      <div className="flex items-center space-x-2">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
          <Input
            type="search"
            placeholder="Search assignments..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Assignments</CardTitle>
          <CardDescription>
            Manage assignments across all your classes.
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
                  <TableHead>Assignment Name</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Class</TableHead>
                  <TableHead>Max Score</TableHead>
                  <TableHead>Due Date</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAssignments.length > 0 ? (
                  filteredAssignments.map((assignment) => (
                    <TableRow key={assignment.id}>
                      <TableCell className="font-medium">
                        {assignment.id}
                      </TableCell>
                      <TableCell>{assignment.assignment_name}</TableCell>
                      <TableCell>{assignment.assignment_type}</TableCell>
                      <TableCell>{getClassName(assignment.class_id)}</TableCell>
                      <TableCell>{assignment.maximum_score}</TableCell>
                      <TableCell>{formatDate(assignment.due_date)}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => openEditDialog(assignment)}
                          >
                            <Pencil className="h-4 w-4" />
                            <span className="sr-only">Edit</span>
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-red-500"
                            onClick={() => openDeleteDialog(assignment)}
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
                      colSpan={7}
                      className="text-center py-4 text-gray-500"
                    >
                      No assignments found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
        <CardFooter className="border-t px-6 py-4">
          <div className="text-xs text-gray-500">
            Showing {filteredAssignments.length} of {assignments.length}{" "}
            assignments
          </div>
        </CardFooter>
      </Card>

      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="sm:max-w-[525px]">
          <DialogHeader>
            <DialogTitle>Add New Assignment</DialogTitle>
            <DialogDescription>
              Enter the details for the new assignment.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="assignmentName" className="text-right">
                Name
              </Label>
              <Input
                id="assignmentName"
                value={assignmentName}
                onChange={(e) => setAssignmentName(e.target.value)}
                className="col-span-3"
                required
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="assignmentClass" className="text-right">
                Class
              </Label>
              <Select
                value={classId?.toString() || "selectClass"}
                onValueChange={(value) => {
                  if (value !== "selectClass") {
                    setClassId(parseInt(value));
                  }
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
              <Label htmlFor="assignmentType" className="text-right">
                Type
              </Label>
              <Select
                value={assignmentType || "Homework"}
                onValueChange={(value) => setAssignmentType(value)}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select a type" />
                </SelectTrigger>
                <SelectContent>
                  {assignmentTypes.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="maximumScore" className="text-right">
                Max Score
              </Label>
              <Input
                id="maximumScore"
                type="number"
                value={maximumScore === 0 ? "" : maximumScore}
                onChange={(e) => setMaximumScore(Number(e.target.value))}
                className="col-span-3"
                min={0}
                required
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="dueDate" className="text-right">
                Due Date
              </Label>
              <div className="col-span-3">
                <DatePicker value={dueDate} onChange={setDueDate} />
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
              onClick={handleCreateAssignment}
              disabled={!assignmentName || !assignmentType || !classId}
            >
              Create Assignment
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[525px]">
          <DialogHeader>
            <DialogTitle>Edit Assignment</DialogTitle>
            <DialogDescription>
              Update the assignment details.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-assignmentName" className="text-right">
                Name
              </Label>
              <Input
                id="edit-assignmentName"
                value={assignmentName}
                onChange={(e) => setAssignmentName(e.target.value)}
                className="col-span-3"
                required
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-assignmentClass" className="text-right">
                Class
              </Label>
              <Select
                value={classId?.toString() || "selectClass"}
                onValueChange={(value) => {
                  if (value !== "selectClass") {
                    setClassId(parseInt(value));
                  }
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
              <Label htmlFor="edit-assignmentType" className="text-right">
                Type
              </Label>
              <Select
                value={assignmentType || "Homework"}
                onValueChange={(value) => setAssignmentType(value)}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select a type" />
                </SelectTrigger>
                <SelectContent>
                  {assignmentTypes.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-maximumScore" className="text-right">
                Max Score
              </Label>
              <Input
                id="edit-maximumScore"
                type="number"
                value={maximumScore === 0 ? "" : maximumScore}
                onChange={(e) => setMaximumScore(Number(e.target.value))}
                className="col-span-3"
                min={0}
                placeholder="Enter Maximum Score"
                required
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-dueDate" className="text-right">
                Due Date
              </Label>
              <div className="col-span-3">
                <DatePicker value={dueDate} onChange={setDueDate} />
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
              onClick={handleUpdateAssignment}
              disabled={!assignmentName || !assignmentType || !classId}
            >
              Update Assignment
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Assignment</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this assignment? This action
              cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            {currentAssignment && (
              <p>
                You are about to delete{" "}
                <strong>{currentAssignment.assignment_name}</strong>.
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
            <Button variant="destructive" onClick={handleDeleteAssignment}>
              Delete Assignment
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
