import React, { useState } from "react";
import axios from "axios";

const API_URL = "http://localhost:8001"; // Địa chỉ backend của bạn

export default function Login({ onLoginSuccess }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const formData = new URLSearchParams();
      formData.append("username", username);
      formData.append("password", password);

      const response = await axios.post(`${API_URL}/login`, formData, {
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
      });

      const { access_token } = response.data;

      // Lưu token nếu đăng nhập thành công
      localStorage.setItem("token", access_token);
      onLoginSuccess(); // Gọi callback khi thành công
    } catch (err) {
      if (err.response?.status === 401) {
        setError("Tên đăng nhập hoặc mật khẩu không đúng.");
      } else if (err.response?.status === 403) {
        setError("Tài khoản của bạn không có quyền truy cập.");
      } else {
        setError("Lỗi kết nối đến máy chủ. Vui lòng thử lại sau.");
      }
    }
  };

  return (
    <div style={{ maxWidth: 400, margin: "auto", padding: 20 }}>
      <h2>Đăng nhập</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Tên đăng nhập:</label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            autoFocus
          />
        </div>
        <div style={{ marginTop: 10 }}>
          <label>Mật khẩu:</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        {error && <p style={{ color: "red", marginTop: 10 }}>{error}</p>}
        <button type="submit" style={{ marginTop: 15 }}>
          Đăng nhập
        </button>
      </form>
    </div>
  );
}


