from django.core.management.base import BaseCommand
from django.db import connection


class Command(BaseCommand):
    help = "Run PRAGMA foreign_key_check and report any foreign key integrity problems."

    def add_arguments(self, parser):
        parser.add_argument('--table', help='Limit check to a specific table name', default=None)

    def handle(self, *args, **options):
        table = options['table']
        with connection.cursor() as cursor:
            if table:
                cursor.execute(f'PRAGMA foreign_key_check("{table}")')
            else:
                cursor.execute('PRAGMA foreign_key_check')
            rows = cursor.fetchall()

        if not rows:
            self.stdout.write(self.style.SUCCESS('No foreign key violations found.'))
            return

        self.stdout.write(self.style.ERROR(f'Found {len(rows)} foreign key violation(s):'))
        # Row format: (table, rowid, parent, fkid)
        for table_name, rowid, parent, fkid in rows:
            self.stdout.write(f'- Table={table_name} rowid={rowid} parent={parent} fkid={fkid}')

        self.stdout.write(self.style.WARNING('Investigate offending rows; they reference missing parents or violate constraints.'))
