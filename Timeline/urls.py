from django.conf.urls import patterns, include, url

from django.contrib import admin
from admin import views as adminviews
from data import views as dataviews
from django.contrib.auth import views as authviews
from webclient import views as webclientviews
from admin.auth import StyledUserCreationForm, StyledAuthenticationForm, StyledPasswordChangeForm, StyledPasswordResetForm, StyledUserDestructionForm
admin.autodiscover()

urlpatterns = patterns('',
    # Examples:
    # url(r'^$', 'Timeline.views.home', name='home'),
    # url(r'^blog/', include('blog.urls')),
    
    url(r'^superadmin/', include(admin.site.urls)),
    url(r'^admin/event/$', adminviews.listEvents, name='index'),
    url(r'^admin/event/create$', adminviews.createEvent, name='create'),
    url(r'^admin/event/(?P<eventId>\d+)$', adminviews.editEvent, name='edit'),
    url(r'^admin/event/(?P<eventId>\d+)/(?P<revision>\d+)$', adminviews.editEvent, name='edit'),
    url(r'^admin/tag/$', adminviews.listTags, name='index'),
    url(r'^admin/tag/create$', adminviews.createTag, name='create'),
    url(r'^admin/tag/(?P<tagId>\d+)$', adminviews.editTag, name='edit'),
    url(r'^admin/tag/(?P<tagId>\d+)/(?P<revision>\d+)$', adminviews.editTag, name='edit'),
    
    #url(r'^admin/login$', adminviews.login, name='login'),
    url(r'^admin/login/?$', authviews.login, {'template_name': 'user/login.html', 'authentication_form': StyledAuthenticationForm}),
    url(r'^admin/logout/?$', authviews.logout_then_login),
    url(r'^admin/signup/?$', adminviews.createUser, {'template_name': 'user/create.html', 'creation_form': StyledUserCreationForm}),
    url(r'^admin/signout/?$', adminviews.destroyUser, {'template_name': 'user/destroy.html', 'destruction_form': StyledUserDestructionForm}),
    url(r'^admin/password/change/?$', authviews.password_change, {'template_name': 'user/passwordChangeForm.html', 'password_change_form': StyledPasswordChangeForm}, name='password_change'),
    url(r'^admin/password/changed/?$', authviews.password_change_done, {'template_name': 'user/passwordChangeDone.html'}, name='password_change_done'),
    url(r'^admin/password/reset/?$', authviews.password_reset, {'template_name': 'user/passwordResetForm.html', 'password_reset_form': StyledPasswordResetForm}, name='password_reset'),
    url(r'^admin/password/reset/sent/?$', authviews.password_reset_complete, {'template_name': 'user/passwordResetSent.html'}, name='password_reset_done'),
    url(r'^admin/password/reset/token/?(?P<uidb64>[0-9A-Za-z_\-]+)/(?P<token>[0-9A-Za-z]{1,13}-[0-9A-Za-z]{1,20})/$', authviews.password_reset_confirm, {'template_name': 'user/passwordResetToken.html'}, name='password_reset_confirm'),
    url(r'^admin/password/reset/done/$', authviews.password_reset_done, {'template_name': 'user/passwordResetDone.html'}, name='password_reset_complete'),
    
    
    url(r'^$', webclientviews.index, name='index'),
    url(r'^event/$', dataviews.listEvents, name='index'),
    url(r'^tag/$', dataviews.listTags, name='index'),
)
