from django.urls import path, include
from game.views.settings.getinfo import InfoView
# from game.views.settings.login import signin
# from game.views.settings.logout import signout
# from game.views.settings.register import register
from game.views.settings.register import PlayerView
from game.views.settings.ranklist import RanklistView
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)

urlpatterns = [

    # path("login/", signin, name = "settings_login"),
    # path("logout/", signout, name = "settings_logout"),
    # path("register/", register, name = "settings_register"),

    # JWT登陆代替session登陆
    path("token/", TokenObtainPairView.as_view(), name = "settings_token"),
    path("token/refresh/", TokenRefreshView.as_view(), name = "settings_token_refresh"),
    path("getinfo/", InfoView.as_view(), name = "settings_getinfo"),
    path("register/", PlayerView.as_view(), name = "settings_register"),
    path("ranklist/", RanklistView.as_view(), name = "settings_ranklist"),
    path("acwing/", include("game.urls.settings.acwing.index")),
]
