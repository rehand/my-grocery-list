from django.db import models
from django.contrib.auth.models import User

# Create your models here.
class GroceryList(models.Model):
    title = models.CharField(max_length=50)
    description = models.CharField(max_length=2000)

    owner = models.ForeignKey(User, null=True)
    visible = models.BooleanField(default=True)

    dt_created = models.DateTimeField(auto_now_add=True)
    dt_modified = models.DateTimeField(auto_now_add=True, auto_now=True)

    def __unicode__(self):
        return str("{0}: {1}".format(self.id,self.title))

class GroceryListEntry(models.Model):
    grocery_list = models.ForeignKey(GroceryList, related_name='entries')

    title = models.CharField(max_length=50)
    description = models.CharField(max_length=2000)
    done = models.BooleanField()
    owner = models.ForeignKey(User, null=True)

    dt_created = models.DateTimeField(auto_now_add=True)
    dt_modified = models.DateTimeField(auto_now_add=True, auto_now=True)

    def __unicode__(self):
        return str("{0}: {1}".format(self.id,self.title))
