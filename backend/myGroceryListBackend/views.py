from rest_framework import viewsets
import models, serializers, permissions
from rest_framework.views import APIView
from . import authentication
from rest_framework.response import Response
import rest_framework
from django.contrib.auth import logout

# Create your views here.
class GroceryListView(viewsets.ModelViewSet):
    model = models.GroceryList
    serializer_class = serializers.GroceryListSerializer
    permission_classes = (rest_framework.permissions.IsAuthenticated, permissions.IsOwnerOrReadOnly,)

    def pre_save(self, obj):
        obj.owner = self.request.user
    
    def get_queryset(self):
        return self.model.objects.filter(visible=True)

class GroceryListEntryView(viewsets.ModelViewSet):
    model = models.GroceryListEntry
    serializer_class = serializers.GroceryListEntrySerializer
    permission_classes = (rest_framework.permissions.IsAuthenticated, permissions.IsOwnerOrReadOnly,)

    def pre_save(self, obj):
        obj.owner = self.request.user

class AuthView(APIView):
    authentication_classes = (authentication.QuietBasicAuthentication,)
    serializer_class = serializers.UserSerializer
    permission_classes = (rest_framework.permissions.AllowAny,)
 
    def post(self, request, *args, **kwargs):
        return Response(self.serializer_class(request.user).data)
    
    def delete(self, request, *args, **kwargs):
        logout(request)
        return Response()

