from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView
from ..models import NewsletterSubscription


class NewsletterSubscribeView(APIView):
    authentication_classes = []
    permission_classes = []

    def post(self, request):
        email = (request.data.get('email') or '').strip().lower()
        if not email:
            return Response({'detail': 'Email required'}, status=status.HTTP_400_BAD_REQUEST)
        sub, created = NewsletterSubscription.objects.get_or_create(email=email)
        if sub.unsubscribed:
            sub.unsubscribed = False
            sub.unsubscribed_at = None
            sub.save(update_fields=['unsubscribed', 'unsubscribed_at'])
        return Response({
            'email': sub.email,
            'created': created,
            'unsubscribed': sub.unsubscribed
        }, status=status.HTTP_201_CREATED)


class NewsletterUnsubscribeView(APIView):
    authentication_classes = []
    permission_classes = []

    def post(self, request):
        email = (request.data.get('email') or '').strip().lower()
        if not email:
            return Response({'detail': 'Email required'}, status=status.HTTP_400_BAD_REQUEST)
        try:
            sub = NewsletterSubscription.objects.get(email=email)
        except NewsletterSubscription.DoesNotExist:
            return Response({'detail': 'Not found'}, status=status.HTTP_404_NOT_FOUND)
        if not sub.unsubscribed:
            sub.mark_unsubscribed()
        return Response({'email': sub.email, 'unsubscribed': True}, status=status.HTTP_200_OK)
