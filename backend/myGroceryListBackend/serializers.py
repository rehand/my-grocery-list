from django.forms import widgets
from rest_framework import serializers
from models import GroceryList, GroceryListEntry

class GroceryListEntrySerializer(serializers.ModelSerializer):
    grocery_list = serializers.PrimaryKeyRelatedField(many=False)

    class Meta:
        model = GroceryListEntry
        fields = ('id', 'title', 'description', 'dt_created', 'dt_modified', 'done')

class GroceryListSerializer(serializers.ModelSerializer):
    #owner = serializers.Field(source='owner.username')
    #entries = serializers.PrimaryKeyRelatedField(many=True)
    entries = GroceryListEntrySerializer(many=True)
    #RelatedField

    class Meta:
        model = GroceryList
        fields = ('id', 'title', 'description', 'owner', 'dt_created', 'dt_modified', 'entries')
