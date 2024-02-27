# 禁用Session功能

1. 编写自定义Session管理器

```java
package com.itstyle.cloud;

import java.io.IOException;

import org.apache.catalina.Lifecycle;
import org.apache.catalina.LifecycleException;
import org.apache.catalina.LifecycleState;
import org.apache.catalina.Session;
import org.apache.catalina.session.ManagerBase;

public class NoUseSessionManager extends ManagerBase implements Lifecycle {
	@Override
	protected void startInternal() throws LifecycleException {
		super.startInternal();
		setState(LifecycleState.STARTING);
	}
	@Override
	protected void stopInternal() throws LifecycleException {
		setState(LifecycleState.STOPPING);
		super.stopInternal();
	}
	@Override
	public void load() throws ClassNotFoundException, IOException {
	}
	@Override
	public void unload() throws IOException {
	}
	@Override
	public Session createSession(String sessionId) {
		return null;
	}
	@Override
	public Session createEmptySession() {
		return null;
	}
	@Override
	public void add(Session session) {
	}
	@Override
	public Session findSession(String id) throws IOException {
		return null;
	}
	@Override
	public Session[] findSessions() {
		return null;
	}
	@Override
	public void processExpires() {
	}
}
```

2. 编写session管理器配置类
```java
package com.itstyle.cloud;

import org.springframework.boot.autoconfigure.session.NonUniqueSessionRepositoryException;
import org.springframework.boot.web.embedded.tomcat.TomcatServletWebServerFactory;
import org.springframework.boot.web.server.WebServerFactoryCustomizer;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.apache.catalina.Context;
import org.apache.catalina.core.StandardContext;

@Configuration
public class TomcatConfig {
	@Bean
	public WebServerFactoryCustomizer<TomcatServletWebServerFactory> cookieProcessorCustomizer(){
		return factory -> factory.addContextCustomizers(context -> context.setManager(new NoUseSessionManager()));
	}
}
```

3. 获取Session时可看到Session为null

