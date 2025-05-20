from rest_framework.authentication import BaseAuthentication

class UScheduleJWTAuthenticator(BaseAuthentication):
    def authenticate(self, request):
        """
        Since we don't integrate with DRF authentication we don't actually need
        to fetch a user just check if we have a JWT.

        If we decide to integrate later this is where we would fetch the user
        object and return it.
        """
        if request.jwt:
            return (True, None)
        return None

    def authenticate_header(self, request):
        """
        Return the value to be placed in the `WWW-Authenticate` header.

        This is required by w3 and enforced by DRF so we include something sensible.
        """
        return 'JWT realm="uSchedule API", charset="UTF-8"'
