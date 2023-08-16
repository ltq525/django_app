from django.http import JsonResponse
from urllib.parse import quote 
from random import randint
from django.core.cache import cache


def get_state():
    res = ""
    for i in range(8):
        res += str(randint(0, 9))
    return res


def apply_code(request):
    appid = "5806"
    #解析字符 替换特殊字符 重新编码
    redirect_uri = quote("http://localhost/settings/acwing/app/receive_code")
    scope = "userinfo"
    state = get_state()

    cache.set(state, True, 7200)    #有效期两小时

    return JsonResponse({
        'result': "success",
        'appid': appid,
        'redirect_uri': redirect_uri,
        'scope': scope,
        'state': state,
    })