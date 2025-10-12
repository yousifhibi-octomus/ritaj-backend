"""Thin wrapper to re-export models from the models/ package.

This keeps imports like `from articles.models import Article` working,
while actual model class definitions live in `articles/models/*.py`.
"""

from .models.article import Article
from .models.podcast import Podcast
from .models.contact import ContactMessage
from .models.user import User, UserSocial, UserSavedArticle
from .models.requests import AuthorRequest, ArticleRequest
from .models.newsletter import NewsletterSubscription
from .models.comments import ArticleComment
from .models.competitions import Competition, Participant
from .models.engineer import (
    Specialization,
    Country,
    OfficeLocation,
    Engineer,
    WorkExperience,
    Education,
    Project,
    Certification,
    Review,
)
__all__ = [
    'Article', 'Podcast', 'ContactMessage',
    'User', 'UserSocial', 'UserSavedArticle',
    'AuthorRequest', 'ArticleRequest',
    'NewsletterSubscription', 'ArticleComment',
    'Competition', 'Participant', 'Specialization',
    'Education', 'Country', 'Engineer',
    'OfficeLocation', 'WorkExperience',
    'Project', 'Certification', 'Review'
]