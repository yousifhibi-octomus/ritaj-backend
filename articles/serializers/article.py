from rest_framework import serializers
from ..models import Article, UserSavedArticle


class ArticleSerializer(serializers.ModelSerializer):
    author = serializers.SerializerMethodField()
    is_saved = serializers.SerializerMethodField()
    saves_count = serializers.SerializerMethodField()
    images = serializers.SerializerMethodField()

    class Meta:
        model = Article
        fields = '__all__'

    def get_author(self, obj):
        if obj.author:
            user = obj.author
            # Return avatar URL if exists and file is present, else fallback to default
            request = self.context.get('request')
            api_base = ''
            if request:
                api_base = request.build_absolute_uri('/')[:-1]  # Remove trailing slash
            default_avatar = api_base + '/media/users/default.png'  # Adjust path as needed
            avatar = None
            if getattr(user, 'avatar', None):
                try:
                    # Check if file exists on disk
                    import os
                    from django.conf import settings
                    avatar_path = user.avatar.path
                    if os.path.exists(avatar_path):
                        avatar = user.avatar.url
                        if avatar and not avatar.startswith('http'):
                            avatar = api_base + avatar
                    else:
                        avatar = default_avatar
                except Exception:
                    avatar = default_avatar
            else:
                avatar = default_avatar
            return {
                'id': user.id,
                'username': user.username,
                'name': user.name,
                'avatar': avatar,
            }
        return None

    def get_is_saved(self, obj):
        request = self.context.get('request')
        if not request or not request.user.is_authenticated:
            return False
        return UserSavedArticle.objects.filter(user=request.user, article=obj).exists()

    def get_saves_count(self, obj):
        return UserSavedArticle.objects.filter(article=obj).count()

    def get_images(self, obj):
        """Return related images as a list of objects with url, alt, and order."""
        request = self.context.get('request')
        items = []
        # If ArticleImage doesn't exist (older migrations), return empty list gracefully
        rel = getattr(obj, 'images', None)
        if not rel:
            return items
        for img in rel.all():
            try:
                url = img.image.url
            except Exception:
                url = str(img.image)
            items.append({
                'url': request.build_absolute_uri(url) if request and not url.startswith('http') else url,
                'alt': getattr(img, 'alt', '') or '',
                'order': getattr(img, 'order', 0),
            })
        return items


class ArticleListSerializer(serializers.ModelSerializer):
    author_username = serializers.CharField(source='author.username', read_only=True)
    tags = serializers.ListField(child=serializers.CharField(), read_only=True)

    class Meta:
        model = Article
        fields = ['id','title','author_username','tags','slug','date']
