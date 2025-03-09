import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

import { getAllStudents } from "@/api/students";
import { getAllClasses } from "@/api/classes";
import { getAllAssignments } from "@/api/assignments";
import { getOverallGrades } from "@/api/overall-grades";

import StudentsView from "@/components/students-view";
import ClassesView from "@/components/classes-view";
import AssignmentsView from "@/components/assignments-view";
import GradesView from "@/components/grades-view";
import DashboardView from "@/components/dashboard-view";

import type { Student, Class, Assignment, OverallGrade } from "@/api/types";
import "./app.css";

function App() {
  const [students, setStudents] = useState<Student[]>([]);
  const [classes, setClasses] = useState<Class[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [overallGrades, setOverallGrades] = useState<OverallGrade[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("dashboard");

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);

      try {
        const studentsData = await getAllStudents();
        setStudents(studentsData);
      } catch (err) {
        console.error("Error loading students:", err);
        setError(
          "Failed to load students data. Please check database connection.",
        );
        return;
      }

      try {
        const classesData = await getAllClasses();
        setClasses(classesData);
      } catch (err) {
        console.error("Error loading classes:", err);
        setError("Failed to load classes data. Please check database schema.");
        return;
      }

      try {
        const assignmentsData = await getAllAssignments();
        setAssignments(assignmentsData);
      } catch (err) {
        console.error("Error loading assignments:", err);
        setError(
          "Failed to load assignments data. Please check database schema.",
        );
        return;
      }

      try {
        const overallGradesData = await getOverallGrades();
        setOverallGrades(overallGradesData);
      } catch (err) {
        console.error("Error loading overall grades:", err);
        setError("Failed to load grades data. Please check database schema.");
        return;
      }
    } catch (error) {
      console.error("Error loading data:", error);
      setError("An unexpected error occurred while loading data.");
    } finally {
      setLoading(false);
    }
  };

  const refreshData = async () => {
    await loadData();
  };

  return (
    <div className="flex flex-col min-h-screen">
      <header className="sticky top-0 z-10 border-b bg-white dark:bg-gray-950 px-6 py-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            GradeTracker
          </h1>
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                document.body.classList.toggle("dark");
              }}
            >
              Theme
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto py-6 px-4 flex-1">
        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
            <Button
              variant="outline"
              size="lg"
              onClick={loadData}
              className="mt-2"
            >
              Retry
            </Button>
          </Alert>
        )}

        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="space-y-4"
        >
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
            <TabsTrigger value="students">Students</TabsTrigger>
            <TabsTrigger value="classes">Classes</TabsTrigger>
            <TabsTrigger value="assignments">Assignments</TabsTrigger>
            <TabsTrigger value="grades">Grades</TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard" className="space-y-4">
            <DashboardView
              students={students}
              classes={classes}
              assignments={assignments}
              overallGrades={overallGrades}
              loading={loading}
            />
          </TabsContent>

          <TabsContent value="students" className="space-y-4">
            <StudentsView
              students={students}
              refreshData={refreshData}
              loading={loading}
            />
          </TabsContent>

          <TabsContent value="classes" className="space-y-4">
            <ClassesView
              classes={classes}
              refreshData={refreshData}
              loading={loading}
            />
          </TabsContent>

          <TabsContent value="assignments" className="space-y-4">
            <AssignmentsView
              assignments={assignments}
              classes={classes}
              refreshData={refreshData}
              loading={loading}
            />
          </TabsContent>

          <TabsContent value="grades" className="space-y-4">
            {classes.length > 0 && students.length > 0 ? (
              <GradesView
                grades={overallGrades}
                students={students}
                classes={classes}
                assignments={assignments}
                refreshData={refreshData}
                loading={loading}
              />
            ) : (
              <Alert className="mb-6">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>No data available</AlertTitle>
                <AlertDescription>
                  Please create at least one class and one student before
                  accessing grades.
                </AlertDescription>
              </Alert>
            )}
          </TabsContent>
        </Tabs>
      </main>

      <footer className="border-t bg-white dark:bg-gray-950 px-6 py-4 text-center text-sm text-gray-500 mt-auto">
        <p>© 2025 Gradify</p>
      </footer>
    </div>
  );
}

export default App;
