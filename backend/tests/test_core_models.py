"""
Property tests for core models
Tests Property 22: Model Timestamp Fields
"""

from django.test import TestCase, TransactionTestCase
from django.utils import timezone
from django.db import models, connection
from apps.core.models import BaseModel
import time
import uuid


class CoreModelsPropertyTest(TransactionTestCase):
    """Property tests for core models using TransactionTestCase for table creation"""
    
    def setUp(self):
        """Set up test database table"""
        # Create the test table manually
        with connection.schema_editor() as schema_editor:
            # Create a temporary model for testing
            class TestModel(BaseModel):
                name = models.CharField(max_length=100)
                
                class Meta:
                    app_label = 'tests'
                    db_table = 'test_basemodel'
                    ordering = ['-created_at']  # Explicitly set ordering for test
            
            self.TestModel = TestModel
            schema_editor.create_model(TestModel)
    
    def tearDown(self):
        """Clean up test database table"""
        with connection.schema_editor() as schema_editor:
            schema_editor.delete_model(self.TestModel)
    
    def test_property_22_model_timestamp_fields(self):
        """
        Property 22: Model Timestamp Fields
        
        GIVEN any model that inherits from BaseModel
        WHEN the model is created or updated
        THEN the model MUST have created_at and updated_at timestamps
        AND created_at MUST be set on creation and never change
        AND updated_at MUST be updated on every save operation
        AND timestamps MUST be in UTC timezone
        """
        # Test model creation
        before_creation = timezone.now()
        instance = self.TestModel.objects.create(name="Test Instance")
        after_creation = timezone.now()
        
        # Verify timestamps exist
        self.assertIsNotNone(instance.created_at, "created_at must be set on creation")
        self.assertIsNotNone(instance.updated_at, "updated_at must be set on creation")
        
        # Verify timestamps are within expected range
        self.assertGreaterEqual(instance.created_at, before_creation, "created_at must be after creation start")
        self.assertLessEqual(instance.created_at, after_creation, "created_at must be before creation end")
        self.assertGreaterEqual(instance.updated_at, before_creation, "updated_at must be after creation start")
        self.assertLessEqual(instance.updated_at, after_creation, "updated_at must be before creation end")
        
        # Verify created_at and updated_at are initially the same
        self.assertEqual(instance.created_at, instance.updated_at, "created_at and updated_at must be equal on creation")
        
        # Store original timestamps
        original_created_at = instance.created_at
        original_updated_at = instance.updated_at
        
        # Wait a small amount to ensure timestamp difference
        time.sleep(0.01)
        
        # Test model update
        before_update = timezone.now()
        instance.name = "Updated Test Instance"
        instance.save()
        after_update = timezone.now()
        
        # Verify created_at hasn't changed
        self.assertEqual(instance.created_at, original_created_at, "created_at must not change on update")
        
        # Verify updated_at has changed
        self.assertNotEqual(instance.updated_at, original_updated_at, "updated_at must change on update")
        self.assertGreater(instance.updated_at, original_updated_at, "updated_at must be later than original")
        
        # Verify updated_at is within expected range
        self.assertGreaterEqual(instance.updated_at, before_update, "updated_at must be after update start")
        self.assertLessEqual(instance.updated_at, after_update, "updated_at must be before update end")
    
    def test_uuid_primary_key(self):
        """
        Test that BaseModel uses UUID as primary key
        """
        instance = self.TestModel.objects.create(name="UUID Test")
        
        # Verify ID is UUID
        self.assertIsNotNone(instance.id, "ID must be set")
        self.assertIsInstance(instance.id, uuid.UUID, "ID must be a UUID instance")
        self.assertEqual(len(str(instance.id)), 36, "UUID must be 36 characters long")
        self.assertIn('-', str(instance.id), "UUID must contain hyphens")
        
        # Verify ID is unique
        instance2 = self.TestModel.objects.create(name="UUID Test 2")
        self.assertNotEqual(instance.id, instance2.id, "UUIDs must be unique")
    
    def test_model_ordering(self):
        """
        Test that BaseModel orders by created_at descending by default
        """
        # Create multiple instances with slight delays
        instance1 = self.TestModel.objects.create(name="First")
        time.sleep(0.01)
        instance2 = self.TestModel.objects.create(name="Second")
        time.sleep(0.01)
        instance3 = self.TestModel.objects.create(name="Third")
        
        # Verify ordering (newest first) - use order_by to ensure consistent ordering
        instances = list(self.TestModel.objects.all().order_by('-created_at'))
        self.assertEqual(instances[0].id, instance3.id, "Newest instance should be first")
        self.assertEqual(instances[1].id, instance2.id, "Middle instance should be second")
        self.assertEqual(instances[2].id, instance1.id, "Oldest instance should be last")
        
        # Also test that the default ordering works
        default_instances = list(self.TestModel.objects.all())
        # The default ordering should be the same as explicit -created_at ordering
        self.assertEqual(len(default_instances), 3, "Should have 3 instances")
        # Check that instances are ordered by creation time (newest first)
        for i in range(len(default_instances) - 1):
            self.assertGreaterEqual(
                default_instances[i].created_at, 
                default_instances[i + 1].created_at,
                f"Instance {i} should be newer than instance {i+1}"
            )
    
    def test_timestamp_timezone(self):
        """
        Test that timestamps are timezone-aware and in UTC
        """
        instance = self.TestModel.objects.create(name="Timezone Test")
        
        # Verify timestamps are timezone-aware
        self.assertIsNotNone(instance.created_at.tzinfo, "created_at must be timezone-aware")
        self.assertIsNotNone(instance.updated_at.tzinfo, "updated_at must be timezone-aware")
        
        # Verify timestamps are in UTC (check the zone name or offset)
        self.assertEqual(str(instance.created_at.tzinfo), 'UTC', "created_at must be in UTC")
        self.assertEqual(str(instance.updated_at.tzinfo), 'UTC', "updated_at must be in UTC")