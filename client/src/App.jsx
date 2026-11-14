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

export default function App() {
  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/expos" element={<Expos />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route
  path="/expos/:id/apply"
  element={
    <ProtectedRoute roles={['exhibitor']}>
      <ExhibitorApply />
    </ProtectedRoute>
  }
/>
<Route
  path="/profile"
  element={
    <ProtectedRoute roles={['exhibitor']}>
      <Profile />
    </ProtectedRoute>
  }
/>
<Route
  path="/my-applications"
  element={
    <ProtectedRoute allowedRoles={['exhibitor']}>
      <MyRegistrations />
    </ProtectedRoute>
  }
/>

      </Routes>

    </>
  );
}