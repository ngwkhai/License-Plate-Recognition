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

// Tạo mảng số nguyên từ start đến end
const rangeArray = (start, end) =>
  Array.from({ length: end - start + 1 }, (_, i) => i + start);

// Hàm lấy số ngày trong tháng của năm cụ thể
const getDaysInMonth = (year, month) => new Date(year, month, 0).getDate();

/**
 * Xử lý dữ liệu theo chu kỳ (period)
 * @param {Array} rawData - Dữ liệu thô dạng [{ date: "YYYY-MM-DD", count: number }, ...]
 * @param {string} period - "day", "month", hoặc "year"
 * @param {number} year - Năm dùng để lọc
 * @param {number} month - Tháng dùng để lọc (chỉ khi period === "day")
 * @returns {Array} Mảng dữ liệu dạng [{ date: "label", count: tổng }, ...]
 */
const getDataByPeriod = (rawData, period, year, month) => {
  // Tạo Map để tra cứu nhanh theo date
  const dataMap = new Map(rawData.map(({ date, count }) => [date, count]));
  const result = [];

  if (period === "year") {
    const currentYear = new Date().getFullYear();
    for (let y = 2020; y <= currentYear; y++) {
      let sum = 0;
      for (let m = 1; m <= 12; m++) {
        const daysInMonth = getDaysInMonth(y, m);
        const prefix = `${y}-${String(m).padStart(2, "0")}`;
        for (let d = 1; d <= daysInMonth; d++) {
          const key = `${prefix}-${String(d).padStart(2, "0")}`;
          sum += dataMap.get(key) || 0;
        }
      }
      result.push({ date: y.toString(), count: sum });
    }
  } else if (period === "month") {
    for (let m = 1; m <= 12; m++) {
      const daysInMonth = getDaysInMonth(year, m);
      const prefix = `${year}-${String(m).padStart(2, "0")}`;
      let sum = 0;
      for (let d = 1; d <= daysInMonth; d++) {
        const key = `${prefix}-${String(d).padStart(2, "0")}`;
        sum += dataMap.get(key) || 0;
      }
      result.push({ date: m.toString(), count: sum });
    }
  } else if (period === "day") {
    const daysInMonth = getDaysInMonth(year, month);
    for (let d = 1; d <= daysInMonth; d++) {
      const key = `${year}-${String(month).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
      result.push({ date: d.toString(), count: dataMap.get(key) || 0 });
    }
  }

  return result;
};

export default function PlatesChart({ rawData }) {
  const currentYear = new Date().getFullYear();
  const [period, setPeriod] = useState("day");
  const [year, setYear] = useState(currentYear);
  const [month, setMonth] = useState(new Date().getMonth() + 1);

  // Tính lại dữ liệu khi có sự thay đổi tham số
  const processedData = useMemo(() => getDataByPeriod(rawData, period, year, month), [
    rawData,
    period,
    year,
    month,
  ]);

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
        <select
          value={period}
          onChange={(e) => setPeriod(e.target.value)}
          style={{ padding: "6px 12px" }}
        >
          <option value="day">Theo Ngày</option>
          <option value="month">Theo Tháng</option>
          <option value="year">Theo Năm</option>
        </select>

        {(period === "day" || period === "month") && (
          <select
            value={year}
            onChange={(e) => setYear(Number(e.target.value))}
            style={{ padding: "6px 12px" }}
          >
            {rangeArray(2020, currentYear).map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>
        )}

        {period === "day" && (
          <select
            value={month}
            onChange={(e) => setMonth(Number(e.target.value))}
            style={{ padding: "6px 12px" }}
          >
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
        <LineChart data={processedData} style={{ backgroundColor: "white" }}>
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
