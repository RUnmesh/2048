from django.db import models
from django.contrib.auth.models import User

class Member(models.Model):
    user = models.ForeignKey(User , on_delete=models.CASCADE , related_name="member")
    best_score = models.IntegerField(default=0)
    games = models.IntegerField(default = 0)