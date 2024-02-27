# 三级缓存概念理解

一个对象的初始化过程：

创建A-实例化A（放入三级缓存）-属性注入（检查依赖的对象是否存在）-对A进行初始化-清除二级缓存，放入一级缓存-结束

三级缓存：
1. 一级缓存：存放已经初始化完成的bean，为Spring的单例属性而生
2. 二级缓存：存放半成品的AOP的单例Bean，为解决AOP而生
3. 三级缓存：存放生成半成品单例Bean的工程方法，为打破循环而生


当A-B类循环依赖时 流程解读：
1. getBean(A)，在一级二级缓存中未发现A，然后将A的代理工程放入三级缓存中，发现A依赖B，去getBean(B)
2. 准备创建B，发现B又依赖A，需要去创建A
3. 去创建A，从三级缓存中拿到A的代理工程，获取A的代理对象，放入二级缓存，并清理三级缓存
4. 有了A的代理对象，B依赖A解决，A为半成品在二级缓存中，B初始化完成，进入一级缓存
5. 将B注入A中，完成A的初始化工作，A进入一级缓存中

为什么需要三级缓存：

三级缓存是为了解决AOP代理的问题，三级缓存中存放对象的工厂类，当Bean有AOP时，工厂类生成Bean的代理类放入二级缓存，当Bean无AOP时，二级缓存中存放的是半成品Bean。

能否干掉二级缓存：不能

因为当A需要AOP时，代理对象生成的都是不同的对象，所以需要二级缓存进行去重。如果没有AOP，只需要一三级缓存就够了

参考链接： https://mp.weixin.qq.com/s?__biz=Mzg2NzYyNjQzNg==&mid=2247506165&idx=1&sn=9aeb40bae2e4684e89aad7901fbe7297&chksm=ceba245ef9cdad480aa5df971abcebcec204473adbda9a3c639f9d8d78a6d8bbb6e772c6eab7&mpshare=1&scene=1&srcid=1222CR1ch072MsLkQcWMs2jW&sharer_sharetime=1671718331807&sharer_shareid=642d83d9c8fefc74f6f02afd4a4babf1#rd