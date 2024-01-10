from rest_framework.views import APIView
from rest_framework.response import Response
from django.contrib.auth.models import User
from game.models.player.player import Player
import random

class PlayerView(APIView):
    def post(self, request):
        data = request.POST
        username = data.get("username", "").strip() # 没有返回空 strip函数去重前后的空格
        password = data.get("password", "").strip()
        password_confirm = data.get("password_confirm", "").strip()
        if not username or not password:
            return Response({
                'result': "用户名和密码不能为空"
            })
        if password != password_confirm:
            return Response({
                'result': "两个密码不一致"
            })
        if User.objects.filter(username = username).exists(): # 查找数据库用户名判断是否已存在
            return Response({
                'result': "用户名已存在"
            })
        
        user = User(username = username)
        user.set_password(password)
        user.save()

        imgs = ["yuzi", "xianzi"]
        random_img = imgs[random.randint(0,1)]

        Player.objects.create(user = user, photo = "https://app5806.acapp.acwing.com.cn/static/image/picture/%s.jpg" % random_img)

        return Response({
                'result': "success"
        })