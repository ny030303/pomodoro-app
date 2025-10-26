export const initialRecentActivity = [
  { id: 1, text: "25분 집중 완료. 솔라나에 증명 기록됨.", link: "https://solscan.io/", timestamp: new Date(Date.now() - 3600 * 1000 * 2) },
  { id: 2, text: "5분 휴식 완료.", link: null, timestamp: new Date(Date.now() - 3600 * 1000 * 2.5) },
  { id: 3, text: "25분 집중 완료. 솔라나에 증명 기록됨.", link: "https://solscan.io/", timestamp: new Date(Date.now() - 3600 * 1000 * 5) },
  { id: 4, text: "업적 달성: 첫 10 뽀모도로!", link: null, timestamp: new Date(Date.now() - 3600 * 1000 * 24) },
  { id: 5, text: "25분 집중 완료. 솔라나에 증명 기록됨.", link: "https://solscan.io/", timestamp: new Date(Date.now() - 3600 * 1000 * 48) },
];

export const mockAchievements = [
  { id: 1, title: "첫 발걸음", description: "첫 뽀모도로 세션을 완료했습니다.", earned: true, date: "2023-10-01", tx: "4sf...j9x" },
  { id: 2, title: "집중의 맛", description: "첫 10 뽀모도로를 달성했습니다.", earned: true, date: "2023-10-03", tx: "8as...k2p" },
  { id: 3, title: "꾸준함의 증표", description: "연속 7일 집중했습니다.", earned: true, date: "2023-10-07", tx: "9df...l5o" },
  { id: 4, title: "마라토너", description: "하루에 8 세션을 완료했습니다.", earned: false, date: null, tx: null },
  { id: 5, title: "블록체인 탐험가", description: "총 50개의 증명을 블록체인에 기록했습니다.", earned: false, date: null, tx: null },
  { id: 6, title: "주간 목표 챔피언", description: "주간 목표를 4주 연속 달성했습니다.", earned: false, date: null, tx: null },
];

export const mockLeaderboard = [
  { rank: 1, user: "5x...7yZ", sessions: 184 },
  { rank: 2, user: "9A...c3F", sessions: 172 },
  { rank: 3, user: "user.sol", sessions: 155 },
  { rank: 4, user: "YOU", sessions: 140 },
  { rank: 5, user: "3p...q8R", sessions: 121 },
  { rank: 6, user: "hJ...mN2", sessions: 98 },
  { rank: 7, user: "kL...tY9", sessions: 85 },
];

export const storeCharacterboard = [
  {
    itemId: 1,
    price: 200,
    name: "Cat",
    description: "귀여운 치즈 고양이",
    dir: "/assets/Cat/Cat_texture/Gemini_Generated_Image_6153bl6153bl6153/",
    url: "/assets/Cat/Cat_", // 스켈레톤은 공통일 수 있음
    parts: ["head", "body", "ear_left", "ear_right", "tail", "eye_left", "eye_right", "nose"],
    position: { x: 0, y: 0 },
    width: 180,
    height: 180,
    scale: 0.5,
    initialAnimation: "idle",
    onLoaded: () => console.log("Cat loaded!"),
    onError: (err) => console.error("Cat error:", err),
  },
  {
    itemId: 2,
    price: 200,
    name: "Rabbit",
    description: "귀여운 갈색 토끼",
    dir: "/assets/Rabbit/Rabbit_texture/Gemini_Generated_Image_v0ukfxv0ukfxv0uk/",
    url: "/assets/Rabbit/Rabbit_",
    parts: ["head", "body", "ear_left", "ear_right", "tail"],
    width: 180,
    height: 180,
    position: { x: 0, y: 0 },
    initialAnimation: "idle",
    scale: 0.5,
    onLoaded: () => console.log("Rabbit loaded!"),
    onError: (err) => console.error("Rabbit error:", err),
  },];

export const mockHeatmapData = () => {
  const data = {};
  const today = new Date();
  for (let i = 0; i < 365; i++) {
    const date = new Date(today);
    date.setDate(today.getDate() - i);
    const dateString = date.toISOString().split('T')[0];
    data[dateString] = Math.floor(Math.random() * 8);
  }
  return data;
};