import React, { useState, useEffect, useRef } from 'react';
import { getStats } from '../../api/stats.js';

export default function TotalPlates() {
  const [count, setCount] = useState(0);
  // Lưu ngày hiện tại để so sánh
  const currentDateRef = useRef(new Date().toDateString());

  useEffect(() => {
    let isMounted = true;

    const fetchCount = async () => {
      try {
        const now = new Date();
        const todayStr = now.toDateString();

        // Nếu sang ngày mới => reset count
        if (currentDateRef.current !== todayStr) {
          currentDateRef.current = todayStr;
          setCount(0); // reset count
          // Hoặc có thể gọi lại API ngay để lấy số liệu mới ngày hôm nay:
          // const stats = await getStats();
          // if (isMounted) setCount(stats.totalPlates);
          return; // tránh gọi API ngay sau reset, hoặc có thể tuỳ bạn
        }

        const stats = await getStats();
        if (isMounted) {
          setCount(stats.totalPlates);
        }
      } catch (error) {
        console.error('Lỗi khi lấy tổng số biển số:', error);
      }
    };

    fetchCount();
    const interval = setInterval(fetchCount, 10000);

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  return (
    <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>
      Tổng số biển số đã nhận diện hôm nay: <strong>{count}</strong>
    </div>
  );
}
