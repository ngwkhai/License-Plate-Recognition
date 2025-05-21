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
  const [selectedYear, setSelectedYear] = useState(now.getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(null);
  const [selectedDay, setSelectedDay] = useState(null);
  const [timeUnit, setTimeUnit] = useState('month');
  const [rawData, setRawData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [animatedData, setAnimatedData] = useState([]);

  const whiteBackgroundPlugin = {
    id: 'whiteBackground',
    beforeDraw: (chart) => {
      const { ctx, width, height } = chart;
      ctx.save();
      ctx.globalCompositeOperation = 'destination-over';
      ctx.fillStyle = 'white';
      ctx.fillRect(0, 0, width, height);
      ctx.restore();
    },
  };

  useEffect(() => {
    if (selectedYear && selectedMonth && selectedDay) setTimeUnit('hour');
    else if (selectedYear && selectedMonth) setTimeUnit('day');
    else setTimeUnit('month');
  }, [selectedYear, selectedMonth, selectedDay]);

  useEffect(() => {
    let mounted = true;
    mockGetStats().then((stats) => {
      if (mounted && stats.plateCounts) setRawData(stats.plateCounts);
    });
    return () => (mounted = false);
  }, []);

  useEffect(() => {
    const unsubscribe = subscribePlates(() => {
      mockGetStats().then((stats) => {
        if (stats.plateCounts) setRawData(stats.plateCounts);
      });
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const group = {};
    rawData.forEach(({ timestamp, count }) => {
      const date = new Date(timestamp.replace(' ', 'T'));
      const c = count >= 0 ? count : 0;
      let key = '';

      if (timeUnit === 'hour' && matchDate(date, selectedYear, selectedMonth, selectedDay)) {
        key = date.getHours().toString().padStart(2, '0') + ':00';
      } else if (timeUnit === 'day' && matchDate(date, selectedYear, selectedMonth)) {
        key = date.getDate().toString().padStart(2, '0');
      } else if (timeUnit === 'month' && date.getFullYear() === selectedYear) {
        key = (date.getMonth() + 1).toString().padStart(2, '0');
      }

      if (key) group[key] = (group[key] || 0) + c;
    });

    const labels = generateLabels(timeUnit, selectedYear, selectedMonth);
    const final = labels.map((label) => ({ time: label, count: group[label] || 0 }));
    setFilteredData(final);
  }, [rawData, timeUnit, selectedYear, selectedMonth, selectedDay]);

  useEffect(() => {
    if (!filteredData.length) return;
    const target = filteredData.map((d) => d.count);
    let start = 0;
    const duration = 1000;
    let id;

    const animate = (t) => {
      if (!start) start = t;
      const progress = Math.min((t - start) / duration, 1);
      setAnimatedData(target.map((v) => Math.floor(v * progress)));
      if (progress < 1) id = requestAnimationFrame(animate);
    };

    id = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(id);
  }, [filteredData]);

  const labels = filteredData.map((d) => d.time);
  const maxCount = Math.max(...animatedData, 10);
  const step = Math.ceil(maxCount / 9);
  const maxY = step * 9;

  const chartData = {
    labels,
    datasets: [
      {
        label: 'Số lượng xe nhận diện',
        data: animatedData,
        borderColor: 'rgb(75, 192, 192)',
        backgroundColor: 'rgba(75, 192, 192, 0.4)',
        fill: true,
        tension: 0.4,
        pointRadius: 3,
        borderWidth: 3,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    animation: { duration: 1500, easing: 'easeOutQuart' },
    scales: {
      y: {
        beginAtZero: true,
        min: 0,
        max: maxY,
        ticks: { stepSize: step },
      },
    },
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          usePointStyle: true,
          pointStyle: 'line',
          boxWidth: 20,
          font: { size: 14 },
        },
      },
      title: {
        display: true,
        text: 'Biểu đồ số lượng xe nhận diện theo thời gian',
      },
    },
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', padding: 24 }}>
      <div style={{ maxWidth: 800, width: '100%' }}>
        <div
          style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20, flexWrap: 'wrap' }}
        >
          <span style={{ fontWeight: 'bold', color: 'black', backgroundColor: '#f0f0f0', padding: '4px 8px', borderRadius: '4px' }}>
            Chọn thời gian:
          </span>


          <select value={selectedYear} onChange={(e) => handleYearChange(e)}>
            {Array.from({ length: 6 }, (_, i) => now.getFullYear() - i).map((y) => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>

          <select value={selectedMonth || ''} onChange={(e) => handleMonthChange(e)}>
            <option value="">-- Tháng --</option>
            {Array.from({ length: 12 }, (_, i) => (
              <option key={i + 1} value={i + 1}>{(i + 1).toString().padStart(2, '0')}</option>
            ))}
          </select>

          <select
            value={selectedDay || ''}
            onChange={(e) => setSelectedDay(e.target.value ? Number(e.target.value) : null)}
            disabled={!selectedMonth}
          >
            <option value="">-- Ngày --</option>
            {selectedYear && selectedMonth &&
              Array.from({ length: new Date(selectedYear, selectedMonth, 0).getDate() }, (_, i) => (
                <option key={i + 1} value={i + 1}>{(i + 1).toString().padStart(2, '0')}</option>
              ))}
          </select>
        </div>

        <Line data={chartData} options={chartOptions} plugins={[whiteBackgroundPlugin]} />
      </div>
    </div>
  );

  function handleYearChange(e) {
    const y = Number(e.target.value);
    setSelectedYear(y);
    setSelectedMonth(null);
    setSelectedDay(null);
  }

  function handleMonthChange(e) {
    const m = e.target.value === '' ? null : Number(e.target.value);
    setSelectedMonth(m);
    setSelectedDay(null);
  }

  function matchDate(date, year, month, day = null) {
    return (
      date.getFullYear() === year &&
      date.getMonth() + 1 === month &&
      (day === null || date.getDate() === day)
    );
  }

  function generateLabels(unit, year, month) {
    if (unit === 'hour') return Array.from({ length: 24 }, (_, i) => `${i.toString().padStart(2, '0')}:00`);
    if (unit === 'day') {
      const days = new Date(year, month, 0).getDate();
      return Array.from({ length: days }, (_, i) => (i + 1).toString().padStart(2, '0'));
    }
    return Array.from({ length: 12 }, (_, i) => (i + 1).toString().padStart(2, '0'));
  }
}
