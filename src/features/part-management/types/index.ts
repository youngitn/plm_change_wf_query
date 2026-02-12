export interface IPart {
  partNumber: string;
  description: string;
  revision: string;
  lifecyclePhase: string;
}

export interface IPartBOMItem {
  partNumber: string;
  description: string;
  quantity: number;
  sequence: number;
  revision: string;
}

export interface IPartSearchParams {
  keyword: string;
  limit?: number;
}
