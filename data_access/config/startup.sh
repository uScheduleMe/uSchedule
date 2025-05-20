#!/bin/bash

if [[ "$IS_UPDATER" == 'true' ]]; then
	if [[ "$ENABLE_CRON" == 'true' ]]; then
		crontab timetable_crontab
		exec cron -f
	else
		exit 0
	fi
fi

# Run any pending database migrations
python3 /app/manage.py migrate;

# Note that this block needs to be the last thing in this script:
#    the server runs in the current process.
if [[ "$DEV_SERVER" == 'true' ]]; then
	exec python3 /app/manage.py runserver 0.0.0.0:8000;
else
	exec gunicorn -b 0.0.0.0:8000 -w 1 -k gthread --thread "$THREAD_COUNT" uschedule.wsgi;
fi
