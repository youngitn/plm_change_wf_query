import httpClient from '../../../lib/httpClient';
import { IPart, IPartBOMItem, IPartSearchParams } from '../types';

const BASE_URL = '/agile';

/**
 * 統一格式化料號資料
 */
const normalizePart = (item: any): IPart => ({
  partNumber: item.partNumber || '-',
  description: item.description || '',
  revision: item.revision || '-',
  lifecyclePhase: item.lifecyclePhase || '-',
});

export const partService = {
  /**
   * 搜尋料號
   */
  searchParts: async (params: IPartSearchParams): Promise<IPart[]> => {
    try {
      const response = await httpClient.get(`${BASE_URL}/parts/search`, { 
        params,
        timeout: 90000 
      });
      
      let payload = response.data;
      
      // 處理 JSON 字串
      if (typeof payload === 'string' && payload.trim()) {
        try {
          payload = JSON.parse(payload);
        } catch (e) {
          console.warn('SDK returned raw string, parsing failed');
        }
      }

      // 針對結構 { total: n, data: [...], keyword: "..." } 進行提取
      let items: any[] = [];
      if (payload && typeof payload === 'object') {
        if (Array.isArray(payload.data)) {
          items = payload.data;
        } else if (Array.isArray(payload)) {
          items = payload;
        } else {
          items = payload.items || payload.list || [payload];
        }
      }

      return items
        .filter(item => item && typeof item === 'object' && (item.partNumber || item.description))
        .map(normalizePart);
    } catch (error) {
      console.error('Part search failed:', error);
      throw error;
    }
  },

  /**
   * 取得料號詳細資訊 (支援直接回傳物件或包含在陣列中)
   */
  getPartInfo: async (partNumber: string): Promise<IPart> => {
    const response = await httpClient.get(`${BASE_URL}/parts/${partNumber}`, {
      timeout: 90000
    });
    
    let payload = response.data;
    if (typeof payload === 'string' && payload.trim()) {
      try {
        payload = JSON.parse(payload);
      } catch (e) {}
    }

    // 如果回傳的是陣列 [{...}]，取第一筆
    const target = Array.isArray(payload) ? payload[0] : (payload.data?.[0] || payload);
    return normalizePart(target);
  },

  /**
   * 取得 BOM 結構
   */
  getPartBOM: async (partNumber: string): Promise<IPartBOMItem[]> => {
    const response = await httpClient.get(`${BASE_URL}/parts/${partNumber}/bom`, {
      timeout: 90000
    });
    
    let payload = response.data;
    if (typeof payload === 'string' && payload.trim()) {
      try {
        payload = JSON.parse(payload);
      } catch (e) {
        console.warn('Failed to parse BOM response string');
      }
    }

    // 根據提供格式，清單在 payload.bom 中
    const list = Array.isArray(payload?.bom) ? payload.bom : 
                 (Array.isArray(payload) ? payload : (payload?.data || []));

    return list.map((item: any) => ({
      partNumber: item.partNumber || item.itemNumber || '-',
      description: item.description || '',
      quantity: item.quantity ? Number(item.quantity) : 0,
      sequence: item.sequence || 0,
      revision: item.revision || '-',
    }));
  }
};