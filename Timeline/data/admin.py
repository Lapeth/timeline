from django.contrib import admin

# Register your models here.

from Timeline.data.models import EventBase,EventVersion,TagBase,TagVersion


class EventVersionAdmin(admin.ModelAdmin):
    fields = ['base', 'title', 'text', 'date']
    
    
class EventBaseAdmin(admin.ModelAdmin):
    fields = ['key']



class TagVersionAdmin(admin.ModelAdmin):
    fields = ['base', 'title']
    
    
class TagBaseAdmin(admin.ModelAdmin):
    fields = ['key']




#------------------------------------------------------------------------------


admin.site.register(EventVersion, EventVersionAdmin)
admin.site.register(EventBase, EventBaseAdmin)

admin.site.register(TagVersion, TagVersionAdmin)
admin.site.register(TagBase, TagBaseAdmin)


