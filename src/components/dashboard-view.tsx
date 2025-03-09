import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { UserCircle, BookOpen, FileText, BarChart3 } from "lucide-react";
import type { Student, Class, Assignment, OverallGrade } from "@/api/types";

interface DashboardViewProps {
  students: Student[];
  classes: Class[];
  assignments: Assignment[];
  overallGrades: OverallGrade[];
  loading: boolean;
}

export default function DashboardView({
  students,
  classes,
  assignments,
  overallGrades,
  loading,
}: DashboardViewProps) {
  const totalStudents = students.length;
  const totalClasses = classes.length;
  const totalAssignments = assignments.length;

  const avgGrade =
    overallGrades.length > 0
      ? (
          overallGrades.reduce((sum, grade) => sum + grade.percentage, 0) /
          overallGrades.length
        ).toFixed(1)
      : "N/A";

  const atRiskStudents = overallGrades
    .filter((grade) => grade.percentage < 70)
    .map((grade) => {
      const student = students.find((s) => s.id === grade.student_id);
      const className = classes.find(
        (c) => c.id === grade.class_id,
      )?.class_name;
      return {
        studentName: student
          ? `${student.first_name} ${student.last_name}`
          : "Unknown",
        className: className || "Unknown",
        percentage: grade.percentage,
        letterGrade: grade.letter_grade,
      };
    });

  const assignmentsByClass = assignments.reduce(
    (acc, assignment) => {
      const classId = assignment.class_id;
      if (!acc[classId]) {
        acc[classId] = [];
      }
      acc[classId].push(assignment);
      return acc;
    },
    {} as Record<number, Assignment[]>,
  );

  let mostAssignmentsClass = { classId: 0, count: 0, name: "" };
  Object.entries(assignmentsByClass).forEach(([classId, assignments]) => {
    if (assignments.length > mostAssignmentsClass.count) {
      const classInfo = classes.find((c) => c.id === parseInt(classId));
      mostAssignmentsClass = {
        classId: parseInt(classId),
        count: assignments.length,
        name: classInfo?.class_name || "Unknown",
      };
    }
  });

  const today = new Date();
  const nextWeek = new Date(today);
  nextWeek.setDate(today.getDate() + 7);

  const upcomingAssignments = assignments
    .filter((assignment) => {
      if (!assignment.due_date) return false;
      const dueDate = new Date(assignment.due_date);
      return dueDate >= today && dueDate <= nextWeek;
    })
    .map((assignment) => {
      const className = classes.find(
        (c) => c.id === assignment.class_id,
      )?.class_name;
      return {
        ...assignment,
        className: className || "Unknown",
        formattedDueDate: new Date(assignment.due_date!).toLocaleDateString(),
      };
    })
    .sort(
      (a, b) =>
        new Date(a.due_date!).getTime() - new Date(b.due_date!).getTime(),
    );

  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Total Students"
          value={loading ? "Loading..." : totalStudents.toString()}
          description="Enrolled students"
          icon={<UserCircle className="h-4 w-4 text-blue-600" />}
          loading={loading}
        />
        <StatsCard
          title="Total Classes"
          value={loading ? "Loading..." : totalClasses.toString()}
          description="Active classes"
          icon={<BookOpen className="h-4 w-4 text-green-600" />}
          loading={loading}
        />
        <StatsCard
          title="Total Assignments"
          value={loading ? "Loading..." : totalAssignments.toString()}
          description="Created assignments"
          icon={<FileText className="h-4 w-4 text-amber-600" />}
          loading={loading}
        />
        <StatsCard
          title="Average Grade"
          value={loading ? "Loading..." : `${avgGrade}%`}
          description="Across all classes"
          icon={<BarChart3 className="h-4 w-4 text-purple-600" />}
          loading={loading}
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Students at Risk</CardTitle>
            <CardDescription>Students with grades below 70%</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
              </div>
            ) : atRiskStudents.length > 0 ? (
              <div className="space-y-2">
                {atRiskStudents.map((student, index) => (
                  <div
                    key={index}
                    className="flex justify-between items-center py-2 border-b"
                  >
                    <div>
                      <p className="font-medium">{student.studentName}</p>
                      <p className="text-sm text-gray-500">
                        {student.className}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span
                        className={`px-2 py-1 rounded text-xs font-medium ${
                          student.percentage < 60
                            ? "bg-red-100 text-red-800"
                            : "bg-amber-100 text-amber-800"
                        }`}
                      >
                        {student.percentage}% ({student.letterGrade})
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500">
                No students currently at risk.
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Upcoming Assignments</CardTitle>
            <CardDescription>Due in the next 7 days</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
              </div>
            ) : upcomingAssignments.length > 0 ? (
              <div className="space-y-2">
                {upcomingAssignments.map((assignment) => (
                  <div
                    key={assignment.id}
                    className="flex justify-between items-center py-2 border-b"
                  >
                    <div>
                      <p className="font-medium">
                        {assignment.assignment_name}
                      </p>
                      <p className="text-sm text-gray-500">
                        {assignment.className}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs font-medium">
                        Due: {assignment.formattedDueDate}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500">
                No assignments due in the next 7 days.
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function StatsCard({
  title,
  value,
  description,
  icon,
  loading,
}: {
  title: string;
  value: string;
  description: string;
  icon: React.ReactNode;
  loading: boolean;
}) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        {loading ? (
          <Skeleton className="h-7 w-1/2" />
        ) : (
          <>
            <p className="text-2xl font-bold">{value}</p>
            <p className="text-xs text-gray-500">{description}</p>
          </>
        )}
      </CardContent>
    </Card>
  );
}
