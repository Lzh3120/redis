# Spring面试题

> Spring核心

IOC容器:Spring通过将对象提前创建放入ioc容器中进行管理,避免对象在调用时多次创建.从而实现控制反转,由使用方实实现依赖类的注入.IOC是基于ioc容器完成的管理,ioc容器就是对象工厂.

AOP切面:面向切面编程,可以在不修改业务逻辑的清空下,为业务增加一系列功能,包括日志,事务等功能.

> Spring提供两种ioc容器的实现:
1. BeanFactory:ioc的基本实现,spring自带,不提供给开发人员,特点:加载配置文件时不会创建对象,使用时才创建.
2. ApplicationContext:BeanFactory对象的子接口,提供更强大的功能,特点:加载配置文件时,就去创建对象.

> 常见的3种依赖注入方式:
1. set方法进行注入
2. 使用有参构造进行注入

> Bean的作用域:
1. singleton:单例模式
2. prototype:多例模式
3. session:存在于用户请求过程中
4. request:存在于一次请求中

> BeanFacotry和FactoryBean的区别
1. BeanFactory:Bean工厂,生产bean
2. FactoryBean:工厂Bean,返回某一种bean对象

> 常用注解
1. 创建Bean: @Controller @Service @Repository @Component @Bean
2. 配置文件: @Configuration
3. 注入Bean:

> 使用的设计模式
1. 工厂模式:bean工厂
2. 模板方法模式:***Template
3. 策略模式:
4. 动态代理模式: aop动态代理
5. 

> 描述spring源码过程



>AOP的原理,使用了动态代理
1. 有接口的情况,使用jdk动态代理
2. 没有接口的情况,使用CGLIB动态代理


