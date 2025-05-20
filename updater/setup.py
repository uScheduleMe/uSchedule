# -*- coding: utf-8 -*-

import io
import os
import sys
import re

from setuptools import find_packages, setup, Command

#from uoapi import __version__

here = os.path.abspath(os.path.dirname(__file__))

# Package meta-data.
NAME = 'updater'
DESCRIPTION = ''
URL = 'https://github.com/uScheduleMe/Notifier'
EMAIL = 'anaga042@uottawa.ca'
AUTHOR = 'Andrew Nagarajah'
REQUIRES_PYTHON = '>=3.6.0'
#VERSION = __version__
VERSION = os.getenv("VERSION") or ""

# What packages are required for this module to be executed?
REQUIRED = [
    'requests',
]

# What packages are optional?
EXTRAS = {
    # 'fancy feature': ['django'],
}

# The rest you shouldn't have to touch too much :)
# ------------------------------------------------
# Except, perhaps the License and Trove Classifiers!
# If you do change the License, remember to change the Trove Classifier for that!


# Import the README and use it as the long-description.
# Note: this will only work if 'README.md' is present in your MANIFEST.in file!
long_description = DESCRIPTION = ""

# Load the package's __version__.py module as a dictionary.
about = {}
#if not VERSION:
#    project_slug = NAME.lower().replace("-", "_").replace(" ", "_")
#    with open(os.path.join(here, project_slug, '__version__.py')) as f:
#        exec(f.read(), about)
#else:
#    about['__version__'] = VERSION
about['__version__'] = VERSION



# Where the magic happens:
setup(
    name=NAME,
    version=about['__version__'],
    description=DESCRIPTION,
    long_description=long_description,
    long_description_content_type='text/markdown',
    author=AUTHOR,
    author_email=EMAIL,
    python_requires=REQUIRES_PYTHON,
    url=URL,
    #package_data = {"notifier": [os.path.join("notifier", "templates", "*")]},
    # If your package is a single module, use this instead of 'packages':
    py_modules=[
        'updater',
    ],
    entry_points={
        'console_scripts': [
            'update_timetables=updater.timetables:main',
            'update_available_terms=updater.available_terms:main',
        ],
    },
    include_package_data=True,
    install_requires=REQUIRED,
    extras_require=EXTRAS,
)
