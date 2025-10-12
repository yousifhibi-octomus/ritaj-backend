from django.apps import AppConfig


class ArticlesConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'articles'

    def ready(self):
        # Ensure signal handlers are imported so they're registered
        try:
            from . import signals  # noqa: F401
        except Exception:
            pass
        # Create or update Google SocialApp from environment variables if provided.
        # This avoids SocialApp.DoesNotExist when running local dev without creating
        # the Social Application in the admin UI.
        try:
            from django.conf import settings
            from allauth.socialaccount.models import SocialApp
            from django.contrib.sites.models import Site

            client_id = getattr(settings, "GOOGLE_CLIENT_ID", "")
            client_secret = getattr(settings, "GOOGLE_CLIENT_SECRET", "")
            if not (client_id and client_secret):
                return  # no creds provided

            site_pk = getattr(settings, "SITE_ID", 1)
            site = Site.objects.get(pk=site_pk)

            app, created = SocialApp.objects.get_or_create(
                provider="google",
                defaults={"name": "Google", "client_id": client_id, "secret": client_secret},
            )

            changed = False
            if app.client_id != client_id:
                app.client_id = client_id
                changed = True
            if app.secret != client_secret:
                app.secret = client_secret
                changed = True
            if site not in app.sites.all():
                app.sites.add(site)
                changed = True
            if changed:
                app.save()
        except Exception:
            # Do not block startup on any exception here (DB may not be ready during migrations)
            pass
