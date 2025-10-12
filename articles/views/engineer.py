from rest_framework.generics import ListCreateAPIView, RetrieveUpdateDestroyAPIView, ListAPIView
from rest_framework.permissions import AllowAny, IsAuthenticatedOrReadOnly
from rest_framework.filters import SearchFilter, OrderingFilter
from django_filters.rest_framework import DjangoFilterBackend, FilterSet, filters
from ..models import Engineer, Specialization, Country
from ..serializers import (
    EngineerListSerializer, EngineerDetailSerializer,
    SpecializationSerializer, CountrySerializer
)

class EngineerFilter(FilterSet):
    specialization = filters.CharFilter(method="filter_specialization")
    country = filters.NumberFilter(field_name="country_id")
    city = filters.CharFilter(field_name="city", lookup_expr="icontains")
    is_verified = filters.BooleanFilter()
    is_freelancer = filters.BooleanFilter()
    availability = filters.CharFilter()
    min_years = filters.NumberFilter(field_name="years_experience", lookup_expr="gte")
    max_years = filters.NumberFilter(field_name="years_experience", lookup_expr="lte")

    def filter_specialization(self, queryset, name, value):
        return queryset.filter(specializations__name__icontains=value)

    class Meta:
        model = Engineer
        fields = ["country", "city", "is_verified", "is_freelancer", "availability"]

class EngineerListCreateView(ListCreateAPIView):
    queryset = Engineer.objects.select_related("country").prefetch_related("specializations").all()
    serializer_class = EngineerListSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_class = EngineerFilter
    search_fields = ["first_name", "last_name", "email", "company", "job_title", "city"]
    ordering_fields = ["created_at", "years_experience", "hourly_rate"]
    ordering = ["-created_at"]

    def get_serializer_class(self):
        if self.request and self.request.method == "GET":
            return EngineerListSerializer
        return EngineerDetailSerializer

class EngineerDetailView(RetrieveUpdateDestroyAPIView):
    queryset = Engineer.objects.select_related("country").prefetch_related(
        "specializations", "work_experience", "education", "projects", "certifications", "reviews"
    )
    serializer_class = EngineerDetailSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]

class SpecializationListView(ListAPIView):
    queryset = Specialization.objects.all().order_by("discipline", "name")
    serializer_class = SpecializationSerializer
    permission_classes = [AllowAny]

class CountryListView(ListAPIView):
    queryset = Country.objects.all().order_by("name")
    serializer_class = CountrySerializer
    permission_classes = [AllowAny]