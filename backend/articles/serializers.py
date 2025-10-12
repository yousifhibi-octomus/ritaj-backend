"""
Compatibility barrel: re-export split serializers from the serializers/ package.
This keeps existing imports like `from articles.serializers import ArticleSerializer` working.
"""

from .serializers import *

__all__ = [name for name in globals() if not name.startswith('_')]