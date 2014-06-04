from rest_framework import permissions
import models

class IsOwnerOrReadOnly(permissions.BasePermission):
    """
    Object-level permission to only allow owners of an object to edit it.
    Assumes the model instance has an `owner` attribute.
    """

    def has_object_permission(self, request, view, obj):
        if isinstance(obj, models.GroceryList) or isinstance(obj, models.GroceryListEntry):
            # Instance must have an attribute named `owner`.
            if obj.owner == request.user:
                return True

            # Read permissions are allowed to any request,
            # so we'll always allow GET, HEAD or OPTIONS requests.
            #return request.method in permissions.SAFE_METHODS
            return False
        else:
            return True
