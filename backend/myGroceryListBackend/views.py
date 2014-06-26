from rest_framework import viewsets
import models, serializers, permissions
from rest_framework.views import APIView
from rest_framework.response import Response
import rest_framework
from google.appengine.api import users
from django.contrib.auth.models import User
from django.core.exceptions import ObjectDoesNotExist
from django.contrib.auth import login, logout, authenticate
from . import authentication
from rest_framework.authentication import SessionAuthentication
from MyGroceryList import settings

# Create your views here.
class GroceryListView(viewsets.ModelViewSet):
    model = models.GroceryList
    serializer_class = serializers.GroceryListSerializer
    permission_classes = (rest_framework.permissions.IsAuthenticated, permissions.IsOwnerOrReadOnly,)
    authentication_classes = (SessionAuthentication,)

    def pre_save(self, obj):
        obj.owner = self.request.user
    
    def get_queryset(self):
        return self.model.objects.filter(visible=True)

class GroceryListEntryView(viewsets.ModelViewSet):
    model = models.GroceryListEntry
    serializer_class = serializers.GroceryListEntrySerializer
    permission_classes = (rest_framework.permissions.IsAuthenticated, permissions.IsOwnerOrReadOnly,)
    authentication_classes = (SessionAuthentication,)

    def pre_save(self, obj):
        obj.owner = self.request.user

class AuthView(APIView):
    authentication_classes = (authentication.QuietBasicAuthentication,)
    serializer_class = serializers.UserSerializer
    permission_classes = (rest_framework.permissions.AllowAny,)
 
    def post(self, request, *args, **kwargs):
        data = {'loginUrl': users.create_login_url(dest_url='/app/index.html#/login'),
        }
        
        user = users.get_current_user()
        if user:
            data['username'] = user.nickname()
            data['id'] = user.user_id()
            
            try:
                django_user = User.objects.get(username=user.user_id())
            except ObjectDoesNotExist:
                django_user = User.objects.create_user(user.user_id(), user.email(), settings.SECRET_KEY)
                django_user.save()
         
            django_user = authenticate(username=django_user.username, password=settings.SECRET_KEY)
            
            login(request, django_user)
        
        return Response(data)
    
    def delete(self, request, *args, **kwargs):
        logout(request)
        return Response({'logoutUrl': users.create_logout_url(dest_url='/')})

