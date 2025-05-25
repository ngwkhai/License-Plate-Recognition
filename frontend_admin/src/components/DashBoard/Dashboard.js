import React, { useEffect, useState } from 'react';
import { getLatestPlates, convertPlatesToStats } from '../../api/plates';
import { getStats } from '../../api/stats';
import TotalPlates from './TotalPlates';
import PlatesChart from './PlatesChart';
import LatestPlatesList from './LatestPlatesList';
import '../../style/Dashboard.css';

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [latestPlates, setLatestPlates] = useState([]);
  const [chartData, setChartData] = useState([]);

  useEffect(() => {
    async function fetchData() {
      try {
        const statsData = await getStats();
        setStats(statsData);

        const latest = await getLatestPlates();
        setLatestPlates(latest);

        // Chuyển đổi dữ liệu plates thành dạng thống kê cho biểu đồ
        const statsFromPlates = convertPlatesToStats(latest);
        setChartData(statsFromPlates);
      } catch (error) {
        console.error('Error fetching dashboard data', error);
      }
    }

    fetchData();
  }, []);

  if (!stats) return <div>Đang tải dữ liệu...</div>;

  return (
    <div className="dashboard-bg">
      <TotalPlates className="total-plates" count={stats.totalPlates} />
      <LatestPlatesList className="latest-plates-list" plates={latestPlates} />
      <PlatesChart className="plates-chart" rawData={chartData} />
    </div>
  );

  
}
