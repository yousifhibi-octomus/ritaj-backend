import json
import re
from django.shortcuts import get_object_or_404
from rest_framework import generics, permissions
from rest_framework.response import Response
from ..models import User, Article, UserSavedArticle
from ..serializers import UserSerializer, ArticleSerializer


def resolve_user_identifier(qs, identifier):
    try:
        return qs.get(name=identifier)
    except User.DoesNotExist:
        return get_object_or_404(qs, username=identifier)


class UserListCreateView(generics.ListCreateAPIView):
    queryset = User.objects.all()
    serializer_class = UserSerializer


class UserArticlesView(generics.ListAPIView):
    serializer_class = ArticleSerializer

    def get_queryset(self):
        identifier = self.kwargs['identifier']
        user = resolve_user_identifier(User.objects.all(), identifier)
        return user.articles_authored.all()


class UserSavedArticlesView(generics.ListAPIView):
    serializer_class = ArticleSerializer

    def get_queryset(self):
        identifier = self.kwargs['identifier']
        user = resolve_user_identifier(User.objects.all(), identifier)
        article_ids = user.saved_articles.values_list('article_id', flat=True)
        return Article.objects.filter(id__in=article_ids)


class UserDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = User.objects.all()
    serializer_class = UserSerializer

    def get_object(self):
        identifier = self.kwargs.get('identifier')
        return resolve_user_identifier(self.get_queryset(), identifier)

    def update(self, request, *args, **kwargs):
        partial = kwargs.pop('partial', False)
        instance = self.get_object()
        data = request.data

        mutable_data = {}
        allowed_fields = {'username','email','name','bio','password','role'}
        for f in allowed_fields:
            if f in data and data.get(f) not in [None,'']:
                mutable_data[f] = data.get(f)

        social_pattern = re.compile(r'^socials\[(\d+)\](?:\[|\.)(name|link|icon)\]?$')
        socials_indexed = {}
        for key in list(data.keys()):
            match = social_pattern.match(key)
            if match:
                idx = int(match.group(1))
                field = match.group(2)
                socials_indexed.setdefault(idx, {})[field] = data.get(key)

        reconstructed = []
        if socials_indexed:
            for i in sorted(socials_indexed.keys()):
                reconstructed.append(socials_indexed[i])

        if not reconstructed and 'socials' in data:
            raw_socials = data.get('socials')
            if isinstance(raw_socials, str):
                try:
                    parsed = json.loads(raw_socials)
                    if isinstance(parsed, list):
                        reconstructed = parsed
                except json.JSONDecodeError:
                    pass
            elif isinstance(raw_socials, list):
                reconstructed = raw_socials

        if reconstructed:
            cleaned = []
            for s in reconstructed:
                if not isinstance(s, dict):
                    continue
                name = (s.get('name') or '').strip()
                link = (s.get('link') or '').strip()
                icon = s.get('icon')
                if name and link:
                    cleaned.append({'name': name, 'link': link, 'icon': icon})
            mutable_data['socials'] = cleaned

        serializer = self.get_serializer(instance, data=mutable_data, partial=partial)
        serializer.is_valid(raise_exception=True)
        self.perform_update(serializer)

        if 'avatar' in request.FILES:
            instance.avatar = request.FILES['avatar']
            instance.save(update_fields=['avatar'])

        return Response(serializer.data)
