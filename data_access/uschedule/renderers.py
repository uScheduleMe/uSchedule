from rest_framework.renderers import JSONRenderer

class uScheduleRenderer(JSONRenderer):
    '''
    Override of the django rest framework JSONRenderer to:
    * extract meta information and add it to the toplevel
    * move the main content into the "data" field
    '''
    def render(self, data, accepted_media_type=None, renderer_context=None):
        # If the body is empty (usually delete requests) simply continue
        if data is None:
            return super(uScheduleRenderer, self).render(data, accepted_media_type, renderer_context)

        response = {}
        meta = {}

        # Extract meta from dict if present
        if type(data) == dict:
            meta = data.pop("meta", meta)
        
        if 'messages' not in meta:
            meta['messages'] = []

        if 'data' in data:
            response['data'] = data['data']
        else:
            response['data'] = data

        for key, value in meta.items():
            response[key] = value

        return super(uScheduleRenderer, self).render(response, accepted_media_type, renderer_context)
