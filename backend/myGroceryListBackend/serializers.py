from rest_framework import serializers
from models import GroceryList, GroceryListEntry
from django.contrib.auth.models import User

class GroceryListEntrySerializer(serializers.ModelSerializer):
    grocery_list = serializers.PrimaryKeyRelatedField(many=False)

    class Meta:
        model = GroceryListEntry
        fields = ('id', 'title', 'description', 'dt_created', 'dt_modified', 'done', 'grocery_list')

class GroceryListSerializer(serializers.ModelSerializer):
    #owner = serializers.Field(source='owner.username')
    #entries = serializers.PrimaryKeyRelatedField(many=True)
    entries = GroceryListEntrySerializer(many=True, read_only=True)
    #RelatedField

    class Meta:
        model = GroceryList
        fields = ('id', 'title', 'description', 'owner', 'dt_created', 'dt_modified', 'entries', 'visible')
        write_only_fields = ('visible', )

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ('password', 'first_name', 'last_name', 'email', 'username')
        write_only_fields = ('password',)
 
    def restore_object(self, attrs, instance=None):
        # call set_password on user object. Without this
        # the password will be stored in plain text.
        user = super(UserSerializer, self).restore_object(attrs, instance)
        user.set_password(attrs['password'])
        user.save()
        return user
