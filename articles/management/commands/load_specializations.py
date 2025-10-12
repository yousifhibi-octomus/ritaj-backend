from django.core.management.base import BaseCommand
from articles.models import Specialization


SPECIALIZATIONS = [
    {"discipline": "architecture", "name": "العمارة"},
    {"discipline": "interior", "name": "التصميم الداخلي"},
    {"discipline": "civil", "name": "الهندسة المدنية"},
    {"discipline": "urban", "name": "التخطيط الحضري"},
    {"discipline": "conservation", "name": "الهندسة المعمارية المستدامة"},
]


class Command(BaseCommand):
    help = "Load preset specializations (Arabic names with English disciplines). Safe to re-run."

    def handle(self, *args, **options):
        created, updated, skipped = 0, 0, 0
        for item in SPECIALIZATIONS:
            discipline = (item.get("discipline") or "").strip()
            name = (item.get("name") or "").strip()
            if not discipline or not name:
                continue

            obj, was_created = Specialization.objects.get_or_create(
                discipline__iexact=discipline,
                defaults={"discipline": discipline, "name": name},
            )

            if was_created:
                created += 1
            else:
                changed = False
                # Normalize discipline casing if needed
                if obj.discipline != discipline:
                    obj.discipline = discipline
                    changed = True
                if obj.name != name:
                    obj.name = name
                    changed = True
                if changed:
                    obj.save(update_fields=["discipline", "name"])
                    updated += 1
                else:
                    skipped += 1

        total = Specialization.objects.count()
        self.stdout.write(self.style.SUCCESS(
            f"Specializations load complete: created={created}, updated={updated}, skipped={skipped}, total={total}"
        ))
