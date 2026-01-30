import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Login from './pages/Login';
import Signup from './pages/Signup';
import ForgotPassword from './pages/ForgotPassword';
import Cart from './pages/Cart';
import Compare from './pages/Compare';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { CompareProvider } from './context/CompareContext';

import CategoryProducts from './pages/CategoryProducts';

function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <CompareProvider>
          <Router>
            <div className="app">
              <Navbar />
              <main className="container" style={{ marginTop: '2rem', paddingBottom: '2rem' }}>
                <Routes>
                  <Route path="/" element={<Home />} />
                  <Route path="/mobiles" element={<CategoryProducts categoryName="Mobiles" />} />
                  <Route path="/laptops" element={<CategoryProducts categoryName="Laptops" />} />
                  <Route path="/accessories" element={<CategoryProducts categoryName="Accessories" />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/signup" element={<Signup />} />
                  <Route path="/cart" element={<Cart />} />
                  <Route path="/compare" element={<Compare />} />
                  <Route path="/forgot-password" element={<ForgotPassword />} />
                </Routes>
              </main>
            </div>
          </Router>
        </CompareProvider>
      </CartProvider>
    </AuthProvider>
  );
}

export default App;
