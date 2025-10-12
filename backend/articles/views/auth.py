from django.contrib.auth import authenticate, login, logout
from django.middleware.csrf import get_token
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView
from ..models import User


class AuthStatusView(APIView):
    def get(self, request):
        if request.user.is_authenticated:
            return Response({
                'is_authenticated': True,
                'user': {
                    'id': request.user.id,
                    'username': request.user.username,
                    'name': request.user.name,
                    'role': request.user.role,
                }
            })
        return Response({'is_authenticated': False}, status=401)


class CSRFTokenView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        token = get_token(request)
        return Response({'csrfToken': token})


class LoginView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        username = request.data.get('username') or request.data.get('email')
        password = request.data.get('password')
        if not username or not password:
            return Response({'detail': 'Username/email and password required'}, status=400)

        user = authenticate(request, username=username, password=password)
        if user is None:
            try:
                possible = User.objects.get(email=username)
                user = authenticate(request, username=possible.username, password=password)
            except User.DoesNotExist:
                pass

        if user is None:
            return Response({'detail': 'Invalid credentials'}, status=401)

        login(request, user)
        return Response({'message': 'Login successful', 'user': {
            'id': user.id,
            'username': user.username,
            'name': user.name,
            'role': user.role,
        }})


class LogoutView(APIView):
    def post(self, request):
        if not request.user.is_authenticated:
            return Response({'detail': 'Not authenticated'}, status=401)
        logout(request)
        return Response({'message': 'Logged out'})
