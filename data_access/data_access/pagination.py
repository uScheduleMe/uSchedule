from rest_framework import pagination
from rest_framework.response import Response

class TruncatePaginator(pagination.BasePagination):
    '''
    A Paginator that will simply truncate the result to 50 results
    '''

    truncate_size = 50

    def paginate_queryset(self, queryset, request, view=None):
        return list(queryset[0:self.truncate_size])

    def get_paginated_response(self, data):
        return Response(data)
