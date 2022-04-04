from django.urls import path
from game.consumers.multiPlayer.index import MultiPlayer
websocket_urlpatterns = [
    path("wss/multiPlayer/", MultiPlayer.as_asgi(), name = "wss_multiplayer"),
]
#相当于http的url