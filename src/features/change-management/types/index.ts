export interface IOption {
  label: string;
  value: string;
}

export interface IChangeRequest {
  id: string;
  changeNumber: string; // 變更單號 (e.g., ECO-12345)
  description: string;  // 變更描述
  status: string;       // 狀態 (Open, Released, Canceled)
  workflow: string;     // 流程名稱
  createDate: string;   // ISO 8601 Date String
  originator: string;   // 發起人
}

export interface IChangeSearchParams {
  formType?: string;     // 對應 form-types API
  businessUnit?: string; // 對應 business-units API
  keyword?: string;      // 描述關鍵字搜尋 (API: description)
  changeNumber?: string; // 表單單號搜尋 (API: changeNumber)
  startDate?: string;    // 開始日期 (yyyy-MM-dd)
  endDate?: string;      // 結束日期 (yyyy-MM-dd)
}

export interface IChangeResponse {
  items: IChangeRequest[];
  total: number;
}

export interface ISignoff {
  startTime: string | null;
  endTime: string | null;    // 結束時間
  statusName: string;      // 關卡名稱
  isCurrentStatus: number;  // 1 為當前關卡
  signerType: string;      // 簽核類型 (Approver/Observer)
  signStatus: string;      // 簽核狀態碼
  signerName: string;      // 簽核人姓名
}
