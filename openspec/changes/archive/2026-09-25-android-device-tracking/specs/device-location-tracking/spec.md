# Spec Delta

## Purpose

Provides authorized operators with the latest reported locations of enrolled Android 11+ devices, including when tracking continues with the screen off.

## ADDED Requirements

### Requirement: Screen-off location tracking

The Android app SHALL support Android 11 and later. It SHALL start location tracking only after an explicit user action and the required location permissions. While tracking is active, it SHALL continue collecting locations with the screen off and display an ongoing notification that identifies the active tracking state and provides a way to stop tracking. If required permission is unavailable, the app SHALL explain that tracking cannot start.

#### Scenario: User starts tracking and turns off the screen

- **WHEN** the user starts tracking with the required permissions granted and then turns off the screen
- **THEN** the app continues collecting location updates and shows an ongoing tracking notification

#### Scenario: User stops tracking from the notification

- **WHEN** the user chooses to stop tracking from the ongoing notification
- **THEN** the app stops collecting and submitting location updates

#### Scenario: Required location permission is denied

- **WHEN** the user attempts to start tracking without granting a required location permission
- **THEN** the app does not collect or submit locations and explains which permission is needed

### Requirement: Enrolled devices submit authenticated location reports

The system SHALL allow an enrolled device to submit a location report through an authenticated HTTPS API. Each accepted report SHALL include latitude, longitude, the time the location was observed, and horizontal accuracy when available. The API SHALL reject unauthenticated reports and coordinates outside valid latitude or longitude ranges.

#### Scenario: Enrolled device submits a valid location

- **WHEN** an enrolled device submits a valid report with its credential
- **THEN** the system accepts the report for storage

#### Scenario: Unknown or revoked device submits a report

- **WHEN** a device submits a report with an unknown or revoked credential
- **THEN** the API rejects the report and does not store it

#### Scenario: Device submits invalid coordinates

- **WHEN** an authenticated device submits latitude or longitude outside the valid range
- **THEN** the API rejects the report and does not store it

### Requirement: Operators manage device access

The system SHALL restrict location data to authenticated operators and SHALL allow an operator to enroll a device and revoke its reporting credential. Revoking a device SHALL prevent subsequent reports from that device credential from being accepted.

#### Scenario: Operator enrolls a device

- **WHEN** an authenticated operator enrolls a device
- **THEN** the device can be associated with a reporting credential for location submissions

#### Scenario: Operator revokes a device credential

- **WHEN** an authenticated operator revokes a device credential
- **THEN** that credential can no longer submit location reports

#### Scenario: Unauthenticated viewer requests locations

- **WHEN** a client without an authenticated operator session requests device locations
- **THEN** the system denies access to those locations

### Requirement: Accepted reports persist and provide latest locations

The system SHALL persist every accepted report with its device identity, observed time, server receipt time, coordinates, and accuracy when available. It SHALL provide the latest accepted report for each enrolled device to authorized operators. Stored reports SHALL survive application and database container restarts and SHALL be deleted after one calendar week from server receipt.

#### Scenario: Authorized operator requests latest locations

- **WHEN** an authenticated operator requests the latest locations
- **THEN** the system returns the most recently accepted report for each enrolled device, including its observed time and accuracy when available

#### Scenario: Containers restart after reports are stored

- **WHEN** the application and database containers are restarted
- **THEN** previously accepted reports remain available

#### Scenario: A report reaches its retention limit

- **WHEN** one calendar week has passed since the server received a report
- **THEN** the report is deleted and is no longer returned by location queries

### Requirement: Dashboard displays latest device locations on an interactive map

The React dashboard SHALL display the latest available location for each enrolled device on an interactive map. It SHALL identify each marker with the device and show the report time when the operator selects that marker.

#### Scenario: Operator views enrolled devices on the map

- **WHEN** an authenticated operator opens the location dashboard and devices have reported locations
- **THEN** the map displays a marker at each device's latest reported coordinates

#### Scenario: Operator selects a device marker

- **WHEN** the operator selects a device marker
- **THEN** the dashboard shows the device identity and the time of its latest report

### Requirement: Administrator configures the global upload interval

The React admin page SHALL allow an authenticated operator with admin access to set and view one positive location-upload interval that applies to all enrolled devices. The system SHALL persist the setting across restarts. Each device that is actively tracking SHALL use the latest configured interval after its next successful API exchange.

#### Scenario: Administrator changes the upload interval

- **WHEN** an authenticated administrator saves a valid upload interval
- **THEN** the admin page displays the saved interval and the setting applies to all enrolled devices

#### Scenario: Tracking device receives the current interval

- **WHEN** an actively tracking device successfully exchanges data with the API
- **THEN** it uses the latest configured interval to schedule subsequent location uploads

#### Scenario: Administrator provides an invalid interval

- **WHEN** an administrator attempts to save a zero or negative interval
- **THEN** the system rejects the value and preserves the previously saved interval

#### Scenario: Server restarts after an interval is saved

- **WHEN** the server is restarted after an administrator saves an interval
- **THEN** the saved interval remains available to the admin page and enrolled devices

### Requirement: Compose deployment and development environment

The project SHALL provide a Docker Compose deployment for the web dashboard, API, and database. It SHALL provide a development container with the toolchains needed to build the Android app, API, and dashboard and to run their automated tests.

#### Scenario: Operator starts the deployment

- **WHEN** the deployment is started with Docker Compose
- **THEN** the dashboard, API, and database become available as one deployment

#### Scenario: Developer runs project checks in the development container

- **WHEN** a developer invokes the documented build and test commands in the development container
- **THEN** the Android, API, and dashboard build and automated test tasks can be run from that container

### Requirement: PostgreSQL schema is defined by SQL files

The project SHALL define the desired PostgreSQL schema in the repository-root `database/` directory. Each table, view, function, procedure, trigger, and other database object used by the system SHALL have its definition in an individual `.sql` file organized under the matching object-type directory. The `database/` directory SHALL be the source of the desired schema; contributors SHALL NOT maintain a separate schema migration history.

#### Scenario: Contributor adds a database object

- **WHEN** a feature adds a PostgreSQL database object
- **THEN** its definition is added as an individual `.sql` file under the matching directory in `database/`

#### Scenario: Deployment determines the desired schema

- **WHEN** the deployment workflow prepares a schema comparison
- **THEN** it derives the desired PostgreSQL schema from the SQL definitions in `database/`

### Requirement: Deployment generates and applies database schema updates

The GitHub deployment workflow SHALL compare the running PostgreSQL database schema with the desired schema defined in `database/`, generate an SQL update script for any differences, and execute that generated script against the target database as part of the deployment update. The workflow SHALL retain the generated script as an artifact for that deployment. The deployment runner SHALL reach PostgreSQL over a private network, and the database SHALL NOT be publicly exposed. The workflow SHALL require review of a generated plan containing destructive operations before applying it. Any required transformation of stored data SHALL be specified explicitly as reviewed SQL alongside the feature; the schema comparison SHALL NOT infer data transformations.

#### Scenario: Deployment finds schema differences

- **WHEN** a deployment update finds differences between the running database and the SQL definitions in `database/`
- **THEN** the workflow generates an SQL update script, executes that generated script against the target database as part of the deployment, and retains the script as a deployment artifact

#### Scenario: Deployment finds no schema differences

- **WHEN** the running database schema matches the desired schema in `database/`
- **THEN** the workflow applies no schema changes and continues the deployment

#### Scenario: Generated update contains destructive operations

- **WHEN** the generated update plan contains an operation that can remove or destroy existing schema or data
- **THEN** the workflow waits for review and approval before executing the update script

#### Scenario: A feature requires transforming stored data

- **WHEN** a feature requires changing the meaning or representation of stored values
- **THEN** the required transformation is specified as explicit reviewed SQL and is not inferred from the schema difference
