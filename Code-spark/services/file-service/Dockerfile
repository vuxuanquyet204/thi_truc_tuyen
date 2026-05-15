# ==================== JVM Tuned Dockerfile ====================
# JVM Tuning: -Xms384m -Xmx512m (file-service - Cloudinary, Feign)
# GC: ZGC - tối ưu cho file operations
# Total Container: 768MB

FROM eclipse-temurin:21-jdk
ARG JAR_FILE=target/*.jar
COPY ${JAR_FILE} app.jar

# JVM Tuning for File Service
# Cloudinary SDK buffer cho image processing
ENV JAVA_OPTS="\
  -Xms384m \
  -Xmx512m \
  -XX:+UseZGC \
  -XX:MaxGCPauseMillis=100 \
  -XX:+HeapDumpOnOutOfMemoryError \
  -XX:HeapDumpPath=/var/log/heapdump.hprof \
  -Djava.security.egd=file:/dev/./urandom"

ENV CONTAINER_MAX_MEMORY="768m"

RUN mkdir -p /var/log

EXPOSE 9005

HEALTHCHECK --interval=30s --timeout=3s --start-period=30s --retries=3 \
  CMD curl -f http://localhost:9005/actuator/health || exit 1

ENTRYPOINT ["sh", "-c", "java ${JAVA_OPTS} -jar /app.jar"]
