from django.core.management.base import BaseCommand
from articles.models import ArticleRequest


class Command(BaseCommand):
    help = "Print counts and sample ArticleRequest entries for debugging"

    def handle(self, *args, **options):
        qs = ArticleRequest.objects.all()
        total = qs.count()
        pending = qs.filter(status='pending').count()
        needs_editing = qs.filter(status='needs_editing').count()
        approved = qs.filter(status='approved').count()
        rejected = qs.filter(status='rejected').count()

        self.stdout.write(self.style.MIGRATE_HEADING("ArticleRequest Stats"))
        self.stdout.write(f"Total: {total}")
        self.stdout.write(f"Pending: {pending}")
        self.stdout.write(f"Needs Editing: {needs_editing}")
        self.stdout.write(f"Approved: {approved}")
        self.stdout.write(f"Rejected: {rejected}")

        sample = qs.order_by('-created_at')[:5]
        if sample:
            self.stdout.write(self.style.MIGRATE_LABEL("\nLatest 5:"))
            for req in sample:
                self.stdout.write(f"- #{req.id} {req.title} [{req.status}] by {req.author.username}")
        else:
            self.stdout.write("No ArticleRequest entries found.")