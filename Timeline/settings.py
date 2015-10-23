"""
Django settings for Timeline project.

For more information on this file, see
https://docs.djangoproject.com/en/1.6/topics/settings/

For the full list of settings and their values, see
https://docs.djangoproject.com/en/1.6/ref/settings/
"""

# Build paths inside the project like this: os.path.join(BASE_DIR, ...)
import os
from django.conf.global_settings import TEMPLATE_CONTEXT_PROCESSORS as TCP
import socket

ROOT_PATH = os.path.dirname(os.path.abspath(__file__))

configs = {
    '/opt/timeline/production/Timeline' : 'production',
    '/opt/timeline/staging/Timeline' : 'staging',
    '/opt/timeline/demo/Timeline' : 'demo'
}

config_module = __import__("config_%s" % configs.get(ROOT_PATH, 'development'), globals(), locals(), 'Timeline')

for setting in dir(config_module):
    if setting == setting.upper():
        locals()[setting] = getattr(config_module, setting)

BASE_DIR = os.path.dirname(os.path.dirname(__file__))

# Quick-start development settings - unsuitable for production
# See https://docs.djangoproject.com/en/1.6/howto/deployment/checklist/

ALLOWED_HOSTS = ['*']

# Application definition

INSTALLED_APPS = (
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'rest_framework',
    'pipeline',
    'Timeline.data',
    'Timeline.admin',
    'Timeline.webclient',
)

MIDDLEWARE_CLASSES = (
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.locale.LocaleMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
)

ROOT_URLCONF = 'Timeline.urls'

WSGI_APPLICATION = 'Timeline.wsgi.application'


TEMPLATE_CONTEXT_PROCESSORS = TCP + (
    'django.core.context_processors.request',
)


# Database
# https://docs.djangoproject.com/en/1.6/ref/settings/#databases

# Internationalization
# https://docs.djangoproject.com/en/1.6/topics/i18n/

LANGUAGE_CODE = 'en-us'

TIME_ZONE = 'UTC'

USE_I18N = True

USE_L10N = True

USE_TZ = True

LANGUAGE_COOKIE_NAME = "language"


# Static files (CSS, JavaScript, Images)
# https://docs.djangoproject.com/en/1.6/howto/static-files/

STATIC_URL = '/static/'
STATIC_ROOT = 'static/'


# Pipelined assets

STATICFILES_STORAGE = 'pipeline.storage.PipelineCachedStorage'

STATICFILES_FINDERS = (
    'django.contrib.staticfiles.finders.FileSystemFinder',
    'django.contrib.staticfiles.finders.AppDirectoriesFinder',
    'pipeline.finders.PipelineFinder',
    'npm.finders.NpmFinder',
)

PIPELINE_STORAGE = 'pipeline.storage.PipelineFinderStorage'
PIPELINE_JS_COMPRESSOR = 'pipeline.compressors.uglifyjs.UglifyJSCompressor'
PIPELINE_UGLIFYJS_BINARY = '/usr/bin/uglifyjs'
PIPELINE_CSS_COMPRESSOR = 'pipeline.compressors.csstidy.CSSTidyCompressor'
PIPELINE_CSSTIDY_BINARY = '/usr/bin/csstidy'
PIPELINE_ENABLED = False

LOGIN_URL = '/admin/login/'
LOGIN_REDIRECT_URL = '/admin/event/'
SIGNUP_REDIRECT_URL = '/admin/event/'


PIPELINE_CSS = {
    'webclient': {
        'source_filenames': (
            'css/AddHover.css',
            'css/Control.css',
            'css/EventBox.css',
            'css/FilterDialog.css',
            'css/Timeline.css',
            'css/UI.css',
        ),
        'output_filename': 'css/webclient.css',
    },
        
    'admin_common': {
        'source_filenames': (
            'css/admin.css',
            'css/bootstrap-fix.css',
        ),
        'output_filename': 'css/admin_common.css',
    },
}

PIPELINE_JS = {
    'webclient': {
        'source_filenames': (
          'js/01_Item.js',
          'js/02_Control.js',
          'js/03_Util.js',
          'js/04_Time.js',
          'js/Event.js',
          'js/Tag.js',
          'js/Controller.js',
          'js/Container.js',
          'js/EventBox.js',
          'js/FilterDialog.js',
          'js/Filter.js',
          'js/Timeline.js',
          'js/AddHover.js',
          'js/UI.js',
        ),
        'output_filename': 'js/webclient.js',
    },
    'admin_common': {
        'source_filenames': (
            'js/inputCheckExisting.js',
            'js/confirmationButton.js',
            'js/inputNumber.js',
            'js/autosubmit.js'
        ),
        'output_filename': 'js/admin_common.js',
    },
}


NPM_PREFIX_PATH = '/home/lars/Projekt/timeline/Timeline/thirdparty'
NPM_DESTINATION_PREFIX = 'thirdparty'
NPM_FILE_PATTERNS = {
    'jquery': ['dist/jquery.min.js'],
    'jquery-mousewheel': ['jquery.mousewheel.js'],
    'bootstrap': ['dist/js/bootstrap.min.js', 'dist/css/bootstrap.min.css', 'dist/fonts/*'],
    'bootstrap-datepicker': ['dist/js/bootstrap-datepicker.min.js', 'dist/css/bootstrap-datepicker.min.css', 'dist/locales/*'],
    'bootstrap-select': ['dist/js/bootstrap-select.min.js', 'dist/css/bootstrap-select.min.css'],
    'bootbox': ['bootbox.min.js'],
    'typeahead.js': ['dist/typeahead.bundle.min.js']
}