import { useQuery } from '@tanstack/react-query';
import { partService } from '../api/partService';
import { IPartSearchParams } from '../types';

export const usePartSearch = (params: IPartSearchParams, enabled: boolean = true) => {
  return useQuery({
    queryKey: ['parts', params],
    queryFn: () => partService.searchParts(params),
    placeholderData: (previousData) => previousData,
    enabled: enabled && !!params.keyword,
    retry: 1,
  });
};

export const usePartBOM = (partNumber: string, enabled: boolean = false) => {
  return useQuery({
    queryKey: ['part-bom', partNumber],
    queryFn: () => partService.getPartBOM(partNumber),
    enabled: enabled && !!partNumber,
  });
};
