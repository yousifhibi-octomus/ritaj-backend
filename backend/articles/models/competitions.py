from django.db import models
import uuid
from django.utils import timezone as dj_tz


class Competition(models.Model):
    class Category(models.TextChoices):
        ARCHITECTURAL_DESIGN = 'architectural_design', 'Architectural Design'
        URBAN_PLANNING = 'urban_planning', 'Urban Planning'
        HOUSING = 'housing', 'Housing'
        RESTORATION = 'restoration', 'Restoration'
        IDEAS = 'ideas', 'Ideas Competition'

    class Audience(models.TextChoices):
        PROFESSIONALS = 'professionals', 'Professionals'
        STUDENTS = 'students', 'Students'
        OPEN = 'open', 'Open for All'

    class Status(models.TextChoices):
        UPCOMING = 'upcoming', 'Upcoming'
        ACTIVE = 'active', 'Active'
        COMPLETED = 'completed', 'Completed'
        CANCELLED = 'cancelled', 'Cancelled'

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    title = models.CharField(max_length=500)

    category = models.CharField(max_length=50, choices=Category.choices)
    target_audience = models.CharField(max_length=50, choices=Audience.choices, default=Audience.OPEN)
    description = models.TextField()
    registration_start = models.DateTimeField()
    registration_end = models.DateTimeField()
    submission_end = models.DateTimeField()
    results_date = models.DateTimeField(null=True, blank=True)
    bio = models.TextField(max_length=250, default="Default bio text")
    status = models.CharField(max_length=50, choices=Status.choices, default=Status.UPCOMING)
    featured = models.BooleanField(default=False)

    prizes = models.JSONField(default=list, blank=True)
    requirements = models.JSONField(default=list, blank=True)
    jury = models.JSONField(default=list, blank=True)

    cover_image = models.ImageField(upload_to='competitions/covers/', null=True, blank=True)
    participant_count = models.IntegerField(default=0)

    created_at = models.DateTimeField(default=dj_tz.now)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']
        verbose_name_plural = 'Competitions'

    def __str__(self):
        return self.title

    def is_active(self):
        return self.status == self.Status.ACTIVE and dj_tz.now() <= self.registration_end

    def can_register(self):
        now = dj_tz.now()
        return (
            self.status == self.Status.ACTIVE and
            self.registration_start <= now <= self.registration_end
        )


class Participant(models.Model):
    class ParticipantType(models.TextChoices):
        PROFESSIONAL = 'professional', 'Professional'
        STUDENT = 'student', 'Student'
        ENTHUSIAST = 'enthusiast', 'Enthusiast'

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    competition = models.ForeignKey(
        Competition, on_delete=models.CASCADE, related_name='participants'
    )
    full_name = models.CharField(max_length=255)
    email = models.EmailField()
    phone = models.CharField(max_length=20, default='0000000000')
    country = models.CharField(max_length=100, null=True, blank=True)
    city = models.CharField(max_length=100, null=True, blank=True)
    participant_type = models.CharField(max_length=50, choices=ParticipantType.choices)
    occupation = models.CharField(max_length=255, null=True, blank=True)
    organization = models.CharField(max_length=255, null=True, blank=True)
    team_name = models.CharField(max_length=255, null=True, blank=True)
    registered_at = models.DateTimeField(default=dj_tz.now)

    class Meta:
        unique_together = ['competition', 'email']
        verbose_name_plural = 'Participants'

    def __str__(self):
        return f"{self.full_name} - {self.competition.title}"
