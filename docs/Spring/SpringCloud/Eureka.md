# 注册中心 Eureka

## 服务端配置

### 引入依赖
```xml
<!--为服务注册中心引入 Eureka Server 的依赖-->
<dependency>
    <groupId>org.springframework.cloud</groupId>
    <artifactId>spring-cloud-starter-netflix-eureka-server</artifactId>
</dependency>
```

### 配置信息
```
eureka:
  instance:
    hostname: localhost
  client:
    registerWithEureka: false #是否注册到eureka
    fetchRegistry: false #是否从eureka中拉取注册信息
    serviceUrl: #暴露eureka服务的地址
      defaultZone: http://${eureka.instance.hostname}:${server.port}/eureka/
  server: #自我保护模式
    enable-self-preservation: true
    eviction-interval-timer-ms: 60 #清理无效节点的时间间隔,默认60秒,设置60毫秒
```

### 启动类添加启动注解
```
@EnableEurekaServer		//开启eureka服务
@SpringBootApplication
public class EurekaApplication{
	
	public static void main(String[] args) {
		SpringApplication.run(EurekaApplication.class, args);
	}

}
```

### 访问路径

http://localhost:8761/


## 客户端配置

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
```

### 配置信息
```
server:
  port: 8001
spring:
  application:
    name: user-consumer
eureka:
  client:
    service-url:
      defaultZone: http://localhost:8761/eureka
```

### 启动类添加启动注解
```java
@EnableEurekaClient        //开启eureka客户端
@SpringBootApplication
public class UserApplication {
	
	public static void main(String[] args) {
		SpringApplication.run(UserApplication.class, args);
	}

}
```

## Eureka用户认证

### 添加依赖
```
<!-- 安全组件 -->
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-security</artifactId>
</dependency>
```

### 添加配置类
```java
/**
 * eureka认证配置
 */
@EnableWebSecurity
public class WebSecurityConfig extends WebSecurityConfigurerAdapter {
    @Override
    protected void configure(HttpSecurity http) throws Exception {
        //关闭csrf
        http.csrf().disable();
        //开启认证,url格式登录必须时httpBasic
        http.authorizeHttpRequests().anyRequest().authenticated().and().httpBasic();
    }
}
```

### 添加配置
```
security:
  basic:
    enable: true # 开启认证
spring:
  security:
    user:
      name: admin
      password: admin
```

### 客户端改造,添加用户名密码即可
```
eureka:
  client:
    service-url:
      defaultZone: http://admin:admin@localhost:8761/eureka
```

## 服务续约保活

客户端启动后向eureka注册自身,间隔时间发送心跳信息证明自己存活.

### 服务端配置
```
eureka:
  server: #自我保护模式 保活
    enable-self-preservation: true
    eviction-interval-timer-ms: 60 #清理无效节点的时间间隔,默认60秒,设置60毫秒
    renewal-percent-threshold: 0.85 # 统计15分钟内心跳低于85%的实例,保护起来
```

### 服务端配置
```
eureka:
  client:
    service-url:
      defaultZone: http://admin:admin@localhost:8761/eureka
    registry-fetch-interval-seconds: 30 # eureka client 间隔多久拉取注册信息,默认30秒
  instance:
    lease-renewal-interval-in-seconds: 30 # 服务续约,心态哦的时间间隔
    lease-expiration-duration-in-seconds: 90 #从第一次收到心跳,90秒没有收到,剔除服务
```

## Eureka健康检查

默认的健康检查只检查服务是UP还是DOWN,可以自定义检查项,比如数据库连接等,单独线程调用,隔一段时间调用一次

### 依赖项
```
<!-- eureka健康检查依赖 -->
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-actuator</artifactId>
</dependency>
```

### 自定义健康检查
```java
/**
 * 自定义健康检查
 */
@Configuration
public class HealthConfig implements HealthIndicator {

    @Override
    public Health health() {
        return new Health.Builder(Status.UP).build();
    }
}
```

## Eureka服务高可用

整个微服务存在多个eureka服务,每个eureka服务都是互相复制的,会把客户端复制到集群中其他eureka服务.

