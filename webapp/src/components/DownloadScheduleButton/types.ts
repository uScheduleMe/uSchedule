import { CourseSchedule } from '@models/CourseSchedule';
import { Term } from '@models/Term';
import { DropdownButtonProps } from 'react-bootstrap/DropdownButton';

export interface DownloadScheduleButtonProps extends Partial<DropdownButtonProps> {
  schedule: CourseSchedule;
  term: Term;
  disabled?: boolean;
}
