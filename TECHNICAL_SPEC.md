\# Technical Specification: PLM Change Workflow



\## 1. Domain Model (TypeScript Interfaces)



\### Shared Models

```typescript

// 通用下拉選單選項

export interface IOption {

&nbsp; label: string; // 顯示文字

&nbsp; value: string; // 傳遞給後端的代碼

}



// 分頁請求結構 (若後端支援)

export interface IPaginationParams {

&nbsp; page: number;

&nbsp; pageSize: number;

}

Module: Change Management

TypeScript

// 變更單主要資料結構

export interface IChangeRequest {

&nbsp; id: string;

&nbsp; changeNumber: string; // 變更單號 (e.g., ECO-12345)

&nbsp; description: string;  // 變更描述

&nbsp; status: string;       // 狀態 (Open, Released, Canceled)

&nbsp; workflow: string;     // 流程名稱

&nbsp; createDate: string;   // ISO 8601 Date String

&nbsp; originator: string;   //發起人

}



// 搜尋參數

export interface IChangeSearchParams {

&nbsp; formType?: string;    // 對應 form-types API

&nbsp; businessUnit?: string;// 對應 business-units API

&nbsp; keyword?: string;     // 一般關鍵字搜尋

}

2\. API Contract \& Implementation Details

A. Initialization (Options Fetching)

頁面載入時，必須並行 (Parallel) 獲取篩選條件的選項。



Endpoint 1: GET /api/agile/options/form-types



Endpoint 2: GET /api/agile/options/business-units



Logic Requirement:



使用 Promise.all 或 React Query useQueries。



禁止 Waterfall (序列式) 請求。



若任一 API 失敗，該下拉選單顯示 Error 狀態，但不應阻擋整個頁面渲染。



B. Main Search Query

根據使用者篩選條件查詢變更單。



Endpoint: GET /api/agile/changes



Query Parameters: mapping IChangeSearchParams



Logic Requirement:



Debounce: 關鍵字輸入欄位需有 500ms 延遲。



Auto-Refetch: 當 formType 或 businessUnit 改變時，自動觸發重新查詢。



Loading State: 表格需顯示 Skeleton 或 Spin 加載動畫。



C. Future Modules (Reference Only)

以下 API 暫不實作，但需預留擴充空間



Part Detail: GET /api/agile/parts/{partNumber}



Part BOM: GET /api/agile/parts/{partNumber}/bom



User Info: POST /api/agile/user



3\. UI/UX Requirements (Ant Design)

Search Filter Area (<SearchFilter />)

使用 <Card> 包覆。



Layout: Responsive Grid (Desktop: 3 columns, Mobile: 1 column).



Components:



Form Type: <Select showSearch optionFilterProp="label" />



Business Unit: <Select />



Keyword: <Input.Search />



Result Table Area (<ChangeTable />)

Columns:



Change No: Link style (點擊可跳轉/開啟詳情).



Description: Ellipsis (過長自動省略).



Workflow: Text.



Status: <Tag> (依狀態顯示不同顏色: Released=Green, Open=Blue, Pending=Orange).



Date: Format as YYYY-MM-DD.



Pagination: 顯示 Total 筆數。



4\. Performance Goals

First Contentful Paint (FCP): < 1.5s



Search Response Interaction: < 200ms (UI 響應)

