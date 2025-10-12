import json
from rest_framework import serializers
from ..models import Competition, Participant


class CompetitionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Competition
        fields = [
            'id', 'title', 'category', 'target_audience', 'description', 'bio',
            'registration_start', 'registration_end', 'submission_end', 'results_date',
            'status', 'featured', 'prizes', 'requirements', 'jury',
            'cover_image', 'participant_count', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'participant_count', 'created_at', 'updated_at']

    def _coerce_json_field(self, name, data):
        raw = self.context['request'].data.get(name)
        if isinstance(raw, str):
            raw = raw.strip()
            if raw:
                try:
                    data[name] = json.loads(raw)
                except json.JSONDecodeError:
                    raise serializers.ValidationError({name: 'Invalid JSON'})
            else:
                data[name] = []
        elif raw is None and name not in data:
            data[name] = []

    def validate(self, attrs):
        # Coerce empty string results_date to None
        if attrs.get('results_date') == '':
            attrs['results_date'] = None

        rs = attrs.get('registration_start') or getattr(self.instance, 'registration_start', None)
        re = attrs.get('registration_end') or getattr(self.instance, 'registration_end', None)
        se = attrs.get('submission_end') or getattr(self.instance, 'submission_end', None)
        rd = attrs.get('results_date') or getattr(self.instance, 'results_date', None)

        if rs and re and rs > re:
            raise serializers.ValidationError({'registration_end': 'Must be after registration_start'})
        if re and se and re > se:
            raise serializers.ValidationError({'submission_end': 'Must be after registration_end'})
        if se and rd and se > rd:
            raise serializers.ValidationError({'results_date': 'Must be after submission_end'})
        return attrs

    def _coerce_featured(self, validated_data):
        raw = self.context['request'].data.get('featured')
        if isinstance(raw, str):
            if raw.lower() in ('true', '1', 'yes', 'on'):
                validated_data['featured'] = True
            elif raw.lower() in ('false', '0', 'no', 'off'):
                validated_data['featured'] = False

    def create(self, validated_data):
        for f in ['prizes', 'requirements', 'jury']:
            self._coerce_json_field(f, validated_data)
        self._coerce_featured(validated_data)
        return super().create(validated_data)

    def update(self, instance, validated_data):
        for f in ['prizes', 'requirements', 'jury']:
            if f in self.context['request'].data:
                self._coerce_json_field(f, validated_data)
        self._coerce_featured(validated_data)
        return super().update(instance, validated_data)


class ParticipantSerializer(serializers.ModelSerializer):
    class Meta:
        model = Participant
        fields = '__all__'
