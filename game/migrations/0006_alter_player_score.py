# Generated by Django 3.2.8 on 2024-01-09 09:59

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('game', '0005_alter_player_score'),
    ]

    operations = [
        migrations.AlterField(
            model_name='player',
            name='score',
            field=models.IntegerField(default=1500),
        ),
    ]