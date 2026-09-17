FROM redis:8-alpine AS redis

LABEL org.opencontainers.image.title="jandapress-redis"
LABEL org.opencontainers.image.description="Dedicated Redis cache backend for jandapress"
LABEL org.opencontainers.image.source="https://github.com/sinkaroid/jandapress"
LABEL org.opencontainers.image.licenses="MIT"

# Expose standard Redis port
EXPOSE 6379

# Start Redis with a default password (jandapress)
CMD ["redis-server", "--requirepass", "jandapress"]
