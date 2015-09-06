from django.conf.urls import patterns, include, url

from django.contrib import admin as djangoadmin
import data
import webclient
djangoadmin.autodiscover()

urlpatterns = patterns('',
    # Examples:
    # url(r'^$', 'Timeline.views.home', name='home'),
    # url(r'^blog/', include('blog.urls')),

    #url(r'^admin/', include(admin.site.urls)),
    url(r'^admin/event/$', data.views.listEvents, name='index'),
    url(r'^admin/event/create$', data.views.createEvent, name='create'),
    url(r'^admin/event/(?P<eventId>\d+)$', data.views.editEvent, name='edit'),
    url(r'^admin/event/(?P<eventId>\d+)/(?P<revision>\d+)$', data.views.editEvent, name='edit'),
    url(r'^admin/tag/$', data.views.listTags, name='index'),
    url(r'^admin/tag/create$', data.views.createTag, name='create'),
    url(r'^admin/tag/(?P<tagId>\d+)$', data.views.editTag, name='edit'),
    url(r'^admin/tag/(?P<tagId>\d+)/(?P<revision>\d+)$', data.views.editTag, name='edit'),


    url(r'^/$', webclient.views.index),
)
