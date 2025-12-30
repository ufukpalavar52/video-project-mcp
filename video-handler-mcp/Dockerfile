FROM golang:1.25.5-trixie AS builder

WORKDIR /app

COPY video-handler-mcp /app/data

RUN cd /app/data && go build -o mcp-server .

FROM debian:stable-slim AS runner
ENV DENO_INSTALL=/usr/local

WORKDIR /app

COPY --from=builder /app/data/mcp-server ./mcp-server

RUN apt-get update -y && apt-get install -y --no-install-recommends ca-certificates \
    && apt-get install -y --no-install-recommends ffmpeg curl unzip python3 \
    && curl -fsSL https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp_linux -o /usr/local/bin/yt-dlp \
    && chmod a+rx /usr/local/bin/yt-dlp \
    && curl -fsSL https://deno.land/install.sh -o /tmp/install_deno.sh \
    && sh /tmp/install_deno.sh \
    && apt remove -y curl unzip && \
    apt autoremove -y && apt clean \
    && rm -rf /var/lib/apt/lists/* && rm -rf /tmp/install_deno.sh


ENTRYPOINT ["sh", "-c", "/app/mcp-server"]