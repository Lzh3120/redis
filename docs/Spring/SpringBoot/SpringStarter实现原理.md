# SpringStarter实现原理

springboot利用starter,避免了繁琐的配置,将starter里的功能做到开箱即用.

## **SPI机制**

SPI全称Service Provider Interface,是java提供的一套用来被第三方实现或者扩展的接口,可以用来启用框架扩展和替换组件.SPI的作用就是为这些被扩展的API寻找服务实现.

编程时面向接口Interface进行调用,SPI是调用方来定制接口规范,提供给外部实现,调用方在调用时选择自己需要的外部实现.

### **SPI的简单实现**

1. 定义一个接口
```java
public interface Service{
    void print();
}
```
2. 通过接口实现两个类
```java
public class OneServcie implements Service{
    public void print(){
        sysout(one);
    }
}

public class TwoService implements Service{
    public void print(){
        sysout(two);
    }
}

```
3. 然后在resources目录下新建META-INF/services目录,并在这个目录下面新建一个与上述接口的全限定名一致的文件,在这个文件中写入接口的实现类的全限定名.

4. 然后通过serviceLoader加载实现类并调用
```java
public static void main(String[] args){
    ServiceLoader<Service> service = ServiceLoader.load(Service.class);
    for(Service s : service){
        s.print();
    }
}
```

### **dubbo SPI**

dubbo是一个高度可扩展的rpc框架,也依赖于java的spi,但dubbo对java的spi做出了一定的扩展,使其功能强大.

java的api有以下缺点:
1. 只能遍历所有的实现类,并全部实例化
2. 配置文件中只是简单的列出了所有扩展实现,没有命名,导致无法准确的引用它们
3. 扩展如果依赖其他扩展,做不到自动注入和装配
4. 扩展很难和其他的框架集成

spi的优点:
1. 不需要改动源码就可以实现扩展,解耦
2. 实现扩展对原来的代码几乎没有侵入性
3. 只需要添加配置就可以实现扩展,复合开闭原则




## **spring starter实现原理**

SpringBoot通过SPI机制读取META-INF/spring.factories文件中配置的类信息,将其加载到spring容器中.



## **自定义starter**

1. 创建一个module,pom.xml文件中增加依赖和打包方式
```xml
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-configuration-processor</artifactId>
    <optional>true</optional>
</dependency>
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-autoconfigure</artifactId>
</dependency>

<build>
    <plugins>
        <plugin>
            <groupId>org.apache.maven.plugins</groupId>
            <artifactId>maven-source-plugin</artifactId>
            <executions>
                <execution>
                    <phase>package</phase>
                    <goals>
                        <goal>
                            jar-no-fork
                        </goal>
                    </goals>
                </execution>
            </executions>
        </plugin>
    </plugins>
</build>
```
spring-boot-configuration-processor的作用是编译时生成spring-configuration-metadata.json文件.打包时选择jar-no-fork,不需要main函数

2. 自动配置开关
```
@Target({ElementType.TYPE})
@Retention(RetentionPolicy.RUNTIME)
@Documented
@Inherited
public @interface EnableDemoCongifuration{

}
```

3. 自动注入
```java
@Data
@ConfigurationProperties(pregix = "demo")
public class DemoProperties{
    private String name;
    private Integer age;
}

@Configuration
@ConditionalOnBean(annotation = EnableDemoConfiguration.class)
@EnableConfigurationProperties(DemoProperties.class)
public class DemoAutoConfiguration{
    DemoService demoService(){
        return null;
    }
}
```

4. 编写业务类
```java
public class DemoService{
    @Autowired
    private DemoProperties demoP;

    public void print(){

    }
}
```

5.  在resources/META-INF/下创建spring.factories文件,并填入以下信息
```
org.springframework.boot.autoconfigure.EnableAutoConfiguration=\com.lzh.DemoAutoConfiguration
```

6. 本地maven install,在新的springboot项目中引用自定义jar,然后在启动类中开启配置
```java
@SpringBootApplication
@EnableDemoConfiguration
public class AutoApplication {

}
```

## **EnableAutoConfiguration原理**

待完成