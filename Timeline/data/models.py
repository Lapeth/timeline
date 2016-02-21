from django.db import models

from django import forms
import time

class TimeFormWidget(forms.MultiWidget):
	
	def __init__(self, attrs=None):
		widgets = [
			forms.NumberInput(),
			forms.NumberInput(),
			forms.NumberInput()
		]
		super(TimeFormWidget, self).__init__(widgets, attrs)
		
	def decompress(self, value):
		# Convert Time object to form values
		if value:
			year = value / 1000
			day = value % 1000
			isLeapYear = Time.isLeapYear(year)
			return [year, Time.getMonth(day, isLeapYear), Time.getDate(day, isLeapYear)]
		return [None, None, None]
	
	


class TimeFormField(forms.MultiValueField):
	
	widget = TimeFormWidget
	
	def __init__(self, *args, **kwargs):
		fields = (
			forms.DecimalField(), 
			forms.DecimalField(),
			forms.DecimalField()
		)
		super(TimeFormField, self).__init__(fields, *args, **kwargs)

	def compress(self, data):
		# Convert form value to Time object
		if data:
			return Time(data[0], data[1], data[2])
		return None




class Time(object):
	
	def __init__(self, arg1, arg2=None, arg3=None):
		year = None
		month = None
		date = None
		try:
			arg1 = int(arg1)
		except:
			arg1 = None
		try:
			arg2 = int(arg2)
		except:
			arg2 = None
		try:
			arg3 = int(arg3)
		except:
			arg3 = None

		if arg1 is None:
			raise Exception("Invalid Time constructor arguments")
		
		if arg2 is None or arg3 is None:
			if arg2 is None:
				day = arg1 % 1000
				year = (arg1 - day) / 1000
			else:
				day = arg2
				year = arg1
		else:
			year = arg1
			if arg3 < 0:
				raise ValueError('date may not be negative')
			isLeapYear = Time._isLeapYear(year)
			priorDays = 0
			for m in range(0, arg2-1):
				priorDays += Time.getMonthLength(m, isLeapYear)
			day = priorDays + arg3
			
		self.year = year
		self.day = day
		
	def __str__(self):
		return "%s.%s.%s" % (self.getDate(), self.getMonth(), self.getYear())
	

	@staticmethod
	def fromPython(pythontime):
		if not isinstance(pythontime, time.struct_time):
			raise TypeError("Inappropriate argument type: argument 'pythontime' must be of class 'time.struct_time'")
		return Time(pythontime.tm_year, pythontime.tm_yday)
	
	@staticmethod
	def fromString(stringtime):
		stringtime = stringtime.lower()
		formats = ["%Y","%Y-%m","%Y.%m","%Y-%m-%d","%Y.%m.%d","%d %B %Y","%d. %B %Y","%d %b %Y","%B %d, %Y","%b %d, %Y"]
		for format in formats:
			try:
				t = time.strptime(stringtime, format)
			except ValueError:
				pass
			else:
				return Time.fromPython(t)
		else:
			raise ValueError("could not determine date from %r: does not "
				"match any of the accepted patterns ('%s')"
				% (stringtime, "', '".join(formats)))
		

	def getYear(self):
		return self.year	

	def getMonth(self):
		day = self.day
		isLeapYear = self.isLeapYear()
		for month in range(1, 13):
			if day < 0:
				return month-1
			day -= Time.getMonthLength(month, isLeapYear)
		return month
	
	def getDate(self):
		day = self.day
		isLeapYear = self.isLeapYear()
		for month in range(1, 13):
			monthLength = Time.getMonthLength(month, isLeapYear)
			if day <= monthLength:
				return day
			day -= monthLength

	def getDay(self):
		return self.day

	def isLeapYear(self):
		if self.year % 400 == 0:
			return True
		if self.year % 100 == 0:
			return False
		if self.year % 4 == 0:
			return True
		return False

	@staticmethod
	def _isLeapYear(year):
		if year % 400 == 0:
			return True
		if year % 100 == 0:
			return False
		if year % 4 == 0:
			return True
		return False
	

		
	MONTH_LENGTHS = [31,28,31,30,31,30,31,31,30,31,30,31]
	MONTH_LENGTHS_LEAP = [31,29,31,30,31,30,31,31,30,31,30,31]

	@staticmethod
	def getMonthLength(month, isLeapYear):
		if month <= 0:
			month = 12 + (month % 12)
		if month > 12:
			month = 1 + (month-1 % 12)
		if isLeapYear:
			return Time.MONTH_LENGTHS_LEAP[month-1]
		else:
			return Time.MONTH_LENGTHS[month-1]
		
		
		
class TimeField(models.Field):
	
	def __init__(self, *args, **kwargs):
		super(TimeField, self).__init__(*args, **kwargs)
		
	def db_type(self, connection):
		return 'bigint'
	
	def get_prep_value(self, timeValue):
		if timeValue:
			#print "prep_value: (%d,%d) => %d" % (timeValue.year, timeValue.day, (timeValue.year * 1000) + timeValue.day)
			return (timeValue.year * 1000) + timeValue.day
		else:
			return None
	
	def to_python(self, dbValue):
		#return Time(dbValue >> 10, dbValue & 0x03ff)
		return super(TimeField, self).to_python(dbValue)
	
	def __str__(self):
		return "year: %d, day: %d" % (self.year, self.day)
	
	def formfield(self, **kwargs):
		defaults = {'form_class': TimeFormField}
		defaults.update(kwargs)
		return super(TimeField, self).formfield(**defaults)
	

#------------------------------------------------------------------------------

class Language(models.Model):
	code = models.CharField(max_length=5)
	indexing = models.IntegerField(unique=True)
	name = models.CharField(max_length=20)

#------------------------------------------------------------------------------



class TagBase(models.Model):
	
	#class Meta:
	#	db_table = 'data_tagbase'
	
	key = models.CharField(max_length=20)
	language = models.ForeignKey(Language)
	publicRevision = models.IntegerField()
	enabled = models.BooleanField(default=True)
	group = models.IntegerField(default=0)
	
	def save(self, *args, **kwargs):
		if self.pk is not None:
			raise Exception("Updates not allowed, only inserts")
		else:
			self.publicRevision = self.getNextIdleRevision()
			super(TagBase, self).save(*args, **kwargs)
	
	def getNextIdleRevision(self):
		revisions = TagVersion.objects.filter(base_id=self.id)
		maxrev = 0
		for r in revisions:
			if r.revision > maxrev:
				maxrev = r.revision
		return maxrev + 1
			
	
	def getNextRevision(self, revision):
		try:
			return TagVersion.objects.filter(base_id=self.id).filter(revision__gt=revision).order_by("revision")[0].revision
		except:
			return None
			
	def getPrevRevision(self, revision):
		try:
			return TagVersion.objects.filter(base_id=self.id).filter(revision__lt=revision).order_by("-revision")[0].revision
		except:
			return None
	
	
	def getEditPath(self):
		return "/admin/tag/%s/" % self.id
	

	def getCurrentVersion(self):
		return self.getVersion(self.publicRevision)
	
	def getVersion(self, revision):
		return TagVersion.objects.filter(base=self).filter(revision=revision).get()
	
	def getVersions(self):
		return TagVersion.objects.filter(base=self).all()
	
	def setPublicRevision(self, revision):
		self.publicRevision = revision
		super(TagBase, self).save()
		
	def addVersion(self, title, setCurrent=False):
		version = TagVersion()
		version.base = self
		version.title = title
		version.save()
		if setCurrent:
			self.publicRevision = version.revision
			super(TagBase, self).save()
		return version
	
	def delete(self):
		TagVersion.objects.filter(base=self).delete()
		super(TagBase, self).delete()
	
	def deleteVersion(self, revision):
		revision = int(revision, 10)
		version = self.getVersion(revision)
		if version is not None and version.base == self:
			if self.publicRevision == revision:
				newRevision = self.getNextRevision(revision)
				if newRevision is None:
					newRevision = self.getPrevRevision(revision)
					if newRevision is None:
						return False
				self.publicRevision = newRevision
				super(TagBase, self).save()
			version.delete()
			return True
		return False
	
	def toggleEnabled(self):
		self.enabled = not self.enabled
		super(TagBase, self).save()
		
		

class TagVersion(models.Model):
	
	#class Meta:
	#	db_table = 'data_tagversion'
	
	revision = models.IntegerField(editable=False)
	base = models.ForeignKey(TagBase)
	title = models.CharField('Tag title', max_length=50)
	created = models.DateTimeField('Version timestamp', auto_now_add=True, editable=False)
	
	def save(self, *args, **kwargs):
		if self.revision is None:
			revisions = TagVersion.objects.filter(base_id=self.base.id).extra(order_by = ['-revision'])
			if len(revisions):
				self.revision = revisions[0].revision + 1
			else:
				self.revision = 1
		super(TagVersion, self).save(*args, **kwargs)

	def getTitle(self):
		return self.title



#---------------------------------------------------------------------------



class EventBase(models.Model):
	
	#class Meta:
	#	db_table = 'data_eventbase'
	
	key = models.CharField(max_length=20)
	language = models.ForeignKey(Language)
	publicRevision = models.IntegerField()
	enabled = models.BooleanField(default=True)
	group = models.IntegerField(default=0)
	
	def save(self, *args, **kwargs):
		if self.pk is not None:
			raise Exception("Updates not allowed, only inserts")
		else:
			self.publicRevision = self.getNextIdleRevision()
			super(EventBase, self).save(*args, **kwargs)
	
	def getNextIdleRevision(self):
		versions = EventVersion.objects.filter(base_id=self.id)
		maxrev = 0
		for version in versions:
			if version.revision > maxrev:
				maxrev = version.revision
		return maxrev + 1
			
	def getNextRevision(self, revision):
		try:
			return EventVersion.objects.filter(base_id=self.id).filter(revision__gt=revision).order_by("revision")[0].revision
		except:
			return None
			
	def getPrevRevision(self, revision):
		try:
			return EventVersion.objects.filter(base_id=self.id).filter(revision__lt=revision).order_by("-revision")[0].revision
		except:
			return None
	
	
	def getCurrentVersion(self):
		return self.getVersion(self.publicRevision)
	
	def getVersion(self, revision):
		try:
			return EventVersion.objects.filter(base=self).filter(revision=revision).get()
		except:
			return None
	
	def getVersions(self):
		return EventVersion.objects.filter(base=self).all()
	
	def setPublicRevision(self, revision):
		self.publicRevision = revision
		super(EventBase, self).save()
		
	def addVersion(self, data, setCurrent=False):
		version = EventVersion()
		version.base = self
		version.title = data.get("title")
		version.text = data.get("text")
		version.date = Time(data.get("year"), data.get("month"), data.get("date"))
		version.wiki = data.get("wiki", None)
		if not version.title:
			raise Exception("No title defined in Event Version")
		if not version.text:
			raise Exception("No text defined in Event Version")
		current = self.getCurrentVersion()
		if current is None or not current.equals(version) or "tags" in data:
			version.save()
		for tagid in data.getlist("tags"):
			if tagid:
				version.tags.add(TagBase.objects.get(id=tagid))
		if setCurrent or current is None:
			version.save()
			self.publicRevision = version.revision
			super(EventBase, self).save()
		return version
	
	def delete(self):
		EventVersion.objects.filter(base=self).delete()
		super(EventBase, self).delete()
	
	def deleteVersion(self, revision):
		revision = int(revision, 10)
		version = self.getVersion(revision)
		if version is not None and version.base == self:
			if self.publicRevision == revision:
				newRevision = self.getNextRevision(revision)
				if newRevision is None:
					newRevision = self.getPrevRevision(revision)
					if newRevision is None:
						return False
				self.publicRevision = newRevision
				super(EventBase, self).save()
			version.delete()
			return True
		return False

	
	def toggleEnabled(self):
		self.enabled = not self.enabled
		super(EventBase, self).save()
		
	
	
class EventVersion(models.Model):
	
	#class Meta:
	#	db_table = 'data_eventversion'
	
	revision = models.IntegerField(editable=False)
	base = models.ForeignKey(EventBase)
	title = models.CharField('Event title', max_length=50)
	text = models.TextField('Event contents')
	date = TimeField('Event date', null=True, blank=True)
	wiki = models.CharField('Wikipedia link', max_length=75, null=True, blank=True)
	tags = models.ManyToManyField(TagBase)
	created = models.DateTimeField('Version timestamp', auto_now_add=True, editable=False)
	
	def save(self, *args, **kwargs):
		if self.revision is None:
			revisions = EventVersion.objects.filter(base_id=self.base.id).extra(order_by = ['-revision'])
			if len(revisions):
				self.revision = revisions[0].revision + 1
			else:
				self.revision = 1
		super(EventVersion, self).save(*args, **kwargs)

	def getDate(self):
		return Time(self.date).getDate()

	def getDay(self):
		return Time(self.date).getDay()

	def getYear(self):
		return Time(self.date).getYear()

	def getMonth(self):
		return Time(self.date).getMonth()
	
	def equals(self, other):
		return self.base == other.base and self.title == other.title and self.text == other.text
	
