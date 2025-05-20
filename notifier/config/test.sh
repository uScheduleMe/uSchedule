#!/bin/sh

poetry install
poetry run pytest
poetry run flake8
poetry run mypy notifier
poetry run bandit -r -c pyproject.toml .
poetry run pydocstyle notifier
poetry run black --check .