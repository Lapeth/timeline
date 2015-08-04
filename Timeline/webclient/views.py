from django.shortcuts import render
from django.utils import translation
import json

from Timeline.data.models import Language

# Create your views here.

def index(request):
    dbLanguages = Language.objects.order_by('indexing').all()
    languageList = [{'id':lang.id, 'code':lang.code, 'name':lang.name} for lang in dbLanguages]
    languageDict = { lang.code : lang for lang in dbLanguages }
    
    currentLanguage = translation.get_language()
    if '-' in currentLanguage:
        currentLanguage = currentLanguage[0:currentLanguage.find('-')]
    if not currentLanguage in languageDict:
        currentLanguage = "en"
    
    return render(request, "index.html", {
        'language': json.dumps({
            'available': languageList,
            'current': currentLanguage
        })
    })
