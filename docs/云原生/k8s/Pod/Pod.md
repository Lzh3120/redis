# Pod

重点关注内容：
1. Pod和容器的使用
2. 应用配管理
3. Pod的控制和调度管理
4. Pod的升级和回滚
5. Pod的扩容和缩容机制

## Pod的定义
```yaml


```

## Pod的基本定义
1. Pod是k8s调度的最小单元
2. Pod可由一个或多个容器组合而成
3. 同一个Pod内的容器之间，使用localhost即可互相访问，被绑定在一个环境中。

## 静态Pod
由kublet管理仅存在于特定Node上的Pod。不能通过APIServer管理，无法与RC，Deployment或者deamonSet进行关联，并且kublet无法对它们进行健康检查。有kubelet创建，仅在kublet所在Node上运行。

启动方式：
1. 配置文件方式：在kubelet启动参数中设置staticPodPath参数，kubelet会定期扫描该目录，进行创建Pod。
2. HTTP方式：设置kubelet的启动参数 --manifest-url，会定期从该url地址下载pod的定义文件。

## Pod容器共享Volume
同一个Pod中的多个容器共享Pod级别的存储卷Volume，可以挂在一个emptyDir做到共享。
```yaml
spec: 
  containers:
  - name: tomcat
    volumeMounts:
    - name: app-logs
      mountPath: /usr
  - name: busybox
    volumeMounts:
    - name: app-logs
      mountPath: /usr
  volumes:
  - name: app-logs
    emptyDir: {}
```

## Pod的配置管理
### ConfigMap
场景：
1. 生成容器内的环境变量
2. 设置容器启动命令的启动参数（需设置为环境变量）
3. 以Volume的形式挂载为容器内部的文件或目录

创建方式：
1. 通过yaml创建
```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: cm-appvars
  data:
    apploglevel: info
    appdatadir: /var/data

kubectl create -f cm-appvars.yaml

kubectl get configmap cm-appvars

kubectl describe configmap cm-appvars
```
2. 通过命令创建
  - 通过--from-file参数从文件中进行创建：kubectl create configmap NAME --from-file=filePath
  - 通过--from-file参数从目录下进行创建，文件名为key，内容为value：kubectl create configmap NAME --from-file=dir
  - 使用--from-literal，从文本中创建，直接将指定的key#=value#创建为configmap:kubectl create configmap NAME --from-literal=key1=value1 --from-literal=key2=value2

使用方式：
1. 通过环境变量的方式使用ConfigMap
```yaml
# 引入单个值
spec:
  env:
  - name: APPLOG
    valueFrom:
      configMapKeyReg:
        name: cm-appvars
        key: apploglevel
# 将configmap都引入
spec:
  containers:
  - envFrom:
    - configMapRef:
      name: cm-appvars  #将cm-appvars内所有key vlaue自动生成环境变量
```
2. 通过volumeMount使用ConfigMap
```yaml
spec:
  containers:
  - volumeMounts:
    - name: serverxml   #Volume的名称
      mountPath: /configfiles   #挂载到容器内的目录
    volumes:
    - name: serverxml  #定义volume名字
      configMap:
        name: cm-name  #configMap Name
```

限制条件：
1. ConfigMap无法用于静态Pod

### Downward API（在容器内获取Pod信息）
将容器的元数据注入到容器内部：
1. 环境变量：将元数据设置为容器内的环境变量
2. Volumn挂载：将元数据以文件的形式挂载到容器内部

#### 环境变量方式
```yaml
#设置Pod信息到环境变量
spec:
  containers:
  -env:
    - name: MY_NODE_NAME
      valueForm:
        fieldRef:
          fieldPath: sepc.nodeName
#设置container信息到环境变量
spec:
  containers:
  -env:
    - name: MY_CPU_REQUEST
      valueFrom:
        resourceFieldRef:
          containerName: conName
          resource: requests.cpu
```
#### Volume挂载方式
```yaml
#将Pod信息挂载为容器内部文件
spec:
  contaners:
  - volumeMounts:
    - name: podinfo
      mountPath: /etc/podinfo
volumes:
  - name: podinfo
    downwarddAPI:
      items:
        - path: "labels"
          fieldRef:
            fieldPath: metadata.labels
#将container信息挂载为容器内部文件
spec:
  contaners:
  - volumeMounts:
    - name: podinfo
      mountPath: /etc/podinfo
volumes:
  - name: podinfo
    downwardAPI:
      items:
        - path: "cpu_limit"
          resourceFieldRef:
            containerName: client-contaner
            resource: limit.cpu
            divisor: 1m
```

#### Downared API支持的Pod和Container信息

## Pod生命周期和重启策略

Pod的状态
1. Pending:APIServer创建了该Pod，但未完全启动
2. Running：Pod内所有容器均已创建，且至少有一个容器处于运行状态、正在启动或正在重启状态
3. Succeeded：Pod内所有容器均已启动，且不会再重启
4. Failed：Pod内所有容器均已推出，但至少有一个容器退出失败
5. Unknown：无法获取该Pod状态

Pod重启策略（RestartPolicy）仅在Pod所处的Node上由kubelet进行判断和重启，当容器异常退出或健康检查失败是，根据重启策略进行操作：
1. Always：当容器失败时，由kubelet自动重启该容器
2. OnFailure：当容器终止运行且退出码不为0时，由kublet自动重启该容器
3. Never：不论容器运行状态如何，kublet都不会重启该容器

kublet重启容器时间间隔以sync-frequency*2n计算，如1，2，4，8倍，最长延时5min，在容器重启后10min重置该时间。

重启策略与控制器相关：
1. RC或DeamonSet：必须为Always，保证容器启动成功
2. Job：OnFailure或Never，确保容器执行完后不再重启
3. kublet：Pod失效时自动重启它，不论RestartPolicy设置为什么值，也不会对Pod进行健康检查 

## Pod健康检查和服务可用性检查
三类探针：
1. LivenessProbe：判断容器是否存活（Running），探测到不健康，kubelet将杀掉容器，根据重启策略进行操作
2. ReadinessProbe：判断容器是否可用（Ready），达到Ready状态的容器才可接收请求。被Service管理的Pod，Service与Pod的Endpoint关联关系也基于是否Ready进行设置。定期触发，存在于整个生命周期。
3. StartupProbe：有且仅有一次的超长延时探针。

探针三类实现方式：
1. ExecAction：在容器内部运行一个命令，返回码为0，表示容器健康
2. TCPSocketAction：通过容器的IP地址和端口号执行TCP检查。
3. HTTPGetAction：通过容器的IP地址，端口号即路径调用GET请求，状态码大于登录200且小于400，认为容器健康

对于探针，需要设置以下两个参数:
1. initialDelaySeconds:容器启动后首次进行健康检查的时间
2. timeoutSeconds:健康检查发送请求后等待响应的超时时间

k8s为复杂容器提供了Readiness Gates,给与了Pod之外的组件控制某个Pod就绪的能力。

## Pod调度

k8s的早期只有一个副本控制器RC(Replication Controller),继任者是ReplicaSet，Deployment控制器使用RS进行副本的控制。RS拥有了集合式的标签选择器。 k8s的滚动升级就是通过RS的多标签实现，滚动升级时，RS拥有两个版本的标签。

调度方式：
1. 全自动调度
2. NodeSelector:定向调度
3. NodeAffinity：Node亲和性调度
4. PodAffinity：Pod亲和和互斥调度策略
5. Taints和Tolerations（污点和容忍）调度
6. Pod Priority Preemption：Pod优先级调度
7. DeamonSet: 在每个Node上都调度一个Pod
8. Job：批处理调度
9. CronJob：定时任务
10. 自定义调度器

## Init Container 初始化容器

用于在启动应用容器前启动一个或多个初始化容器

特定：
1. 必须先于应用容器启动完成，设置多个时，按顺序启动
2. 也可以设置资源限制，Volume的使用和安全策略
3. 不能设置readiness Probe探针

## Pod的升级和回滚

### Deployment升级

初始创建Deployment时，系统创建一个ReplicaSet，按需求创建3个Pod，更新Deployment时，创建一个新的ReplicaSet，将其副本数扩展到1，将旧的RS缩减为2，之后，按照更新策略对新旧两个RS进行逐个调整。

Deployment在升级过程中，需要确保过程中只有一定数量的Pod处于不可用状态，还需要确保过程中Pod的总数量不会超过所需副本数太多。
maxUnavailabel：最大不可用数量
maxSurge：最大Pod数量

Deployment中，通过spec.strategy指定Pod的更新策略：
1. Recreate（重建）：会先杀掉所有正在运行的Pod，然后创建新的
2. RollingUpdate（滚动更新，默认）：以滚动的方式逐个更新Pod
  - maxUnavailabel：更新过程中不可用Pod的数量上限
  - maxSurge：更新过程中Pod总数量超过Pod期望副本数的最大值

### Deployment 回滚

### 暂停和恢复Deployment的部署操作

### DeamonSet的更新策略
1. onDelete：创建新的DeamonSet后，新的Pod不会被自动创建，直到用户手动删除旧版本的Pod
2. RollingUpdate：滚动更新

## Pod的扩缩容

分为两种方式：手动和自动

