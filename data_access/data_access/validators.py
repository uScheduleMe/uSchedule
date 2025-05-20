# Django
from rest_framework import serializers
from rest_framework.exceptions import ValidationError

class MinCountValidator:
    '''
    Validator to ensure a list contains at least one item
    '''
    def __init__(self, count, prop):
        self.count = count
        self.prop = prop

    def __call__(self, value):
        # If the prop is not in the value obj then we assume it's marked
        # not required otherwise the required validator should catch it
        if self.prop in value and len(value[self.prop]) < self.count:
            raise ValidationError("At least {count} value required for {prop}".format(**self.__dict__))
        return value

class NotEditableValidator:
    '''
    Disable editing of a given field field
    '''
    requires_context = True

    def __init__(self, prop):
        self.prop = prop

    def __call__(self, value, serializer):
        if serializer.instance and self.prop in value:
            raise ValidationError("{} are not editable".format(self.prop))
        return value
