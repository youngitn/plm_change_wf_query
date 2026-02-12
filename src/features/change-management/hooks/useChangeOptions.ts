import { useQueries } from '@tanstack/react-query';
import { changeService } from '../api/changeService';
import { IOption } from '../types';

export interface IChangeOptions {
  formTypes: IOption[];
  businessUnits: IOption[];
  isLoading: boolean;
  isError: boolean;
}

export const useChangeOptions = (): IChangeOptions => {
  const results = useQueries({
    queries: [
      {
        queryKey: ['change-options', 'form-types'],
        queryFn: changeService.getFormTypes,
        staleTime: 1000 * 60 * 60, // 1 hour (選項類資料不常變動)
      },
      {
        queryKey: ['change-options', 'business-units'],
        queryFn: changeService.getBusinessUnits,
        staleTime: 1000 * 60 * 60,
      },
    ],
  });

  const [formTypesQuery, businessUnitsQuery] = results;

  // 當 API 失敗時的後備資料
  const MOCK_FORM_TYPES = [
    { label: 'Engineering Change Order (ECO)', value: 'ECO' },
    { label: 'Manufacturing Change Order (MCO)', value: 'MCO' },
    { label: 'Deviation', value: 'DEV' }
  ];

  const MOCK_BU = [
    { label: 'Consumer Electronics', value: 'CE' },
    { label: 'Automotive', value: 'AUTO' },
    { label: 'Medical Devices', value: 'MED' }
  ];

  const isError = formTypesQuery.isError || businessUnitsQuery.isError;

  return {
    formTypes: formTypesQuery.data || (isError ? MOCK_FORM_TYPES : []),
    businessUnits: businessUnitsQuery.data || (isError ? MOCK_BU : []),
    isLoading: formTypesQuery.isLoading || businessUnitsQuery.isLoading,
    isError,
  };
};
