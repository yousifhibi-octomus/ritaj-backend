from rest_framework import serializers
from ..models import ArticleComment


class ArticleCommentReplySerializer(serializers.ModelSerializer):
    user_name = serializers.ReadOnlyField()
    user_photo = serializers.ReadOnlyField()

    class Meta:
        model = ArticleComment
        fields = ['id', 'user_name', 'user_photo', 'text', 'created_at']


class ArticleCommentSerializer(serializers.ModelSerializer):
    user_name = serializers.ReadOnlyField()
    user_photo = serializers.ReadOnlyField()
    replies = ArticleCommentReplySerializer(many=True, read_only=True)

    class Meta:
        model = ArticleComment
        fields = ['id', 'article', 'parent', 'user_name', 'user_photo', 'text', 'created_at', 'replies']
        read_only_fields = ['id', 'created_at', 'user_name', 'user_photo', 'replies', 'article', 'parent']
