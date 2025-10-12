from django.db import models


class AuthorRequest(models.Model):
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('approved', 'Approved'),
        ('rejected', 'Rejected'),
    ]
    user = models.OneToOneField('User', on_delete=models.CASCADE, related_name='author_request')
    motivation = models.TextField(blank=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    created_at = models.DateTimeField(auto_now_add=True)
    reviewed_at = models.DateTimeField(null=True, blank=True)

    def __str__(self):
        return f"AuthorRequest({self.user.username}, {self.status})"


class ArticleRequest(models.Model):
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('approved', 'Approved'),
        ('needs_editing', 'Needs Editing'),
        ('rejected', 'Rejected'),
    ]

    title = models.CharField(max_length=500)
    slug = models.SlugField(unique=True)
    author = models.ForeignKey('User', on_delete=models.CASCADE, related_name='article_requests')
    text = models.TextField()
    excerpt = models.TextField(blank=True)
    header_image = models.ImageField(upload_to='article_requests/', blank=True)
    tags = models.JSONField(default=list, blank=True)

    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    created_at = models.DateTimeField(auto_now_add=True)
    reviewed_at = models.DateTimeField(null=True, blank=True)
    reviewer = models.ForeignKey('User', on_delete=models.SET_NULL, null=True, blank=True, related_name='reviewed_articles')
    review_comments = models.TextField(blank=True)

    def __str__(self):
        return f"ArticleRequest({self.title}, {self.status})"

    @property
    def author_name(self):
        return self.author.name or self.author.username


class ArticleRequestImage(models.Model):
    """Uploaded image attached to an ArticleRequest before approval."""
    request = models.ForeignKey(ArticleRequest, on_delete=models.CASCADE, related_name='images')
    image = models.ImageField(upload_to='article_requests/')
    alt = models.CharField(max_length=255, blank=True)
    order = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ['order', 'id']

    def __str__(self):
        return f"ReqImage for {self.request.title} (#{self.pk})"
