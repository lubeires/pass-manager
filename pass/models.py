from django.contrib.auth.models import AbstractUser
from django.db import models

class User(AbstractUser):
    pass

class Access(models.Model):
    user = models.ForeignKey("User", on_delete=models.CASCADE, related_name="passwords", default=None)
    site = models.CharField(max_length=60, default=None)
    username = models.CharField(max_length=60)
    password = models.CharField(max_length=60)

    def serialize(self):
        return {
            "id": self.id,
            "site": self.site,
            "username": self.username,
            "password": self.password
        }
