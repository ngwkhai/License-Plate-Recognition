import React, { useState, useEffect, useRef } from 'react';
import '../../style/LatestPlatesList.css';

import { getLatestPlates, subscribePlates } from '../../api/plates.js';

function LatestPlatesList({ plates, onHovering }) {
  const latest10 = plates
    .slice()
    .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
    .slice(0, 10);

  return (
    <div>
      <h3>Biển số nhận diện gần nhất</h3>
      <div className="latest-plates-container">
        {latest10.map((plate) => (
          <div
            key={plate.id}
            className="plate-card"
            onMouseEnter={() => onHovering(true)}
            onMouseLeave={() => onHovering(false)}
          >
            <div className="flip-card-inner">
              <div className="flip-card-front">{plate.plateNumber}</div>
              <div className="flip-card-back">
                {new Date(plate.timestamp).toLocaleString()}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function LatestPlatesComponent() {
  const [plates, setPlates] = useState([]);
  const isHoveringRef = useRef(false);
  const platesRef = useRef(plates);

  useEffect(() => {
    platesRef.current = plates;
  }, [plates]);

  // Lấy dữ liệu ban đầu với polling
  useEffect(() => {
    let isMounted = true;

    const updateData = async () => {
      if (!isMounted) return;
      if (isHoveringRef.current) return;

      try {
        const newData = await getLatestPlates();

        const currentPlates = platesRef.current;
        const maxOldTimestamp = currentPlates.length
          ? new Date(
              Math.max(...currentPlates.map((p) => new Date(p.timestamp).getTime()))
            )
          : new Date(0);

        const newPlates = newData.filter(
          (p) => new Date(p.timestamp) > maxOldTimestamp
        );

        if (newPlates.length > 0) {
          setPlates((prev) => {
            const existingIds = new Set(prev.map((p) => p.id));
            const filteredNew = newPlates.filter((p) => !existingIds.has(p.id));
            return [...filteredNew, ...prev];
          });
        }
      } catch (error) {
        console.error('Lỗi khi lấy dữ liệu biển số:', error);
      }
    };

    updateData();
    const interval = setInterval(updateData, 2000);

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  // Đăng ký realtime cập nhật
  useEffect(() => {
    const unsubscribe = subscribePlates((newPlate) => {
      setPlates((prev) => {
        // Nếu đã có id này rồi thì không thêm
        if (prev.find((p) => p.id === newPlate.id)) return prev;
        return [newPlate, ...prev];
      });
    });

    return () => {
      unsubscribe();
    };
  }, []);

  const handleHovering = (hovering) => {
    isHoveringRef.current = hovering;
  };

  return <LatestPlatesList plates={plates} onHovering={handleHovering} />;
}
