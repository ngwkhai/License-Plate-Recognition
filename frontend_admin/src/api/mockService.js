// src/api/mockService.js

// === Utility ===
function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomPlateNumber() {
  const province = Math.floor(Math.random() * 90) + 10; // 10 - 99
  const letter = String.fromCharCode(65 + Math.floor(Math.random() * 26)); // A-Z
  const numbers = Math.floor(1000 + Math.random() * 90000); // 4 đến 5 chữ số
  return `${province}${letter}-${numbers}`;
}

// === Generate Initial Data ===
function generateLatestPlates(count = 30) {
  const now = new Date();
  const plates = [];

  for (let i = 0; i < count; i++) {
    const timestamp = new Date(now.getTime() - i * 60000); // mỗi bản ghi cách nhau 1 phút
    plates.push({
      id: i + 1,
      plateNumber: randomPlateNumber(),
      timestamp: timestamp.toISOString().replace('T', ' ').substring(0, 19),
    });
  }

  return plates;
}

function generatePlateCounts(days = 14) {
  const plateCounts = [];
  const baseDate = new Date('2025-05-12T00:00:00');

  for (let dayOffset = 0; dayOffset < days; dayOffset++) {
    for (let hour = 0; hour < 24; hour++) {
      const date = new Date(baseDate);
      date.setDate(date.getDate() + dayOffset);
      date.setHours(hour, 0, 0, 0);

      plateCounts.push({
        timestamp: date.toISOString().replace('T', ' ').substring(0, 19),
        count: randomInt(0, 50),
      });
    }
  }

  return plateCounts;
}

// === Mock Data ===
export const latestPlatesMock = generateLatestPlates(30);
export const statsMock = {
  totalPlates: latestPlatesMock.length,
  plateCounts: generatePlateCounts(14),
};

// === Basic API-like methods ===
export const mockGetLatestPlates = () =>
  new Promise((resolve) => setTimeout(() => resolve(latestPlatesMock), 300));

export const mockSearchPlates = (filters) => {
  console.log('Mock search filters:', filters);
  return new Promise((resolve) => setTimeout(() => resolve(latestPlatesMock), 300));
};

export const mockGetStats = () =>
  new Promise((resolve) => setTimeout(() => resolve(statsMock), 300));

// === Real-time Simulation (every 10s) ===
let nextPlateId = latestPlatesMock.length + 1;
let subscribers = [];

export function subscribePlates(callback) {
  subscribers.push(callback);

  const interval = setInterval(() => {
    const timestamp = new Date().toISOString().replace('T', ' ').substring(0, 19);
    const newPlate = {
      id: nextPlateId++,
      plateNumber: randomPlateNumber(),
      timestamp,
    };

    // Thêm vào đầu danh sách mock
    latestPlatesMock.unshift(newPlate);
    statsMock.totalPlates++;

    // Gửi tới tất cả các callback
    subscribers.forEach((cb) => cb(newPlate));
  }, 10000); // mỗi 10s

  // Hàm hủy đăng ký
  return () => {
    clearInterval(interval);
    subscribers = subscribers.filter((cb) => cb !== callback);
  };
}
