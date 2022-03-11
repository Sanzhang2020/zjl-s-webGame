from django.urls import path, include
#引入views中处理request的方法
from game.views.settings.getinfo import getinfo
from game.views.settings.login import signin
from game.views.settings.logout import signout
from game.views.settings.register import register
urlpatterns = [
    #在此添加路由
    path("getinfo/", getinfo, name = "settings_getinfo"),
    path("login/", signin, name = "settings_login"),
    path("logout/", signout, name = "settings_logout"),
    path("register/", register, name = "settings_register"),
]
