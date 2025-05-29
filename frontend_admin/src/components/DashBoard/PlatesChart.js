import React, { useState, useMemo } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import dayjs from "dayjs";

// Hàm tạo mảng số nguyên từ start đến end
const rangeArray = (start, end) => Array.from({ length: end - start + 1 }, (_, i) => i + start);

// Trả về số ngày trong tháng (dùng dayjs chuẩn, không tz)
const getDaysInMonth = (year, month) => dayjs(`${year}-${month}-01`).daysInMonth();

/**
 * Xử lý dữ liệu theo chu kỳ: day, month, year
 */
const getDataByPeriod = (rawData, period, year, month) => {
  const dataMap = new Map(rawData.map(({ date, count }) => [date, count]));
  const result = [];

  const formatDate = (y, m, d) =>
    `${y}-${String(m).padStart(2, "0")}-${String(d).padStart(2, "0")}`;

  if (period === "year") {
    for (let y = 2020; y <= new Date().getFullYear(); y++) {
      let sum = 0;
      for (let m = 1; m <= 12; m++) {
        const days = getDaysInMonth(y, m);
        for (let d = 1; d <= days; d++) {
          sum += dataMap.get(formatDate(y, m, d)) || 0;
        }
      }
      result.push({ date: y.toString(), count: sum });
    }
  } else if (period === "month") {
    for (let m = 1; m <= 12; m++) {
      let sum = 0;
      const days = getDaysInMonth(year, m);
      for (let d = 1; d <= days; d++) {
        sum += dataMap.get(formatDate(year, m, d)) || 0;
      }
      result.push({ date: m.toString(), count: sum });
    }
  } else if (period === "day") {
    const days = getDaysInMonth(year, month);
    for (let d = 1; d <= days; d++) {
      const key = formatDate(year, month, d);
      result.push({ date: d.toString(), count: dataMap.get(key) || 0 });
    }
  }

  return result;
};

export default function PlatesChart({ rawData }) {
  const now = dayjs();
  const currentYear = now.year();
  const currentMonth = now.month() + 1;

  const [period, setPeriod] = useState("day");
  const [year, setYear] = useState(currentYear);
  const [month, setMonth] = useState(currentMonth);

  const processedData = useMemo(
    () => getDataByPeriod(rawData, period, year, month),
    [rawData, period, year, month]
  );

  return (
    <div
      style={{
        width: "80%",
        maxWidth: 900,
        margin: "20px auto",
        padding: 20,
        backgroundColor: "white",
        borderRadius: 8,
        boxShadow: "0 0 10px rgba(0,0,0,0.1)",
        display: "flex",
        flexDirection: "column",
        gap: 20,
      }}
    >
      <h3 style={{ textAlign: "center" }}>
        Thống kê số lượng tra cứu biển số theo {period}
      </h3>

      {/* Controls chọn thời gian */}
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          gap: "12px",
          flexWrap: "wrap",
        }}
      >
        <select value={period} onChange={(e) => setPeriod(e.target.value)} style={{ padding: "6px 12px" }}>
          <option value="day">Theo Ngày</option>
          <option value="month">Theo Tháng</option>
          <option value="year">Theo Năm</option>
        </select>

        {(period === "day" || period === "month") && (
          <select value={year} onChange={(e) => setYear(Number(e.target.value))} style={{ padding: "6px 12px" }}>
            {rangeArray(2020, currentYear).map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>
        )}

        {period === "day" && (
          <select value={month} onChange={(e) => setMonth(Number(e.target.value))} style={{ padding: "6px 12px" }}>
            {rangeArray(1, 12).map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </select>
        )}
      </div>

      {/* Biểu đồ */}
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={processedData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" />
          <YAxis allowDecimals={false} domain={[0, "dataMax + 5"]} />
          <Tooltip />
          <Line
            type="monotone"
            dataKey="count"
            stroke="#007bff"
            strokeWidth={2}
            dot={{ r: 3 }}
            activeDot={{ r: 6 }}
            isAnimationActive={true}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
