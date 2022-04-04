当你的服务器被vscode撑爆的时候，也许你需要重启一下服务器。相信你会用到这几个命令：
1. 启动容器 
   docker start django_server
2. 启动`nginx `
   sudo /etc/init.d/nginx start
3. 启动`redis `
   sudo redis-server /etc/redis/redis.conf

启动uwsgi服务的命令：
uwsgi --ini scripts/uwsgi.ini

启动django_channels
在~/acapp目录下执行：
daphne -b 0.0.0.0 -p 5015 acapp.asgi:application
js打包，在js那里。