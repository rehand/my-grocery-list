from rest_framework import viewsets
import models, serializers, permissions

# Create your views here.
class GroceryListView(viewsets.ModelViewSet):
    model = models.GroceryList
    serializer_class = serializers.GroceryListSerializer
    permission_classes = (permissions.IsOwnerOrReadOnly,)

    def pre_save(self, obj):
        obj.owner = self.request.user

class GroceryListEntryView(viewsets.ModelViewSet):
    model = models.GroceryListEntry
    serializer_class = serializers.GroceryListEntrySerializer
    permission_classes = (permissions.IsOwnerOrReadOnly,)

    def pre_save(self, obj):
        obj.owner = self.request.user

