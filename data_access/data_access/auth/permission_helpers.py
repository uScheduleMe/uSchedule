from typing import Iterable
from functools import wraps

def has_jwt(_func=None, *, scopes=None, client_id=None):
    """
    Make sure the user has a JWT and if claims are provided that they match

    args:
        scopes: a single scope or a list of scopes that the JWT must contain
        client_id: the client_id string that the JWT must have
    """
    def decorator_has_jwt(func):
        is_object_permission = "has_object" in func.__name__

        @wraps(func)
        def func_wrapper(*args, **kwargs):
            request = args[0]
            # use second parameter if object permission
            if is_object_permission:
                request = args[1]

            # Check that the jwt exists
            if not(request.jwt):
                return False
            
            # Check the jwt for requested scopes (if any)
            if scopes is not None and not has_scopes(request, scopes):
                return False

            # Check the jwt for requested client_id (if any)
            if client_id is not None and request.jwt.client_id != client_id:
                return False

            return func(*args, **kwargs)

        return func_wrapper

    if _func is None:
        return decorator_has_jwt
    else:
        return decorator_has_jwt(_func)



@has_jwt
def has_scopes(request, perms: str or Iterable) -> bool:
    if isinstance(perms, str):
        return perms in request.jwt.scopes

    for perm in perms:
        if perm not in request.jwt.scopes:
            return False
    return True
