# Spec Delta

## MODIFIED Requirements

### Requirement: Compose deployment and development environment

The project SHALL provide a Docker Compose deployment for the web dashboard, API, and database. The dashboard and API SHALL be published on the host only at an explicitly configured LAN IP address; Compose SHALL fail to start those services if the address is missing. PostgreSQL SHALL NOT publish a host port and SHALL be reachable only by services on the private Compose network. The project SHALL provide a development container with the toolchains needed to build the Android app, API, and dashboard and to run their automated tests.

#### Scenario: Operator starts the deployment
- **WHEN** Docker Compose starts with the host's LAN IP configured
- **THEN** the dashboard and API are reachable through that IP and their configured ports, and PostgreSQL is reachable by the application only on the Compose network

#### Scenario: LAN IP is missing
- **WHEN** Docker Compose starts without a configured LAN IP
- **THEN** it fails instead of publishing the dashboard or API on another interface

#### Scenario: Developer runs project checks in the development container
- **WHEN** a developer invokes the documented build and test commands in the development container
- **THEN** the Android, API, and dashboard build and automated test tasks can be run from that container
