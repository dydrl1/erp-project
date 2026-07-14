# ============================================================
# 약통 ERP 백엔드 Dockerfile
# 사전 준비: ./gradlew build 로 jar 생성되어 있어야 함
# 빌드 위치: backend/ 폴더에서 실행
# ============================================================
FROM eclipse-temurin:17-jdk AS builder

WORKDIR /workspace

COPY gradlew gradlew.bat build.gradle settings.gradle ./
COPY gradle ./gradle

COPY src ./src
RUN sed -i 's/\r$//' ./gradlew && chmod +x ./gradlew && ./gradlew clean bootJar -x test --no-daemon

FROM eclipse-temurin:17-jre

WORKDIR /app

COPY --from=builder \
/workspace/build/libs/backend-0.0.1-SNAPSHOT.jar \
app.jar

ENV TZ=Asia/Seoul
ENV TNS_ADMIN_PATH=/app/Wallet

EXPOSE 8080

ENTRYPOINT ["java", "-jar", "app.jar"]
