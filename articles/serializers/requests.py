from rest_framework import serializers
from ..models import AuthorRequest, ArticleRequest


class AuthorRequestSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source='user.username', read_only=True)
    email = serializers.EmailField(source='user.email', read_only=True)

    class Meta:
        model = AuthorRequest
        fields = ['id', 'username', 'email', 'motivation', 'status', 'created_at', 'reviewed_at']


class ArticleRequestSerializer(serializers.ModelSerializer):
    author_name = serializers.SerializerMethodField()
    content = serializers.CharField(source='text', read_only=True)
    headerImage = serializers.ImageField(source='header_image', allow_null=True, required=False)
    excerpt = serializers.SerializerMethodField()

    class Meta:
        model = ArticleRequest
        fields = [
            'id','title','slug','status',
            'author_name','created_at',
            'excerpt','content','tags','images','headerImage'
        ]

    def get_author_name(self, obj):
        u = getattr(obj, 'author', None)
        return getattr(u, 'username', '') or getattr(u, 'email', '') or 'مستخدم'

    def get_excerpt(self, obj):
        txt = (obj.text or '') if hasattr(obj, 'text') else ''
        return txt[:150] + ('...' if len(txt) > 150 else '')
