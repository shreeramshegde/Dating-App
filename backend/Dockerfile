# Stage 1: Build JAR
FROM eclipse-temurin:21-jdk-alpine AS builder

WORKDIR /build

# Copy Maven wrapper and pom.xml first for layer caching
COPY .mvn/ .mvn/
COPY mvnw pom.xml ./

# Ensure wrapper script is executable
RUN chmod +x ./mvnw

# Download dependencies offline (cached unless pom.xml changes)
RUN ./mvnw dependency:go-offline -B

# Copy source code and build production jar
COPY src/ ./src/
RUN ./mvnw clean package -DskipTests

# Stage 2: Production JRE Runtime
FROM eclipse-temurin:21-jre-alpine

WORKDIR /app

# Create a non-root user for security
RUN addgroup -S appgroup && adduser -S appuser -G appgroup

# Copy JAR from builder stage
COPY --from=builder /build/target/*.jar app.jar

# Give appuser ownership
RUN chown -R appuser:appgroup /app
USER appuser

EXPOSE 8080

# Production JVM optimizations for container environment
ENTRYPOINT ["java", \
    "-XX:+UseContainerSupport", \
    "-XX:MaxRAMPercentage=75.0", \
    "-Djava.security.egd=file:/dev/./urandom", \
    "-jar", "app.jar"]
