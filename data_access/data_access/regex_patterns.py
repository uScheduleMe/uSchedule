import re

full_course_code_pattern = re.compile(r'(?P<subject_code>[A-Za-z]{3,4})\s*(?P<course_code>[0-9]{4,5})')
term_code_pattern = re.compile(r'(?P<year>[0-9]{4})-(?P<season>winter|summer|fall)')
