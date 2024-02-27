# MyBatis批量操作

## 使用batchSqlSessionTemplate
```java
    //支持事务
    @Bean("batchSqlSessionTemplate")
	public SqlSessionTemplate sqlSessionTemplate(SqlSessionFactory sqlSessionTemplate) {
		return new SqlSessionTemplate(sqlSessionTemplate, ExecutorType.BATCH);
	}
	
	@Autowired
	SqlSessionTemplate sqlSessionTemplate;
	
    //必须开启事务，否则做不到批量提交的效果。
    @Transactional
	public void test() {
		Object mapper = sqlSessionTemplate.getMapper(null);
		for(int i = 0;i<2000;i++) {
			mapper.insert(entity);
		}
	}


```

## 使用SqlSessionFactory

```java
    @Autowired
	SqlSessionFactory sqlSessionFactory;
	//需要手动管理事务提交
	public void test() {
		SqlSession openSession = sqlSessionFactory.openSession(ExecutorType.BATCH, false);
		Object mapper = openSession.getMapper(null);
		for(int i = 0;i<10000;i++) {
			mapper.insert(null);
		}
	}
```

## 使用foreach处理批量提交
```java
@Insert("<script>insert into `table_name`(`c1`,`c2`) values <foreach>(#{list.c1}，#{list.c2})</foreach></script>")
public void insertList(@Param("list") List<obj> list);
```

//推荐使用第一种，可以使用spring管理事务
