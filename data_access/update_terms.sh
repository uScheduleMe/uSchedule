#!/bin/bash

set -e;

started=false
# Wait for the service to be up
while ! curl --fail &>/dev/null localhost:8000/v1/heartbeat; do
	# We only want to start the server once if it's not already running
	if [[ "$started" != "true" ]]; then
		python3 /app/manage.py runserver &
		started=true
	fi
	sleep 1;
done

update_available_terms -d localhost -s /var/log/uschedule/ -l /var/log/uschedule -q;
