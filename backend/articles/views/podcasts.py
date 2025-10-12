from rest_framework import generics
from ..models import Podcast
from ..serializers import PodcastSerializer


class PodcastListCreateView(generics.ListCreateAPIView):
    queryset = Podcast.objects.all()
    serializer_class = PodcastSerializer
