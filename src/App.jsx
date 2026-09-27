import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { TimerProvider } from './context/TimerContext'
import Layout from './components/Layout'
import AdminLayout from './components/AdminLayout'
import AdminRoute from './components/AdminRoute'
import StudentRoute from './components/StudentRoute'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import StudyRoom from './pages/StudyRoom'
import Notes from './pages/Notes'
import Profile from './pages/Profile'
import RoomsLobby from './pages/RoomsLobby'
import RoomDetail from './pages/RoomDetail'
import JoinRoomRedirect from './pages/JoinRoomRedirect'
import AdminLogin from './pages/AdminLogin'
import AdminDashboard from './pages/AdminDashboard'
import AdminUsers from './pages/AdminUsers'
import AdminAnalytics from './pages/AdminAnalytics'
import AdminReports from './pages/AdminReports'
import AdminAnnouncements from './pages/AdminAnnouncements'

function App() {
  return (
    <TimerProvider>
      <BrowserRouter>
        <Layout>
          <Routes>

            <Route path="/" element={<Login />} />

            <Route
              path="/dashboard"
              element={
                <StudentRoute>
                  <Dashboard />
                </StudentRoute>
              }
            />

            <Route
              path="/study-room"
              element={
                <StudentRoute>
                  <StudyRoom />
                </StudentRoute>
              }
            />

            <Route
              path="/rooms"
              element={
                <StudentRoute>
                  <RoomsLobby />
                </StudentRoute>
              }
            />

            <Route
              path="/rooms/:roomId"
              element={
                <StudentRoute>
                  <RoomDetail />
                </StudentRoute>
              }
            />

            <Route
              path="/notes"
              element={
                <StudentRoute>
                  <Notes />
                </StudentRoute>
              }
            />

            <Route
              path="/profile"
              element={
                <StudentRoute>
                  <Profile />
                </StudentRoute>
              }
            />

            {/* ================================================
                ADMIN
            ================================================ */}

            <Route path="/admin/login" element={<AdminLogin />} />

            <Route
              path="/admin"
              element={
                <AdminRoute>
                  <AdminLayout>
                    <AdminDashboard />
                  </AdminLayout>
                </AdminRoute>
              }
            />

            <Route
              path="/admin/users"
              element={
                <AdminRoute>
                  <AdminLayout>
                    <AdminUsers />
                  </AdminLayout>
                </AdminRoute>
              }
            />

            <Route
              path="/admin/analytics"
              element={
                <AdminRoute>
                  <AdminLayout>
                    <AdminAnalytics />
                  </AdminLayout>
                </AdminRoute>
              }
            />

            <Route
              path="/admin/reports"
              element={
                <AdminRoute>
                  <AdminLayout>
                    <AdminReports />
                  </AdminLayout>
                </AdminRoute>
              }
            />

            <Route
              path="/admin/announcements"
              element={
                <AdminRoute>
                  <AdminLayout>
                    <AdminAnnouncements />
                  </AdminLayout>
                </AdminRoute>
              }
            />

          </Routes>
        </Layout>
      </BrowserRouter>
    </TimerProvider>
  )
}

export default App
