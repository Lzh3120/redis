# Spring Boot


## **Spring Boot SPI机制**

SPI在springboot中是去读取META-INF/spring.factories目录的配置文件内容,把配置文件中的类加载到spring容器中.这样就可以把一个类加载到spring容器中.

把一个类加载到spring容器中管理的几种方式:
1. 通过xml的bean标签
2. 通过@Component注解被@ComponentScan扫描
3. 通过在spring.factories配置该类

前两种是加载本工程的bean,第三种加载是加载第三方定义jar中的bean.


## **Spring Boot启动流程**
1. 准备环境，根据不同的环境创建不同的Environment
2. 准备，加载上下文，为不同的环境选择不同的SpringContext，然后加载资源，配置Bean
3. 初始化，这个阶段刷新SpringContext，启动应用
4. 最后结束流程


## **事务传播机制**
1. PROPAGATION_REQUIRED：当前没有事务，创建一个信事务；当前存在事务，就加入该事务，通常我们的默认选择
2. PROPAGATION_REQUIRES_NEW：创建新事务，无论当前存不存在事务，都创建新事务
3. PROPAGATION_NESTED：如果当前存在事务，则在嵌套事务内执行，如果当前没有事务，则按REQUIRED属性执行
4. PROPAGATION_NOT_SUPPORTED：以非事务方式执行操作，如果当前存在事务，把当前事务挂起
5. PROPAGATION_NEVER：以非事务方式执行，如果存在事务，抛出异常
6. PROPAGATION_MANDATORY：支持当前事务，如果当前存在事务，就加入该事务，如果当前不存在事务，就抛出异常
7. PROPAGATION_SUPPORTS：支持当前事务，如果当前存在事务，就加入该事务，如果当前不存在，就以非事务执行