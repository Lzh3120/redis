# 集成mybaits-puls

1. 引入mybatis-plus及pageHelper依赖
2. 增加mysql配置
3. 启动类增加mapper扫描注解
4. 编写实体类
5. 编写mapper
6. 开始开发
7. 集成PageHelper插件

## 引入依赖
```xml
<dependency>
    <groupId>com.baomidou</groupId>
    <artifactId>mybatis-plus-boot-starter</artifactId>
    <version>3.5.2</version>
</dependency>
<dependency>
    <groupId>mysql</groupId>
    <artifactId>mysql-connector-java</artifactId>
    <scope>runtime</scope>
</dependency>
```

## 配置信息
```
# DataSource Config
spring:
  datasource:
    url: jdbc:mysql://1.116.***.***:3306/blog?characterEncoding=utf-8&useSSL=false&&serverTimezone=UTC&allowPublicKeyRetrieval=true
    username: root
    password: ***
    driver-class-name: com.mysql.cj.jdbc.Driver
mybatis:
  configuration:
    # Mybatis 开启驼峰标识, 数据库为下划线命名规则, 而实体类为驼峰标识, 不开启此选项无法查询出数据
    map-underscore-to-camel-case: true
```

## 启动类增加扫描注解
```java
@SpringBootApplication
@MapperScan("com.mapper")
public class Application {

    public static void main(String[] args) {
        SpringApplication.run(Application.class, args);
    }

}
```

## 编写实体类
```java
@Data
@TableName("sys_user")
public class User {
    @TableId
    private Long id;
    private String name;
    private Integer age;
    private String email;
}
```

## 编写mapper类
```java
public interface UserMapper extends BaseMapper<User> {

}
```

## 集成PageHelper插件

### 修改依赖信息

```xml
<dependency>
    <groupId>com.github.pagehelper</groupId>
    <artifactId>pagehelper-spring-boot-starter</artifactId>
    <version>1.4.5</version>
    <exclusions>
        <exclusion>
            <groupId>org.mybatis</groupId>
            <artifactId>mybatis</artifactId>
        </exclusion>
        <exclusion>
            <groupId>org.mybatis</groupId>
            <artifactId>mybatis-spring</artifactId>
        </exclusion>
    </exclusions>
</dependency>
```

### 添加pageHelper配置信息
```
############# 分页插件PageHelper配置 #############
pagehelper: 
  helper-dialect: mysql
  reasonable: true
  support-methods-arguments: true
  pageSizeZero: true
  params: count=countSql
```
### 添加Page封装类
```java
@Data
public class PageResult<T>{

	private int page;
	private int size;
	private long total;
	private int pageTotal;
	private List<T> list;
	
	public PageResult(List<? extends T> list) {
		PageInfo<T> page = new PageInfo<>(list);
		this.page = page.getPageNum();
		this.size = page.getPageSize();
		this.total = page.getTotal();
		this.pageTotal = page.getPages();
		this.list = page.getList();
	}

}
```

### 编写代码
```java
@Autowired
UserMapper userMapper;

@GetMapping("/list")
public Object list(String key) {
    PageHelper.startPage(1, 10);
    List<User> list = userMapper.selectList(null);
    PageResult<User> page = new PageResult<>(list);
    return page;
}
```

参考链接:
1. [mybatis-plus官网](https://baomidou.com/)