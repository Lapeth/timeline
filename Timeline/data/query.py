from django.shortcuts import render
from django.http import HttpResponse
from django.http import HttpResponseRedirect
from django.core import serializers
from django.core.exceptions import PermissionDenied
from django.forms import model_to_dict
from django.template import RequestContext
from django.db.models import Q
from models import EventBase
from models import EventVersion
from models import TagBase
from models import TagVersion
from models import Language
from Timeline.util.Permissions import require_permission
import math
import re


class Query:
    # Show a filterable list of all events
    
    
    @staticmethod
    def getQuery(request):
        if 'q' in request.GET:
            return request.GET['q']
    
    """
    @staticmethod
    def parseTagQuery(tagQuery):
        # (2a4)o5
        # 2a(4o5)
        # (2a(4o5))
        # ((2o3)a(4o5))
        numeric = re.compile("^\d$")
        AND = "a"
        OR = "o"

        def eatPart(queryPart):
            currentQ = None
            nextOp = None
            currentId = ""
            length = len(queryPart)
            i = 0
            while i < length:
                endId = True
                char = queryPart[i]
                if numeric.match(char):
                    currentId += char
                    endId = False
                elif char == AND or char == OR:
                    nextOp = char
                
                last = i == length-1

                if endId or last:
                    if len(currentId) > 0:
                        id = int(currentId)
                        currentId = ""
                        q = Q(eventversion__tags__id=id)
                        if currentQ is None:
                            currentQ = q
                        elif nextOp == AND:
                            currentQ = currentQ & q
                        elif nextOp == OR:
                            currentQ = currentQ | q
                if char == ")" or last:
                    return (currentQ, queryPart[i:])
                if char == "(":
                    (q, queryPart) = eatPart(queryPart[i+1:])
                    i = 0
                    length = len(queryPart)
                    if currentQ is None:
                        currentQ = q
                    elif nextOp == AND:
                        currentQ = currentQ & q
                    elif nextOp == OR:
                        currentQ = currentQ | q
                i += 1
            return (currentQ, queryPart[i:])

        (q, p) = eatPart(tagQuery)
        return q
    """
    
    @staticmethod
    def listLanguages():
        return Language.objects.order_by('indexing').all()
    

    @staticmethod
    def filterByTags(dbPath, tagQuery):
        sep = "a"
        numeric = re.compile("^\d$")
        for id in tagQuery.split(sep):
            if numeric.match(id):
                dbPath = dbPath.filter(eventversion__tags__id=id)
        return dbPath
    
    
    @staticmethod
    def listEvents(request, shorten):
        dbPath = EventBase.objects
        cullDisabled = True
        
        if not 'f' in request.GET or request.GET['f'] == 'html':
            cullDisabled = False
            
        if 'incDisabled' in request.GET:
            cullDisabled = request.GET['incDisabled'] == False
            
        if cullDisabled:
            dbPath = dbPath.filter(enabled=True)
            
        if 'key' in request.GET:
            key = request.GET['key']
            if key.startswith("~"):
                key = key.lstrip("~")
                dbPath = dbPath.filter(key__icontains=key)
            else:
                dbPath = dbPath.filter(key__iexact=key)
            
        if 'title' in request.GET:
            title = request.GET['title']
            if title.startswith("~"):
                title = title.lstrip("~")
                dbPath = dbPath.filter(eventversion__title__icontains=title)
            else:
                dbPath = dbPath.filter(eventversion__title__iexact=title)
                
        if 'q' in request.GET:
            query = Query.getQuery(request)
            dbPath = dbPath.filter(Q(key__icontains=query) | Q(eventversion__title__icontains=query))
            
        if 't' in request.GET:
            dbPath = Query.filterByTags(dbPath, request.GET['t'])
            
        if 'l' in request.GET and request.GET['l'] != '':
            dbPath = dbPath.filter(language__code=request.GET['l'])
        
        dbPath = dbPath.distinct()
        pag = Query.pagination(request, dbPath)
        rawevents = dbPath.order_by("key")[pag['offset']: pag['offset'] + pag['limit']]
        events = []
        for event in rawevents:
            version = event.getCurrentVersion()
            if version is not None:
                events.append({'id': event.id,
                               'key': event.key,
                               'title': version.title,
                               'text': version.text,
                               'enabled': event.enabled,
                               'year': version.getYear(),
                               'day': version.getDay(),
                               'language': event.language.code if shorten else event.language
                               })
          
        return (events, pag)
        
        
    
    
    # Create an event
    @staticmethod
    def createEvent(request):
        require_permission(request.user, "Timeline_data.add_eventbase")
        key = request.POST['key']
        languageCode = request.POST['language']
        if EventBase.objects.filter(key=key, language__code=languageCode).count() == 0:
            event = EventBase()
            event.key = key
            event.language = Language.objects.get(code=languageCode)
            event.save()
            try:
                eventVersion = event.addVersion(request.POST, 'publish' in request.POST)
                return event
            except Exception as e:
                event.delete()
                raise e
        else:
            raise Exception("Event with key '%s' already exists for language '%s'" % (key, languageCode))
        
    
    
    # Show an event (POST for saving changes)
    @staticmethod
    def updateEvent(request, eventId, revision=None):
        event = EventBase.objects.filter(id=eventId).get()
        version = None
        permissions = request.user.get_all_permissions()
        if event is not None and request.method == "POST":
            if 'enabled' in request.POST:
                require_permission(request.user, "Timeline_data.change_eventbase")
                event.toggleEnabled()
                version = event.getCurrentVersion()
            if 'current' in request.POST:
                require_permission(request.user, "Timeline_data.change_eventbase")
                event.setPublicRevision(request.POST['current'])
                version = event.getCurrentVersion()
            elif 'save' in request.POST:
                require_permission(request.user, "Timeline_data.add_eventversion")
                version = event.addVersion(request.POST, False)
            elif 'publish' in request.POST:
                require_permission(request.user, "Timeline_data.add_eventversion")
                version = event.addVersion(request.POST, True)
            elif 'deleteVersion' in request.POST:
                require_permission(request.user, "Timeline_data.delete_eventversion")
                if revision is None and 'revision' in request.POST:
                    revision = request.POST['revision']
                if revision is not None:
                    event.deleteVersion(revision)
            elif 'deleteEvent' in request.POST:
                require_permission(request.user, "Timeline_data.delete_eventbase")
                event.delete()
                return (None,None)
        return (event, version)
    
    @staticmethod
    def deleteEvent(request, eventId):
        require_permission(request.user, "Timeline_data.delete_eventbase")
        event = EventBase.objects.filter(id=eventId).get()
        event.delete()
    
    
    @staticmethod
    def deleteEventVersion(request, eventId, revision):
        require_permission(request.user, "Timeline_data.delete_eventversion")
        event = EventBase.objects.filter(id=eventId).get()
        if revision is not None:
            event.deleteVersion(revision)
        return event
    
        
    
    #------------------------------------------------------------------------------
    
    
    # Show a filterable list of all tags
    @staticmethod
    def listTags(request, shorten):
        dbPath = TagBase.objects
        
        if 'q' in request.GET:
            query = Query.getQuery(request)
            dbPath = dbPath.filter(Q(key__icontains=query) | Q(tagversion__title__icontains=query))
            
        if 'key' in request.GET:
            key = request.GET['key']
            if key.startswith("~"):
                key = key.lstrip("~")
                dbPath = dbPath.filter(key__icontains=key)
            else:
                dbPath = dbPath.filter(key__iexact=key)
            
        if 'title' in request.GET:
            title = request.GET['title']
            if title.startswith("~"):
                title = title.lstrip("~")
                dbPath = dbPath.filter(tagversion__title__icontains=title)
            else:
                dbPath = dbPath.filter(tagversion__title__iexact=title)
                
        if 'l' in request.GET:
            dbPath = dbPath.filter(language__code=request.GET['l'])
                
        dbPath = dbPath.distinct()
        print dbPath
        pag = Query.pagination(request, dbPath)
        rawtags = dbPath.order_by("key")[pag['offset'] : pag['offset'] + pag['limit']]
        tags = []
        print rawtags
        for tag in rawtags:
            version = tag.getCurrentVersion()
            tags.append({
                'id': tag.id,
                'key': tag.key,
                'title': version.title,
                'key': tag.key,
                'enabled': tag.enabled,
                'language': tag.language.code if shorten else tag.language
            });
        return (tags,pag)
    
    # Create an event (POST for saving changes)
    @staticmethod
    def createTag(request):
        require_permission(request.user, "Timeline_data.add_tagbase")
        key = request.POST['key']
        languageCode = request.POST['language']
        if TagBase.objects.filter(key=key, language__code=languageCode).count() == 0:
            tag = TagBase()
            tag.key = key
            tag.language = Language.objects.get(code=languageCode)
            tag.save()
            tagVersion = tag.addVersion(request.POST['title'], True)
            return tag
        else:
            raise Exception("Tag with key '%s' already exists for language '%s'" % (key, languageCode))
    
    
    # Show an event (POST for saving changes)
    @staticmethod
    def updateTag(request, tagId, revision=None):
        tag = TagBase.objects.filter(id=tagId).get()
        version = None
        if request.method == "POST":
            if 'enabled' in request.POST:
                require_permission(request.user, "Timeline_data.change_tagbase")
                tag.toggleEnabled()
            if 'current' in request.POST:
                require_permission(request.user, "Timeline_data.change_tagbase")
                revision = request.POST['current']
                tag.setPublicRevision(revision)
            elif 'save' in request.POST:
                require_permission(request.user, "Timeline_data.add_tagversion")
                version = tag.addVersion(request.POST['title'], False)
            elif 'publish' in request.POST:
                require_permission(request.user, "Timeline_data.add_tagversion")
                version = tag.addVersion(request.POST['title'], True)
            elif 'deleteVersion' in request.POST:
                require_permission(request.user, "Timeline_data.delete_tagversion")
                if revision is None and 'revision' in request.POST:
                    revision = request.POST['revision']
                if revision is not None:
                    tag.deleteVersion(revision)
            elif 'deleteTag' in request.POST:
                require_permission(request.user, "Timeline_data.delete_tagbase")
                tag.delete()
                return (None,None)
        return (tag,version)
    
    
    @staticmethod
    def deleteTag(request, tagId):
        require_permission(request.user, "Timeline_data.delete_tagbase")
        tag = TagBase.objects.filter(id=tagId).get()
        tag.delete()
    
    
    @staticmethod
    def deleteTagVersion(request, tagId, revision):
        require_permission(request.user, "Timeline_data.delete_tagversion")
        tag = EventBase.objects.filter(id=tagId).get()
        if revision is not None:
            tag.deleteVersion(revision)
        return tag
    
    
    
    #------------------------------------------------------------------------------
    
    @staticmethod
    def pagination(request, dbPath):
        try:
            page = int(request.GET['p'])
        except:
            page = 1
        limit = 10
        offset = (page - 1) * limit
        lastpage = int(math.ceil(dbPath.count() / limit))
        return {
            "offset": offset,
            "limit": limit,
            "current": page,
            "prev": page - 1 if page > 1 else None,
            "next": page + 1 if page < lastpage else None,
            "first": 1 if page > 1 else None,
            "last": lastpage if page < lastpage else None
        }
