import { CourseSectionComponent, Schedule } from '@modules/schedule_generator';
import { CompressedComponentGuid, CompressedSchedule, CompressedSchedulesBundle } from './schemas';

export function serializeSchedules(
  schedules_iterator: IterableIterator<Schedule>,
): CompressedSchedulesBundle {
  const component_ids: CompressedComponentGuid[] = [];
  const components_pos_map: Map<string, number> = new Map();

  const getComponentPosition = (com: CourseSectionComponent): number => {
    let position = components_pos_map.get(com.guid);
    if (position === undefined) {
      position = component_ids.length;
      component_ids.push([com.course.id, com.section.id, com.id]);
      components_pos_map.set(com.guid, position);
    }
    return position;
  };

  const schedules: CompressedSchedule[] = Array.from(schedules_iterator, (s) =>
    s.components.map((sc) => sc.components.map(getComponentPosition)),
  );

  return { component_ids, schedules };
}
