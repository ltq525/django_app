from django.db import models
from django.contrib.auth.models import User

# 更新数据库存储
class Player(models.Model):
    user = models.OneToOneField(User, on_delete = models.CASCADE) # 级联删除
    photo = models.URLField(max_length = 256, blank = True)
    openid = models.CharField(default = "", max_length=50, blank=True, null=True)
    score = models.IntegerField(default=1500)
    def __str__(self):
        return str(self.user)

# 修改后运行以下命令
# python3 manage.py makemigrations
# python3 manage.py migrate