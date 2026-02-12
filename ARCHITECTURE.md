\# System Architecture: Agile PLM Query Dashboard



\## 1. Architectural Pattern: Feature-Sliced Design (Simplified)

本專案採用 \*\*Feature-Based\*\* 架構，確保高內聚、低耦合。每個業務功能（如變更查詢、料號管理）應自成一格。



\### Directory Structure

```text

src/

├── components/           # \[Shared] 通用 UI 元件 (Button, Layout, ErrorBoundary)

├── hooks/                # \[Shared] 通用 Hooks (useDebounce, useLocalStorage)

├── lib/                  # \[Core] 第三方庫設定 (axios-client, react-query-client)

├── utils/                # \[Core] 工具函數 (date-formatter, currency)

├── features/             # \[Domain] 業務功能模組

│   ├── change-management/# \[Phase 1] 變更流程查詢模組

│   │   ├── api/          # 該功能的 API 定義 (endpoints)

│   │   ├── components/   # 該功能的專屬 UI (SearchFilter, ResultTable)

│   │   ├── hooks/        # 該功能的邏輯 (useChangeSearch, useOptions)

│   │   └── types/        # 該功能的 TS Interface

│   ├── part-management/  # \[Phase 2] 料號與 BOM

│   └── user-management/  # \[Phase 3] 使用者管理

└── pages/                # \[Routing] 頁面組裝層 (Page Composition)

2\. Tech Stack Specification

Core: React 18+, TypeScript 5.x



Build Tool: Vite



UI Framework: Ant Design v5 (利用 ConfigProvider 統一主題)



Styling: Tailwind CSS (用於 Layout 與 Utility classes)



State Management:



Server State: TanStack Query (React Query) v5 - 核心！用於快取 API 回傳值



Client State: React Context / Zustand (若需跨組件共享篩選條件)



HTTP Client: Axios (需設定 Interceptor 處理 Auth Token)



3\. Data Flow Strategy

User Action: 使用者在 UI 觸發操作 (選擇下拉選單、點擊搜尋)。



Hook Layer: useChangeSearch 接收參數，透過 React Query 發起請求。



Service Layer: Axios 發送 HTTP 請求至後端。



Caching: React Query 快取回應，並處理 Loading/Error 狀態。



Render: UI 根據 data, isLoading, isError 自動更新。



4\. Error Handling Standard

API Errors (4xx/5xx): 統一由 Axios Interceptor 攔截，使用 Antd message.error() 全局提示。



Component Errors: 使用 react-error-boundary 包覆主要功能區塊，防止單一模組崩潰影響全站。



Empty States: 表格無資料時，必須顯示 Antd <Empty /> 元件。



5\. Coding Conventions

Naming: Components (PascalCase), Functions/Hooks (camelCase), Constants (UPPER\_SNAKE\_CASE).



Files: 一個檔案一個 Component (One Component per File)。



Types: 所有 API Response 必須定義明確的 Interface，嚴禁使用 any。

