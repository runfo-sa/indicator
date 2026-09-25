# Proposal

## Why

There is no agreed behavior contract for collecting locations from multiple Android devices and viewing their reported positions in one place. This change defines the system requirements first so implementation can proceed later in small steps selected by the user.

## What Changes

- Specify Android 11+ screen-off location tracking, its permission requirements, and visible tracking status.
- Specify authenticated device enrollment and location reporting, PostgreSQL-backed location storage, and one-week report retention.
- Specify an interactive map of each device's latest reported location and an admin page for configuring one global upload interval.
- Specify root-level `database/` SQL files as the desired PostgreSQL schema and a GitHub deployment workflow that generates and applies an update script against the running database.
- Publish the detailed system requirements in `docs/system-requirements.md`.
- Specify Docker Compose deployment and a development container with the toolchains needed to build and run tests.
- Limit this change to requirements documents. Defer design and implementation tasks until the user selects a requirement; do not implement application or deployment code.

## Capabilities

### New Capabilities

- `device-location-tracking`: Define requirements for authorized Android device location reporting, retention, map display, and global upload interval administration.

### Modified Capabilities

None.

## Impact

This change affects requirement documents in OpenSpec and `docs/system-requirements.md`. It does not create Android, API, database, web, GitHub workflow, or Compose implementation files. Those can be addressed later in requirement-sized steps chosen by the user. The requirements assume HTTPS-based location reporting and an ongoing foreground-service notification while tracking; they do not require MQTT. The schema comparison tool and backend language remain implementation choices.
