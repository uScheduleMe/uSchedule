#!/bin/sh

printenv | sed 's/^/REACT_APP_/' > /app/.env

exec "$@"
