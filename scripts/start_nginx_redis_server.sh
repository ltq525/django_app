#! /bin/bash

# 启动nginx服务 提高网站并发性，支持多线程
sudo /etc/init.d/nginx start

# 启动redis-server服务 装载数据库
sudo redis-server /etc/redis/redis.conf