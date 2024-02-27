# Spring源码

## **对IOC和AOP的理解**
**IOC**：控制反转，通过Spring管理对象的创建，配置和生命周期，相当于把控制权交给Spring，不需要人工管理对象间关系，这样就做到解耦。Spring中提供了BeanFactory和ApplicationContext两种IOC容器，通过它们对Bean管理

**AOP**：面向切面编程，提高代码的模块性。AOP基于动态代理实现，实现接口的使用JDk动态代理，无接口的使用CGLIB代理。Spring中AOP主要用在事务，日志，异常处理等方面，通过在代码前后做一些增强处理。
spring提供了Aspect切面，JointPoint连接点，PointCut切入点，Advice增强等实现方式。

## **JDK动态代理和CGLIB的区别**
JDK动态代理：针对实现了接口AOP使用JDK动态代理，基于反射的机制实现，生成一个实现同样接口的代理类，通过重写方法的方式，实现对代码的增强。
CGLIB动态代理：针对无接口AOP使用CGLIB动态代理，底层原理基于asm第三方框架，通过修改字节码生成一个子类，然后重写父类的方法，实现对代码增强。

## **Spring AOP和Aspect AOP区别**
Spring AOP基于动态代理实现，属于运行时增强
AspectJ属于编译期增强，3中方式
1. 编译时织入：增强的代码在代码和源代码都有，直接使用AspectJ编译器编译就行，编译之后生成一个新类，作为正常类加载
2. 编译后织入：代码编译后class或war包后进行增强，就是编译后织入，比如依赖了第三方库，又想增强的话，通过这种方式
3. 加载时织入：JVM加载类时进行织入
总：Spring AOP只能运行时织入，不需要单独编译，性能比AspectJ慢，而AspcetJ只支持编译前后和加载时织入，性能更好，功能更强大

## **FactoryBean 和 BeanFactory区别**
BeanFactory是Bean工厂，ApplicationContext的父类，IOC容器核心，负责生产和管理Bean对象
FactoryBean是Bean，通过实现FactoryBean接口定制实例化Bean的逻辑，通过代理一个Bean对象，对方法前后做一些操作。


## **关键流程**
1. 创建BeanFacotry
2. BeanPostProcessor处理BeanFacotry
3. 实例化Bean：创建一个Bean对象
4. 填充属性：为属性赋值
5. 初始化
    - 如果实现了xxxAware接口，通过不同类型的Aware接口拿到Spring容器的资源
    - 如果实现了BeanPostProcessor接口，则会回调该接口的postProcessBeforeinitialzation和postProcessAfterInitialization方法
    - 如果配置了init-method方法，则会执行init-method配置的方法
6. 销毁
    - 容器关闭后，如果Bean实现了DisposableBean接口，则回调该接口的destroy方法
    - 如果配置了destroy-method方法，则会执行destroy-method配置的方法

## **如何解决循环依赖**
spring解决循环依赖有两个前提：
1. 不全是构造器方法的循环依赖
2. 必须是单例
本质上解决循环依赖就是三级缓存，通过三级缓存提前拿到未初始化完全的对象

1. 第一级缓存：用来保存实例化，初始化都完成的对象
2. 第二季缓存：保存实例化完成，但未初始化完成的对象
3. 第三级缓存：保存一个对象工厂，提供一个匿名内部类，用于创建二级缓存中的对象

**解决循环依赖过程：**
1. 创建对象A，实例化时把A对象工厂放入三级缓存
2. A注入属性时，发现依赖B，转而去实例化B
3. 同样创建对象B，注入属性时发现依赖A，一次从一级到三级缓存查询A，从三级缓存通过对象工厂拿到A，把A放入二级缓存，同时删除三级缓存中的A，此时，B已经实例化并且初始化完成，把B放入一级缓存
4. 接着继续创建A，顺利从一次缓存拿到实例化且初始化完成的B对象，A对象创建也完成，删除二级缓存中的A，同时把A放入一级缓存
5. 最后，一级缓存中保存着实例化，初始化都完成的A，B对象

由于实例化和初始化的流程分开了，如果都是用构造器的话，就没法分离这个操作，所以都是构造器就无法解决循环依赖的问题

## **为什么是三级缓存，二级不行吗**
不可以，主要为了生成代理对象
因为三次缓存放的是生成具体对象的匿名内部类，他可以生成代理对象，也可以是普通的实例对象。
使用三级缓存主要为了保证不管什么时候使用的都是一个对象。
假设只有二级缓存，往二级缓存中放的显示一个普通的Bean对象，BeanPostProcessor去生成代理对象之后，覆盖掉二级缓存中的普通Bean对象，那么多线程下可能取到的对象就不一致了。



#### **使用的设计模式**
1. 代理模式：       AOP动态代理
2. 模板方法模式：   RestTemplate、RedisTemplate，JDBCTemplate
3. 工厂方法模式：   BeanFactory
4. 单例模式：       Bean的单例模式，一级缓存单例模式
5. 委托模式：       解析xml文件时的委托模式
6. 观察者模式：     事件驱动通知
7. 装饰者模式：     配置DataSource时，赋予不同功能
8. 适配器模式：     DispatcherServlet根据请求调用HandlerMapping
9. 策略设计模式：   资源访问属于策略设计模式

