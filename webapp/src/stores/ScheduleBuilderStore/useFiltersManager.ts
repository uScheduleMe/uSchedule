import { ScheduleFilterData } from '@models/ScheduleFilterData';
import { useState } from 'react';

export function useFiltersManager(defaultFilters: ScheduleFilterData) {
  const [filters, setFilters] = useState<ScheduleFilterData>(defaultFilters);

  const updateFilters = (newFilters: Partial<ScheduleFilterData>): void => {
    setFilters((filters) => ({ ...filters, ...newFilters }));
  };

  return { filters, updateFilters };
}
