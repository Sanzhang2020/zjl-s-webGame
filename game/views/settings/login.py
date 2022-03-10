from django.http import JsonResponse
from django.contrib.auth import authenticate, login

def signin(request):
    data = request.GET #使用http 中的GET方法
    username = data.get('username') 
    password = data.get('password')
    user = authenticate(username = username, password = password) #比较数据库中的数据
    if not user:
        return JsonResponse({
            'result' : "用户名或密码不正确"
        })
    login(request, user)#如果跟数据库数据匹配则直接登录
    return JsonResponse({
        'result' : "success"
    })