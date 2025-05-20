export interface OptionsProps {
  moveToSchedulesTab: () => void;
  courseIsLoading: boolean;
}

export interface FilterTimeDropdownProps {
  id: string;
  prependText: string;
  startTime: string;
  endTime: string;
  interval: number;
  displayFormat: string;
  value: string;
  onChange: (newValue: string) => void;
}
