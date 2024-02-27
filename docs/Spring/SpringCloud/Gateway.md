# Gateway服务网关

## 引入依赖
```
<!--网关gateway的依赖-->
<dependency>
    <groupId>org.springframework.cloud</groupId>
    <artifactId>spring-cloud-starter-gateway</artifactId>
</dependency>
```

## 配置信息
```
spring:
  application:
    name: gateway
  cloud:
    gateway:
      routes:
        - id: user-consumer
          uri: lb://user-consumer
          predicates:
            - Path=/user/**
```