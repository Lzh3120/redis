# Docker

Docker三大核心概念
1. 仓库：集中存放镜像文件
2. 镜像：为标准化打包提供基础
3. 容器：从镜像创建的运行实例

## Docker镜像

是一个Linux的文件系统，包含运行的程序以及库，资源，配置等数据。

类似于一个压缩包，用于创建容器，分层构建，前一层是后一层的基础。
包含了一个精简的操作系统，应用运行所必须的文件和依赖包。一次构架，到处运行。

镜像构建的方法：
1. docker commit生成镜像
2. Dockerfile（建议）

## 镜像仓库

类似于代码仓库，是镜像集中存放的地方。
1. 实现Docker镜像的全局存储
2. 提供api接口
3. 提供镜像的下载、推送、查询

## 容器Docker体系结构
1. Docker Registry：镜像仓库
  - 官方仓库
  - 私有镜像仓库
2. Docker Server：Docker服务端
  - 宿主机中运行守护进程Docker deamon
  - 接收Docker客户端发送的指令来执行拉取镜像，缓存，启动容器等
3. Docker Client：Docker客户端
  - 负责通过Docker命令对容器进行基本操作

## Docker 操作：
1. Build构建镜像：打包文件即运行环境等资源
2. Ship运输镜像：在宿主机和仓库间进行运输
3. Run运行镜像：运行的镜像就是一个容器

## Dockerfile

命令|说明
-|-
FROM|指定构建镜像的基础源镜像，必须是非注释的第一个命令
MAINTAINER|指定创建镜像的用户
RUN|在当前镜像基础上执行指定命令，并提交为新镜像
CMD|同run，但有多个时只执行最后一个，cmd在启动容器时执行，而run在build时执行
EXPOSE|告诉docker服务端容器对外的本地端口
ENV|指定一个环境变量
ADD|复制本地主机文件，目录或者远程文件到容器指定路径，
COPY|复制本地主机文件，目录或者远程文件到容器指定路径，不能指定远程文件的urls
ENTRYPOINT|配置容器启动后执行的命令，且不可被docker run提供的参数覆盖，cmd是可以被覆盖的
VOLUME|创建一个可以从本地主机的挂载点
USER|指定运行容器时的用户名或UID
WORKDIR|为后续的run cmd entrypoint等配置工作目录

## Docker 安装

## 运行容器

1. docker pull name：下载镜像
2. docker images：查看本地镜像
3. docker run -d -name demo busybox:1.25 top：运行容器

命令|说明
-|-
docker ps|检查运行容器列表
docker run|运行容器
docker rm|删除容器
docker exec|在运行的容器中运行额外的进程
docker create|创建一个尚未启动的容器，start启动创建的容器
docker wait|阻塞对容器的其他调用方法，直到容器停止后推出
docker stop|停止一个运行中的容器
docker start|启动一个或多个已经被停止的容器
docker top|显示主机为每个容器进程分配的PID
docker diff|查看容器镜像的改动，返回文件改动列表
docker inspect|显示docker为该容器i保留的元数据
docker commit|向镜像提交一个新的文件记录

