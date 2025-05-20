import base64
import json
from types import SimpleNamespace

class UScheduleJWTMiddleware:
    """
    Middleware that will extract the jwt from the cookies and
    insert it into the request object
    """
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        if ('access_token' in request.COOKIES):
            jwt = request.COOKIES['access_token']
            encoded_payload = jwt.split('.')[1]
            # python base64 complains about insufficent padding but
            # is ok with excess padding so we add the max amount possile
            payload = base64.b64decode(encoded_payload + '===')
            request.jwt = json.loads(payload, object_hook=lambda d: SimpleNamespace(**d))
        else:
            request.jwt = None

        return self.get_response(request)
