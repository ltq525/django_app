from django.shortcuts import render

def index(request):
    #路径问题：哪个目录底下有__init__.py就从哪里开始找
    return render(request, "multiends/web.html") 