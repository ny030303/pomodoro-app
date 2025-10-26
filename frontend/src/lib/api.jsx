// src/lib/api.js

// .env.local 파일에 API 서버 주소를 정의하여 관리하는 것이 좋습니다.
// VITE_API_BASE_URL=http://localhost:3001
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001';

/**
 * 뽀모도로 세션 완료를 백엔드에 알려 온체인에 기록을 요청합니다.
 * @param {string} userPublicKey - 토큰을 받을 사용자의 지갑 주소 (base58 인코딩된 문자열).
 * @returns {Promise<object>} - API로부터 받은 성공 응답 데이터 (e.g., { message, signature }).
 * @throws {Error} - API 요청이 실패했을 경우 에러를 발생시킵니다.
 */
export const logEffortOnChain = async (userPublicKey) => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/log-effort`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ userPublicKey }),
    });

    // response.ok가 false이면 HTTP 에러 상태 코드를 받은 것입니다.
    if (!response.ok) {
      // 서버가 JSON 형태로 에러 메시지를 보냈을 경우를 대비해 body를 파싱합니다.
      const errorData = await response.json().catch(() => ({ message: '서버 응답을 파싱할 수 없습니다.' }));
      throw new Error(errorData.message || `HTTP 에러 발생! Status: ${response.status}`);
    }

    // 성공적인 응답의 body를 JSON으로 파싱하여 반환합니다.
    return await response.json();

  } catch (error) {
    // 네트워크 문제나 위에서 발생시킨 에러를 다시 throw하여 호출한 쪽에서 처리하도록 합니다.
    console.error('API 요청 중 에러 발생:', error);
    // 더 구체적인 에러 메시지를 전달합니다.
    throw new Error(error.message || '네트워크 요청에 실패했습니다. 서버 상태를 확인해주세요.');
  }
};

export const purchaseCreateTx = async (item) => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/purchase/create-tx`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ ...item }),
    });

    // response.ok가 false이면 HTTP 에러 상태 코드를 받은 것입니다.
    if (!response.ok) {
      // 서버가 JSON 형태로 에러 메시지를 보냈을 경우를 대비해 body를 파싱합니다.
      const errorData = await response.json().catch(() => ({ message: '서버 응답을 파싱할 수 없습니다.' }));
      throw new Error(errorData.message || `HTTP 에러 발생! Status: ${response.status}`);
    }

    // 성공적인 응답의 body를 JSON으로 파싱하여 반환합니다.
    return await response.json();

  } catch (error) {
    // 네트워크 문제나 위에서 발생시킨 에러를 다시 throw하여 호출한 쪽에서 처리하도록 합니다.
    console.error('API 요청 중 에러 발생:', error);
    // 더 구체적인 에러 메시지를 전달합니다.
    throw new Error(error.message || '네트워크 요청에 실패했습니다. 서버 상태를 확인해주세요.');
  }
};

// 나중에 추가될 다른 API 함수들
// 예: export const getLeaderboardData = async () => { ... };
