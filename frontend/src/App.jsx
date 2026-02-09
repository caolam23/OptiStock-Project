import { GoogleOAuthProvider } from '@react-oauth/google';
import { AuthProvider } from './context/AuthContext'; // <--- 1. Import dòng này
import AppRouter from "./routes/AppRouter.jsx";
import './App.css';

function App() {
  // Thay bằng Client ID thật của bạn
  const clientId = "YOUR_GOOGLE_CLIENT_ID_HERE"; 

  return (
    <GoogleOAuthProvider clientId={clientId}>
      {/* 2. Bọc AuthProvider vào bên trong */}
      <AuthProvider>
        <div className="App">
          <AppRouter />
        </div>
      </AuthProvider>
    </GoogleOAuthProvider>
  );
}

export default App;