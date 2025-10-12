from rest_framework import serializers
from ..models import NewsletterSubscription


class NewsletterSubscriptionSerializer(serializers.ModelSerializer):
    class Meta:
        model = NewsletterSubscription
        fields = ['id', 'email', 'subscribed_at', 'unsubscribed', 'unsubscribed_at', 'last_sent_at']
        read_only_fields = ['id', 'subscribed_at', 'unsubscribed_at', 'last_sent_at']
