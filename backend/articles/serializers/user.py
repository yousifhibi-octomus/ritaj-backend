from rest_framework import serializers
from ..models import User, UserSocial


class UserSocialSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserSocial
        fields = ['name', 'link', 'icon']
        extra_kwargs = {
            'icon': {'required': False, 'allow_null': True, 'allow_blank': True},
            'link': {'required': True},
            'name': {'required': True},
        }


class UserSerializer(serializers.ModelSerializer):
    socials = UserSocialSerializer(many=True, required=False)
    articles = serializers.SerializerMethodField()
    saved = serializers.SerializerMethodField()
    avatar = serializers.SerializerMethodField()
    password = serializers.CharField(write_only=True, required=False, style={'input_type': 'password'})

    class Meta:
        model = User
        fields = ['id', 'username', 'password', 'role', 'email', 'name', 'bio', 'avatar', 'socials', 'articles', 'saved']
        extra_kwargs = {
            'password': {'write_only': True},
            'email': {'required': True},
        }

    def create(self, validated_data):
        password = validated_data.pop('password')
        user = User(**validated_data)
        user.set_password(password)
        user.save()
        return user

    def update(self, instance, validated_data):
        password = validated_data.pop('password', None)
        socials_data = validated_data.pop('socials', None)
        instance = super().update(instance, validated_data)
        if password:
            instance.set_password(password)
        if socials_data is not None:
            cleaned = []
            for s in socials_data:
                name = (s.get('name') or '').strip()
                link = (s.get('link') or '').strip()
                if not name or not link:
                    continue
                cleaned.append({'name': name, 'link': link, 'icon': s.get('icon')})
            provided_names = [s['name'] for s in cleaned]
            UserSocial.objects.filter(user=instance).exclude(name__in=provided_names).delete()
            for s in cleaned:
                UserSocial.objects.update_or_create(
                    user=instance,
                    name=s['name'],
                    defaults={'link': s['link'], 'icon': s.get('icon')}
                )
        instance.save()
        return instance

    def get_articles(self, obj):
        return list(obj.articles_authored.values_list('id', flat=True))

    def get_saved(self, obj):
        return list(obj.saved_articles.values_list('article_id', flat=True))

    def get_avatar(self, obj):
        request = self.context.get('request')
        if obj.avatar and request:
            return request.build_absolute_uri(obj.avatar.url)
        return "/images/users/default.png"
