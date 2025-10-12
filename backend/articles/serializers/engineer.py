from rest_framework import serializers
from ..models import (
    Specialization, Country, Engineer, WorkExperience,
    Education, Project, Certification, Review, OfficeLocation
)

class SpecializationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Specialization
        fields = ["id", "name", "discipline"]

class CountrySerializer(serializers.ModelSerializer):
    class Meta:
        model = Country
        fields = ["id", "name", "iso_code"]

class WorkExperienceSerializer(serializers.ModelSerializer):
    class Meta:
        model = WorkExperience
        fields = ["id", "job_title", "company", "start_date", "end_date", "description", "is_current"]

class EducationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Education
        fields = ["id", "degree", "field_of_study", "school", "graduation_year", "achievements"]

class ProjectSerializer(serializers.ModelSerializer):
    class Meta:
        model = Project
        fields = ["id", "name", "description", "client", "completion_date", "project_url", "project_image", "technologies_used"]

class CertificationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Certification
        fields = ["id", "name", "issuing_organization", "issue_date", "expiration_date", "credential_id", "credential_url"]

class ReviewSerializer(serializers.ModelSerializer):
    class Meta:
        model = Review
        fields = ["id", "reviewer_name", "reviewer_email", "rating", "title", "comment", "is_verified", "created_at"]


class OfficeLocationSerializer(serializers.ModelSerializer):
    country = CountrySerializer(read_only=True)
    country_id = serializers.PrimaryKeyRelatedField(
        queryset=Country.objects.all(), source="country", write_only=True, required=True
    )

    class Meta:
        model = OfficeLocation
        fields = [
            "id", "company_name", "street_address", "city", "state_province",
            "country", "country_id", "postal_code", "latitude", "longitude",
            "phone", "email", "location_type", "is_verified",
        ]

class EngineerListSerializer(serializers.ModelSerializer):
    full_name = serializers.CharField(read_only=True)
    country = CountrySerializer(read_only=True)
    specializations = serializers.SlugRelatedField(slug_field="name", read_only=True, many=True)
    projects_count = serializers.IntegerField(read_only=True)
    reviews_count = serializers.IntegerField(read_only=True)
    avg_rating = serializers.FloatField(read_only=True)

    class Meta:
        model = Engineer
        fields = [
            "id", "full_name", "job_title", "city", "country",
            "is_verified", "availability", "years_experience", "featured_level", "featured_id", "specializations",
            "projects_count", "reviews_count", "avg_rating",
        ]

class EngineerDetailSerializer(serializers.ModelSerializer):
    full_name = serializers.CharField(read_only=True)
    country = CountrySerializer(read_only=True)
    specializations = SpecializationSerializer(read_only=True, many=True)
    work_experience = WorkExperienceSerializer(read_only=True, many=True)
    education = EducationSerializer(read_only=True, many=True)
    projects = ProjectSerializer(read_only=True, many=True)
    certifications = CertificationSerializer(read_only=True, many=True)
    reviews = ReviewSerializer(read_only=True, many=True)
    projects_count = serializers.IntegerField(read_only=True)
    reviews_count = serializers.IntegerField(read_only=True)
    avg_rating = serializers.FloatField(read_only=True)

    class Meta:
        model = Engineer
        fields = [
            "id", "first_name", "last_name", "full_name", "email", "phone", "profile_photo",
            "company", "job_title", "specializations",
            "office_location", "street_address", "city", "state_province", "country",
            "postal_code", "latitude", "longitude", "location_visibility",
            "years_experience", "hourly_rate", "is_freelancer", "availability", "featured_level", "featured_id",
            "professional_summary", "bio", "languages",
            "website_url", "linkedin_url",
            "is_verified", "is_active", "created_at", "updated_at",
            "work_experience", "education", "projects", "certifications", "reviews", "projects_count", "reviews_count", "avg_rating",
        ]


class EngineerWriteSerializer(serializers.ModelSerializer):
    # Accept IDs for related fields
    country = serializers.PrimaryKeyRelatedField(queryset=Country.objects.all(), required=False, allow_null=True)
    specializations = serializers.PrimaryKeyRelatedField(queryset=Specialization.objects.all(), many=True, required=False)
    office_location = serializers.PrimaryKeyRelatedField(queryset=OfficeLocation.objects.all(), required=False, allow_null=True)

    class Meta:
        model = Engineer
        fields = [
            "first_name", "last_name", "email", "phone", "profile_photo",
            "company", "job_title", "specializations",
            "office_location", "street_address", "city", "state_province", "country",
            "postal_code", "latitude", "longitude", "location_visibility",
            "years_experience", "hourly_rate", "is_freelancer", "availability",
            "professional_summary", "bio", "languages",
            "website_url", "linkedin_url",
        ]