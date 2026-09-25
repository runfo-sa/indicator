# Indicator

Android device-location system starter. Product behavior is not implemented yet; see [system requirements](docs/system-requirements.md) and [contributor guidance](CONTRIBUTING.md).

## Local stack

Copy `.env.example` to `.env` and set `LAN_IP` to this computer's LAN IPv4 address. Do not use `0.0.0.0`, `localhost`, or `127.0.0.1`. Then start the API, web app, and PostgreSQL:

```powershell
Copy-Item .env.example .env
docker compose up --build -d
```

- Web starter: `http://<LAN_IP>:5173`
- API health: `http://<LAN_IP>:8080/healthz`
- PostgreSQL is available to Compose services at `postgres:5432` and has no host-published port.

The dashboard and API bind only to the configured LAN IP. Compose fails to start them if `LAN_IP` is missing. PostgreSQL 18 data is kept in the `postgres-data-v18` volume. PostgreSQL 18 changed the image data directory and mount point, so the prior PostgreSQL 17 `postgres-data` volume is left untouched and is not migrated automatically.

## Development container

Build and start the optional toolchain container, then open a shell:

```powershell
docker compose --profile dev up --build -d dev
docker compose exec dev bash
```

The repository is mounted at `/workspace`. Run component checks there:

```sh
cd /workspace/api && go test ./...
cd /workspace/android && ./gradlew assembleDebug testDebugUnitTest
cd /workspace/web && pnpm install --frozen-lockfile && pnpm build
```

The Android starter targets Android 11 (API 30) and later and builds against stable API 36. Android 17 (API 37) is still preview. The Go API exposes only `/healthz`; the React page is a placeholder. Neither reports or displays device locations.
