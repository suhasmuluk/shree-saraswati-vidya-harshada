import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/hooks/useAuth";
import { useUserRole } from "@/hooks/useUserRole";
import { LanguageProvider } from "@/hooks/useLanguage";
import { AppLayout } from "@/components/AppLayout";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import Students from "./pages/Students";
import Parents from "./pages/Parents";
import Attendance from "./pages/Attendance";
import Fees from "./pages/Fees";
import Teachers from "./pages/Teachers";
import Homework from "./pages/Homework";
import ActivityIdeas from "./pages/ActivityIdeas";
import StaffAttendanceSalary from "./pages/StaffAttendanceSalary";
import TeacherSummary from "./pages/TeacherSummary";
import Events from "./pages/Events";
import Announcements from "./pages/Announcements";
import Reports from "./pages/Reports";
import Settings from "./pages/Settings";
import ExamResults from "./pages/ExamResults";
import Expenses from "./pages/Expenses";
import Inquiries from "./pages/Inquiries";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

function ProtectedRoute({ children, adminOnly }: { children: React.ReactNode; adminOnly?: boolean }) {
  const { user, loading } = useAuth();
  const { isAdmin, isLoading: roleLoading } = useUserRole();
  if (loading || roleLoading) return <div className="min-h-screen flex items-center justify-center text-muted-foreground">Loading...</div>;
  if (!user) return <Navigate to="/auth" replace />;
  if (adminOnly && !isAdmin) return <Navigate to="/" replace />;
  return <AppLayout>{children}</AppLayout>;
}

function AuthRoute() {
  const { user, loading } = useAuth();
  if (loading) return <div className="min-h-screen flex items-center justify-center text-muted-foreground">Loading...</div>;
  if (user) return <Navigate to="/" replace />;
  return <Auth />;
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <LanguageProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AuthProvider>
            <Routes>
              <Route path="/auth" element={<AuthRoute />} />
              <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
              <Route path="/students" element={<ProtectedRoute><Students /></ProtectedRoute>} />
              <Route path="/parents" element={<ProtectedRoute><Parents /></ProtectedRoute>} />
              <Route path="/classes" element={<Navigate to="/teachers" replace />} />
              <Route path="/attendance" element={<ProtectedRoute><Attendance /></ProtectedRoute>} />
              <Route path="/fees" element={<ProtectedRoute><Fees /></ProtectedRoute>} />
              <Route path="/teachers" element={<ProtectedRoute adminOnly><Teachers /></ProtectedRoute>} />
              <Route path="/staff-salary" element={<ProtectedRoute adminOnly><StaffAttendanceSalary /></ProtectedRoute>} />
              <Route path="/teacher-summary" element={<ProtectedRoute adminOnly><TeacherSummary /></ProtectedRoute>} />
              <Route path="/homework" element={<ProtectedRoute><Homework /></ProtectedRoute>} />
              <Route path="/activity-ideas" element={<ProtectedRoute><ActivityIdeas /></ProtectedRoute>} />
              <Route path="/events" element={<ProtectedRoute><Events /></ProtectedRoute>} />
              <Route path="/announcements" element={<ProtectedRoute><Announcements /></ProtectedRoute>} />
              <Route path="/reports" element={<ProtectedRoute><Reports /></ProtectedRoute>} />
              <Route path="/exam-results" element={<ProtectedRoute><ExamResults /></ProtectedRoute>} />
              <Route path="/expenses" element={<ProtectedRoute adminOnly><Expenses /></ProtectedRoute>} />
              <Route path="/inquiries" element={<ProtectedRoute><Inquiries /></ProtectedRoute>} />
              <Route path="/settings" element={<ProtectedRoute adminOnly><Settings /></ProtectedRoute>} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </AuthProvider>
        </BrowserRouter>
      </TooltipProvider>
    </LanguageProvider>
  </QueryClientProvider>
);

export default App;
