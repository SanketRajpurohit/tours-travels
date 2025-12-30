"""
Unit tests for boot stability (Phase 0)
Tests server startup and URL resolution without errors
"""

from django.test import TestCase
from django.core.management import execute_from_command_line
from django.urls import reverse, resolve
from django.conf import settings
from django.core.exceptions import ImproperlyConfigured
import sys
from io import StringIO


class BootStabilityTestCase(TestCase):
    """Test Django server starts without import or circular dependency errors"""
    
    def test_django_check_passes(self):
        """Test that Django system check passes without errors"""
        # Capture stdout to avoid cluttering test output
        old_stdout = sys.stdout
        sys.stdout = StringIO()
        
        try:
            # This will raise an exception if there are system check errors
            execute_from_command_line(['manage.py', 'check'])
        except SystemExit as e:
            # Django check command exits with code 0 on success
            self.assertEqual(e.code, 0, "Django system check failed")
        finally:
            sys.stdout = old_stdout
    
    def test_settings_configuration(self):
        """Test that Django settings are properly configured"""
        # Test that essential settings are present
        self.assertTrue(hasattr(settings, 'INSTALLED_APPS'))
        self.assertTrue(hasattr(settings, 'MIDDLEWARE'))
        self.assertTrue(hasattr(settings, 'ROOT_URLCONF'))
        self.assertTrue(hasattr(settings, 'DATABASES'))
        
        # Test that our custom user model is configured
        self.assertEqual(settings.AUTH_USER_MODEL, 'tours.User')
    
    def test_url_resolution_no_circular_imports(self):
        """Test that URL resolution works without circular dependency issues"""
        try:
            # Test that we can resolve the admin URL
            admin_url = reverse('admin:index')
            self.assertTrue(admin_url.startswith('/admin/'))
            
            # Test that we can resolve API v1 URLs
            # This will fail if there are circular imports in URL configuration
            from django.urls import get_resolver
            resolver = get_resolver()
            
            # Test that the resolver can be created without errors
            self.assertIsNotNone(resolver)
            
        except Exception as e:
            self.fail(f"URL resolution failed with error: {e}")
    
    def test_installed_apps_importable(self):
        """Test that all installed apps can be imported without errors"""
        for app in settings.INSTALLED_APPS:
            # Skip Django built-in apps
            if app.startswith('django.'):
                continue
                
            try:
                __import__(app)
            except ImportError as e:
                self.fail(f"Failed to import app '{app}': {e}")
    
    def test_database_configuration(self):
        """Test that database configuration is valid"""
        from django.db import connection
        
        # Test that we can get a database connection
        try:
            connection.ensure_connection()
        except Exception as e:
            self.fail(f"Database connection failed: {e}")
    
    def test_middleware_configuration(self):
        """Test that middleware configuration is valid"""
        # Test that essential middleware is present
        required_middleware = [
            'corsheaders.middleware.CorsMiddleware',
            'django.middleware.security.SecurityMiddleware',
            'django.contrib.sessions.middleware.SessionMiddleware',
            'django.middleware.common.CommonMiddleware',
            'django.contrib.auth.middleware.AuthenticationMiddleware',
        ]
        
        for middleware in required_middleware:
            self.assertIn(middleware, settings.MIDDLEWARE,
                         f"Required middleware '{middleware}' not found in MIDDLEWARE setting")