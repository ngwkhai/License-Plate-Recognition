import React from "react";
import "../../style/TotalPlates.css"; 

export default function TotalPlates({ count }) {
  return (
    <div className="total-plates-blur-box">
      <h2>Tổng số biển số tra cứu: {count ?? "Đang tải..."}</h2>
    </div>
  );
}
