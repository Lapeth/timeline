from django.core.exceptions import PermissionDenied

def require_permission(user, *args):
    for arg in args:
        if not user.has_perm(arg):
            raise PermissionDenied("Action %s not allowed" % arg)