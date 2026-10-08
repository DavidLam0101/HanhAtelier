import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar.jsx';
import Footer from './components/Footer.jsx';
import BookButton from './components/BookButton.jsx';
import Toast from './components/Toast.jsx';
import Home from './pages/Home.jsx';
import Profile from './pages/Profile.jsx';

export default function App() {
  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/profile" element={<Profile />} />
      </Routes>
      <Footer />
      {/* Rendered outside the routes so it stays fixed on every page */}
      <BookButton />
      <Toast />
    </>
  );
}
