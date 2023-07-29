from django.http import HttpResponse

def index(request):
    line1 = '<h1 style = "text-align: center"> 666 </h1>'
    line2 = '<a href = "/play/">进入游戏界面</a>'
    return HttpResponse(line1 + line2)

def play(request):
    line1 = '<h1 style = "text-align: center"> 原神 启动 </h1>'
    line2 = '<a href = "/">返回</a>'
    return HttpResponse(line1 + line2)