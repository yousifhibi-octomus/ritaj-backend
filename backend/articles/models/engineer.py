# models.py
from django.db import models
from django.conf import settings
from django.core.validators import MinValueValidator, MaxValueValidator
from django.utils import timezone



class Specialization(models.Model):
    name = models.CharField(max_length=100)
    discipline = models.CharField(max_length=100)

    def __str__(self):
        return self.name

class Country(models.Model):
    """Country data for consistent location handling"""
    name = models.CharField(max_length=100)
    iso_code = models.CharField(max_length=2)
    
    def __str__(self):
        return self.name

class OfficeLocation(models.Model):
    """For companies with multiple offices"""
    LOCATION_TYPES = [
        ('headquarters', 'Headquarters'),
        ('branch', 'Branch Office'),
        ('regional', 'Regional Office'),
    ]
    
    company_name = models.CharField(max_length=200)
    street_address = models.CharField(max_length=255)
    city = models.CharField(max_length=100)
    state_province = models.CharField(max_length=100)
    country = models.ForeignKey(Country, on_delete=models.CASCADE)
    postal_code = models.CharField(max_length=20)
    latitude = models.DecimalField(max_digits=10, decimal_places=8, null=True, blank=True)
    longitude = models.DecimalField(max_digits=11, decimal_places=8, null=True, blank=True)
    phone = models.CharField(max_length=20, blank=True)
    email = models.EmailField(blank=True)
    location_type = models.CharField(max_length=20, choices=LOCATION_TYPES, default='branch')
    is_verified = models.BooleanField(default=False)
    
    class Meta:
        indexes = [
            models.Index(fields=['latitude', 'longitude']),
            models.Index(fields=['city', 'country']),
        ]
    
    def __str__(self):
        return f"{self.company_name} - {self.city}, {self.country}"

class Engineer(models.Model):
    """Main engineer profile model"""
    LOCATION_VISIBILITY = [
        ('full', 'Full Address'),
        ('area', 'Area Only (City/State)'),
        ('hidden', 'No Location Shown'),
    ]
    
    AVAILABILITY_STATUS = [
        ('available', 'Available for Projects'),
        ('limited', 'Limited Availability'),
        ('unavailable', 'Not Taking New Clients'),
    ]
    
    # Core Identity
    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, null=True, blank=True)
    first_name = models.CharField(max_length=100)
    last_name = models.CharField(max_length=100)
    email = models.EmailField()
    phone = models.CharField(max_length=20, blank=True)
    profile_photo = models.ImageField(upload_to='engineer_photos/', null=True, blank=True)
    
    # Professional Information
    company = models.CharField(max_length=200, blank=True)
    job_title = models.CharField(max_length=200)
    specializations = models.ManyToManyField(Specialization, related_name='engineers')
    
    # Location Data
    office_location = models.ForeignKey(OfficeLocation, on_delete=models.SET_NULL, null=True, blank=True)
    # Individual location (if not part of an office)
    street_address = models.CharField(max_length=255, blank=True)
    city = models.CharField(max_length=100, blank=True)
    state_province = models.CharField(max_length=100, blank=True)
    country = models.ForeignKey(Country, on_delete=models.CASCADE, null=True, blank=True)
    postal_code = models.CharField(max_length=20, blank=True)
    latitude = models.DecimalField(max_digits=10, decimal_places=8, null=True, blank=True)
    longitude = models.DecimalField(max_digits=11, decimal_places=8, null=True, blank=True)
    location_visibility = models.CharField(max_length=20, choices=LOCATION_VISIBILITY, default='area')
    
    # Professional Details
    years_experience = models.PositiveIntegerField(null=True, blank=True)
    hourly_rate = models.DecimalField(max_digits=8, decimal_places=2, null=True, blank=True)
    is_freelancer = models.BooleanField(default=False)
    availability = models.CharField(max_length=20, choices=AVAILABILITY_STATUS, default='available')
    
    # Bio & Description
    professional_summary = models.CharField(max_length=255, blank=True)
    bio = models.TextField(blank=True)
    languages = models.CharField(max_length=200, blank=True, help_text="Comma-separated list of languages")
    
    # Social & Links
    website_url = models.URLField(blank=True)
    linkedin_url = models.URLField(blank=True)
    
    
    # Verification & Status
    is_verified = models.BooleanField(default=False)
    is_active = models.BooleanField(default=True)
    featured_level = models.PositiveIntegerField(
        default=1,
        validators=[MinValueValidator(1), MaxValueValidator(5)],
        help_text="Featured level from 1 (lowest) to 5 (highest)"
    )
    featured_id = models.PositiveIntegerField(null=True, blank=True, db_index=True,
                                              help_text="Optional external or campaign feature ID")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        indexes = [
            models.Index(fields=['city', 'country']),
            models.Index(fields=['latitude', 'longitude']),
            models.Index(fields=['is_verified', 'is_active']),
        ]
    
    def __str__(self):
        return f"{self.first_name} {self.last_name} - {self.job_title}"
    
    @property
    def full_name(self):
        return f"{self.first_name} {self.last_name}"
    
    @property
    def display_location(self):
        """Get location based on visibility settings"""
        if self.location_visibility == 'hidden':
            return "Location not shown"
        elif self.location_visibility == 'area':
            if self.city and self.country:
                return f"{self.city}, {self.country.name}"
            return "Location available"
        else:  # full
            if self.street_address and self.city and self.country:
                return f"{self.street_address}, {self.city}, {self.country.name}"
            return f"{self.city}, {self.country.name}" if self.city else "Location available"

class WorkExperience(models.Model):
    """Work history for engineers"""
    engineer = models.ForeignKey(Engineer, on_delete=models.CASCADE, related_name='work_experience')
    job_title = models.CharField(max_length=200)
    company = models.CharField(max_length=200)
    start_date = models.DateField()
    end_date = models.DateField(null=True, blank=True)
    description = models.TextField(blank=True)
    is_current = models.BooleanField(default=False)
    
    class Meta:
        ordering = ['-start_date']
    
    def __str__(self):
        return f"{self.job_title} at {self.company}"

class Education(models.Model):
    """Education history"""
    DEGREE_TYPES = [
        ('bs', 'Bachelor of Science'),
        ('ms', 'Master of Science'),
        ('phd', 'PhD'),
        ('associate', 'Associate Degree'),
        ('diploma', 'Diploma'),
        ('certificate', 'Certificate'),
    ]
    
    engineer = models.ForeignKey(Engineer, on_delete=models.CASCADE, related_name='education')
    degree = models.CharField(max_length=50, choices=DEGREE_TYPES)
    field_of_study = models.CharField(max_length=200)
    school = models.CharField(max_length=200)
    graduation_year = models.PositiveIntegerField(
        validators=[MinValueValidator(1950), MaxValueValidator(2030)]
    )
    achievements = models.TextField(blank=True)
    
    class Meta:
        ordering = ['-graduation_year']
    
    def __str__(self):
        return f"{self.get_degree_display()} in {self.field_of_study} - {self.school}"

class Project(models.Model):
    """Portfolio projects"""
    engineer = models.ForeignKey(Engineer, on_delete=models.CASCADE, related_name='projects')
    name = models.CharField(max_length=200)
    description = models.TextField()
    client = models.CharField(max_length=200, blank=True)
    completion_date = models.DateField(null=True, blank=True)
    project_url = models.URLField(blank=True)
    project_image = models.ImageField(upload_to='project_images/', null=True, blank=True)
    technologies_used = models.CharField(max_length=500, blank=True, help_text="Comma-separated list")
    
    class Meta:
        ordering = ['-completion_date']
    
    def __str__(self):
        return f"{self.name} - {self.engineer.full_name}"

class Certification(models.Model):
    """Professional certifications"""
    engineer = models.ForeignKey(Engineer, on_delete=models.CASCADE, related_name='certifications')
    name = models.CharField(max_length=200)
    issuing_organization = models.CharField(max_length=200)
    issue_date = models.DateField()
    expiration_date = models.DateField(null=True, blank=True)
    credential_id = models.CharField(max_length=100, blank=True)
    credential_url = models.URLField(blank=True)
    
    class Meta:
        ordering = ['-issue_date']
    
    def __str__(self):
        return f"{self.name} - {self.issuing_organization}"

class Review(models.Model):
    """Client reviews and ratings"""
    engineer = models.ForeignKey(Engineer, on_delete=models.CASCADE, related_name='reviews')
    reviewer_name = models.CharField(max_length=100)
    reviewer_email = models.EmailField(blank=True)
    rating = models.PositiveIntegerField(
        validators=[MinValueValidator(1), MaxValueValidator(5)]
    )
    title = models.CharField(max_length=200)
    comment = models.TextField()
    is_verified = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.rating} stars - {self.title}"