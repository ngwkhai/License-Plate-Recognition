import React, { useEffect, useRef, useState } from "react";
import "../../style/ManagerPlates.css";
import axios from "axios";
import dayjs from "dayjs";

export default function LookupLogsTable({ externalLogs = [], onDelete }) {
  const [logs, setLogs] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const prevExternalLogsRef = useRef([]);

  useEffect(() => {
    const prevLogs = prevExternalLogsRef.current;
    const isDifferent =
      externalLogs.length !== prevLogs.length ||
      externalLogs.some((log, i) => log.id !== prevLogs[i]?.id);

    if (isDifferent) {
      setLogs(externalLogs);
      const newTotalPages = Math.ceil(externalLogs.length / itemsPerPage);
      setCurrentPage((curr) => Math.min(curr, newTotalPages) || 1);
      prevExternalLogsRef.current = externalLogs;
    }
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
      if (onDelete) onDelete(id);
    } catch (error) {
      console.error("Xóa bản ghi thất bại", error);
      alert("Xóa bản ghi thất bại");
    }
  }

  // Format thời gian lookup_time bình thường, không chuyển múi giờ
  const formatLookupTime = (timeString) =>
    dayjs(timeString).format("DD/MM/YYYY HH:mm:ss");

  const filteredLogs = logs.filter((log) =>
    log.plate_number.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.ceil(filteredLogs.length / itemsPerPage);
  const currentLogs = filteredLogs.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );
  const emptyRowsCount = itemsPerPage - currentLogs.length;

  const goToPrevious = () => setCurrentPage((p) => Math.max(p - 1, 1));
  const goToNext = () => setCurrentPage((p) => Math.min(p + 1, totalPages));

  return (
    <div className="logs-container">
      <h3>Danh sách biển số đã tra cứu</h3>

      <input
        type="text"
        placeholder="Tìm kiếm theo biển số..."
        value={searchTerm}
        onChange={(e) => {
          setSearchTerm(e.target.value);
          setCurrentPage(1);
        }}
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
            {currentLogs.length === 0 ? (
              <tr>
                <td colSpan="4" style={{ textAlign: "center", padding: 20 }}>
                  Không có dữ liệu
                </td>
              </tr>
            ) : (
              <>
                {currentLogs.map((log) => (
                  <tr key={log.id}>
                    <td>{log.id}</td>
                    <td>{log.plate_number}</td>
                    <td>{formatLookupTime(log.lookup_time)}</td>
                    <td>
                      <button onClick={() => handleDelete(log.id)}>Xóa</button>
                    </td>
                  </tr>
                ))}
                {emptyRowsCount > 0 &&
                  [...Array(emptyRowsCount)].map((_, idx) => (
                    <tr key={"empty_" + idx} style={{ height: 40 }}>
                      <td>&nbsp;</td>
                      <td></td>
                      <td></td>
                      <td></td>
                    </tr>
                  ))}
              </>
            )}
          </tbody>
        </table>
      </div>

      <div style={{ marginTop: 15, textAlign: "center" }}>
        <button onClick={goToPrevious} disabled={currentPage === 1}>
          Previous
        </button>
        <span style={{ margin: "0 10px" }}>
          Page {currentPage} / {totalPages}
        </span>
        <button onClick={goToNext} disabled={currentPage === totalPages}>
          Next
        </button>
      </div>
    </div>
  );
}
