from django.http import JsonResponse
from urllib.parse import quote #拼接url字符串，将一些特殊字符转换一下，我也不是很懂。
from random import randint
from django.core.cache import cache

def get_state():
    res = ""
    for i in range(8):
        res += str(randint(0, 9))
    return res

def apply_code(request):
    appid = "1042"
    redirect_uri = quote("https://app1042.acapp.acwing.com.cn/settings/acwing/acapp/receive_code")
    scope = "userinfo"
    state = get_state()

    cache.set(state, True, 7200)
    #apply_code_url = "https://www.acwing.com/third_party/api/oauth2/web/authorize/"
    return JsonResponse({
        'result': "success",
        #'apply_code_url': apply_code_url + "?appid=%s&redirect_uri=%s&scope=%s&state=%s" % (appid, redirect_uri, scope, state)
        'appid': appid,
        'redirect_uri': redirect_uri,
        'scope': scope,
        'state': state,
    })