import { Course } from '@models/Course';
import { Term } from '@models/Term';
import { TermScheduleSetData } from '@models/TermScheduleSetData';
import { TermData } from '@stores/ScheduleBuilderStore';
import { EventParams, SendEvent } from './types';

export class EventTrackerService {
  private readonly sendEvent: SendEvent;

  constructor(sendEvent: SendEvent) {
    // Wrap the injected event sender and force the type to 'custom'
    this.sendEvent = (name: string, params: EventParams) => {
      sendEvent(name, { ...params, type: 'custom' });
    };
  }

  addCourse(course: Course, load_time: number): void {
    const term = EventTrackerService.getTermString(course);
    const levelMatches = course.course_code.match(/^([0-9])[0-9]+.*/);

    this.sendEvent('add_course', {
      label: `${course.subject_code} ${course.course_code}`,
      term,
      subject_code: course.subject_code,
      course_code: course.course_code,
      course_level: levelMatches ? `${levelMatches[1]}000` : course.course_code,
      load_time,
      load_time_bracket: EventTrackerService.calculateLoadTimeBracket(load_time),
    });
  }

  downloadSchedule(term: Term, download_format: string, load_time: number): void {
    const term_val = EventTrackerService.getTermString(term);

    this.sendEvent('download_schedule', {
      label: `${term_val}.${download_format}`,
      term: term_val,
      download_format,
      load_time,
      load_time_bracket: EventTrackerService.calculateLoadTimeBracket(load_time),
    });
  }

  generateSchedules(
    schedule_data: TermScheduleSetData,
    term_data: TermData,
    load_time: number,
    use_remote_scheduler: boolean,
  ): void {
    const term = EventTrackerService.getTermString(schedule_data.term);
    const generator = use_remote_scheduler ? 'remote' : 'local';
    const courses = Object.values(term_data.courses);
    const course_list = JSON.stringify(
      courses.map((c) => ({ id: c.id, label: `${c.subject_code} ${c.course_code}` })),
    );

    this.sendEvent('generate_schedules', {
      label: `${term}.${generator}`,
      term,
      load_time,
      load_time_bracket: EventTrackerService.calculateLoadTimeBracket(load_time),
      generator,
      course_list,
      num_courses: courses.length,
      num_results: schedule_data.schedules.length,
      limit_reached: schedule_data.limit_was_reached ? 'true' : 'false',
    });
  }

  private static getTermString(input: Term | Course): string {
    if (input instanceof Term) {
      return `${input.year}-${input.season}`;
    }
    return `${input.year}-${input.term}`;
  }

  private static calculateLoadTimeBracket(load_time: number) {
    const BRACKET_SIZE_MS = 100;
    const bracket_num = Math.floor(load_time / BRACKET_SIZE_MS);
    const lower = bracket_num * BRACKET_SIZE_MS;
    const upper = lower + BRACKET_SIZE_MS - 1;
    return `${lower}-${upper} ms`;
  }
}
