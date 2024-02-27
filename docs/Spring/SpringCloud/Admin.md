# Admin服务监控

## 服务端

### 引入依赖
```xml
<!--为服务注册中心引入 Eureka Client 的依赖-->
<dependency>
    <groupId>org.springframework.cloud</groupId>
    <artifactId>spring-cloud-starter-netflix-eureka-client</artifactId>
</dependency>
<!-- web依赖 -->
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-web</artifactId>
</dependency>
<!-- admin -->
<dependency>
    <groupId>de.codecentric</groupId>
    <artifactId>spring-boot-admin-starter-server</artifactId>
    <version>2.6.7</version>
</dependency>

```

### 启动类增加启动注解
```java
@EnableEurekaClient        //开启eureka客户端
@EnableAdminServer			//开启Admin
@SpringBootApplication
public class AdminApplication {
	public static void main(String[] args) {
		SpringApplication.run(AdminApplication.class, args);
	}
}
```

### 增加密码配置
```
spring:
  application:
    name: admin
  security:
    user:
      name: admin
      password: admin
```

## 客户端

### 增加依赖
```
<!-- admin client -->
<dependency>
    <groupId>de.codecentric</groupId>
    <artifactId>spring-boot-admin-starter-client</artifactId>
    <version>2.6.7</version>
</dependency>
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-actuator</artifactId>
</dependency>
```

### 增加配置
```
server:
  port: 8001
  servlet:
    context-path: /user
spring:
  application:
    name: user-consumer
eureka:
  client:
    service-url:
      defaultZone: http://admin:admin@localhost:8761/eureka/
    registry-fetch-interval-seconds: 30 # eureka client 间隔多久拉取注册信息,默认30秒
  instance:
    lease-renewal-interval-in-seconds: 30 # 服务续约,心态哦的时间间隔
    lease-expiration-duration-in-seconds: 90 #从第一次收到心跳,90秒没有收到,剔除服务
    prefer-ip-address: true
    metadata-map: #给admin忽略请求前缀
      management:
        context-path: ${server.servlet.context-path}/actuator
#启动actuator,给admin提供信息
management:
  endpoint:
    health:
      show-details: ALWAYS
  endpoints:
    enabled-by-default: true
    web:
      base-path: /actuator
      exposure:
        include: '*'
```