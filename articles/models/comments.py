from django.db import models
from django.conf import settings


class ArticleComment(models.Model):
    article = models.ForeignKey('Article', on_delete=models.CASCADE, related_name='comments')
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        null=True, blank=True,
        on_delete=models.CASCADE,
        related_name='article_comments'
    )
    parent = models.ForeignKey('self', null=True, blank=True, on_delete=models.CASCADE, related_name='replies')
    text = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    is_deleted = models.BooleanField(default=False)

    class Meta:
        ordering = ['-created_at']
        indexes = [models.Index(fields=['article', 'parent'])]

    def __str__(self):
        return f"{(self.user or 'Anon')} -> {self.article} ({self.text[:30] if isinstance(self.text,str) else 'binary'})"

    @property
    def user_name(self):
        if not self.user:
            return "مستخدم"
        return getattr(self.user, 'name', None) or getattr(self.user, 'username', 'مستخدم')

    @property
    def user_photo(self):
        if self.user and getattr(self.user, 'avatar', None):
            try:
                return self.user.avatar.url
            except Exception:
                return None
        return None
