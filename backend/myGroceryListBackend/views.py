from rest_framework import viewsets
import models, serializers, permissions
from django.contrib.auth.models import User
from rest_framework.views import APIView
from . import authentication
from rest_framework.response import Response
import rest_framework
from rest_framework.decorators import permission_classes

# Create your views here.
class GroceryListView(viewsets.ModelViewSet):
    model = models.GroceryList
    serializer_class = serializers.GroceryListSerializer
    permission_classes = (rest_framework.permissions.IsAuthenticated, permissions.IsOwnerOrReadOnly,)

    def pre_save(self, obj):
        obj.owner = self.request.user

class GroceryListEntryView(viewsets.ModelViewSet):
    model = models.GroceryListEntry
    serializer_class = serializers.GroceryListEntrySerializer
    permission_classes = (rest_framework.permissions.IsAuthenticated, permissions.IsOwnerOrReadOnly,)

    def pre_save(self, obj):
        obj.owner = self.request.user

class AuthView(APIView):
    authentication_classes = (authentication.QuietBasicAuthentication,)
    serializer_class = serializers.UserSerializer
    permission_classes = (rest_framework.permissions.AllowAny, )
 
    def post(self, request, *args, **kwargs):
        return Response(self.serializer_class(request.user).data)
