import React from "react";
import "../../style/LatestPlatesList.css";

export default function LatestPlatesList({ plates }) {
  if (!plates || plates.length === 0) {
    return <div>Đang tải dữ liệu...</div>;
  }

  return (
    <>
      <h2 className="latest-plates-title">10 biển số tra cứu gần nhất</h2>

      <div className="latest-plates-container">
        {plates.map((plate) => {
          const key = plate.id || plate.lookup_time + plate.plate_number;
          return (
            <div key={key} className="flip-card">
              <div className="flip-card-inner">
                <div className="flip-card-front">{plate.plate_number}</div>
                <div className="flip-card-back">
                  {new Date(plate.lookup_time).toLocaleString()}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}
