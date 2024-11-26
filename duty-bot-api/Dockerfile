FROM openjdk:23-jdk AS build-stage
WORKDIR /api

COPY mvnw .
COPY .mvn .mvn
COPY pom.xml .
RUN ./mvnw dependency:go-offline

COPY ./src ./src
RUN ./mvnw package -DskipTests

FROM openjdk:19-jdk-alpine3.16 AS run-stage
RUN apk --no-cache add curl
COPY --from=build-stage /api/target/DutyBot*.jar ./DutyBot.jar
CMD ["java", "-jar", "DutyBot.jar"]