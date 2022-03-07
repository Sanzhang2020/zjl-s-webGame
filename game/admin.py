from django.contrib import admin
from game.models.player.player import Player #引入Player 这张表
# Register your models here.

#在这里注册表
admin.site.register(Player)
