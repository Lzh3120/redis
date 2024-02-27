# Logback

## 项目结构
1. Core：核心模块，基础。
2. Classic：扩展了Core模块，日常使用Core和Classic即可。
3. Access：与Servlet容器集成，提供HTTP访问功能。

## 核心类
1. Logger
2. Appender
3. Layout

### Logger

负责生产日志，应用启动时由LoggerContext创建Logger，并根据配置初始化每个Logger的级别。
Logger的级别可继承。未配置级别时，将从最近的祖先处获取。
```xml
<logger name="com.lzh" level="INFO" additivity="false">
    <appender-ref ref="ConsoleAppender">
</logger>
```
默认情况下根logger时DEBUG级别，可以保证每个logger都获得一个可用级别。生产环境下必须每个logger都设置级别，防止日志太多。

### Appender

Appender负责记录日志事件的组件，必须实现“cn.qos.logback.core.Appender”接口，常用的有 ConsoleAppender,FileAppender

### Layout

Layout负责把日志转换为字符串。format方法用于转换