from rest_framework import generics, permissions
from ..models import ContactMessage
from ..serializers import ContactMessageSerializer


class ContactMessageCreateView(generics.CreateAPIView):
	queryset = ContactMessage.objects.all()
	serializer_class = ContactMessageSerializer
	permission_classes = [permissions.AllowAny]

	def perform_create(self, serializer):
		serializer.save()


class ContactMessageListCreateView(generics.ListCreateAPIView):
	queryset = ContactMessage.objects.order_by('-created_at')
	serializer_class = ContactMessageSerializer
	permission_classes = [permissions.AllowAny]


class ContactMessageDetailView(generics.RetrieveDestroyAPIView):
	queryset = ContactMessage.objects.all()
	serializer_class = ContactMessageSerializer
	permission_classes = [permissions.AllowAny]
