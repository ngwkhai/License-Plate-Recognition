import React, { useState, useEffect } from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

import { mockGetStats, subscribePlates } from '../../api/mockService.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

export default function PlatesChart() {
  const now = new Date();

  // Filter lựa chọn ngày tháng năm
  const [selectedYear, setSelectedYear] = useState(now.getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(null);
  const [selectedDay, setSelectedDay] = useState(null);

  // State xác định cấp độ thời gian (hour, day, month)
  const [timeUnit, setTimeUnit] = useState('month');

  // Dữ liệu thô (mảng { timestamp, count })
  const [rawData, setRawData] = useState([]);

  // Các năm để chọn
  const yearOptions = [];
  for (let y = now.getFullYear(); y >= now.getFullYear() - 5; y--) {
    yearOptions.push(y);
  }

  // Cập nhật timeUnit khi filter thay đổi
  useEffect(() => {
    if (selectedYear && selectedMonth && selectedDay) {
      setTimeUnit('hour');
    } else if (selectedYear && selectedMonth && !selectedDay) {
      setTimeUnit('day');
    } else if (selectedYear && !selectedMonth && !selectedDay) {
      setTimeUnit('month');
    }
  }, [selectedYear, selectedMonth, selectedDay]);

  // Fetch dữ liệu từ API khi mount
  useEffect(() => {
    let isMounted = true;

    const fetchData = async () => {
      try {
        const stats = await mockGetStats();
        if (isMounted && stats.plateCounts) {
          setRawData(stats.plateCounts);
        }
      } catch (error) {
        console.error('Lỗi khi lấy dữ liệu biểu đồ:', error);
      }
    };

    fetchData();

    return () => {
      isMounted = false;
    };
  }, []);

  // Cập nhật dữ liệu realtime qua subscribePlates
  useEffect(() => {
    // Hàm callback khi có plate mới
    const handleNewPlate = (newPlate) => {
      // newPlate chỉ có id, plateNumber, timestamp
      // Nhưng biểu đồ dựa vào plateCounts: [{ timestamp, count }], 
      // do đó ta cần cập nhật rawData phù hợp (tạm giản là fetch lại toàn bộ stats)
      // hoặc giả lập tăng count giờ hiện tại

      // Cách đơn giản: fetch lại toàn bộ dữ liệu stats mới
      mockGetStats().then((stats) => {
        if (stats.plateCounts) setRawData(stats.plateCounts);
      });
    };

    // Đăng ký nhận dữ liệu realtime
    const unsubscribe = subscribePlates(handleNewPlate);

    return () => {
      unsubscribe();
    };
  }, []);

  // Xử lý lọc và nhóm dữ liệu theo timeUnit, ngày tháng năm
  const [filteredData, setFilteredData] = useState([]);

  useEffect(() => {
    if (!Array.isArray(rawData)) return;

    const groupBy = {};

    rawData.forEach((item) => {
      const date = new Date(item.timestamp.replace(' ', 'T'));
      const count = item.count >= 0 ? item.count : 0;

      if (timeUnit === 'hour') {
        if (
          date.getFullYear() === selectedYear &&
          date.getMonth() + 1 === selectedMonth &&
          date.getDate() === selectedDay
        ) {
          const key = date.getHours().toString().padStart(2, '0') + ':00';
          groupBy[key] = (groupBy[key] || 0) + count;
        }
      } else if (timeUnit === 'day') {
        if (
          date.getFullYear() === selectedYear &&
          date.getMonth() + 1 === selectedMonth
        ) {
          const key = date.getDate().toString().padStart(2, '0');
          groupBy[key] = (groupBy[key] || 0) + count;
        }
      } else if (timeUnit === 'month') {
        if (date.getFullYear() === selectedYear) {
          const key = (date.getMonth() + 1).toString().padStart(2, '0');
          groupBy[key] = (groupBy[key] || 0) + count;
        }
      }
    });

    let fullLabels = [];

    if (timeUnit === 'hour') {
      fullLabels = Array.from({ length: 24 }, (_, i) =>
        i.toString().padStart(2, '0') + ':00'
      );
    } else if (timeUnit === 'day') {
      const daysInMonth = new Date(selectedYear, selectedMonth, 0).getDate();
      fullLabels = Array.from(
        { length: daysInMonth },
        (_, i) => (i + 1).toString().padStart(2, '0')
      );
    } else if (timeUnit === 'month') {
      fullLabels = Array.from({ length: 12 }, (_, i) =>
        (i + 1).toString().padStart(2, '0')
      );
    }

    const finalData = fullLabels.map((label) => ({
      time: label,
      count: groupBy[label] || 0,
    }));

    setFilteredData(finalData);
  }, [rawData, timeUnit, selectedYear, selectedMonth, selectedDay]);

  // Chuẩn bị data và options cho ChartJS
  const labels = filteredData.map((d) => d.time);
  const counts = filteredData.map((d) => d.count);

  const chartData = {
    labels,
    datasets: [
      {
        label: 'Số lượng xe nhận diện',
        data: counts,
        borderColor: 'rgb(75, 192, 192)',
        backgroundColor: 'rgba(75, 192, 192, 0.4)',
        fill: true,
        tension: 0.4,
        pointRadius: 3,
        borderWidth: 3,
      },
    ],
  };

  const options = {
    scales: {
      y: {
        beginAtZero: true,
        min: 0,
        ticks: { stepSize: 1 },
      },
    },
    responsive: true,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          usePointStyle: true,
          pointStyle: 'line',
          boxWidth: 20,
          boxHeight: 20,
          font: { size: 14 },
          borderWidth: 4,
        },
      },
      title: {
        display: true,
        text: 'Biểu đồ số lượng xe nhận diện theo thời gian',
      },
    },
  };

  return (
    <div style={{ width: '100%', maxWidth: 800 }}>
      <div style={{ marginBottom: 16 }}>
        <label htmlFor="selectYear">Chọn năm:&nbsp;</label>
        <select
          id="selectYear"
          value={selectedYear}
          onChange={(e) => {
            const y = Number(e.target.value);
            setSelectedYear(y);
            setSelectedMonth(null);
            setSelectedDay(null);
          }}
        >
          {yearOptions.map((y) => (
            <option key={y} value={y}>
              {y}
            </option>
          ))}
        </select>
      </div>

      <div style={{ marginBottom: 16 }}>
        <label htmlFor="selectMonth">Chọn tháng :&nbsp;</label>
        <select
          id="selectMonth"
          value={selectedMonth || ''}
          onChange={(e) => {
            const m = e.target.value === '' ? null : Number(e.target.value);
            setSelectedMonth(m);
            setSelectedDay(null);
          }}
        >
          <option value="">-- Chọn tháng --</option>
          {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
            <option key={m} value={m}>
              {m.toString().padStart(2, '0')}
            </option>
          ))}
        </select>
      </div>

      <div style={{ marginBottom: 16 }}>
        <label htmlFor="selectDay">Chọn ngày :&nbsp;</label>
        <select
          id="selectDay"
          value={selectedDay || ''}
          onChange={(e) => {
            const d = e.target.value === '' ? null : Number(e.target.value);
            setSelectedDay(d);
          }}
          disabled={!selectedMonth}
        >
          <option value="">-- Chọn ngày --</option>
          {selectedYear && selectedMonth
            ? Array.from(
                { length: new Date(selectedYear, selectedMonth, 0).getDate() },
                (_, i) => i + 1
              ).map((d) => (
                <option key={d} value={d}>
                  {d.toString().padStart(2, '0')}
                </option>
              ))
            : null}
        </select>
      </div>

      <Line data={chartData} options={options} />
    </div>
  );
}
