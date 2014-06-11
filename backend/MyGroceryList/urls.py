from django.conf.urls import patterns, include, url
from rest_framework import routers
from django.contrib import admin
from myGroceryListBackend import views
from django.views.generic.base import RedirectView
from django.templatetags.static import static

admin.autodiscover()

router = routers.DefaultRouter(trailing_slash=False)
router.register(r'list', views.GroceryListView)
router.register(r'entry', views.GroceryListEntryView)


urlpatterns = patterns('',
    # Examples:
    # url(r'^$', 'MyGroceryList.views.home', name='home'),
    # url(r'^blog/', include('blog.urls')),

    url(r'^admin/', include(admin.site.urls)),
    url(r'^api/', include(router.urls)),
)

# static files 
urlpatterns += patterns(
    'django.contrib.staticfiles.views',
    #url(r'^(?:index.html)?$', 'serve', kwargs={'path': 'index.html'}),
    url(r'^(?:index.html)?$', RedirectView.as_view(url=static('index.html'), permanent=False)),
    url(r'^(?P<path>(?:js|css|img)/.*)$', 'serve'),
    url(r'^(?P<path>(?:.*\.(ico|xml|txt|appcache)))$', 'serve'),
    url(r'^api/auth$',
        views.AuthView.as_view(),
        name='authenticate'),
)

# debug only
urlpatterns += patterns('',
    url(r'^api-auth/', include('rest_framework.urls',
                               namespace='rest_framework')),
)
