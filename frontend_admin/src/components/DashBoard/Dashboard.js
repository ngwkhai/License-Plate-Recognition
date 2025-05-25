import React, { useEffect, useState, useCallback } from "react";
import {
  getLookupCountToday,
  getAdminLookupLogs,
  getLookupStats,
} from "../../api/admin";
import LatestPlatesList from "./LatestPlatesList";
import PlatesChart from "./PlatesChart";
import TotalPlates from "./TotalPlates";
import "../../style/Dashboard.css";

// Chuyển đổi logs thành dữ liệu biểu đồ
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

  const fetchDashboardData = useCallback(async () => {
    try {
      // Gọi song song để tối ưu tốc độ tải
      const [countRes, logsRes, statsRes] = await Promise.all([
        getLookupCountToday(),
        getAdminLookupLogs(100),
        getLookupStats(),
      ]);

      setCountToday(countRes);
      setLatestPlates(logsRes.slice(0, 10));
      setChartData(convertPlatesToStats(logsRes));
      setStats(statsRes);
    } catch (error) {
      console.error("Lỗi tải dữ liệu dashboard:", error);
    }
  }, []);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    if (onLogout) onLogout();
  };

  if (!stats?.length) return <div>Đang tải dữ liệu...</div>;

  return (
    <div className="dashboard-bg">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h2>Tổng số biển số tra cứu hôm nay: {countToday ?? "Đang tải..."}</h2>
        <button onClick={handleLogout}>Đăng xuất</button>
      </div>

      {/* Nếu backend không trả về tổng cộng, ta có thể tính tay */}
      <TotalPlates
        count={stats.reduce((acc, cur) => acc + (cur.count || 0), 0)}
      />

      <LatestPlatesList plates={latestPlates} />

      <PlatesChart rawData={chartData} />
    </div>
  );
}
