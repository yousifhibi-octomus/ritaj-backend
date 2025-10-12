from django.db.models import Q
from rest_framework import generics, permissions
from rest_framework.decorators import api_view
from rest_framework.response import Response
from ..models import Article, ArticleComment, UserSavedArticle
from ..serializers import ArticleSerializer, ArticleListSerializer, ArticleCommentSerializer


class SaveArticleView(generics.GenericAPIView):
	def get_permissions(self):
		if self.request.method == 'GET':
			return [permissions.AllowAny()]
		return super().get_permissions()

	def get(self, request, article_id):
		try:
			article = Article.objects.get(id=article_id)
		except Article.DoesNotExist:
			return Response({"detail": "Article not found"}, status=404)
		user = request.user
		is_saved = False
		if user.is_authenticated:
			is_saved = UserSavedArticle.objects.filter(user=user, article=article).exists()
		total_saves = UserSavedArticle.objects.filter(article=article).count()
		return Response({
			"article_id": article.id,
			"is_saved": is_saved,
			"total_saves": total_saves
		})

	def post(self, request, article_id):
		user = request.user
		article = Article.objects.get(id=article_id)
		saved_article, created = UserSavedArticle.objects.get_or_create(user=user, article=article)
		if created:
			return Response({"message": "Article saved successfully."}, status=201)
		else:
			return Response({"message": "Article is already saved."}, status=200)

	def delete(self, request, article_id):
		user = request.user
		try:
			saved_article = UserSavedArticle.objects.get(user=user, article_id=article_id)
			saved_article.delete()
			return Response({"message": "Article unsaved successfully."}, status=200)
		except UserSavedArticle.DoesNotExist:
			return Response({"message": "Article was not saved."}, status=404)


class ArticleListCreateView(generics.ListCreateAPIView):
	queryset = Article.objects.all()
	serializer_class = ArticleSerializer


class ArticleDetailView(generics.RetrieveUpdateDestroyAPIView):
	queryset = Article.objects.all()
	serializer_class = ArticleSerializer
	lookup_field = 'slug'


class ArticleListView(generics.ListAPIView):
	queryset = Article.objects.all()
	serializer_class = ArticleSerializer

	def get_serializer_context(self):
		context = super().get_serializer_context()
		context['request'] = self.request
		return context


class ArticleCommentListCreateView(generics.ListCreateAPIView):
	serializer_class = ArticleCommentSerializer
	permission_classes = [permissions.AllowAny]

	def get_queryset(self):
		article_id = self.kwargs['article_id']
		return (ArticleComment.objects
				.filter(article_id=article_id, parent__isnull=True)
				.select_related('user')
				.prefetch_related('replies__user'))

	def perform_create(self, serializer):
		article = Article.objects.get(pk=self.kwargs['article_id'])
		serializer.save(article=article, user=self.request.user if self.request.user.is_authenticated else None)


class ArticleCommentReplyCreateView(generics.CreateAPIView):
	serializer_class = ArticleCommentSerializer
	permission_classes = [permissions.AllowAny]

	def perform_create(self, serializer):
		parent = ArticleComment.objects.get(pk=self.kwargs['parent_id'])
		serializer.save(
			article=parent.article,
			parent=parent,
			user=self.request.user if self.request.user.is_authenticated else None
		)


@api_view(['GET'])
def article_search(request):
	q = request.GET.get('q', '').strip()
	if not q:
		return Response([])
	qs = (
		Article.objects.select_related('author')
		.filter(
			Q(title__icontains=q) |
			Q(author__username__icontains=q) |
			Q(author__first_name__icontains=q) |
			Q(author__last_name__icontains=q) |
			Q(tags__icontains=q)
		)
		.distinct()
		.order_by('-date')[:25]
	)
	return Response(ArticleListSerializer(qs, many=True, context={'request': request}).data)
