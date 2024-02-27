# Spring MVC & Spring Bean 注解

|类别|注解|释义|
|-|-|-|
|SpringBootWeb|@RequestBody |       将请求主体中的参数绑定到一个对象中|
||@Controller|定义一个普通风格Controller|
||@RestController|定义一个Rest风格Controller|
||@RequestMapping|映射请求与处理的方法|
||@GetMapping |        定义一个get请求|
||@PostMapping  |      定义一个post请求|
||@PutMapping    |     定义一个put请求|
||@DeleteMapping |     定义一个delete请求|
||@PatchMapping  |     定义一个patch请求|
||@ControllerAdvice  | 处理控制器所抛出的异常信息|
||@ExceptionHandler |  用于处理特定类型异常抛出的方法|
||@InitBinder||
||@ModeAttribute | 控制处理器抛出的异常|
|参数注解|@PathVariable     |  将方法中参数绑定到请求url的模板变量上|
||@RequestParam     |  将方法参数与请求传递的参数进行绑定|
|返回值注解|@ResponseBody    |   将控制器中方法的返回值写入到Http响应中|
||@ResponseStatus   |  标注请求处理方法的响应状态码|
||@ModelAttribute   |  通过模型索引访问已存在控制器中的model|

