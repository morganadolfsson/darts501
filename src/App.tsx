import { Routes, Route } from 'react-router-dom';
import HomePage from './components/HomePage';
import SessionPage from './components/SessionPage';
import LocalGame from './components/LocalGame';
import './App.css';

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/session/:id" element={<SessionPage />} />
      <Route path="/local" element={<LocalGame />} />
    </Routes>
  );
}
