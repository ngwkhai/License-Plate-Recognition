import React, { useEffect, useState } from "react";
import "../../style/ManagerPlates.css";
import axios from "axios";

export default function LookupLogsTable({ externalLogs = [], onDelete }) {
  const [logs, setLogs] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");

  // Cập nhật logs khi externalLogs thay đổi
  useEffect(() => {
    setLogs(externalLogs);
  }, [externalLogs]);

  async function handleDelete(id) {
    if (!window.confirm("Bạn có chắc muốn xóa bản ghi này không?")) return;

    try {
      const token = localStorage.getItem("token");
      await axios.delete(`http://localhost:8001/admin/lookup_logs/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setLogs((prev) => prev.filter((log) => log.id !== id));
      if (onDelete) onDelete(id); // Gọi callback nếu có
    } catch (error) {
      console.error("Xóa bản ghi thất bại", error);
      alert("Xóa bản ghi thất bại");
    } 
  }

  const filteredLogs = logs.filter((log) =>
    log.plate_number.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="logs-container">
      <h3>Danh sách biển số đã tra cứu</h3>

      <input
        type="text"
        placeholder="Tìm kiếm theo biển số..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="logs-search-input"
      />

      <div className="logs-table-wrapper">
        <table className="logs-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Biển số</th>
              <th>Thời gian tra cứu</th>
              <th>Hành động</th>
            </tr>
          </thead>
          <tbody>
            {filteredLogs.length === 0 ? (
              <tr>
                <td colSpan="4" style={{ textAlign: "center", padding: 20 }}>
                  Không có dữ liệu
                </td>
              </tr>
            ) : (
              filteredLogs.map((log) => (
                <tr key={log.id}>
                  <td>{log.id}</td>
                  <td>{log.plate_number}</td>
                  <td>{new Date(log.lookup_time).toLocaleString()}</td>
                  <td>
                    <button onClick={() => handleDelete(log.id)}>Xóa</button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
