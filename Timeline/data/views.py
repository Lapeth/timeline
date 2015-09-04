from django.http import HttpResponse
from Timeline.util.JSONSerializer import JSONSerializer

from Timeline.data.query import Query

# Show a filterable list of all events
def listEvents(request):
    (events,p) = Query.listEvents(request, True)
    return HttpResponse(JSONSerializer().serialize(events))
    

# Show a filterable list of all tags
def listTags(request):
    (tags,p) = Query.listTags(request, True)
    return HttpResponse(JSONSerializer().serialize(tags))
