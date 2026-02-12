import axios from 'axios';
import { notificationBus } from '../utils/eventBus';

/**
 * 全域 Axios 客戶端配置
 */
const httpClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '',
  timeout: 60000, // 增加到 60 秒以處理緩慢的 SDK 請求
  headers: {
    'Content-Type': 'application/json',
  },
});

// ... 請求攔截器保持不變

// 回應攔截器
httpClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    let message = '連線發生異常';
    
    // 如果回傳的是 Blob (通常發生在檔案下載失敗)
    if (error.response?.data instanceof Blob && error.response.data.type === 'application/json') {
      const text = await error.response.data.text();
      try {
        const json = JSON.parse(text);
        message = json.message || json.error || message;
      } catch (e) {
        message = text || message;
      }
    } else {
      message = error.response?.data?.message || error.message || message;
    }
    
    // 自動發送錯誤通知
    notificationBus.emit(message, 'error');
    
    return Promise.reject(error);
  }
);

export default httpClient;
