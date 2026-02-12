import httpClient from '../../../lib/httpClient';
import { IChangeRequest, IChangeResponse, IChangeSearchParams, IOption, ISignoff } from '../types';

const BASE_URL = '/agile';

/**
 * 統一格式化 Change Request 資料
 */
const normalizeChangeRequest = (item: any): IChangeRequest => ({
  id: item.id || item.changeId || String(Math.random()),
  changeNumber: item.changeNumber || item.number || '-',
  description: item.description || item.changeDescription || '', 
  status: item.statusName || item.status || 'Unknown',
  workflow: item.workflowName || item.workflow || '-',
  createDate: item.applyDate || item.createDate || '',
  originator: [item.firstName, item.lastName].filter(Boolean).join(' ') || item.originator || '-',
});

/**
 * 通用選項轉換工具
 */
const transformOptions = (data: any): IOption[] => {
  const list = Array.isArray(data) ? data : Object.entries(data || {});
  return list.map((item: any) => {
    const val = typeof item === 'object' ? (item.value || item.id) : item;
    const lab = typeof item === 'object' ? (item.label || item.name) : item;
    return { label: String(lab), value: `${val}__${lab}` };
  });
};

export const changeService = {
  searchChanges: async (params: IChangeSearchParams): Promise<IChangeResponse> => {
    const response = await httpClient.get(`${BASE_URL}/changes`, { 
      params: {
        startDate: params.startDate,
        endDate: params.endDate,
        businessUnit: params.businessUnit?.split('__')[0],
        formType: params.formType?.split('__')[0],
        description: params.keyword,
        changeNumber: params.changeNumber,
      } 
    });

    let payload = response.data;

    // 1. 處理 JSON 字串 (SDK 常用格式)
    if (typeof payload === 'string' && payload.trim()) {
      try {
        payload = JSON.parse(payload);
      } catch (e) {
        console.warn('Failed to parse changes response string');
      }
    }

    // 2. 靈活提取陣列 (支援直接回傳陣列 或 包裹在 data/items 中)
    let items: any[] = [];
    if (Array.isArray(payload)) {
      items = payload;
    } else if (payload && typeof payload === 'object') {
      items = payload.data || payload.items || [payload];
    }

    // 如果 items 依然不是陣列，確保它是空的
    if (!Array.isArray(items)) items = [];

    return {
      items: items.filter(i => i && typeof i === 'object').map(normalizeChangeRequest),
      total: payload?.total || items.length
    };
  },

  getFormTypes: async (): Promise<IOption[]> => {
    const { data } = await httpClient.get(`${BASE_URL}/options/form-types`);
    return transformOptions(data);
  },

  getBusinessUnits: async (): Promise<IOption[]> => {
    const { data } = await httpClient.get(`${BASE_URL}/options/business-units`);
    return transformOptions(data);
  },

  getSignoffs: async (changeNumber: string): Promise<ISignoff[]> => {
    const { data } = await httpClient.get(`${BASE_URL}/changes/${changeNumber}/signoffs`);
    const list = Array.isArray(data) ? data : (data.items || []);
    return list.map((item: any) => ({
      ...item,
      endTime: item.lastUpdTime || item.endTime,
    }));
  },

  /**
   * 匯出簽核清單 Excel
   */
  exportChangeSignoffs: async (params: IChangeSearchParams): Promise<void> => {
    try {
      // 過濾掉空字串或 undefined 的參數
      const apiParams: any = {
        startDate: params.startDate,
        endDate: params.endDate,
        businessUnit: params.businessUnit?.split('__')[0],
        formType: params.formType?.split('__')[0],
        description: params.keyword,
        changeNumber: params.changeNumber,
      };

      Object.keys(apiParams).forEach(key => {
        if (apiParams[key] === undefined || apiParams[key] === '') {
          delete apiParams[key];
        }
      });

      const response = await httpClient.get(`${BASE_URL}/changes/export`, {
        params: apiParams,
        responseType: 'blob',
      });

      // 檢查是否回傳的是 JSON (代表錯誤) 而非檔案
      if (response.data.type === 'application/json') {
        const reader = new FileReader();
        reader.onload = () => {
          const message = JSON.parse(reader.result as string)?.message || '匯出失敗';
          throw new Error(message);
        };
        reader.readAsText(response.data);
        return;
      }

      const url = window.URL.createObjectURL(new Blob([response.data], { 
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
      }));
      const link = document.createElement('a');
      link.href = url;
      
      const dateStr = new Date().toISOString().split('T')[0];
      const filename = `PLM_Change_Export_${dateStr}.xlsx`;
      
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      
      // 清理
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error: any) {
      console.error('Export error:', error);
      throw error; // 讓 UI 層級的 GlobalNotification 處理
    }
  },
};