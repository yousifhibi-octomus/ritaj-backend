import json
from django.shortcuts import get_object_or_404
from django.utils import timezone
from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView
from ..models import Article, AuthorRequest, ArticleRequest
from ..models.requests import ArticleRequestImage
from ..serializers import AuthorRequestSerializer, ArticleRequestSerializer


class AuthorRequestCreateView(APIView):
	def post(self, request):
		if not request.user.is_authenticated:
			return Response({'detail': 'Authentication required'}, status=401)
		if request.user.role in ['author', 'editor', 'admin']:
			return Response({'detail': 'You already have author privileges.'}, status=400)
		existing = getattr(request.user, 'author_request', None)
		if existing and existing.status == 'pending':
			return Response({'detail': 'Request already pending.'}, status=400)
		motivation = request.data.get('motivation', '')
		req, created = AuthorRequest.objects.get_or_create(user=request.user, defaults={'motivation': motivation})
		if not created and req.status == 'rejected':
			req.status = 'pending'
			req.motivation = motivation or req.motivation
			req.save(update_fields=['status','motivation'])
		return Response(AuthorRequestSerializer(req).data, status=201)


class AuthorRequestModerateView(APIView):
	def post(self, request, username):
		if not request.user.is_authenticated or request.user.role != 'admin':
			return Response({'detail': 'Admin only'}, status=403)
		action = request.data.get('action')
		try:
			req = AuthorRequest.objects.get(user__username=username)
		except AuthorRequest.DoesNotExist:
			return Response({'detail': 'Not found'}, status=404)
		if action == 'approve':
			req.status = 'approved'
			req.reviewed_at = timezone.now()
			req.save(update_fields=['status', 'reviewed_at'])
			req.user.role = 'author'
			req.user.save(update_fields=['role'])
		elif action == 'reject':
			req.status = 'rejected'
			req.reviewed_at = timezone.now()
			req.save(update_fields=['status', 'reviewed_at'])
		else:
			return Response({'detail': 'Invalid action'}, status=400)
		return Response(AuthorRequestSerializer(req).data)


class AuthorRequestAdminListView(APIView):
	def get(self, request):
		user = request.user
		if not user.is_authenticated or getattr(user, 'role', '') not in ('admin', 'editor'):
			return Response({"detail": "Unauthorized"}, status=status.HTTP_403_FORBIDDEN)

		status_param = request.query_params.get('status')
		qs = AuthorRequest.objects.all().select_related('user').order_by('-created_at')
		if status_param and status_param != 'all':
			qs = qs.filter(status=status_param)

		serializer = AuthorRequestSerializer(qs, many=True)
		return Response(serializer.data, status=status.HTTP_200_OK)


class ArticleRequestAdminListView(APIView):
	def get(self, request):
		user = request.user
		if not user.is_authenticated or getattr(user, 'role', '') not in ('admin', 'editor'):
			return Response({"detail": "Unauthorized"}, status=status.HTTP_403_FORBIDDEN)

		status_param = request.query_params.get('status')
		qs = (ArticleRequest.objects
			  .all()
			  .select_related('author')
			  .order_by('-created_at'))

		if status_param and status_param != 'all':
			if status_param == 'pending_or_edit':
				qs = qs.filter(status__in=['pending', 'needs_editing'])
			else:
				qs = qs.filter(status=status_param)
		else:
			qs = qs.filter(status__in=['pending', 'needs_editing'])

		serializer = ArticleRequestSerializer(qs, many=True)
		return Response(serializer.data, status=status.HTTP_200_OK)


class ArticleRequestCreateView(APIView):
	def post(self, request):
		if not request.user.is_authenticated:
			return Response({'detail': 'Authentication required'}, status=401)

		data = request.data
		title = data.get('title')
		slug = data.get('slug')
		body = data.get('text') or data.get('content')
		excerpt = data.get('excerpt', '')
		tags = data.get('tags', [])

		if isinstance(tags, str):
			try:
				tags = json.loads(tags)
			except json.JSONDecodeError:
				tags = []

		if not title or not body:
			return Response({'detail': 'Title and content required'}, status=400)

		if ArticleRequest.objects.filter(slug=slug).exists() or Article.objects.filter(slug=slug).exists():
			return Response({'detail': 'Slug already in use'}, status=400)

		header_image = request.FILES.get('header_image')

		article_request = ArticleRequest.objects.create(
			title=title,
			slug=slug,
			author=request.user,
			text=body,
			excerpt=excerpt,
			header_image=header_image,
			tags=tags,
		)
		# Save uploaded additional images as related rows with order
		order = 0
		for key, f in request.FILES.items():
			if key.startswith('image_'):
				ArticleRequestImage.objects.create(request=article_request, image=f, order=order)
				order += 1
		return Response(ArticleRequestSerializer(article_request).data, status=201)


class ArticleRequestDraftCreateView(ArticleRequestCreateView):
	pass


class ArticleRequestModerateView(APIView):
	def post(self, request, request_id):
		if not request.user.is_authenticated or request.user.role not in ['admin', 'editor']:
			return Response({'detail': 'Unauthorized'}, status=status.HTTP_403_FORBIDDEN)

		action = request.data.get('action')
		comments = request.data.get('comments', '')

		article_request = get_object_or_404(ArticleRequest, id=request_id)

		if action == 'approve':
			article = Article.objects.create(
				title=article_request.title,
				slug=article_request.slug,
				author=article_request.author,
				text=article_request.text,
				headerImage=article_request.header_image,
				tags=article_request.tags,
				date=timezone.now().date(),
			)
			# Copy request images to article images
			try:
				from ..models.article import ArticleImage
				for order, ri in enumerate(article_request.images.all()):
					ArticleImage.objects.create(article=article, image=ri.image, order=order)
			except Exception:
				pass
			article_request.status = 'approved'
		elif action == 'needs_editing':
			article_request.status = 'needs_editing'
		elif action == 'reject':
			article_request.status = 'rejected'
		else:
			return Response({'detail': 'Invalid action'}, status=status.HTTP_400_BAD_REQUEST)

		article_request.reviewed_at = timezone.now()
		article_request.reviewer = request.user
		article_request.review_comments = comments
		article_request.save()

		return Response(ArticleRequestSerializer(article_request).data)


class ArticleRequestDetailAdminView(APIView):
	def get(self, request, id):
		user = request.user
		if not user.is_authenticated or getattr(user, 'role', '') not in ('admin','editor'):
			return Response({'detail': 'Unauthorized'}, status=403)
		obj = get_object_or_404(ArticleRequest.objects.select_related('author'), id=id)
		return Response(ArticleRequestSerializer(obj).data, status=200)
