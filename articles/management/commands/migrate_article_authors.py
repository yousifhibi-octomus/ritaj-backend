from django.core.management.base import BaseCommand
from django.db import transaction
from articles.models import Article, User


class Command(BaseCommand):
    help = "Map legacy Article.author string values (if any) to the new FK field after migration."

    def add_arguments(self, parser):
        parser.add_argument('--dry-run', action='store_true', help='Do not persist changes, only show what would happen.')
        parser.add_argument('--by', choices=['username', 'name', 'auto'], default='auto',
                            help='How to resolve legacy author strings: username, name, or auto (try username then name).')

    def handle(self, *args, **options):
        dry = options['dry_run']
        mode = options['by']
        updated = 0
        unmatched = []

        # Safety: if author is already a FK field value (i.e. Article.author_id exists), we assume legacy string was removed.
        # But in case legacy data was stored somewhere else (e.g., a temporary text field), adapt here.
        # This command currently assumes the legacy text was kept in a temporary field named 'legacy_author'. Adjust if needed.

        if not hasattr(Article, 'legacy_author'):
            self.stdout.write(self.style.WARNING(
                'No legacy_author field found on Article; nothing to migrate. If legacy data still exists in another field, adjust command.'
            ))
            return

        qs = Article.objects.filter(author__isnull=True).exclude(legacy_author__isnull=True).exclude(legacy_author='')
        total = qs.count()
        if not total:
            self.stdout.write(self.style.SUCCESS('No articles needing author migration.'))
            return

        self.stdout.write(f'Processing {total} articles with legacy_author strings...')

        def resolve_user(raw):
            raw = raw.strip()
            if not raw:
                return None
            if mode == 'username':
                return User.objects.filter(username=raw).first()
            if mode == 'name':
                return User.objects.filter(name=raw).first()
            # auto mode
            user = User.objects.filter(username=raw).first()
            if user:
                return user
            return User.objects.filter(name=raw).first()

        with transaction.atomic():
            for article in qs.iterator():
                legacy = getattr(article, 'legacy_author')
                user = resolve_user(legacy)
                if user:
                    article.author = user
                    if not dry:
                        article.save(update_fields=['author'])
                    updated += 1
                else:
                    unmatched.append((article.id, legacy))
            if dry:
                transaction.set_rollback(True)

        self.stdout.write(self.style.SUCCESS(f'Updated {updated} articles.'))
        if unmatched:
            self.stdout.write(self.style.WARNING(f'{len(unmatched)} articles could not be matched:'))
            for aid, legacy in unmatched[:25]:  # limit output
                self.stdout.write(f'  Article {aid}: "{legacy}"')
            if len(unmatched) > 25:
                self.stdout.write('  ... (truncated)')
        if dry:
            self.stdout.write(self.style.WARNING('Dry run complete; no changes were committed.'))
