# --- Etapa de build: compila el backend con Maven + JDK 21 ---
FROM maven:3.9-eclipse-temurin-21 AS build
WORKDIR /build

# Dependencias primero para aprovechar la caché de capas
COPY backend/pom.xml ./backend/pom.xml
RUN mvn -B -q -f backend/pom.xml dependency:go-offline || true

COPY backend/src ./backend/src
RUN mvn -B -f backend/pom.xml clean package -DskipTests

# --- Etapa de ejecución: solo JRE 21 ---
FROM eclipse-temurin:21-jre

# El jar queda en /app/backend y el frontend en /app/frontend para que
# spring.web.resources.static-locations=file:../frontend/ siga resolviendo
# igual que en local, sin cambiar esa propiedad.
WORKDIR /app/backend
COPY --from=build /build/backend/target/*.jar app.jar
COPY frontend/ /app/frontend/

EXPOSE 8080

# MaxRAMPercentage limita el heap al 75% de la memoria del contenedor (512 MB en el plan gratis)
CMD ["java", "-XX:MaxRAMPercentage=75.0", "-jar", "app.jar"]
