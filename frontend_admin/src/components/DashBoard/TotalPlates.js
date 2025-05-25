import React from "react";

export default function TotalPlates({ count }) {
  return (
    <div>
      <h2>Tổng số biển số tra cứu: {count ?? "Đang tải..."}</h2>
    </div>
  );
}
