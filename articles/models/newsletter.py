from django.db import models


class NewsletterSubscription(models.Model):
    email = models.EmailField(unique=True, db_index=True)
    subscribed_at = models.DateTimeField(auto_now_add=True)
    unsubscribed = models.BooleanField(default=False)
    unsubscribed_at = models.DateTimeField(null=True, blank=True)
    last_sent_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        ordering = ['-subscribed_at']
        indexes = [
            models.Index(fields=['email']),
            models.Index(fields=['unsubscribed']),
        ]

    def __str__(self):
        return f"{'ACTIVE' if not self.unsubscribed else 'UNSUB'} {self.email}"

    @property
    def active(self):
        return not self.unsubscribed

    def mark_unsubscribed(self):
        if not self.unsubscribed:
            from django.utils import timezone
            self.unsubscribed = True
            self.unsubscribed_at = timezone.now()
            self.save(update_fields=['unsubscribed', 'unsubscribed_at'])

    def save(self, *args, **kwargs):
        self.email = self.email.strip().lower()
        super().save(*args, **kwargs)
