import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Expos from './pages/Expos';
import ProtectedRoute from './components/ProtectedRoute';
import ExhibitorApply from './pages/ExhibitorApply';
import Profile from './pages/Profile';
import MyRegistrations from './pages/MyRegistrations';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import AdminLayout from './pages/admin/AdminLayout';
import Dashboard from './pages/admin/Dashboard';
import ManageExpos from './pages/admin/ManageExpos';
import Applications from './pages/admin/Applications';
import Booths from './pages/admin/Booths';
import Schedule from './pages/admin/Schedule';
import ChooseBooth from './pages/ChooseBooth';
import ExpoDetails from './pages/ExpoDetails';
import ExhibitorDirectory from './pages/ExhibitorDirectory';
import MySchedule from './pages/MySchedule';
import Messages from './pages/Messages';

export default function App() {
  return (
    <>
      <Navbar />

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/expos" element={<Expos />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/messages" element={<Messages />} />
        <Route
  path="/expos/:id/apply"
  element={
    <ProtectedRoute roles={['exhibitor']}>
      <ExhibitorApply />
    </ProtectedRoute>
  }
/>
<Route
  path="/admin"
  element={
    <ProtectedRoute roles={['admin']}>
      <AdminLayout />
    </ProtectedRoute>
  }
>
  <Route index element={<Dashboard />} />
  <Route path="expos" element={<ManageExpos />} />
  <Route path="applications" element={<Applications />} />
  <Route path="booths" element={<Booths />} />
  <Route path="schedule" element={<Schedule />} />
  
</Route>
<Route
  path="/profile"
  element={
    <ProtectedRoute roles={['exhibitor']}>
      <Profile />
    </ProtectedRoute>
  }
/>
<Route
  path="/expos/:expoId/booth"
  element={
    <ProtectedRoute roles={['exhibitor']}>
      <ChooseBooth />
    </ProtectedRoute>
  }
/>
<Route
  path="/my-applications"
  element={
    <ProtectedRoute roles={['exhibitor']}>
      <MyRegistrations />
    </ProtectedRoute>
  }
/>
<Route path="/forgot-password" element={<ForgotPassword />} />
<Route path="/reset-password/:token" element={<ResetPassword />} />



<Route path="/expos/:id" element={<ExpoDetails />} />
<Route path="/exhibitors" element={<ExhibitorDirectory />} />
<Route
  path="/my-schedule"
  element={
    <ProtectedRoute roles={['attendee']}>
      <MySchedule />
    </ProtectedRoute>
  }
/>
          </Routes>

    </>

  );
}