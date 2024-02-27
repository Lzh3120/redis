# Ingress
 
 Service工作在TCP/IP层,Ingress工作在Http层.

 k8s使用一个**Ingress策略定义** 和一个具体提供转发服务的**Ingress Controller**实现基于Ingress测类定义的路由功能.ingress实现的时类似于边缘路由器的功能.

 Ingress只能提供Http和Https服务.对于其他网络协议,可以通过设置Service的类型为NodePort或LoadBalancer对集群外部提供服务.

 使用Ingress进行服务路由时,Ingress Controller基于Ingress规则将客户端请求直接转发到Servcie对应的后端Endpoint上,这样会跳过kube-proxy设置的路由转发规则,以提高网络转发效率.

 ## 部署Ingress
 1. 部署IngressController
 2. 创建Ingress策略
 3. 客户端通过Ingress Controller访问后端服务 

目前IngressController有多种实现方案.

在k8s中,IngressController会持续监控API Server的/ingress接口的变化.当发生变化时,IngressController会自动更新其转发规则.

### 配置详解
```yaml
spec: 
  rules: 
  - host: my.com
    http: 
      paths: 
      - path: /demo
        pathType: ImplementationSpecific
        backend: 
         service: 
           name: webapp
           port:
             number: 8080
```
配置(rules)规则:
1. host(可选配置):基于域名访问
2. http.paths:基于路径进行转发
3. backend:目标后端服务,包括服务的名称和端口号

路径类型(pathType):
1. ImplementationSpecific:系统默认
2. Exact:精确匹配URL路径,区分大小写
3. Prefix:匹配URL路径的前缀.

host通配符

ingressClassName和IngressClass资源对象

一个k8s中可以配置多种不同类型的IngressController,此时需要设置一个名为ingress.class的annotation进行声明.

### Ingress策略配置
1. 转发到单个后端服务
2. 将同一域名的不同URL路径转发到不同的服务
3. 将不同的域名转发到不同的服务
4. 不使用域名的的转发规则

### Ingress开启TLS安全配置