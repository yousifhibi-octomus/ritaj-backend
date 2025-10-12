import csv
import datetime
from django.http import HttpResponse
from rest_framework import generics, permissions, parsers, viewsets
from ..models import Competition, Participant
from ..serializers import CompetitionSerializer, ParticipantSerializer


class CompetitionListView(generics.ListCreateAPIView):
    queryset = Competition.objects.all()
    serializer_class = CompetitionSerializer
    permission_classes = [permissions.AllowAny]
    parser_classes = [parsers.MultiPartParser, parsers.FormParser, parsers.JSONParser]

    def get_queryset(self):
        qs = super().get_queryset()
        status_p = self.request.query_params.get('status')
        cat = self.request.query_params.get('category')
        aud = self.request.query_params.get('target_audience')
        if status_p:
            qs = qs.filter(status=status_p)
        if cat:
            qs = qs.filter(category=cat)
        if aud:
            qs = qs.filter(target_audience=aud)
        return qs.order_by('-created_at')


class CompetitionDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Competition.objects.all()
    serializer_class = CompetitionSerializer
    permission_classes = [permissions.AllowAny]
    parser_classes = [parsers.MultiPartParser, parsers.FormParser, parsers.JSONParser]


class CompetitionViewSet(viewsets.ModelViewSet):
    queryset = Competition.objects.all()
    serializer_class = CompetitionSerializer
    permission_classes = [permissions.AllowAny]
    parser_classes = [parsers.MultiPartParser, parsers.FormParser, parsers.JSONParser]

    def get_queryset(self):
        qs = super().get_queryset()
        status_param = self.request.query_params.get('status')
        category = self.request.query_params.get('category')
        audience = self.request.query_params.get('target_audience')
        if status_param:
            qs = qs.filter(status=status_param)
        if category:
            qs = qs.filter(category=category)
        if audience:
            qs = qs.filter(target_audience=audience)
        return qs


class ParticipantListCreateView(generics.ListCreateAPIView):
    queryset = Participant.objects.all()
    serializer_class = ParticipantSerializer


class ParticipantDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Participant.objects.all()
    serializer_class = ParticipantSerializer


class ParticipantCreateView(generics.CreateAPIView):
    queryset = Participant.objects.all()
    serializer_class = ParticipantSerializer


def export_competition_participants(request, pk):
    qs = Participant.objects.filter(competition_id=pk).order_by('id')
    field_names = [f.name for f in Participant._meta.fields]
    response = HttpResponse(content_type='text/csv; charset=utf-8')
    response['Content-Disposition'] = f'attachment; filename="participants_{pk}.csv"'
    response.write('\ufeff')
    writer = csv.writer(response, lineterminator='\n')
    writer.writerow(field_names)

    def to_text(v):
        if v is None:
            return ''
        if isinstance(v, (datetime.datetime, datetime.date, datetime.time)):
            try:
                return v.isoformat()
            except Exception:
                return str(v)
        return str(v)

    for p in qs:
        row = [to_text(getattr(p, name)) for name in field_names]
        writer.writerow(row)

    return response
