from django.urls import path, include
#引入views中处理request的方法
from game.views.settings.getinfo import getinfo

urlpatterns = [
    #在此添加路由
    path("getinfo/", getinfo, name = "settings_getinfo"),
]
