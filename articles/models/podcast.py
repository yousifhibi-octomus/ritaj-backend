from django.db import models


class Podcast(models.Model):
    title = models.CharField(max_length=255)
    header_image = models.ImageField(upload_to='podcasts/')
    description = models.TextField()
    link = models.URLField()

    def __str__(self):
        return self.title
