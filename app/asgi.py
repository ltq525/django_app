"""
ASGI config for app project.

It exposes the ASGI callable as a module-level variable named ``application``.

For more information on this file, see
https://docs.djangoproject.com/en/3.2/howto/deployment/asgi/
"""

import os
import django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'app.settings')
# 设置环境
django.setup()

# from channels.auth import AuthMiddlewareStack
from game.channelsmiddleware import JwtAuthMiddlewareStack
from channels.routing import ProtocolTypeRouter, URLRouter
from django.core.asgi import get_asgi_application
from game.routing import websocket_urlpatterns

# 实现外部调用内部channels函数
from channels.layers import get_channel_layer
channel_layer = get_channel_layer()

application = ProtocolTypeRouter({
    "http": get_asgi_application(),
    "websocket": JwtAuthMiddlewareStack(URLRouter(websocket_urlpatterns))
    # "websocket": AuthMiddlewareStack(URLRouter(websocket_urlpatterns))
})

