from django.db import models


class Article(models.Model):
    slug = models.SlugField(unique=True)
    # Replaced old CharField author with a real FK. If legacy data existed, it will need migration/backfill.
    author = models.ForeignKey('articles.User', null=True, blank=True,
                               on_delete=models.SET_NULL, related_name='articles_authored')
    date = models.DateField()
    title = models.CharField(max_length=500)
    headerImage = models.ImageField(upload_to='articles/')  # keeping original field name used elsewhere
    text = models.TextField()
    # Replace JSON list with related images via ArticleImage
    tags = models.JSONField(default=list, blank=True)
    photographer = models.CharField(max_length=255, blank=True, null=True)
    source = models.URLField(("Source"), max_length=400 , blank=True, null=True)
    def __str__(self):
        return self.title


class ArticleImage(models.Model):
    """Single image belonging to an Article (gallery)."""
    article = models.ForeignKey(Article, on_delete=models.CASCADE, related_name='images')
    image = models.ImageField(upload_to='articles/')
    alt = models.CharField(max_length=255, blank=True)
    order = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ['order', 'id']

    def __str__(self):
        return f"Image for {self.article.title} (#{self.pk})"
