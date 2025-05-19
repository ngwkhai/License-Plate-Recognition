import React, { useEffect, useState } from 'react';
import { getLatestPlates, convertPlatesToStats } from '../../api/plates';
import { getStats } from '../../api/stats';
import TotalPlates from './TotalPlates';
import PlatesChart from './PlatesChart';
import LatestPlatesList from './LatestPlatesList';

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
    <div>
      <TotalPlates count={stats.totalPlates} />
      <LatestPlatesList plates={latestPlates} />
      <PlatesChart rawData={chartData} />
    </div>
  );
}
