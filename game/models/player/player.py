#使用django自带基类
from django.db import models # 从django.db中引入models类
from django.contrib.auth.models import User  #从django中引入这个基本的user类，user表是django自带的
#继承于models.Model
class Player(models.Model): 
    
# #Player是从user中扩充，OneToOne表示player跟User表是一对一的关系 
# on_delete的意思是 当User被删除，对应的player也会被删除
# 很明显User优先于Player
#通俗的来讲，这个user明显是外键
    user = models.OneToOneField(User, on_delete = models.CASCADE)
# 新增一个字段，用来存储头像的URL，by the way 本地图片可用图床流转换成url
    photo = models.URLField(max_length = 256, blank = True)
# 将这个表对象封装成一个str并返回，这个表需要外键user,所以会传入参数
    def __str__(self): 
        return str(self.user)
