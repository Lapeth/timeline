from django.http import HttpResponse
    
def iframe_allow(*args):

    sites = [x for x in args if isinstance(x, basestring)]

    def decorator(function):
        def wrapper(*args, **kwargs):
            response = function(*args, **kwargs)
            if isinstance(response, HttpResponse):
                response["Content-Security-Policy"] = u"frame-ancestors 'self' %s" % ' '.join(sites)
                response["X-Frame-Options"] = "ALLOWALL"
            return response
        return wrapper
    
    return decorator