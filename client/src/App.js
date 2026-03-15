import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Courses from "./pages/Courses";
import Login from "./pages/Login";
import Register from "./pages/Register"; 
import CreateCourse from "./pages/CreateCourse";
import CreateLesson from "./pages/CreateLesson";
import CreateModule from "./pages/CreateModule";
import ManageCourse from "./pages/ManageCourse";
import AdminDashboard from "./pages/AdminDashboard";
import CourseDetails from "./pages/CourseDetails";
import CoursePlayer from "./pages/CoursePlayer";
import MyLearning from "./pages/MyLearning";
import Profile from "./pages/Profile";
import About from "./pages/About";
import Announcements from "./pages/Announcements";
import NotFound from "./pages/NotFound";
import Navbar from "./components/Navbar";

const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem("token");
  if (!token) return <Navigate to="/login" />;
  return children;
};

const AdminRoute = ({ children }) => {
  const user = JSON.parse(localStorage.getItem("user"));
  if (user?.role !== "admin") return <Navigate to="/" />;
  return children;
};

export default function App() {
  const token = localStorage.getItem("token");

  return (
    <BrowserRouter>
      {token && <Navbar />}
      <Routes>
        <Route path="/login" element={token ? <Navigate to="/" /> : <Login />} />
        <Route path="/register" element={token ? <Navigate to="/" /> : <Register />} />

        <Route path="/" element={<ProtectedRoute><Courses /></ProtectedRoute>} />
        <Route path="/course/:courseId" element={<ProtectedRoute><CourseDetails /></ProtectedRoute>} />

        <Route path="/my-learning" element={<ProtectedRoute><MyLearning /></ProtectedRoute>} />
        <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
        <Route path="/about" element={<About />} />
        <Route path="/announcements" element={<ProtectedRoute><Announcements /></ProtectedRoute>} />
        <Route path="/course-player/:courseId" element={<ProtectedRoute><CoursePlayer /></ProtectedRoute>} />

        <Route path="/admin" element={<Navigate to="/admin/dashboard" />} />
        <Route path="/admin/dashboard" element={<ProtectedRoute><AdminRoute><AdminDashboard /></AdminRoute></ProtectedRoute>} />
        <Route path="/admin/create-course" element={<ProtectedRoute><AdminRoute><CreateCourse /></AdminRoute></ProtectedRoute>} />
        <Route path="/admin/add-lesson/:moduleId" element={<ProtectedRoute><AdminRoute><CreateLesson /></AdminRoute></ProtectedRoute>} />
        <Route path="/admin/create-module/:courseId" element={<ProtectedRoute><AdminRoute><CreateModule /></AdminRoute></ProtectedRoute>} />
        <Route path="/admin/manage-course/:courseId" element={<ProtectedRoute><AdminRoute><ManageCourse /></AdminRoute></ProtectedRoute>} />

        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}