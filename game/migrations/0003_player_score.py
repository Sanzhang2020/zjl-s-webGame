# Generated by Django 3.2.8 on 2022-04-10 06:59

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('game', '0002_player_openid'),
    ]

    operations = [
        migrations.AddField(
            model_name='player',
            name='score',
            field=models.IntegerField(default=1500),
        ),
    ]
