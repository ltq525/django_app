from django.shortcuts import redirect
from django.core.cache import cache
import requests
from django.contrib.auth.models import User
from game.models.player.player import Player
from django.contrib.auth import login
from random import randint

def receive_code(request):
    data = request.GET
    code = data.get("code")
    state = data.get("state")

    if not cache.has_key(state):
        return redirect("index")
    cache.delete(state)

    #申请令牌
    apply_access_token_url = "https://www.acwing.com/third_party/api/oauth2/access_token/"
    params = {
        'appid': "5806",
        'secret': "d76c5a9b41e9462bbb2547fc147a92b4",
        'code': code,
    }

    access_token_res = request.get(apply_access_token_url, params = params).json()

    access_token = access_token_res['access_token']
    openid = access_token_res['openid']

    Player = Player.objects.filter(openid=openid)
    if Player.exists(): # 用户已存在 直接登陆
        login(request, Player[0].user)
        return redirect("index")

    get_userinfo_url = "https://www.acwing.com/third_party/api/meta/identity/getinfo/"
    params = {
        'appid': "5806",
        'secret': "d76c5a9b41e9462bbb2547fc147a92b4",
        'code': code,
    }
    userinfo_res = request.get(get_userinfo_url, params=params).json()
    username = userinfo_res('username')
    photo = userinfo_res('photo')

    while User.objects.filter(username = username).exists(): # 当用户名冲突时 找到一个新用户名
        username += str(randint(0, 9))

    user = User.objects.create(username = username)
    player = Player.objects.create(user = user, photo = photo, openid = openid)

    login(request, user)

    return redirect("index")