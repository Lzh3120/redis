# Service

定义：Service是为一组提供服务的Pod抽象一个稳定的网络访问地址

yaml定义
```yaml
apiVersion: v1      #版本
kind: Service       #类型
metadata:           #元数据
  name: my-service  #Service名称
  namespace:space   #空间
  labels:
    - name:label    #标签
  annorations:
    - name: anno    #注解
spec:               #详细描述
  selector:         #选择器
    app.kubernetes.io/name: MyApp
  type:ClusterIP/NodePort/LoadBalancer      #类型
  ClusterIP: 0.0.0.0    #虚拟服务的IP地址
  sessionAffinity: None/ClusterIP   #Session策略
  ports:            #端口列表
    - protocol: TCP #协议
      port: 80      #监听的端口
      targetPort: 9376  #目标服务端口
```

Service作用：
1. 提供稳定的访问地址（域名或IP地址）
2. 负载均衡功能
3. 屏蔽后端Endpoint
4. 为外部服务创建Service
5. 暴露服务到集群外
6. 支持多种网络协议
7. 服务发现机制
8. Headless Service
9. 端点分片
10. 服务拓展

Service实现的微服务中的 服务全自动注册，服务发现，服务负载均衡等功能。Service可以通过Ip：port访问，也可以通过DNS域名访问。
一个完整的IP：Port访问地址，在k8s中叫Endpoint。
查看endpoint：kubectl get endpoints

## Service负载均衡机制

从ServiceIP到Pod的负载均衡机制，是通过每个Node上的kube-proxy负责实现。

### kube-proxy的代理模式
1. userspace模式：用户空间模式，效率低下，不再推荐使用
2. iptables模式：设置Kernel的iptables规则，实现Service到后端Endpoint列表的负载均衡分发规则，效率很高。
3. ipvs模式：设置Kernal的netlink接口设置ipvs规则，转发效率和吞吐率都是最高的。ipvs不可用时，会降级到iptables。负载策略：
  - rr：round-robin 轮询
  - lc：least connection 最小连接数
  - dh：destination hashing 目的地址hash
  - sh：source hashing 源地址hash
  - sed：shortest expected delay 最短期望延时
  - nq：never queue 永不排队
4. kernelspace模式：windows上的代理模式
### 会话保持机制
通过设置sessionAffinity实现了基于客户端IP的会话保持机制。

## Service的多端口设置
```yaml
# 多端口
sepc: 
  ports:
  - port: 8080
    targetPort: 8080
    name: web
  - port: 8090
    targetPort: 8090
    name: management
# 单端口多协议
sepc: 
  ports:
  - port: 8080
    protocol: UDP
    name: dns
  - port: 8080
    protocol: TCP
    name: dns-tcp
```
## 将外部服务定义为Service
普通的Service通过Label Selector对后端Endpoint进行抽象，也可以对任意集群外部服务进行抽象供集群内部使用。场景：
1. 已部署的一个集群外服务，如数据库，缓存服务
2. 其他集群的某个服务
3. 迁移过程中对某个服务进行访问验证

实现时通过定义一个Endpoint，被Service引用即可

## 将Service暴漏到集群外部
Service的type类型：
1. ClusterIP：自动为Service设置的虚拟IP地址，仅可被集群内访问。
2. NodePort：将Service的端口号映射到每个Node的一个端口号上，在集群中的任意Node都可以作为Servcie的访问入口即NodeIP：NodePort
3. LoadBalancer：将Service映射到一个已存在的负载均衡的IP地址上，在公有云使用
4. ExternalName：将Service映射为一个外部域名地址

### NodePort
```yaml
spec: 
  type: NodePort
  ports: 
  - port: 8080
    targetPort: 8080
    nodePort: 8081
```
就可以在任意一个Node的Ip地址和8081进行访问Service。

如果Node上有多块网卡，会在所有网卡上绑定8081.可以通过设置启动参数--nodeport-address指定设置绑定端口的网卡。

如果定义时为指定nodePort端口号，则会自动分配一个可用端口号.

### LoadBalancer
 公有云提供的LoadBalancer可以直接将流量转发到后端Pod上,无需通过kube-proxy.
### ExternalName类型
将集群外的服务定义为Service.

## Service支持的网络协议
1. TCP:默认的网络协议
2. UDP:可用于大多数类型的Service
3. HTTP
4. PROXY
5. SCTP

通过AppProtocol字段设置协议类型

## 服务发现机制
环境变量方法和DNS方式

### 环境变量方式

在Pod运行起来时,系统自动将容器运行环境注入所有集群中有效Service的信息.Service信息包括服务IP,服务端口号,个端口号的协议等.

然后客户端就能够根据Service相关环境变量的命名规则,从环境变量中获取访问的目标服务的地址了.

### DNS方式

k8s集群中需要一个DNS服务,现在时CoreDNS.

## Headless Service的应用

Headless Service是这种服务没有入口访问地址,kube-proxy不会为其创建负载均衡转发规则,服务名解析取决于该HeadLess Service是否设置了Label Selector

### 设置了Label Selector
如果设置了Label,k8s将根据label查询后端Pod列表,自动创建Endpoint咧白哦,将服务名解析机制设置为:当客户端访问该服务名时,得到全部的Endpoint列表

### 没有设置Label Selector
不会自动创建Endpoint列表,会根据以下条件尝试对该服务名设置DNS记录
1. 如果Service类型为ExternalName,则对服务名的访问直接被DNS系统转换为Service设置的外部名称
2. 如果系统中存在同名的Endpoint列表,则服务名将被解析为Endpoint中的列表.

## 端点分片和服务拓扑

### 端点分片

Service的后端时一组Endpoint列表,kube-proxy需要维护大量的负载分发规则,对资源影响极大.

k8s引入了端点分片,包括一个新的 EndpointSlice资源对象 和 一个 EndpointSlice控制器.

#### EndpointSlice

1. EndpointSlice通过对Endpoint进行分片管理降低Master和各Node之间的网络传输和提高整体性能.
2. 为基于Node拓扑的服务路由提供支持

#### 服务拓扑





参考链接

https://kubernetes.io/docs/concepts/services-networking/service/
