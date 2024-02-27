# Spring源码

## 源码结构图
- new AnnotationConfigApplicationContext("com");
    - scan(basePackages)
    - refresh()
        - obtainFreshBeanFactory();
        - prepareBeanFactory(beanFactory);
        - invokeBeanFactoryPostProcessors(beanFactory);
        - registerBeanPostProcessors(beanFactory);
        - onRefresh();
        - finishBeanFactoryInitialization(beanFactory);
            - beanFactory.freezeConfiguration();
            - beanFactory.preInstantiateSingletons();
                - new ArrayList<>(this.beanDefinitionNames);
                - getBean(FACTORY_BEAN_PREFIX + beanName);
                - getBean(beanName);
                    - doGetBean();
                        - Object sharedInstance = getSingleton(beanName);
                        - String[] dependsOn = mbd.getDependsOn()-getBean(dep);
                        - mbd.isSingleton();
                        - createBean(beanName, mbd, args);
                            - resolveBeanClass(mbd, beanName);
                            - prepareMethodOverrides();
                            - resolveBeforeInstantiation(beanName, mbdToUse);
                            - doCreateBean(beanName, mbdToUse, args);
                                - BeanWrapper instanceWrapper = null;
                                - instanceWrapper = createBeanInstance(beanName, mbd, args);
                                - Object bean = instanceWrapper.getWrappedInstance();
                                - applyMergedBeanDefinitionPostProcessors(mbd, beanType, beanName);
                                - Object exposedObject = bean;
                                - populateBean(beanName, mbd, instanceWrapper);
                                - exposedObject = initializeBean(beanName, exposedObject, mbd);
                                - registerDisposableBeanIfNecessary(beanName, bean, mbd);
                - smartSingleton.afterSingletonsInstantiated();



## new AnnotationConfigApplicationContext("com");
```java
//扫描包中注解的类
scan(basePackages)
//刷新容器
refresh()
```

## refresh();
```java
//创建beanFactory
ConfigurableListableBeanFactory beanFactory = obtainFreshBeanFactory();
//准备一些BeanFactory需要的类
prepareBeanFactory(beanFactory);
//子容器在此方法进行一些后置处理器处理
postProcessBeanFactory(beanFactory);
//调用BeanFacotryPostProcessors处理beanFacotry
invokeBeanFactoryPostProcessors(beanFactory);
//注册BeanPostProcessor后置处理器
registerBeanPostProcessors(beanFactory);
//钩子函数,springBoot中tomcat在此启动
onRefresh();
//实例化非懒加载的单例bean
finishBeanFactoryInitialization(beanFactory);
```

## invokeBeanFactoryPostProcessors(beanFactory);
```java
//处理BeanFacotryPostProcessors 类型的处理器
invokeBeanFactoryPostProcessors(beanFactory, getBeanFactoryPostProcessors());
    //获取BeanFactoryPostProcessors
    getBeanFactoryPostProcessors();

//待处理类型
BeanDefinitionRegistryPostProcessor
    PriorityOrdered类型的
    Ordered类型的
    其他类型的
BeanFactoryPostProcessor
    PriorityOrdered类型的
    Ordered类型的
    其他类型的



```

## registerBeanPostProcessors(beanFactory);
```java
BeanPostProcessor
    PriorityOrdered
    Ordered
    nonOrdered
将3中类型的BeanPostProcessor注册到beanFacotry中

registerBeanPostProcessors(beanFactory, internalPostProcessors);
```

## finishBeanFactoryInitialization(beanFactory);
```java
//缓存所有的beanDefinition元数据
beanFactory.freezeConfiguration();
//实例化所有的非懒加载的单例bean
beanFactory.preInstantiateSingletons();
```

## beanFactory.preInstantiateSingletons();
```java
//获取所有的beanDefinitionNames
List<String> beanNames = new ArrayList<>(this.beanDefinitionNames);

//如果是工厂类
if (isFactoryBean(beanName)) {
    //获取工厂类 &开头
    Object bean = getBean(FACTORY_BEAN_PREFIX + beanName);
    //如果bean是FactoryBean
    if (bean instanceof FactoryBean){
        //满足条件的bean,提前初始化
        boolean isEagerInit;
        if (isEagerInit) {
			getBean(beanName);
		}
    }
}else{
    //非工厂类的bean,进行初始化
    getBean(beanName);
}

//从缓存中获取bean
//触发所有bean的初始化后回调
Object singletonInstance = getSingleton(beanName);
if (singletonInstance instanceof SmartInitializingSingleton){
    SmartInitializingSingleton smartSingleton = (SmartInitializingSingleton) singletonInstance;
    smartSingleton.afterSingletonsInstantiated();
}

```

## getBean(beanName)-doGetBean();
```java
//从缓存中获取bean
Object sharedInstance = getSingleton(beanName);
//从缓存中获取到bean,且参数为空
if (sharedInstance != null && args == null){

    beanInstance = getObjectForBeanInstance(sharedInstance, name, beanName, null);
}else{
//未从缓存中获取到
    //获取bean的BeanDefinition
    RootBeanDefinition mbd = getMergedLocalBeanDefinition(beanName);
    //获取bean所依赖的其他备案
    String[] dependsOn = mbd.getDependsOn();
    if (dependsOn != null) {
        for (String dep : dependsOn){
            //注册bean,在bean被注销时,注销被依赖的bean
            registerDependentBean(dep, beanName);
            //实例化被依赖的bean
            getBean(dep);
        }
    }
    //如果bean是单例的
    if (mbd.isSingleton()) {
        //创建bean
        return createBean(beanName, mbd, args);
    }else if(mbd.isPrototype()){
        //如果bean的多例的
    }else{
        //其他类型的bean
    }
}
```

## createBean(beanName, mbd, args);
```java
RootBeanDefinition mbdToUse = mbd;

Class<?> resolvedClass = resolveBeanClass(mbd, beanName);

mbdToUse.prepareMethodOverrides();
//对bean Definigition中的属性做前置处理
Object bean = resolveBeforeInstantiation(beanName, mbdToUse);

Object beanInstance = doCreateBean(beanName, mbdToUse, args);
```

## doCreateBean(beanName, mbdToUse, args);
```java
BeanWrapper instanceWrapper = null;
//根据指定的bean使用对应的策略创建新的实例
instanceWrapper = createBeanInstance(beanName, mbd, args);

Object bean = instanceWrapper.getWrappedInstance();

applyMergedBeanDefinitionPostProcessors(mbd, beanType, beanName);

Object exposedObject = bean;
//对bean进行填充，将各个属性值注入
populateBean(beanName, mbd, instanceWrapper);
//调用初始化方法
exposedObject = initializeBean(beanName, exposedObject, mbd);

registerDisposableBeanIfNecessary(beanName, bean, mbd);
```

initializeBean(beanName, exposedObject, mbd);
```java
//激活Aware方法，spring中提供了一些Aware相关接口，可以获取一些对应的资源。
invokeAwareMethods();
//前置处理器
applyBeanPostProcessorsBeforeInitialization();
    postProcessBeforeInitialization();
//激活自定义的初始化方法
invokeInitMethods();
//后置处理器
applyBeanPostProcessorsAfterInitialization();
```