# Database
# https://docs.djangoproject.com/en/1.6/ref/settings/#databases

DEBUG = True
TEMPLATE_DEBUG = True

DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.mysql',
        'NAME': 'your database name',
        'USER': 'your database user',
        'PASSWORD': 'your datebase password'
    }
}

# SECURITY WARNING: keep the secret key used in production secret!
SECRET_KEY = 'Put in a secret string of ASCII chars here'


