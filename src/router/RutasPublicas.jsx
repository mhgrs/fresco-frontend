import { Routes, Route, Navigate } from 'react-router-dom';
import Login from '../components/Login';
import Registro from '../components/Registro';
import VerificarEmail from '../components/VerificarEmail';
import RecuperarContrasena from '../components/RecuperarContrasena';
import ResetPassword from '../components/ResetPassword';
import LandingPage from '../components/LandingPage';
import AdminRedirect from '../components/layout/AdminRedirect';
import TerminosCondiciones from '../components/TerminosCondiciones';
import PoliticaPrivacidad from '../components/PoliticaPrivacidad';

/**
 * Rutas accesibles sin sesión iniciada.
 * Props: onLogin(usuario) — callback al completar login
 */
export default function RutasPublicas({ onLogin }) {
  return (
    <Routes>
      <Route path="/fresco-login" element={<Login onLogin={onLogin} />} />
      <Route path="/registro" element={<Registro />} />
      <Route path="/verificar-email/:token" element={<VerificarEmail />} />
      <Route path="/recuperar-contrasena" element={<RecuperarContrasena />} />
      <Route path="/reset-password/:token" element={<ResetPassword />} />
      <Route path="/terminos" element={<TerminosCondiciones />} />
      <Route path="/privacidad" element={<PoliticaPrivacidad />} />
      <Route path="/" element={<LandingPage usuario={null} />} />
      <Route path="/fresco-admin/*" element={<AdminRedirect />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
