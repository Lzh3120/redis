# 完全自定义Session

## 引入依赖
```
<dependency>
    <groupId>org.springframework.session</groupId>
    <artifactId>spring-session-core</artifactId>
</dependency>
```

## 自定义Session类
```java
package com.itstyle.cloud.common.session;

import java.io.Serializable;
import java.util.Collections;
import java.util.Enumeration;
import java.util.HashMap;
import java.util.Iterator;
import java.util.LinkedHashMap;
import java.util.LinkedHashSet;
import java.util.Map;

import javax.servlet.ServletContext;
import javax.servlet.http.HttpSession;
import javax.servlet.http.HttpSessionBindingEvent;
import javax.servlet.http.HttpSessionBindingListener;
import javax.servlet.http.HttpSessionContext;

import org.springframework.lang.Nullable;
import org.springframework.util.Assert;
import org.springframework.util.StringUtils;

public class NormalSession implements HttpSession, Serializable{
	private static int nextId = 1;
    private String id;
    private final long creationTime;
    private int maxInactiveInterval;
    private long lastAccessedTime;
    private final ServletContext servletContext;
    private final Map<String, Object> attributes;
    private boolean invalid;
    private boolean isNew;

    public NormalSession(String id){
        this((ServletContext) null);
        this.id=id;
    }

    public NormalSession() {
        this((ServletContext) null);
    }

    public NormalSession(@Nullable ServletContext servletContext) {
        this(servletContext, (String) null);
    }

    public NormalSession(@Nullable ServletContext servletContext, @Nullable String id) {
        this.creationTime = System.currentTimeMillis();
        this.lastAccessedTime = System.currentTimeMillis();
        this.attributes = new LinkedHashMap();
        this.invalid = false;
        this.isNew = true;
        this.servletContext = null;
        this.id = id != null ? id : Integer.toString(nextId++);
    }

    public long getCreationTime() {
        this.assertIsValid();
        return this.creationTime;
    }

    public String getId() {
        return this.id;
    }

    public String changeSessionId() {
        this.id = Integer.toString(nextId++);
        return this.id;
    }

    public void access() {
        this.lastAccessedTime = System.currentTimeMillis();
        this.isNew = false;
    }

    public long getLastAccessedTime() {
        this.assertIsValid();
        return this.lastAccessedTime;
    }

    public ServletContext getServletContext() {
        return this.servletContext;
    }

    public void setMaxInactiveInterval(int interval) {
        this.maxInactiveInterval = interval;
    }

    public int getMaxInactiveInterval() {
        return this.maxInactiveInterval;
    }

    public HttpSessionContext getSessionContext() {
        throw new UnsupportedOperationException("getSessionContext");
    }

    public Object getAttribute(String name) {
        this.assertIsValid();
        Assert.notNull(name, "Attribute name must not be null");
        return this.attributes.get(name);
    }

    public Object getValue(String name) {
        return this.getAttribute(name);
    }

    public Enumeration<String> getAttributeNames() {
        this.assertIsValid();
        return Collections.enumeration(new LinkedHashSet(this.attributes.keySet()));
    }

    public String[] getValueNames() {
        this.assertIsValid();
        return StringUtils.toStringArray(this.attributes.keySet());
    }

    public void setAttribute(String name, @Nullable Object value) {
        this.assertIsValid();
        Assert.notNull(name, "Attribute name must not be null");
        if (value != null) {
            Object oldValue = this.attributes.put(name, value);
            if (value != oldValue) {
                if (oldValue instanceof HttpSessionBindingListener) {
                    ((HttpSessionBindingListener) oldValue).valueUnbound(new HttpSessionBindingEvent(this, name, oldValue));
                }

                if (value instanceof HttpSessionBindingListener) {
                    ((HttpSessionBindingListener) value).valueBound(new HttpSessionBindingEvent(this, name, value));
                }
            }
        } else {
            this.removeAttribute(name);
        }

    }

    public void putValue(String name, Object value) {
        this.setAttribute(name, value);
    }

    public void removeAttribute(String name) {
        this.assertIsValid();
        Assert.notNull(name, "Attribute name must not be null");
        Object value = this.attributes.remove(name);
        if (value instanceof HttpSessionBindingListener) {
            ((HttpSessionBindingListener) value).valueUnbound(new HttpSessionBindingEvent(this, name, value));
        }

    }

    public void removeValue(String name) {
        this.removeAttribute(name);
    }

    public void clearAttributes() {
        Iterator it = this.attributes.entrySet().iterator();

        while (it.hasNext()) {
            Map.Entry<String, Object> entry = (Map.Entry) it.next();
            String name = (String) entry.getKey();
            Object value = entry.getValue();
            it.remove();
            if (value instanceof HttpSessionBindingListener) {
                ((HttpSessionBindingListener) value).valueUnbound(new HttpSessionBindingEvent(this, name, value));
            }
        }

    }

    public void invalidate() {
        this.assertIsValid();
        this.invalid = true;
        this.clearAttributes();
    }

    public boolean isInvalid() {
        return this.invalid;
    }

    private void assertIsValid() {
        Assert.state(!this.isInvalid(), "The session has already been invalidated");
    }

    public void setNew(boolean value) {
        this.isNew = value;
    }

    public boolean isNew() {
        this.assertIsValid();
        return this.isNew;
    }

    public Serializable serializeState() {
        HashMap<String, Serializable> state = new HashMap();
        Iterator it = this.attributes.entrySet().iterator();

        while (it.hasNext()) {
            Map.Entry<String, Object> entry = (Map.Entry) it.next();
            String name = (String) entry.getKey();
            Object value = entry.getValue();
            it.remove();
            if (value instanceof Serializable) {
                state.put(name, (Serializable) value);
            } else if (value instanceof HttpSessionBindingListener) {
                ((HttpSessionBindingListener) value).valueUnbound(new HttpSessionBindingEvent(this, name, value));
            }
        }

        return state;
    }

    public void deserializeState(Serializable state) {
        Assert.isTrue(state instanceof Map, "Serialized state needs to be of type [java.util.Map]");
        this.attributes.putAll((Map) state);
    }

}

```

## 定义请求包装类
```java
package com.itstyle.cloud.common.session;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletRequestWrapper;
import javax.servlet.http.HttpSession;

public class NormalServletRequestWrapper extends HttpServletRequestWrapper{

	private HttpSession session;

    public NormalServletRequestWrapper(HttpServletRequest request) {
        super(request);
    }

    @Override
    public HttpSession getSession() {
        return session;
    }

    public void setSession(HttpSession session){
        this.session=session;
    }

}

```

## 定义过滤器,进行Session管理

```java
package com.itstyle.cloud.common.session;

import java.io.IOException;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

import javax.servlet.Filter;
import javax.servlet.FilterChain;
import javax.servlet.ServletException;
import javax.servlet.ServletRequest;
import javax.servlet.ServletResponse;
import javax.servlet.http.Cookie;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.springframework.stereotype.Component;

@Component
public class ClusterSessionFilter implements Filter{
	
	private Map<String, NormalSession> sessionMap = new HashMap<>();

    public void doFilter(ServletRequest servletRequest, ServletResponse servletResponse, FilterChain filterChain) throws IOException, ServletException {
        HttpServletRequest request = (HttpServletRequest) servletRequest;
        NormalSession myHttpSession = null;
        String cookieName = "token";

        // 获取cookie
        String cookieValue = getCookieValue(cookieName, request.getCookies());
        if (cookieValue != null) {
            myHttpSession = sessionMap.get(cookieValue);
        }

        if (myHttpSession == null) {
            // 自定义生成一个唯一id
            String id = UUID.randomUUID().toString();
            // 生成了id需要添加cookie
            HttpServletResponse response = (HttpServletResponse) servletResponse;
            Cookie cookie = new Cookie(cookieName, id);
            cookie.setPath("/");
            response.addCookie(cookie);

            myHttpSession = new NormalSession(id);
        }

        // 包装类
        NormalServletRequestWrapper myServletRequestWrapper = new NormalServletRequestWrapper(request);
        myServletRequestWrapper.setSession(myHttpSession);

        System.out.println(myHttpSession.getId());

        filterChain.doFilter(myServletRequestWrapper, servletResponse);

        // 将会话存储到内存，也可以选择存储到redis等
        sessionMap.put(myServletRequestWrapper.getSession().getId(), (NormalSession) myServletRequestWrapper.getSession());
    }

    private String getCookieValue(String name, Cookie[] cookies) {
        if (cookies == null)
            return null;
        for (Cookie cookie : cookies) {
            if (name.equals(cookie.getName())) {
                return cookie.getValue();
            }
        }
        return null;
    }
}

```

