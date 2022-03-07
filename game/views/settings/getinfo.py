from django.http import JsonResponse
from game.models.player.player import Player

def getinfo_acapp(request):
    #先默认第一个player
    player = Player.objects.all()[0]
    #Django里以Json装载response
    return JsonResponse({
        'result' : "success",
        'username' : player.user.username,
        'photo' : player.photo,
    })
def getinfo_web(request):
    user = request.user #从request中获取user
    if not user.is_authenticated:
        return JsonResponse({
            "result" : "未登录",
        })
    else:
        #先默认第一个player
        player = Player.objects.all()[0]
        #Django里以Json装载response
        return JsonResponse({
            'result' : "success",
            'username' : player.user.username,
            'photo' : player.photo,
        })
def getinfo(request):
    #传入request (浏览器客户端传进来的request)
    platform = request.GET.get('platform')
    #根据登录的不同平台，处理不同的结果
    if platform == "ACAPP":
        return getinfo_acapp(request)
    elif platform == "WEB":
        return getinfo_web(request)
