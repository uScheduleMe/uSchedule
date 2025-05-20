#!/bin/sh

CMD="yarn run start";

if [[ $RUN_SRC == "true" ]]; then
	CMD="${CMD}:src";
fi

if [[ $ENABLE_WATCHER == "true" ]]; then
	CMD="${CMD}:watch";
fi

exec $CMD;
