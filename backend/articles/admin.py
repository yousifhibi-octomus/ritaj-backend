from django.contrib import admin
from django.utils import timezone
from django.utils.html import format_html
from .models import ArticleComment,NewsletterSubscription, User, UserSocial, UserSavedArticle, Article, Podcast, AuthorRequest, ArticleRequest
from .models.article import ArticleImage
from .models import ContactMessage
from .models import Competition, Participant

from .models import (
    Specialization, Country, OfficeLocation, Engineer,
    WorkExperience, Education, Project, Certification, Review
)

@admin.register(AuthorRequest)
class AuthorRequestAdmin(admin.ModelAdmin):
    list_display = ('user', 'status', 'created_at', 'reviewed_at', 'motivation_short')
    list_filter = ('status', 'created_at')
    search_fields = ('user__username', 'user__email', 'motivation')
    readonly_fields = ('created_at', 'reviewed_at')
    ordering = ('-created_at',)
    actions = ['approve_requests', 'reject_requests']

    def motivation_short(self, obj):
        return (obj.motivation[:60] + '...') if obj.motivation and len(obj.motivation) > 60 else obj.motivation
    motivation_short.short_description = 'Motivation'

    def approve_requests(self, request, queryset):
        updated = 0
        for req in queryset.select_related('user'):
            if req.status != 'approved':
                req.status = 'approved'
                req.reviewed_at = timezone.now()
                req.save()
                if req.user.role != 'author':
                    req.user.role = 'author'
                    req.user.save(update_fields=['role'])
                updated += 1
        self.message_user(request, f'Approved {updated} request(s).')
    approve_requests.short_description = 'Approve selected (and promote to author)'

    def reject_requests(self, request, queryset):
        updated = 0
        for req in queryset:
            if req.status != 'rejected':
                req.status = 'rejected'
                req.reviewed_at = timezone.now()
                req.save()
                updated += 1
        self.message_user(request, f'Rejected {updated} request(s).')
    reject_requests.short_description = 'Reject selected'

@admin.register(ArticleRequest)
class ArticleRequestAdmin(admin.ModelAdmin):
    list_display = ('title', 'author_name', 'status', 'created_at', 'reviewed_at', 'reviewer_name')
    list_filter = ('status', 'created_at', 'reviewed_at')
    search_fields = ('title', 'author__username', 'author__name', 'slug')
    readonly_fields = ('created_at', 'reviewed_at', 'slug')
    ordering = ('-created_at',)
    actions = ['approve_articles', 'reject_articles', 'mark_needs_editing']
    
    fieldsets = (
        ('Article Information', {
            # 'text' is the actual model field (was previously referred to as 'content' in legacy code)
            'fields': ('title', 'slug', 'author', 'text', 'excerpt', 'header_image', 'tags')
        }),
        ('Review Information', {
            'fields': ('status', 'reviewer', 'review_comments', 'created_at', 'reviewed_at')
        }),
    )
    
    def author_name(self, obj):
        if not obj.author:
            return '—'
        return obj.author.name or obj.author.username
    author_name.short_description = 'Author'

    def reviewer_name(self, obj):
        return obj.reviewer.name if obj.reviewer else obj.reviewer.username if obj.reviewer else '—'
    reviewer_name.short_description = 'Reviewer'

    def approve_articles(self, request, queryset):
        updated = 0
        for req in queryset.select_related('author'):
            if req.status == 'pending':
                # Create actual article
                article = Article.objects.create(
                    title=req.title,
                    slug=req.slug,
                    author=req.author,
                    text=req.text,  # Article model field is 'text'
                    headerImage=req.header_image,  # Map naming difference
                    tags=req.tags,
                    date=timezone.now().date(),
                )
                # Create related images if any (names stored in req.images)
                try:
                    for order, name in enumerate(req.images or []):
                        if not name:
                            continue
                        ArticleImage.objects.create(article=article, image=name, order=order)
                except Exception:
                    # Ignore issues with legacy image names
                    pass
                req.status = 'approved'
                req.reviewed_at = timezone.now()
                req.reviewer = request.user
                req.save()
                updated += 1
        self.message_user(request, f'Approved {updated} article(s) and created them as published articles.')
    approve_articles.short_description = 'Approve selected articles (and publish them)'

    def reject_articles(self, request, queryset):
        updated = 0
        for req in queryset:
            if req.status == 'pending':
                req.status = 'rejected'
                req.reviewed_at = timezone.now()
                req.reviewer = request.user
                req.save()
                updated += 1
        self.message_user(request, f'Rejected {updated} article(s).')
    reject_articles.short_description = 'Reject selected articles'

    def mark_needs_editing(self, request, queryset):
        updated = 0
        for req in queryset:
            if req.status == 'pending':
                req.status = 'needs_editing'
                req.reviewed_at = timezone.now()
                req.reviewer = request.user
                req.save()
                updated += 1
        self.message_user(request, f'Marked {updated} article(s) as needing editing.')
    mark_needs_editing.short_description = 'Mark selected articles as needing editing'

class AuthorRequestInline(admin.StackedInline):
    model = AuthorRequest
    can_delete = False
    readonly_fields = ('status', 'created_at', 'reviewed_at')
    extra = 0

class ArticleRequestInline(admin.StackedInline):
    model = ArticleRequest
    fk_name = 'author'  # Specify which foreign key to use
    can_delete = False
    readonly_fields = ('status', 'created_at', 'reviewed_at', 'slug')
    extra = 0
    fields = ('title', 'status', 'created_at', 'reviewed_at', 'reviewer', 'review_comments')

@admin.register(User)
class UserAdmin(admin.ModelAdmin):
    list_display = ('username', 'email', 'role', 'is_active', 'is_staff')
    list_filter = ('role', 'is_staff', 'is_superuser')
    search_fields = ('username', 'email', 'name')
    inlines = [AuthorRequestInline, ArticleRequestInline]

@admin.register(Article)
class ArticleAdmin(admin.ModelAdmin):
    list_display = ('title', 'slug', 'author', 'date', 'image_count')
    search_fields = ('title', 'slug', 'author__username')
    list_filter = ('date',)

    class ArticleImageInline(admin.TabularInline):
        model = ArticleImage
        extra = 0
        fields = ('preview', 'image', 'alt', 'order')
        readonly_fields = ('preview',)

        def preview(self, obj):
            try:
                if obj and obj.image:
                    return format_html('<img src="{}" style="max-height:80px;"/>', obj.image.url)
            except Exception:
                pass
            return '—'
        preview.short_description = 'Preview'

    inlines = [ArticleImageInline]

    def image_count(self, obj):
        rel = getattr(obj, 'images', None)
        return rel.count() if rel is not None else 0
    image_count.short_description = 'Images'

@admin.register(Podcast)
class PodcastAdmin(admin.ModelAdmin):
    list_display = ('title', 'link')

@admin.register(UserSocial)
class UserSocialAdmin(admin.ModelAdmin):
    list_display = ('user', 'name', 'link')
    search_fields = ('user__username', 'name', 'link')

@admin.register(UserSavedArticle)
class UserSavedArticleAdmin(admin.ModelAdmin):
    list_display = ('user', 'article', 'saved_at')
    search_fields = ('user__username', 'article__title')
    list_filter = ('saved_at',)

@admin.register(NewsletterSubscription)
class NewsletterSubscriptionAdmin(admin.ModelAdmin):
    list_display = ('email', 'subscribed_at', 'unsubscribed', 'unsubscribed_at', 'last_sent_at')
    list_filter = ('unsubscribed',)
    search_fields = ('email',)
    date_hierarchy = 'subscribed_at'
    actions = ['mark_unsubscribed', 'mark_resubscribed']  # REMOVED export_selected_csv

    def mark_unsubscribed(self, request, queryset):
        from django.utils import timezone
        updated = queryset.filter(unsubscribed=False).update(
            unsubscribed=True,
            unsubscribed_at=timezone.now()
        )
        self.message_user(request, f"{updated} marked unsubscribed.")
    mark_unsubscribed.short_description = "Mark selected as unsubscribed"

    def mark_resubscribed(self, request, queryset):
        updated = queryset.filter(unsubscribed=True).update(
            unsubscribed=False,
            unsubscribed_at=None
        )
        self.message_user(request, f"{updated} marked active.")
    mark_resubscribed.short_description = "Re-activate selected"


@admin.register(ArticleComment)
class ArticleCommentAdmin(admin.ModelAdmin):
    list_display = ('id', 'short_text', 'article', 'user', 'parent', 'reply_count', 'is_deleted', 'created_at')
    list_filter = ('is_deleted', 'created_at', 'article')
    search_fields = ('text', 'user__username', 'user__name', 'article__title')
    raw_id_fields = ('article', 'user', 'parent')
    date_hierarchy = 'created_at'
    actions = ['mark_deleted', 'restore_comments']
    ordering = ('-created_at',)

    def short_text(self, obj):
        return (obj.text[:40] + '...') if obj.text and len(obj.text) > 40 else obj.text
    short_text.short_description = 'Comment'

    def reply_count(self, obj):
        return obj.replies.count()
    reply_count.short_description = 'Replies'

    def mark_deleted(self, request, queryset):
        updated = queryset.update(is_deleted=True)
        self.message_user(request, f'{updated} comment(s) marked deleted.')
    mark_deleted.short_description = 'Soft delete selected'

    def restore_comments(self, request, queryset):
        updated = queryset.filter(is_deleted=True).update(is_deleted=False)
        self.message_user(request, f'{updated} comment(s) restored.')
    restore_comments.short_description = 'Restore selected'
    
@admin.register(ContactMessage)
class ContactMessageAdmin(admin.ModelAdmin):
    list_display = ("id", "name", "email",  "read", "created_at")
    list_filter = ("read", "created_at")
    search_fields = ("name", "email", "message")
    ordering = ("-created_at",)
    readonly_fields = ("created_at",)

    def short_msg(self, obj):
        return (obj.message[:40] + '...') if len(obj.message) > 43 else obj.message
    short_msg.short_description = "Message"

@admin.register(Competition)
class CompetitionAdmin(admin.ModelAdmin):
    list_display = (
        'title', 'category', 'target_audience', 'status', 'registration_start', 'registration_end',
        'submission_end', 'participant_count', 'featured'
    )
    list_filter = ('status', 'category', 'target_audience', 'featured', 'registration_start')
    search_fields = ('title', 'description')
    readonly_fields = ('participant_count', 'created_at', 'updated_at')
    ordering = ('-created_at',)

@admin.register(Participant)
class ParticipantAdmin(admin.ModelAdmin):
    list_display = ('full_name', 'email', 'competition', 'participant_type', 'registered_at')
    list_filter = ('participant_type', 'competition')
    search_fields = ('full_name', 'email', 'team_name')

@admin.register(Specialization)
class SpecializationAdmin(admin.ModelAdmin):
    list_display = ("name", "discipline")
    search_fields = ("name", "discipline")

@admin.register(Country)
class CountryAdmin(admin.ModelAdmin):
    list_display = ("name", "iso_code")
    search_fields = ("name", "iso_code")

@admin.register(OfficeLocation)
class OfficeLocationAdmin(admin.ModelAdmin):
    list_display = ("company_name", "city", "country", "location_type", "is_verified")
    list_filter = ("location_type", "country", "is_verified")
    search_fields = ("company_name", "city", "state_province")

@admin.register(Engineer)
class EngineerAdmin(admin.ModelAdmin):
    list_display = ("first_name", "last_name", "job_title", "city", "is_verified", "featured_level", "featured_id", "is_active")
    list_filter = ("is_verified", "is_active", "availability", "country", "featured_level")
    search_fields = ("first_name", "last_name", "email", "company", "job_title")
    filter_horizontal = ("specializations",)

@admin.register(WorkExperience)
class WorkExperienceAdmin(admin.ModelAdmin):
    list_display = ("engineer", "job_title", "company", "start_date", "end_date", "is_current")
    search_fields = ("engineer__first_name", "engineer__last_name", "company", "job_title")

@admin.register(Education)
class EducationAdmin(admin.ModelAdmin):
    list_display = ("engineer", "degree", "field_of_study", "school", "graduation_year")
    search_fields = ("engineer__first_name", "engineer__last_name", "school", "field_of_study")

@admin.register(Project)
class ProjectAdmin(admin.ModelAdmin):
    list_display = ("engineer", "name", "client", "completion_date")
    search_fields = ("engineer__first_name", "engineer__last_name", "name", "client")

@admin.register(Certification)
class CertificationAdmin(admin.ModelAdmin):
    list_display = ("engineer", "name", "issuing_organization", "issue_date", "expiration_date")
    search_fields = ("engineer__first_name", "engineer__last_name", "name", "issuing_organization")

@admin.register(Review)
class ReviewAdmin(admin.ModelAdmin):
    list_display = ("engineer", "reviewer_name", "rating", "is_verified", "created_at")
    list_filter = ("rating", "is_verified")
    search_fields = ("engineer__first_name", "engineer__last_name", "reviewer_name", "title")