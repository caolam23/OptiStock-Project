import { useState } from 'react';
import axios from 'axios';
import { Button, Card, Typography, Alert, Spin } from 'antd'; // Thư viện giao diện đẹp

const { Title, Text } = Typography;

function App() {
  const [status, setStatus] = useState(null); // 'success' hoặc 'error'
  const [message, setMessage] = useState("Chưa kết nối...");
  const [loading, setLoading] = useState(false);

  // Hàm gọi điện cho Backend
  const handleTestConnection = async () => {
    setLoading(true);
    setStatus(null);
    try {
      // Gọi vào API test mà bạn vừa tạo ở Backend
      const response = await axios.get('http://localhost:8080/api/v1/test');
      
      // Nếu gọi thành công:
      setMessage(response.data.message); // Lấy dòng chữ "KẾT NỐI THÀNH CÔNG..." từ Java
      setStatus("success");
    } catch (error) {
      // Nếu thất bại:
      console.error(error);
      setMessage("Không thể kết nối tới Backend! (Kiểm tra lại xem Java chạy chưa)");
      setStatus("error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: '#f0f2f5' }}>
      <Card style={{ width: 500, textAlign: 'center', boxShadow: '0 4px 8px rgba(0,0,0,0.1)' }}>
        <Title level={3}>🚀 OptiStock Connection Test</Title>
        
        <div style={{ margin: '20px 0' }}>
          {loading ? (
            <Spin size="large" tip="Đang gọi Server..." />
          ) : (
            status && (
              <Alert
                message={status === 'success' ? "Thành Công!" : "Thất Bại"}
                description={message}
                type={status}
                showIcon
              />
            )
          )}
          
          {!status && !loading && <Text type="secondary">{message}</Text>}
        </div>

        <Button 
          type="primary" 
          size="large" 
          onClick={handleTestConnection} 
          loading={loading}
          style={{ width: '100%' }}
        >
          PING SERVER JAVA
        </Button>
      </Card>
    </div>
  );
}

export default App;