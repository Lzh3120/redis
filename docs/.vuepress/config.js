module.exports = {
    locales: {
        "/": {
            lang: "zh-CN",
            title: "仇犹工作室",            
            description: "三形儿、六劲儿、心已八、无意则十..."
        }
    },
    head: [
        // ico
        ["link", {rel: "icon", href: `/favicon.ico`}],
        // meta
        ["meta", {name: "robots", content: "all"}],
        ["meta", {name: "author", content: "pdai"}],
        ["meta", {name: "keywords", content: "Java 全栈知识体系, java体系, java知识体系, java框架,java详解,java学习路线,java spring, java面试, 知识体系, java技术体系, java编程, java编程指南,java开发体系, java开发,java教程,java,java数据结构, 算法, 开发基础"}],
        ["meta", {name: "apple-mobile-web-app-capable", content: "yes"}]
    ],
    //导航栏
    themeConfig: {
        nav:[
                { text: 'Java基础', link: '/Java/' }, // 内部链接 以docs为根目录
                {
                    text: 'Spring',
                    link: '/Spring/',
                    items: [
                        {text: 'Spring', link: '/Spring/Spring/'},
                        {text: 'SpringBoot', link: '/Spring/SpringBoot/'},
                        {text: 'SpringCloud', link: '/Spring/SpringCloud/'}
                    ]
                },
                { text: '数据库', link: '/Database/' }, // 内部链接 以docs为根目录
                { 
                    text: '内功心法', 
                    link: '/内功心法/',
                    items: [
                        {text: '设计模式', link: '/内功心法/设计模式/'},
                        {text: '数据结构', link: '/内功心法/数据结构/'},
                        {text: '算法', link: '/内功心法/算法/'},
                        {text: '操作系统', link: '/内功心法/操作系统/'}
                    ]
                },
                { 
                    text: '架构设计',
                    link: '/架构设计/',
                    items: [
                        {text: '应用架构', link: '/架构设计/应用架构/'},
                        {text: '数据库设计', link: '/架构设计/数据库设计/'}
                    ]
                },
                // 下拉列表
                {
                    text: 'GitHub',
                    items: [
                        { text: 'GitHub地址', link: 'https://github.com/OBKoro1' },
                        {
                        text: '算法仓库',
                        link: 'https://github.com/OBKoro1/Brush_algorithm'
                        }
                    ]
                },
                { text: 'k8s', link: '/k8s/'},
                { text: '面试集锦', link: '/面试集锦/'},
                { text: '关于我', link: '/AboutMe/'} 
        ],
        //侧边栏
        sidebar: {
            '/Java/':[
                {
                    title: 'JVM虚拟机',
                    path: '/Java/JVM/'
                },
                {
                    title: '并发编程',
                    path: '/Java/并发编程',
                    children: [
                        {title: '并发工具类', path: '/Java/并发编程/并发工具类.html'},
                        {title: '并发容器', path: '/Java/并发编程/并发容器.html'}
                    ]
                    
                }
            ],
            '/Database/':[
                {title: 'Mysql', path: '/Database/Mysql/'},
                {
                    title: 'Redis', 
                    path: '/Database/Redis/',
                    collapsable: false,
                    children: [
                        {title: 'redis简介', path: '/Database/Redis/Redis简介.html'},
                        {title: 'Redis数据类型', path: '/Database/Redis/Redis数据类型.html'},
                        {title: 'Redis事务', path: '/Database/Redis/Redis事务.html'},
                        {title: 'Redis持久化存储', path: '/Database/Redis/Redis持久化.html'},
                        {title: '发布订阅模型', path: '/Database/Redis/Redis发布与订阅.html'},           
                        {title: '主从复制-哨兵-集群', path: '/Database/Redis/Redis主从复制.html'},
                        {title: '缓存业务', path: '/Database/Redis/Redis缓存.html'}
                    ]
                }
            ],
            '/内功心法/': [
                {
                    title: '设计模式', 
                    path: '/内功心法/设计模式/',
                    children: [
                        {title: '单例模式', path: '/内功心法/设计模式/创建型模式/单例模式.html'},
                        {title: '简单工厂模式', path: '/内功心法/设计模式/创建型模式/简单工厂模式.html'},
                        {title: '工厂方法模式', path: '/内功心法/设计模式/创建型模式/工厂方法模式.html'},
                        {title: '抽象工厂模式', path: '/内功心法/设计模式/创建型模式/抽象工厂模式.html'},
                        {title: '建造者模式', path: '/内功心法/设计模式/创建型模式/建造者模式.html'},
                        {title: '适配器模式', path: '/内功心法/设计模式/结构型模式/适配器模式.html'},
                        {title: '装饰模式', path: '/内功心法/设计模式/结构型模式/装饰模式.html'},
                        {title: '代理模式', path: '/内功心法/设计模式/结构型模式/代理模式.html'},
                        {title: '命令模式', path: '/内功心法/设计模式/行为型模式/命令模式.html'},
                        {title: '迭代器模式', path: '/内功心法/设计模式/行为型模式/迭代器模式.html'},
                        {title: '观察者模式', path: '/内功心法/设计模式/行为型模式/观察者模式.html'},
                        {title: '模板方法模式', path: '/内功心法/设计模式/行为型模式/模板方法模式.html'}
                    ]
                }
            ]
        }
    }
};
//yarn docs:dev   build