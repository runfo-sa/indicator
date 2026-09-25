# Android Device Tracking System Requirements

This document records the intended behavior of the Android device tracking system. It describes requirements and acceptance scenarios; it does not choose implementation details unless stated as a requirement.

## Screen-off location tracking

The Android app SHALL support Android 11 and later. It SHALL start location tracking only after an explicit user action and the required location permissions. While tracking is active, it SHALL continue collecting locations with the screen off and display an ongoing notification that identifies the active tracking state and provides a way to stop tracking. If required permission is unavailable, the app SHALL explain that tracking cannot start.

### Scenarios

- **User starts tracking and turns off the screen:** When the user starts tracking with the required permissions granted and then turns off the screen, the app continues collecting location updates and shows an ongoing tracking notification.
- **User stops tracking from the notification:** When the user chooses to stop tracking from the ongoing notification, the app stops collecting and submitting location updates.
- **Required location permission is denied:** When the user attempts to start tracking without granting a required location permission, the app does not collect or submit locations and explains which permission is needed.

## Authenticated device location reports

The system SHALL allow an enrolled device to submit a location report through an authenticated HTTPS API. Each accepted report SHALL include latitude, longitude, the time the location was observed, and horizontal accuracy when available. The API SHALL reject unauthenticated reports and coordinates outside valid latitude or longitude ranges.

### Scenarios

- **Valid report:** When an enrolled device submits a valid report with its credential, the system accepts the report for storage.
- **Unknown or revoked credential:** When a device submits a report with an unknown or revoked credential, the API rejects it and stores nothing.
- **Invalid coordinates:** When an authenticated device submits latitude or longitude outside the valid range, the API rejects the report and stores nothing.

## Operator device access

The system SHALL restrict location data to authenticated operators and SHALL allow an operator to enroll a device and revoke its reporting credential. Revoking a device SHALL prevent subsequent reports from that credential from being accepted.

### Scenarios

- **Device enrollment:** When an authenticated operator enrolls a device, the device can be associated with a reporting credential for location submissions.
- **Credential revocation:** When an authenticated operator revokes a device credential, that credential can no longer submit location reports.
- **Unauthenticated location request:** When a client without an authenticated operator session requests device locations, the system denies access to those locations.

## Report persistence, latest locations, and retention

The system SHALL persist every accepted report with its device identity, observed time, server receipt time, coordinates, and accuracy when available. It SHALL provide the latest accepted report for each enrolled device to authorized operators. Stored reports SHALL survive application and database container restarts and SHALL be deleted after one calendar week from server receipt.

### Scenarios

- **Latest locations:** When an authenticated operator requests latest locations, the system returns the most recently accepted report for each enrolled device, including its observed time and accuracy when available.
- **Container restart:** When the application and database containers restart, previously accepted reports remain available.
- **Retention limit:** When one calendar week has passed since the server received a report, the report is deleted and is no longer returned by location queries.

## Interactive location map

The React dashboard SHALL display the latest available location for each enrolled device on an interactive map. It SHALL identify each marker with the device and show the report time when the operator selects that marker.

### Scenarios

- **Map displays devices:** When an authenticated operator opens the location dashboard and devices have reported locations, the map displays a marker at each device's latest reported coordinates.
- **Marker details:** When the operator selects a device marker, the dashboard shows the device identity and the time of its latest report.

## Global upload interval administration

The React admin page SHALL allow an authenticated operator with admin access to set and view one positive location-upload interval that applies to all enrolled devices. The system SHALL persist the setting across restarts. Each device that is actively tracking SHALL use the latest configured interval after its next successful API exchange.

### Scenarios

- **Administrator changes the interval:** When an authenticated administrator saves a valid interval, the admin page displays the saved interval and the setting applies to all enrolled devices.
- **Tracking device receives the interval:** When an actively tracking device successfully exchanges data with the API, it uses the latest configured interval to schedule subsequent location uploads.
- **Invalid interval:** When an administrator attempts to save a zero or negative interval, the system rejects it and preserves the previous setting.
- **Server restart:** When the server restarts after an administrator saves an interval, the saved interval remains available to the admin page and enrolled devices.

## Docker Compose deployment and development environment

The project SHALL provide a Docker Compose deployment for the web dashboard, API, and database. The dashboard and API SHALL be published on the host only at an explicitly configured LAN IP address; Compose SHALL fail to start those services if the address is missing. PostgreSQL SHALL NOT publish a host port and SHALL be reachable only by services on the private Compose network. The project SHALL provide a development container with the toolchains needed to build the Android app, API, and dashboard and to run their automated tests.

### Scenarios

- **Deployment starts with a LAN IP configured:** When Docker Compose starts with the host's LAN IP configured, the dashboard and API are reachable through that IP and their configured ports, and PostgreSQL is reachable by the application only on the Compose network.
- **LAN IP is missing:** When Docker Compose starts without a configured LAN IP, it fails instead of publishing the dashboard or API on another interface.
- **Developer runs checks:** When a developer invokes the documented build and test commands in the development container, the Android, API, and dashboard build and automated test tasks can be run from that container.

## PostgreSQL schema source files

The project SHALL define the desired PostgreSQL schema in the repository-root `database/` directory. Each table, view, function, procedure, trigger, and other database object used by the system SHALL have its definition in an individual `.sql` file organized under the matching object-type directory. The `database/` directory SHALL be the source of the desired schema; contributors SHALL NOT maintain a separate schema migration history.

### Scenarios

- **Contributor adds a database object:** When a feature adds a PostgreSQL database object, its definition is added as an individual `.sql` file under the matching directory in `database/`.
- **Deployment reads desired schema:** When the deployment workflow prepares a schema comparison, it derives the desired PostgreSQL schema from the SQL definitions in `database/`.

## Browser-only web map visual demo

The React web app SHALL provide exactly two demo pages, Map and Settings, through a left navigation sidebar. The Settings page SHALL accept PNG, JPEG, WebP, or SVG map images and north, south, east, and west geographic bounds, rejecting unreadable images or invalid bounds without replacing the last valid configuration. The browser SHALL retain the demo image, bounds, and a positive whole-number update interval from 1 to 3600 seconds across reloads.

The Map page SHALL fit the configured image with a margin, support bounded zooming and panning, and position mock device markers by linearly mapping longitude west-to-east and latitude north-to-south across the image bounds. Markers SHALL provide a name and latest update time on hover or keyboard focus. Selecting a marker SHALL open a dismissible device detail panel with name, MAC address, IP address, latest report time and coordinates, altitude when available, and location history. Out-of-bounds mock devices SHALL be identified without placing their marker outside the image.

The browser-only demo SHALL start with the bundled `demo-map.png` floor plan, sample bounds, and eight in-bounds mock devices unless the user has saved a custom configuration. It SHALL label mock device data and refresh actions as simulated. Its configured interval SHALL refresh mock device reports while the map is open, and the device detail panel SHALL support refreshing one selected mock device without affecting the others. This demo requirement does not provide authentication, location capture, a device command, or server persistence.

### Scenarios

- **User configures a map:** When a user uploads a readable supported image and valid bounds, the map shows the image and places in-bounds mock devices using those bounds.
- **User opens the demo:** When no custom map is saved, the map shows the bundled floor plan and eight in-bounds mock device markers.
- **User reloads the demo:** When a user reloads after saving valid settings, the browser restores the image, bounds, and interval.
- **User enters invalid settings:** When an image is unreadable, bounds are invalid, or the interval is outside 1 to 3600 whole seconds, the demo reports the error and retains the previous valid configuration.
- **User explores device locations:** When a user zooms, pans, hovers or focuses a marker, or selects a marker, the map remains bounded and exposes the requested mock device information.
- **Mock device locations update:** When the configured interval elapses or a user requests a device refresh, the demo updates the affected mock reports and visibly identifies these actions as simulated.

## Deployment database schema updates

The GitHub deployment workflow SHALL compare the running PostgreSQL database schema with the desired schema defined in `database/`, generate an SQL update script for any differences, and execute that generated script against the target database as part of the deployment update. The workflow SHALL retain the generated script as an artifact for that deployment. The deployment runner SHALL reach PostgreSQL over a private network, and the database SHALL NOT be publicly exposed. The workflow SHALL require review of a generated plan containing destructive operations before applying it. Any required transformation of stored data SHALL be specified explicitly as reviewed SQL alongside the feature; the schema comparison SHALL NOT infer data transformations.

### Scenarios

- **Schema differences:** When a deployment update finds differences between the running database and the SQL definitions in `database/`, the workflow generates an SQL update script, executes that script against the target database as part of the deployment, and retains it as a deployment artifact.
- **No schema differences:** When the running database schema matches the desired schema in `database/`, the workflow applies no schema changes and continues the deployment.
- **Destructive update:** When the generated update plan contains an operation that can remove or destroy existing schema or data, the workflow waits for review and approval before executing the script.
- **Stored data transformation:** When a feature requires changing the meaning or representation of stored values, the required transformation is specified as explicit reviewed SQL and is not inferred from the schema difference.
