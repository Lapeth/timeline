from django.shortcuts import render
from django.http import HttpResponse
from django.http import HttpResponseRedirect
from django.core import serializers
from django.forms import model_to_dict
from django.template import RequestContext
from django.db.models import Q

from django.contrib.auth import authenticate, logout, login
from django.contrib.auth.decorators import login_required, permission_required
from django.contrib.auth.forms import UserCreationForm
from django.contrib.auth.models import User
from django.contrib.auth import REDIRECT_FIELD_NAME
from django.core.exceptions import PermissionDenied
from django.contrib.sites.models import get_current_site
from django.template.response import TemplateResponse
from django.utils.http import is_safe_url
from django.shortcuts import resolve_url
from django.conf import settings
from auth import UserDestructionForm

from Timeline.data.models import EventBase
from Timeline.data.models import EventVersion
from Timeline.data.models import TagBase
from Timeline.data.models import TagVersion
from Timeline.data.models import Language

from Timeline.data.query import Query

from Timeline.util.JSONSerializer import JSONSerializer
import math

from django.contrib.auth.models import User

from inspect import getmembers

import requests

# Create your views here.

pathPrefix = "/admin"

# Show a filterable list of all events
@login_required
def listEvents(request):
    isJSON = request.GET.get('f') == "json"
    (events, pagination) = Query.listEvents(request, isJSON)
    
    if isJSON:
        return HttpResponse(JSONSerializer().serialize(events))
    
    path = "/event/"
    if len(request.GET):
        i = 0
        for key in request.GET:
            if key != 'p':
                value = request.GET[key]
                if not isinstance(value, list):
                    value = [value]
                for v in value:
                    path += "&" if i > 0 else "?";
                    path += key + "=" + v
                    i += 1
        ppath = path + ("?" if i == 0 else "&")
    else:
        ppath = "?"
        
    query = Query.getQuery(request)
    
    data = {
        "events":events,
        "nav":"events",
        "pagination": pagination,
        "query": query or '',
        "path": path,
        "ppath": ppath
    }
    data["user"] = request.user
    data["permissions"] = request.user.get_all_permissions()
    data["languages"] = Query.listLanguages()
    data["language"] = request.GET.get("l")
    return render(request, "events.html", data, context_instance=RequestContext(request))
    


# Create an event (POST for saving changes)
@login_required
def createEvent(request):
    errors = []
    if request.method == "POST":
        try:
            if 'save' in request.POST or 'publish' in request.POST:
                Query.createEvent(request)
            return HttpResponseRedirect("%s/event/" % pathPrefix)
        except PermissionDenied as e:
            errors.append(e)
    return render(request, "event.html", {
        "nav":"events",
        "user": request.user,
        "new": True,
        "permissions": request.user.get_all_permissions(),
        "errors": errors,
        "languages": Query.listLanguages()
    })


# Show an event (POST for saving changes)
@login_required
def editEvent(request, eventId, revision=None):
    
    if request.method == "POST":
        if not 'cancel' in request.POST:
            (event, version) = Query.updateEvent(request, eventId, revision)
            if 'redirect' in request.POST:
                return HttpResponseRedirect(request.POST['redirect'])
            if event is not None:
                revision = version.revision if version is not None else event.publicRevision
                return HttpResponseRedirect("%s/event/%s/%s" % (pathPrefix, event.id, revision))
        return HttpResponseRedirect("%s/event/" % pathPrefix)
    
    if request.method == "DELETE":
        if revision is not None:
            event = Query.deleteEventVersion(request, eventId, revision)
            return HttpResponseRedirect("%s/event/%s/%s" % (pathPrefix, event.id, event.publicRevision))
        else:
            Query.deleteEvent(request, eventId)
            return HttpResponseRedirect("%s/event/" % pathPrefix)
            
            
    
    event = EventBase.objects.filter(id=eventId).get()
        
    if revision is None:
        revision = event.publicRevision
    eventVersion = event.getVersion(revision)
    
    revisions = {}
    for version in event.getVersions():
        revisions[version.revision] = version.created
    
    user = request.user

    return render(request, "event.html", {
        "event": event,
        "eventVersion": eventVersion,
        "revisions": revisions,
        "displayedRevision": int(revision),
        "currentRevision": event.getCurrentVersion().revision,
        "nav":"events",
        "permissions": request.user.get_all_permissions(),
        "user": request.user,
        "new": False,
        "languages": Query.listLanguages()
    })

#------------------------------------------------------------------------------


# Show a filterable list of all tags
@login_required
def listTags(request):
    isJSON = request.GET.get('f') == "json"
    (tags,pagination) = Query.listTags(request, isJSON)
    
    if isJSON:
        return HttpResponse(JSONSerializer().serialize(tags))
    
    languages = Query.listLanguages()
    
    return render(request, "tags.html", {
        "tags": tags,
        "nav": "tags",
        "pagination": pagination,
        "user": request.user,
        "permissions": request.user.get_all_permissions(),
        "languages": languages,
        "language": request.GET.get("l")
    })

# Create a tag (POST for saving changes)
@login_required
def createTag(request):
    errors = []
    if request.method == "POST":
        try:
            if 'save' in request.POST or 'publish' in request.POST:
                tag = Query.createTag(request)
            return HttpResponseRedirect("%s/tag/" % pathPrefix)
        except PermissionDenied as e:
            errors.append(e)
    return render(request, "tag.html", {
        "nav":"tags",
        "user": request.user,
        "new": True,
        "permissions": request.user.get_all_permissions(),
        "errors": errors,
        "languages": Query.listLanguages()
    })


# Show an event (POST for saving changes)
@login_required
def editTag(request, tagId, revision=None):
    tag = TagBase.objects.filter(id=tagId).get()
    
    if request.method == "POST":
        if not 'cancel' in request.POST:
            (tag,version) = Query.updateTag(request, tagId, revision)
            if 'redirect' in request.POST:
                return HttpResponseRedirect(request.POST['redirect'])
            if tag is not None:
                revision = version.revision if version is not None else tag.publicRevision
                return HttpResponseRedirect("%s/tag/%s/%s" % (pathPrefix, tag.id, revision))
        return HttpResponseRedirect("%s/tag/" % pathPrefix)
    
    elif request.method == "DELETE":
        if revision is not None:
            tag = Query.deleteTagVersion(request, tagId, revision)
            return HttpResponseRedirect("%s/tag/%s/%s" % (pathPrefix, tag.id, event.publicRevision))
        else:
            Query.deleteTag(request, tagId)
            return HttpResponseRedirect("%s/tag/" % pathPrefix)
            
    
    else:
        
        
        if revision is None:
            revision = tag.publicRevision
        tagVersion = tag.getVersion(revision)
        
        revisions = {}
        for version in tag.getVersions():
            revisions[version.revision] = version.created

        return render(request, "tag.html", {
            "tag": tag,
            "tagVersion": tagVersion,
            "revisions": revisions,
            "displayedRevision": int(revision),
            "currentRevision": tag.getCurrentVersion().revision,
            "nav":"tags",
            "permissions": request.user.get_all_permissions(),
            "user": request.user,
            "new": False,
            "languages": Query.listLanguages()
        })
    
#-------------------------------------------------------------------------------------

def createUser(request, template_name='createUser.html',
          redirect_field_name=REDIRECT_FIELD_NAME,
          creation_form=UserCreationForm,
          current_app=None, extra_context=None):
    
    #if request.user.is_authenticated():
    #    logout(request)
    
    redirect_to = request.POST.get(redirect_field_name, request.GET.get(redirect_field_name, ''))

    if request.method == "POST":
        form = creation_form(request, data=request.POST)
        if form.is_valid():

            # Ensure the user-originating redirection url is safe.
            if not is_safe_url(url=redirect_to, host=request.get_host()):
                redirect_to = resolve_url(settings.SIGNUP_REDIRECT_URL)

            # Okay, security check complete. Create the user
            username = request.POST['username']
            password = request.POST['password1']
            user = User.objects.create_user(username, request.POST['email'], password)
            
            # Log the user in
            user = authenticate(username=username, password=password)
            login(request, user)
            return HttpResponseRedirect(redirect_to)
    else:
        form = creation_form()

    current_site = get_current_site(request)
    
    context = {
        'form': form,
        redirect_field_name: redirect_to,
        'site': current_site,
        'site_name': current_site.name,
    }
    if extra_context is not None:
        context.update(extra_context)

    if current_app is not None:
        request.current_app = current_app

    return TemplateResponse(request, template_name, context)

def destroyUser(request, template_name='destroyUser.html',
          redirect_field_name=REDIRECT_FIELD_NAME,
          destruction_form=UserDestructionForm,
          current_app=None, extra_context=None):
    
    redirect_to = request.POST.get(redirect_field_name, request.GET.get(redirect_field_name, ''))

    if request.method == "POST":
        form = destruction_form(request, data=request.POST)
        if form.is_valid():
            # Ensure the user-originating redirection url is safe.
            if not is_safe_url(url=redirect_to, host=request.get_host()):
                redirect_to = resolve_url(settings.SIGNUP_REDIRECT_URL)

            # Okay, security check complete. Destroy the user
            username = request.POST['username']
            password = request.POST['password']
            if username == request.user.username:
                request.user.delete()

            return HttpResponseRedirect(redirect_to)
    else:
        form = destruction_form(request)

    current_site = get_current_site(request)
    
    context = {
        'form': form,
        redirect_field_name: redirect_to,
        'site': current_site,
        'site_name': current_site.name,
    }
    if extra_context is not None:
        context.update(extra_context)

    if current_app is not None:
        request.current_app = current_app

    return TemplateResponse(request, template_name, context)

#------------------------------------------------------------------------------------

@login_required
def lookupWikipedia(request):
    
    def excludeWikiItem(item):
        excludeDescriptionBeginnings = ['This is a redirect from a title with another method of capitalisation.']
        for exclusion in excludeDescriptionBeginnings:
            if item['description'].startswith(exclusion):
                return True
        return False
    
    if request.method == "GET" and 'q' in request.GET and 'l' in request.GET:
        query = request.GET['q']
        language = request.GET['l']
        if Query.hasLanguage(language):
            prefix = "https://%s.wikipedia.org" % language
            wikiprefix = "%s/wiki/" % prefix
            data = requests.get("%s/w/api.php" % prefix, params={
                'action': 'opensearch',
                'format': 'json',
                'namespace': 0,
                'limit': 10,
                'search': query
            })
            print data
            if data:
                obj = data.json()
                if obj:
                    items = []
                    term = obj[0]
                    titles = obj[1]
                    descriptions = obj[2]
                    links = obj[3]
                    count = min(len(titles), len(descriptions), len(links))
                    print links
                    for i in range(0, count-1):
                        item = {'title':titles[i],
                                    'description':descriptions[i],
                                    'links':links[i]}
                        if links[i].startswith(wikiprefix):
                            item['key'] = links[i][len(wikiprefix):]
                        if not excludeWikiItem(item):
                            items.append(item)
                        
                    return HttpResponse(JSONSerializer().serialize(items))