from rest_framework.generics import (
    ListCreateAPIView,
    RetrieveUpdateDestroyAPIView,
    ListAPIView,
)
from rest_framework.permissions import AllowAny, IsAuthenticatedOrReadOnly
from rest_framework.pagination import PageNumberPagination
from django.db.models import Q, Count, Avg

from ..models import Engineer, Specialization, Country, OfficeLocation
from ..serializers.engineer import (
    EngineerListSerializer,
    EngineerDetailSerializer,
    EngineerWriteSerializer,
    SpecializationSerializer,
    CountrySerializer,
    OfficeLocationSerializer,
)


class EngineerPagination(PageNumberPagination):
    page_size = 12
    page_query_param = "page"
    page_size_query_param = "page_size"
    max_page_size = 100


class EngineerListCreateView(ListCreateAPIView):
    queryset = (
        Engineer.objects.select_related("country")
        .prefetch_related("specializations")
        .all()
        .annotate(
            projects_count=Count("projects", distinct=True),
            reviews_count=Count("reviews", distinct=True),
            avg_rating=Avg("reviews__rating"),
        )
    )
    permission_classes = [AllowAny]
    ordering = ["-featured_level", "-created_at"]
    pagination_class = EngineerPagination

    def get_queryset(self):
        qs = super().get_queryset()
        params = self.request.query_params if self.request else {}

        # Text search across common fields
        search = params.get("search")
        if search:
            qs = qs.filter(
                Q(first_name__icontains=search)
                | Q(last_name__icontains=search)
                | Q(company__icontains=search)
                | Q(job_title__icontains=search)
                | Q(city__icontains=search)
                | Q(country__name__icontains=search)
            )

        # Specialization can be id(s) or names/discipline strings
        specs = params.getlist("specialization") if hasattr(params, "getlist") else []
        if not specs:
            # Also allow single specialization param
            single_spec = params.get("specialization")
            if single_spec:
                specs = [single_spec]
        if specs:
            spec_q = Q()
            for s in specs:
                if s.isdigit():
                    spec_q |= Q(specializations__id=int(s))
                else:
                    spec_q |= Q(specializations__name__iexact=s) | Q(specializations__discipline__iexact=s)
            qs = qs.filter(spec_q)

        # Country filter: support id or name
        country = params.get("country")
        if country:
            if country.isdigit():
                qs = qs.filter(country__id=int(country))
            else:
                qs = qs.filter(country__name__iexact=country)

        # City exact/partial match
        city = params.get("city")
        if city:
            qs = qs.filter(city__icontains=city)

        # Verified only
        is_verified = params.get("is_verified")
        if is_verified:
            truthy = {"1", "true", "yes", "y", "on"}
            falsy = {"0", "false", "no", "n", "off"}
            val = is_verified.strip().lower()
            if val in truthy:
                qs = qs.filter(is_verified=True)
            elif val in falsy:
                qs = qs.filter(is_verified=False)

        # Freelancer / account type
        is_freelancer = params.get("is_freelancer")
        account_type = params.get("account_type")
        if account_type in ("company", "individual"):
            # Map account_type to is_freelancer without schema changes
            qs = qs.filter(is_freelancer=(account_type == "individual"))
        elif is_freelancer:
            truthy = {"1", "true", "yes", "y", "on"}
            falsy = {"0", "false", "no", "n", "off"}
            val = is_freelancer.strip().lower()
            if val in truthy:
                qs = qs.filter(is_freelancer=True)
            elif val in falsy:
                qs = qs.filter(is_freelancer=False)

        # Availability exact value
        availability = params.get("availability")
        if availability:
            qs = qs.filter(availability=availability)

        # Years of experience range
        min_years = params.get("min_years")
        max_years = params.get("max_years")
        try:
            if min_years is not None and min_years != "":
                qs = qs.filter(years_experience__gte=int(min_years))
        except ValueError:
            pass
        try:
            if max_years is not None and max_years != "":
                qs = qs.filter(years_experience__lte=int(max_years))
        except ValueError:
            pass

        featured_min = self.request.query_params.get("featured_min") if self.request else None
        if featured_min:
            try:
                qs = qs.filter(featured_level__gte=int(featured_min))
            except ValueError:
                pass
        featured_id = self.request.query_params.get("featured_id") if self.request else None
        if featured_id:
            try:
                qs = qs.filter(featured_id=int(featured_id))
            except ValueError:
                pass
        return qs.distinct()

    def get_serializer_class(self):
        # Use a lighter serializer for list; dedicated write serializer for create
        if self.request:
            if self.request.method == "GET":
                return EngineerListSerializer
            # POST
            return EngineerWriteSerializer
        return EngineerListSerializer


class EngineerDetailView(RetrieveUpdateDestroyAPIView):
    queryset = (
        Engineer.objects.select_related("country")
        .prefetch_related(
            "specializations", "work_experience", "education", "projects", "certifications", "reviews"
        )
        .annotate(
            projects_count=Count("projects", distinct=True),
            reviews_count=Count("reviews", distinct=True),
            avg_rating=Avg("reviews__rating"),
        )
    )
    serializer_class = EngineerDetailSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]


class SpecializationListView(ListCreateAPIView):
    queryset = Specialization.objects.all().order_by("discipline", "name")
    serializer_class = SpecializationSerializer
    permission_classes = [AllowAny]


class CountryListView(ListAPIView):
    queryset = Country.objects.all().order_by("name")
    serializer_class = CountrySerializer
    permission_classes = [AllowAny]


class OfficeLocationListCreateView(ListCreateAPIView):
    queryset = OfficeLocation.objects.select_related("country").all().order_by("company_name", "city")
    serializer_class = OfficeLocationSerializer
    permission_classes = [AllowAny]