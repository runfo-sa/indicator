FROM golang:1.27-bookworm AS golang
FROM node:24-bookworm-slim AS node

FROM ghcr.io/cirruslabs/android-sdk:36
COPY --from=golang /usr/local/go /usr/local/go
COPY --from=node /usr/local/bin/node /usr/local/bin/node
COPY --from=node /usr/local/lib/node_modules/npm /opt/npm

RUN apt-get update \
    && apt-get install -y --no-install-recommends ca-certificates postgresql-common \
    && YES=1 /usr/share/postgresql-common/pgdg/apt.postgresql.org.sh \
    && apt-get install -y --no-install-recommends postgresql-client-18 \
    && node /opt/npm/bin/npm-cli.js install --global --ignore-scripts --prefix /usr/local pnpm@12.6.0 \
    && rm -rf /opt/npm \
    && rm -rf /var/lib/apt/lists/*

ENV ANDROID_HOME=/opt/android-sdk-linux \
    ANDROID_SDK_ROOT=/opt/android-sdk-linux \
    GOPATH=/go \
    PATH=/usr/local/go/bin:/opt/android-sdk-linux/platform-tools:/opt/android-sdk-linux/cmdline-tools/latest/bin:$PATH

WORKDIR /workspace
CMD ["sleep", "infinity"]
