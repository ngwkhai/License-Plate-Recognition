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

function rangeArray(start, end) {
  const arr = [];
  for (let i = start; i <= end; i++) arr.push(i);
  return arr;
}

function getDataByPeriod(rawData, period, year, month) {
  const dataMap = new Map();

  rawData.forEach(({ date, count }) => {
    dataMap.set(date, count);
  });

  const result = [];

  if (period === "year") {
    const currentYear = new Date().getFullYear();
    for (let y = 2020; y <= currentYear; y++) {
      let sum = 0;
      for (let m = 1; m <= 12; m++) {
        const prefix = `${y}-${m.toString().padStart(2, "0")}`;
        for (let d = 1; d <= 31; d++) {
          const key = `${prefix}-${d.toString().padStart(2, "0")}`;
          if (dataMap.has(key)) sum += dataMap.get(key);
        }
      }
      result.push({ date: y.toString(), count: sum });
    }
  } else if (period === "month") {
    for (let m = 1; m <= 12; m++) {
      const prefix = `${year}-${m.toString().padStart(2, "0")}`;
      let sum = 0;
      for (let d = 1; d <= 31; d++) {
        const key = `${prefix}-${d.toString().padStart(2, "0")}`;
        if (dataMap.has(key)) sum += dataMap.get(key);
      }
      result.push({ date: m.toString(), count: sum });
    }
  } else if (period === "day") {
    const daysInMonth = new Date(year, month, 0).getDate();
    for (let d = 1; d <= daysInMonth; d++) {
      const key = `${year}-${month.toString().padStart(2, "0")}-${d
        .toString()
        .padStart(2, "0")}`;
      const count = dataMap.get(key) || 0;
      result.push({ date: d.toString(), count });
    }
  }

  return result;
}

export default function PlatesChart({ rawData }) {
  const currentYear = new Date().getFullYear();

  const [period, setPeriod] = useState("day");
  const [year, setYear] = useState(currentYear);
  const [month, setMonth] = useState(new Date().getMonth() + 1);

  const processedData = useMemo(
    () => getDataByPeriod(rawData, period, year, month),
    [rawData, period, year, month]
  );

  return (
    <div
      style={{
        width: "80%",
        maxWidth: 900,
        margin: "20px auto", // căn giữa ngang trang
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
          <option value="day">Ngày</option>
          <option value="month">Tháng</option>
          <option value="year">Năm</option>
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

      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={processedData} style={{ backgroundColor: "white" }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" />
          <YAxis allowDecimals={false} domain={["dataMin + 0", "dataMax + 5"]} />
          <Tooltip />
          <Line
            type="monotone"
            dataKey="count"
            stroke="#007bff"
            strokeWidth={2}
            dot={{ r: 3 }}
            activeDot={{ r: 6 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
