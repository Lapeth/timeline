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

if socket.gethostname() == 'Venus':
    # SECURITY WARNING: don't run with debug turned on in production!
    DEBUG = True
    TEMPLATE_DEBUG = True
else:
    DEBUG = False
    TEMPLATE_DEBUG = False



BASE_DIR = os.path.dirname(os.path.dirname(__file__))


# Quick-start development settings - unsuitable for production
# See https://docs.djangoproject.com/en/1.6/howto/deployment/checklist/

# SECURITY WARNING: keep the secret key used in production secret!
SECRET_KEY = 'dv(n(zkqd^qpz^#&*=wh5@6#emx5)b$ew_d##=^dkh56^u1pdr'

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

DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.mysql',
        'NAME': 'timeline',
        'USER': 'timeline',
        'PASSWORD': 'z5h9b4jk'
    }
}

# Internationalization
# https://docs.djangoproject.com/en/1.6/topics/i18n/

LANGUAGE_CODE = 'en-us'

TIME_ZONE = 'UTC'

USE_I18N = True

USE_L10N = True

USE_TZ = True


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
            'js/confirmationButton.js'
        ),
        'output_filename': 'js/admin_common.js',
    },
}
