# Database
# https://docs.djangoproject.com/en/1.6/ref/settings/#databases

DEBUG = True
TEMPLATE_DEBUG = True

DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.mysql',
        'NAME': 'timeline',
        'USER': 'timeline',
        'PASSWORD': 'not really'
    }
}

# SECURITY WARNING: keep the secret key used in production secret!
SECRET_KEY = 'also, not really'


