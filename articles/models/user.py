from django.db import models
from django.contrib.auth.models import AbstractUser


class User(AbstractUser):
    ROLE_CHOICES = [
        ('admin', 'Admin'),
        ('editor', 'Editor'),
        ('author', 'Author'),
        ('user', 'User'),
    ]
    # Keep username from AbstractUser. Enforce unique email as in previous version.
    email = models.EmailField(unique=True)
    name = models.CharField(max_length=255)
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default='user')
    bio = models.TextField(blank=True)
    avatar = models.ImageField(upload_to='users/', blank=True)

    def __str__(self):
        return self.username


class UserSocial(models.Model):
    user = models.ForeignKey('User', related_name='socials', on_delete=models.CASCADE)
    name = models.CharField(max_length=50)
    link = models.URLField()
    icon = models.CharField(max_length=100, blank=True, null=True)

    class Meta:
        unique_together = ('user', 'name')


class UserSavedArticle(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='saved_articles')
    article = models.ForeignKey('Article', on_delete=models.CASCADE)
    saved_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.user.username} saved {self.article.title}"
