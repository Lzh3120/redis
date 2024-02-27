# 集成Spring Batch

## 添加依赖
```xml
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-batch</artifactId>
</dependency>
```

## Batch配置信息

1. 添加启动注解 @EnableBatchProcessing
2. 注册一个事务管理器 JobRepository
3. 注册批量任务启动器 SimpleJobLauncher
4. 定义任务 Job
5. 定义数据来源组件 ItemReader<JSONObject>
6. 定义数据校验及处理数据组件 ItemProcessor<JSONObject,PersonInfo>
7. 定义数据写出组件 CustomWriter
8. 组件绑定 Step
9. 可以定义各步骤的监听器,进行监听

```java
@Configuration
@EnableBatchProcessing
public class MyBatchConfig {
	
	/**
	 * Job的注册容器以及和数据库打交道（事务管理器）
	 * @param dataSource
	 * @param transactionManager
	 * @return
	 * @throws Exception
	 */
	@Bean
	public JobRepository myJobRepository(DataSource dataSource, PlatformTransactionManager transactionManager) throws Exception {
		JobRepositoryFactoryBean jobRepositoryFactoryBean = new JobRepositoryFactoryBean();
        jobRepositoryFactoryBean.setDatabaseType("mysql");
        jobRepositoryFactoryBean.setTransactionManager(transactionManager);
        jobRepositoryFactoryBean.setDataSource(dataSource);
        return jobRepositoryFactoryBean.getObject();
	}
	/**
	 * job的启动器，绑定相关的JobRe pository
	 * @param dataSource
	 * @param transactionManager
	 * @return
	 * @throws Exception
	 */
	@Bean
	public SimpleJobLauncher myJobLauncher(DataSource dataSource, PlatformTransactionManager transactionManager) throws Exception {
		SimpleJobLauncher jobLauncher = new SimpleJobLauncher();
        // 设置jobRepository
        jobLauncher.setJobRepository(myJobRepository(dataSource, transactionManager));
        return jobLauncher;
	}
	/**
	 * 定义job
	 * @param jobs
	 * @param myStep
	 * @return
	 */
	@Bean
	public Job myJob(JobBuilderFactory jobs, Step myStep) {
		return jobs.get("myJob")
                .incrementer(new RunIdIncrementer())
                .flow(myStep)
                .end()
                //job执行监听器
                .listener(myJobListener())
                .build();
	}
	
	/**
	 * 注册Job监听器
	 * @return
	 */
    @Bean
    public MyJobListener myJobListener(){
        return new MyJobListener();
    }
    
    /**
     * ItemReader定义：读取文件数据+entirty实体类映射
     * @return 读取文件数据+entity实体类映射
     */
    @Bean
    public ItemReader<JSONObject> reader(){
        // 使用FlatFileItemReader去读cvs文件，一行即一条数据
        FlatFileItemReader<JSONObject> reader = new FlatFileItemReader<>();
        // 设置文件处在路径
		reader.setResource(new FileSystemResource(new File("F://person_info.json")));
        // entity与csv数据做映射
        reader.setLineMapper(new DefaultLineMapper<JSONObject>() {
			@Override
			public JSONObject mapLine(String line, int lineNumber) throws Exception {
				
				line = line.replace("\"PHOTO\":\"{\"", "\"PHOTO\":{\"");
				line = line.replace("\"]}\",\"", "\"]},\"");
				line = line.replace("简称\"", "简称");
				line = line.replace("\"或", "或");
				line = line.replace("\")", ")");
				try {
					JSONObject obj = JSON.parseObject(line);
					return obj;
				}catch(Exception e) {
					return null;
				}
			}
        	
        });
        return reader;
    }
    
    /**
     * 处理数据+校验数据 
     * @return
     */
    @Bean
    public ItemProcessor<JSONObject,PersonInfo> processor(){
    	MyItemProcessor processor = new MyItemProcessor();
    	//processor.setValidator(new MyBeanValidator());
    	return processor;
    }
    
    @Autowired
    CustomWriter customWriter;
    /**
     * 设置批量插入sql语句，写入数据库
     * @param dataSource
     * @return
     * @throws Exception 
     */
    @Bean
    public CustomWriter writer(List<PersonInfo> items, DataSource dataSource) throws Exception{
    	//CustomWriter writer = new CustomWriter();
    	//writer.write(items);
        return customWriter;
    }
    
    /**
     * 绑定组件
     * @param stepBuilderFactory
     * @param reader
     * @param writer
     * @param processor
     * @return
     */
    @Bean
    public Step myStep(StepBuilderFactory stepBuilderFactory, ItemReader<JSONObject> reader,
                     ItemWriter<PersonInfo> writer, ItemProcessor<JSONObject, PersonInfo> processor){
        return stepBuilderFactory
                .get("myStep")
                .<JSONObject, PersonInfo>chunk(5000) // Chunk的机制(即每次读取一条数据，再处理一条数据，累积到一定数量后再一次性交给writer进行写入操作)
                .reader(reader)
                //.faultTolerant().retryLimit(3).retry(Exception.class).skip(Exception.class).skipLimit(2)
                .processor(processor)
                .writer(writer)
                //.faultTolerant().skip(Exception.class).skipLimit(2)
                //.listener(new MyReadListener())
                //.listener(new MyWriteListener())
                .build();
    }
    
}
```

## 


## 启动批量任务
```java
public class BatchController {
	
    @Autowired
    SimpleJobLauncher jobLauncher;
 
    @Autowired
    Job myJobNew;
	
	@GetMapping("/runPerson")
	public void runPerson(String authorId) throws JobExecutionAlreadyRunningException, JobRestartException, JobInstanceAlreadyCompleteException, JobParametersInvalidException {
		JobParameters jobParametersNew = new JobParametersBuilder().addLong("timeNew", System.currentTimeMillis())
                .addString("authorId",authorId)
                .toJobParameters();
        JobExecution run = jobLauncher.run(myJobNew,jobParametersNew);
	}
}
```