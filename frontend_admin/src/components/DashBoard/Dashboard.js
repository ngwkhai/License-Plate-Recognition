import React, { useEffect, useState, useCallback } from "react";
import {
  getLookupCountToday,
  getAdminLookupLogs,
  getLookupStats,
} from "../../api/admin";
import LatestPlatesList from "./LatestPlatesList";
import PlatesChart from "./PlatesChart";
import TotalPlates from "./TotalPlates";
import LookupLogsTable from "./ManagerPlates";

import "../../style/Dashboard.css";

// Convert logs thành dữ liệu thống kê
const convertPlatesToStats = (logs) => {
  const counts = logs.reduce((acc, { lookup_time }) => {
    const date = new Date(lookup_time).toISOString().slice(0, 10);
    acc[date] = (acc[date] || 0) + 1;
    return acc;
  }, {});
  return Object.entries(counts).map(([date, count]) => ({ date, count }));
};

export default function Dashboard({ onLogout }) {
  const [countToday, setCountToday] = useState(null);
  const [latestPlates, setLatestPlates] = useState([]);
  const [stats, setStats] = useState([]);
  const [chartData, setChartData] = useState([]);
  const [allLogs, setAllLogs] = useState([]); 

  // Hàm fetch dữ liệu dashboard
  const fetchDashboardData = useCallback(async () => {
    try {
      const [countRes, logsRes, statsRes] = await Promise.all([
        getLookupCountToday(),
        getAdminLookupLogs(100),
        getLookupStats(),
      ]);

      setCountToday(countRes);
      setLatestPlates(logsRes.slice(0, 10));
      setAllLogs(logsRes);
      setChartData(convertPlatesToStats(logsRes));
      setStats(statsRes);
    } catch (error) {
      console.error("Lỗi tải dữ liệu dashboard:", error);
    }
  }, []);

  // Tải dữ liệu lần đầu và bắt đầu polling
  useEffect(() => {
    fetchDashboardData();
    const interval = setInterval(fetchDashboardData, 1000); // cập nhật mỗi 1 giây

    return () => clearInterval(interval);
  }, [fetchDashboardData]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    window.location.assign("http://localhost:3000",)

  };

  if (!stats?.length) return <div>Đang tải dữ liệu...</div>;

  return (
    <div className="dashboard-bg">
      <div className="horizontal-container">
        <TotalPlates
          count={stats.reduce((acc, cur) => acc + (cur.count || 0), 0)}
        />
        <button className="logout-button" onClick={handleLogout}>Đăng xuất</button>
      </div>

      <div className="blur-box" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h2>Tổng số biển số tra cứu hôm nay: {countToday ?? "Đang tải..."}</h2>
      </div>

      <LatestPlatesList plates={latestPlates} />
      <PlatesChart rawData={chartData} />

      {/* Truyền toàn bộ logs sang bảng */}
      <LookupLogsTable externalLogs={allLogs} />
    </div>
  );
}
