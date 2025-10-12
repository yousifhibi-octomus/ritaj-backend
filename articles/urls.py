from django.urls import path ,include
from .endpoints import (
    ArticleCommentListCreateView,
    ArticleCommentReplyCreateView,
    ArticleListCreateView,
    ArticleDetailView,
    article_search,
    ArticleRequestDetailAdminView,
    AuthorRequestAdminListView,
    ContactMessageCreateView,
    ContactMessageDetailView,
    ContactMessageListCreateView,
    ParticipantListCreateView,
    ParticipantDetailView,
    PodcastListCreateView,
    UserListCreateView,
    UserDetailView,
    UserArticlesView,
    UserSavedArticlesView,
    SaveArticleView,
    AuthStatusView,
    CSRFTokenView,
    LoginView,
    LogoutView,
    AuthorRequestCreateView,
    AuthorRequestModerateView,
    ArticleRequestAdminListView,
    ArticleRequestModerateView,
    ArticleRequestCreateView,
    ArticleRequestDraftCreateView,
    NewsletterSubscribeView,
    NewsletterUnsubscribeView,
    
    CompetitionListView,
    CompetitionDetailView,
    export_competition_participants,
    EngineerListCreateView, EngineerDetailView,
    SpecializationListView, CountryListView,
    OfficeLocationListCreateView,
    
)
    
urlpatterns = [
    path('articles/', ArticleListCreateView.as_view(), name='article-list-create'),

    # SEARCH MUST COME BEFORE THE <slug:slug> PATTERN
    path('articles/search/', article_search, name='article-search'),

    path('articles/<int:article_id>/save/', SaveArticleView.as_view(), name='save-article'),
    path('articles/<int:article_id>/comments/', ArticleCommentListCreateView.as_view(), name='article-comments'),
    path('comments/<int:parent_id>/reply/', ArticleCommentReplyCreateView.as_view(), name='comment-reply'),

    path('articles/<slug:slug>/', ArticleDetailView.as_view(), name='article-detail'),

    path('auth/status/', AuthStatusView.as_view(), name='auth-status'),
    path('auth/csrf/', CSRFTokenView.as_view(), name='auth-csrf'),
    path('auth/login/', LoginView.as_view(), name='auth-login'),
    path('auth/logout/', LogoutView.as_view(), name='auth-logout'),

    path('podcasts/', PodcastListCreateView.as_view(), name='podcast-list-create'),

    path('users/', UserListCreateView.as_view(), name='user-list-create'),
    path('users/<str:identifier>/', UserDetailView.as_view(), name='user-detail'),
    path('users/<str:identifier>/articles/', UserArticlesView.as_view(), name='user-articles'),
    path('users/<str:identifier>/saved/', UserSavedArticlesView.as_view(), name='user-saved'),

    path('author-request/', AuthorRequestCreateView.as_view(), name='author-request-create'),
    path('author-request/<str:username>/', AuthorRequestModerateView.as_view(), name='author-request-moderate'),
    path('author-requests/admin/', AuthorRequestAdminListView.as_view(), name='author-requests-admin'),
    path('author-requests/<str:username>/moderate/', AuthorRequestModerateView.as_view(), name='author-request-moderate'),

    path('article-requests/', ArticleRequestCreateView.as_view(), name='article-request-create'),
    path('article-requests/draft/', ArticleRequestDraftCreateView.as_view(), name='article-request-draft'),
    path('article-requests/admin/', ArticleRequestAdminListView.as_view(), name='article-requests-admin'),
    path('article-requests/<int:request_id>/moderate/', ArticleRequestModerateView.as_view(), name='article-request-moderate'),
    path('article-requests/<int:id>/', ArticleRequestDetailAdminView.as_view(), name='article-request-detail'),

    path('newsletter/subscribe/', NewsletterSubscribeView.as_view(), name='newsletter-subscribe'),
    path('newsletter/unsubscribe/', NewsletterUnsubscribeView.as_view(), name='newsletter-unsubscribe'),
    
    
    path('contact/', ContactMessageListCreateView.as_view(), name='contact-list-create'),
    path('contact/<int:pk>/', ContactMessageDetailView.as_view(), name='contact-detail'),

    # Competitions
    path('competitions/', CompetitionListView.as_view(), name='competition-list'),
    path('competitions/<uuid:pk>/', CompetitionDetailView.as_view(), name='competition-detail'),
    path('competitions/<uuid:pk>/participants/export/', export_competition_participants, name='competition-participants-export'),

    path('participants/', ParticipantListCreateView.as_view(), name='participant-list-create'),
    path('participants/<uuid:pk>/', ParticipantDetailView.as_view(), name='participant-detail'),
    
    
     path('engineers/', EngineerListCreateView.as_view(), name='engineer-list-create'),
    path('engineers/<int:pk>/', EngineerDetailView.as_view(), name='engineer-detail'),
    path('specializations/', SpecializationListView.as_view(), name='specialization-list'),
    path('countries/', CountryListView.as_view(), name='country-list'),
    path('office-locations/', OfficeLocationListCreateView.as_view(), name='office-location-list-create'),
    
    
    path('auth/', include('dj_rest_auth.urls')),
    path('auth/registration/', include('dj_rest_auth.registration.urls')),
    path('auth/', include('allauth.socialaccount.urls')),
]