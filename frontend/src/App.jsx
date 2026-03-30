import { GoogleOAuthProvider } from '@react-oauth/google';
import { AuthProvider } from './context/AuthContext'; // <--- 1. Import dòng này
import AppRouter from "./routes/AppRouter.jsx";
import { ConfigProvider } from 'antd';
import viVN from 'antd/locale/vi_VN';
import dayjs from 'dayjs';
import 'dayjs/locale/vi';
import './App.css';

// Set dayjs locale to Vietnamese
dayjs.locale('vi');

function App() {
  // Thay bằng Client ID thật của bạn
  const clientId = "574851867505-lg2cqa3t7bjpkb5augkq95t3bsvn88ss.apps.googleusercontent.com"; 

  return (
    <GoogleOAuthProvider clientId={clientId}>
      {/* 2. Bọc AuthProvider vào bên trong */}
      <AuthProvider>
        {/* 3. Bọc ConfigProvider để cung cấp locale cho tất cả Ant Design components */}
        <ConfigProvider locale={viVN}>
          <div className="App">
            <AppRouter />
          </div>
        </ConfigProvider>
      </AuthProvider>
    </GoogleOAuthProvider>
  );
}

export default App;