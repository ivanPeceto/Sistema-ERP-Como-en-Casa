"""
WSGI config for clients project.

It exposes the WSGI callable as a module-level variable named ``application``.

For more information on this file, see
https://docs.djangoproject.com/en/4.2/howto/deployment/wsgi/
"""

"""esto es una interfaz estandar entre servidores web y aplicaciones web en Python."""

import os

from django.core.wsgi import get_wsgi_application

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'clients.settings')

application = get_wsgi_application()
