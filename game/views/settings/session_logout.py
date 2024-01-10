from django.http import JsonResponse
from django.contrib.auth import logout

def signout(request):
    usesr = request.user
    if not usesr.is_authenticated: #   没有用户状态
        return JsonResponse({
            'result': "success",
        })
    logout(request)
    return JsonResponse({
            'result': "success",
        })