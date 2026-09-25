# Spec Delta

## Purpose

Provides a browser-only preview of Indicator's map and settings experience using calibrated image backgrounds and clearly identified mock device locations.

## ADDED Requirements

### Requirement: Two-page demo navigation
The web demo SHALL provide exactly two primary pages, Map and Settings, accessible from a persistent left navigation sidebar. It SHALL indicate the active page and keep the interface usable at narrow viewport widths.

#### Scenario: Navigate between pages
- **WHEN** a user chooses Map or Settings in the left sidebar
- **THEN** the corresponding page is shown and its navigation item is identified as active

#### Scenario: Narrow viewport
- **WHEN** the viewport becomes narrow
- **THEN** the user can still reach both pages and operate their primary controls

### Requirement: Background image and geographic calibration
The Settings page SHALL accept a PNG, JPEG, WebP, or SVG image as the map background and SHALL let the user set its north, south, east, and west latitude and longitude bounds. It SHALL reject an unsupported or unreadable image, coordinates outside valid latitude or longitude ranges, north less than or equal to south, and east less than or equal to west. Valid demo settings, including the image, SHALL survive a browser reload on the same browser and device. The demo SHALL start with the bundled `demo-map.png` floor plan and sample bounds until replaced.

#### Scenario: Open demo with bundled floor plan
- **WHEN** a user opens the demo without a saved custom image
- **THEN** the Map page displays the bundled floor plan with eight in-bounds mock devices

#### Scenario: Save an image and bounds
- **WHEN** a user selects a supported image and enters valid bounds
- **THEN** the Map page displays that image and positions mock devices using those bounds

#### Scenario: Reload after saving settings
- **WHEN** a user reloads the web demo after saving an image and valid bounds
- **THEN** the saved image and bounds are restored

#### Scenario: Invalid calibration
- **WHEN** a user enters invalid geographic bounds or selects an unreadable or unsupported image
- **THEN** the page explains the error and preserves the last valid map configuration

### Requirement: Bounded interactive image map
The Map page SHALL fit the calibrated background inside the available map area with a small margin at its minimum zoom. It SHALL let users zoom in and out and drag the image, while constraining zoom and pan so the image cannot be lost from view. It SHALL map longitude linearly from west to east and latitude linearly from north to south over the image rectangle.

#### Scenario: Open the map
- **WHEN** a user opens Map with a configured background
- **THEN** the entire image is visible with a small surrounding margin

#### Scenario: Zoom and pan
- **WHEN** a user zooms or drags the map
- **THEN** the image and device markers move together and remain constrained to the configured image area

#### Scenario: Coordinates outside bounds
- **WHEN** a mock device location lies outside the configured bounds
- **THEN** the demo does not render its marker outside the background and identifies that device as outside the map bounds

### Requirement: Mock device markers and details
The Map page SHALL show each mock device with an in-bounds latest location as a glowing dot. Hovering or keyboard focusing a dot SHALL show the device name and latest update time. Selecting a dot SHALL open a right-side detail panel showing name, MAC address, IP address, latest update time, latitude, longitude, altitude when available, and location history with date, time, latitude, longitude, and altitude when available. The panel SHALL be dismissible and usable on narrow screens.

#### Scenario: Inspect a marker summary
- **WHEN** a user hovers over or focuses a device dot
- **THEN** the name and latest update time are shown

#### Scenario: Open device details
- **WHEN** a user selects a device dot
- **THEN** the right-side panel shows that device's known identity, latest position, and location history

#### Scenario: Missing optional location data
- **WHEN** a mock report has no altitude
- **THEN** the device panel marks altitude as unavailable instead of displaying a false value

### Requirement: Simulated location updates
The Settings page SHALL let a user set one global location update interval as a whole number from 1 to 3600 seconds. The demo SHALL use that interval to refresh mock device locations while the Map page is open, updating marker positions, latest update times, and history without requiring a page reload. The device detail panel SHALL offer a force refresh action that updates only the selected mock device. The interface SHALL identify the device data and refresh action as simulated.

#### Scenario: Change the global interval
- **WHEN** a user saves a positive interval
- **THEN** the Settings page shows the saved value and subsequent automatic mock updates use it

#### Scenario: Reject an invalid interval
- **WHEN** a user tries to save a value outside 1 to 3600 seconds or a non-integer
- **THEN** the Settings page explains the error and retains the last valid interval

#### Scenario: Automatic mock update
- **WHEN** the configured interval elapses while the Map page is open
- **THEN** mock device locations, marker positions, and latest update times refresh without a page reload

#### Scenario: Force refresh one device
- **WHEN** a user chooses force refresh in a device's detail panel
- **THEN** only that device receives a new simulated location report and history entry
