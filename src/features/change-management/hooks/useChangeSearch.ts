import { useQuery } from '@tanstack/react-query';
import { changeService } from '../api/changeService';
import { IChangeSearchParams } from '../types';

export const useChangeSearch = (params: IChangeSearchParams, enabled: boolean = true) => {
  return useQuery({
    queryKey: ['changes', params],
    queryFn: () => changeService.searchChanges(params),
    placeholderData: (previousData) => previousData,
    retry: 1,
    enabled, // 控制是否啟動查詢
  });
};
