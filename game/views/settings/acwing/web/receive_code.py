from django.shortcuts import redirect
from django.core.cache import cache
import requests
from django.contrib.auth.models import User
from game.models.player.player import Player
from django.contrib.auth import login
from random import randint

def receive_code(request):
    data = request.GET
    code = data.get('code')
    state = data.get('state')

    if not cache.has_key(state):
        return redirect("index")
    
    # 使用后删除 state参数防止受攻击
    cache.delete(state)

    # 申请令牌地址
    apply_access_token_url = "https://www.acwing.com/third_party/api/oauth2/access_token/"
    
    #json字典写法
    params = {
        'appid': "5806",
        'secret': "99d5d514d7774f809b2d6eb2a829c5ea",
        'code': code,
    }

    # 根据授权码 使用requests.get申请令牌 返回access_token和openid
    access_token_res = requests.get(apply_access_token_url, params = params).json()

    access_token = access_token_res['access_token']
    openid = access_token_res['openid']

    # filter返回长度为1的列表 get找不到时异常 需要处理异常
    players = Player.objects.filter(openid = openid)
    if players.exists(): # 用户已存在 直接登陆
        login(request, players[0].user)
        return redirect("index")

    # 申请用户信息地址
    get_userinfo_url = "https://www.acwing.com/third_party/api/meta/identity/getinfo/"
    params = {
        "access_token": access_token,
        "openid": openid
    }
    
    # 根据令牌 使用requests.get申请用户信息 返回用户名和头像
    userinfo_res = requests.get(get_userinfo_url, params=params).json()
    username = userinfo_res['username']
    photo = userinfo_res['photo']

    while User.objects.filter(username = username).exists(): # 当用户名冲突时 找到一个新用户名
        username += str(randint(0, 9))

    # 创建用户
    user = User.objects.create(username = username)
    player = Player.objects.create(user = user, photo = photo, openid = openid)

    login(request, user)

    return redirect("index")