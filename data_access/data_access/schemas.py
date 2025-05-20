import jsonschema
from jsonschema.exceptions import ValidationError as JsonSchemaValidationError
from django.core.exceptions import ValidationError as DjangoValidationError

def validate(*args, **kwargs):
    try:
        jsonschema.validate(*args, **kwargs)
    except JsonSchemaValidationError as e:
        raise DjangoValidationError("JsonSchema violation found", params=e)


timetable_components_schema = {
    "type": "object",
    "additionalProperties": False,
    "patternProperties": {
        "[1-9][0-9]*": {
            "type": "object",
            "additionalProperties": False,
            "required": [
                "id"
            ],
            "properties": {
                "id": {
                    "type": "integer",
                },
                "school": {
                    "type": "string",
                },
                "year": {
                    "type": "integer",
                },
                "term": {
                    "type": "string",
                    "enum": ["winter", "summer", "fall"],
                },
                "season": {
                    "type": "string",
                    "enum": ["winter", "summer", "fall"],
                },
                "subject_code": {
                    "type": "string",
                },
                "course_code": {
                    "type": "string",
                },
                "sections": {
                    "additionalProperties": False,
                    "patternProperties": {
                        "[A-Z]+": {
                            "type": "array",
                            "items": {
                                "type": "string",
                            },
                        },
                    },
                },
            },
        },
    },
}
