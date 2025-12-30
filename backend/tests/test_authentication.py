"""
Property tests for authentication system
Tests Properties 2, 3, 4, 5, 6, 7, 14
"""

from django.test import TestCase, Client
from django.contrib.auth import get_user_model
from django.urls import reverse
from rest_framework import status
from rest_framework_simplejwt.tokens import AccessToken
import json
import time

User = get_user_model()


class AuthenticationPropertyTest(TestCase):
    """Property tests for authentication system"""
    
    def setUp(self):
        self.client = Client()
        
        # Create admin user
        self.admin_user = User.objects.create_user(
            username='admin',
            email='admin@test.com',
            password='AdminPass123!',
            first_name='Admin',
            last_name='User',
            role='ADMIN',
            is_staff=True,
            is_superuser=True
        )
        
        # Create customer user
        self.customer_user = User.objects.create_user(
            username='customer',
            email='customer@test.com',
            password='CustomerPass123!',
            first_name='Customer',
            last_name='User',
            role='CUSTOMER'
        )
    
    def test_property_2_jwt_authentication_consistency(self):
        """
        Property 2: JWT Authentication Consistency
        
        GIVEN a valid user with proper credentials
        WHEN they authenticate via any login endpoint
        THEN they MUST receive a valid JWT token
        AND the token MUST contain user ID and role
        AND the token MUST be verifiable
        """
        # Test admin login
        admin_response = self.client.post('/api/v1/auth/admin/login/', {
            'email': 'admin@test.com',
            'password': 'AdminPass123!'
        }, content_type='application/json')
        
        self.assertEqual(admin_response.status_code, status.HTTP_200_OK)
        admin_data = json.loads(admin_response.content)
        
        # Verify response structure
        self.assertTrue(admin_data['success'])
        self.assertIn('data', admin_data)
        self.assertIn('access_token', admin_data['data'])
        self.assertIn('user', admin_data['data'])
        
        # Verify token contains required claims
        admin_token = admin_data['data']['access_token']
        decoded_token = AccessToken(admin_token)
        self.assertEqual(int(decoded_token['user_id']), self.admin_user.id)
        self.assertEqual(decoded_token['role'], 'ADMIN')
        self.assertEqual(decoded_token['email'], 'admin@test.com')
        
        # Test customer login
        customer_response = self.client.post('/api/v1/auth/login/', {
            'email': 'customer@test.com',
            'password': 'CustomerPass123!'
        }, content_type='application/json')
        
        self.assertEqual(customer_response.status_code, status.HTTP_200_OK)
        customer_data = json.loads(customer_response.content)
        
        # Verify customer token
        customer_token = customer_data['data']['access_token']
        decoded_customer_token = AccessToken(customer_token)
        self.assertEqual(int(decoded_customer_token['user_id']), self.customer_user.id)
        self.assertEqual(decoded_customer_token['role'], 'CUSTOMER')
        self.assertEqual(decoded_customer_token['email'], 'customer@test.com')
    
    def test_property_3_invalid_token_rejection(self):
        """
        Property 3: Invalid Token Rejection
        
        GIVEN an invalid, expired, or malformed JWT token
        WHEN it is used to access protected endpoints
        THEN the request MUST be rejected with 401 Unauthorized
        """
        # Test with invalid token
        invalid_response = self.client.get('/api/v1/auth/verify/', 
                                         HTTP_AUTHORIZATION='Bearer invalid-token')
        self.assertEqual(invalid_response.status_code, status.HTTP_401_UNAUTHORIZED)
        
        # Test with malformed token
        malformed_response = self.client.get('/api/v1/auth/verify/', 
                                           HTTP_AUTHORIZATION='Bearer malformed.token.here')
        self.assertEqual(malformed_response.status_code, status.HTTP_401_UNAUTHORIZED)
        
        # Test with no token
        no_token_response = self.client.get('/api/v1/auth/verify/')
        self.assertEqual(no_token_response.status_code, status.HTTP_401_UNAUTHORIZED)
    
    def test_property_4_customer_registration_role_assignment(self):
        """
        Property 4: Customer Registration Role Assignment
        
        GIVEN a new user registration via customer endpoint
        WHEN the registration is successful
        THEN the user MUST be assigned CUSTOMER role
        AND the user MUST NOT be assigned ADMIN role
        """
        registration_data = {
            'username': 'newcustomer',
            'email': 'newcustomer@test.com',
            'password': 'NewCustomerPass123!',
            'password_confirm': 'NewCustomerPass123!',
            'first_name': 'New',
            'last_name': 'Customer'
        }
        
        response = self.client.post('/api/v1/auth/register/', 
                                  registration_data, 
                                  content_type='application/json')
        
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        data = json.loads(response.content)
        
        # Verify user was created with CUSTOMER role
        new_user = User.objects.get(email='newcustomer@test.com')
        self.assertEqual(new_user.role, 'CUSTOMER')
        self.assertFalse(new_user.is_staff)
        self.assertFalse(new_user.is_superuser)
        
        # Verify token contains CUSTOMER role
        token = data['data']['access_token']
        decoded_token = AccessToken(token)
        self.assertEqual(decoded_token['role'], 'CUSTOMER')
    
    def test_property_5_customer_login_token_generation(self):
        """
        Property 5: Customer Login Token Generation
        
        GIVEN a valid customer user
        WHEN they login successfully
        THEN they MUST receive a JWT token
        AND the token MUST be valid for 1 hour
        AND the token MUST contain correct user information
        """
        response = self.client.post('/api/v1/auth/login/', {
            'email': 'customer@test.com',
            'password': 'CustomerPass123!'
        }, content_type='application/json')
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        data = json.loads(response.content)
        
        # Verify token structure
        self.assertIn('access_token', data['data'])
        self.assertIn('expires_in', data['data'])
        self.assertEqual(data['data']['expires_in'], 3600)  # 1 hour
        self.assertEqual(data['data']['token_type'], 'Bearer')
        
        # Verify token content
        token = data['data']['access_token']
        decoded_token = AccessToken(token)
        self.assertEqual(int(decoded_token['user_id']), self.customer_user.id)
        self.assertEqual(decoded_token['role'], 'CUSTOMER')
        self.assertEqual(decoded_token['email'], 'customer@test.com')
        
        # Verify user information in response
        user_data = data['data']['user']
        self.assertEqual(user_data['email'], 'customer@test.com')
        self.assertEqual(user_data['username'], 'customer')
    
    def test_property_6_email_uniqueness_validation(self):
        """
        Property 6: Email Uniqueness Validation
        
        GIVEN an email address that already exists in the system
        WHEN a new user tries to register with that email
        THEN the registration MUST be rejected
        AND an appropriate error message MUST be returned
        """
        # Try to register with existing admin email
        registration_data = {
            'username': 'duplicate',
            'email': 'admin@test.com',  # Already exists
            'password': 'DuplicatePass123!',
            'password_confirm': 'DuplicatePass123!',
            'first_name': 'Duplicate',
            'last_name': 'User'
        }
        
        response = self.client.post('/api/v1/auth/register/', 
                                  registration_data, 
                                  content_type='application/json')
        
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        data = json.loads(response.content)
        
        # Verify error message
        self.assertFalse(data['success'])
        self.assertIn('errors', data)
        
        # Try to register with existing customer email
        registration_data['email'] = 'customer@test.com'
        response = self.client.post('/api/v1/auth/register/', 
                                  registration_data, 
                                  content_type='application/json')
        
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
    
    def test_property_7_password_security(self):
        """
        Property 7: Password Security
        
        GIVEN a user registration or password change
        WHEN a weak password is provided
        THEN the operation MUST be rejected
        AND when a strong password is provided
        THEN it MUST be properly hashed and stored
        """
        # Test weak password rejection
        weak_password_data = {
            'username': 'weakpass',
            'email': 'weakpass@test.com',
            'password': '123',  # Too weak
            'password_confirm': '123',
            'first_name': 'Weak',
            'last_name': 'Password'
        }
        
        response = self.client.post('/api/v1/auth/register/', 
                                  weak_password_data, 
                                  content_type='application/json')
        
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        
        # Test strong password acceptance
        strong_password_data = {
            'username': 'strongpass',
            'email': 'strongpass@test.com',
            'password': 'StrongPassword123!',
            'password_confirm': 'StrongPassword123!',
            'first_name': 'Strong',
            'last_name': 'Password'
        }
        
        response = self.client.post('/api/v1/auth/register/', 
                                  strong_password_data, 
                                  content_type='application/json')
        
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        
        # Verify password is hashed
        user = User.objects.get(email='strongpass@test.com')
        self.assertNotEqual(user.password, 'StrongPassword123!')
        self.assertTrue(user.password.startswith('pbkdf2_sha256'))
        self.assertTrue(user.check_password('StrongPassword123!'))
    
    def test_property_14_jwt_payload_content(self):
        """
        Property 14: JWT Payload Content
        
        GIVEN a successful authentication
        WHEN a JWT token is generated
        THEN the token payload MUST contain user_id, role, and email
        AND the payload MUST NOT contain sensitive information
        """
        response = self.client.post('/api/v1/auth/admin/login/', {
            'email': 'admin@test.com',
            'password': 'AdminPass123!'
        }, content_type='application/json')
        
        data = json.loads(response.content)
        token = data['data']['access_token']
        decoded_token = AccessToken(token)
        
        # Verify required claims are present
        required_claims = ['user_id', 'role', 'email', 'exp', 'iat', 'jti', 'token_type']
        for claim in required_claims:
            self.assertIn(claim, decoded_token, f"Required claim '{claim}' missing from token")
        
        # Verify claim values
        self.assertEqual(int(decoded_token['user_id']), self.admin_user.id)
        self.assertEqual(decoded_token['role'], 'ADMIN')
        self.assertEqual(decoded_token['email'], 'admin@test.com')
        self.assertEqual(decoded_token['token_type'], 'access')
        
        # Verify sensitive information is NOT in token
        sensitive_fields = ['password', 'is_superuser', 'is_staff']
        for field in sensitive_fields:
            self.assertNotIn(field, decoded_token, f"Sensitive field '{field}' should not be in token")
    
    def test_admin_role_restriction(self):
        """
        Test that customers cannot access admin login endpoint
        """
        response = self.client.post('/api/v1/auth/admin/login/', {
            'email': 'customer@test.com',
            'password': 'CustomerPass123!'
        }, content_type='application/json')
        
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
        data = json.loads(response.content)
        self.assertFalse(data['success'])
    
    def test_token_verification_endpoint(self):
        """
        Test token verification endpoint works correctly
        """
        # Get valid token
        login_response = self.client.post('/api/v1/auth/login/', {
            'email': 'customer@test.com',
            'password': 'CustomerPass123!'
        }, content_type='application/json')
        
        login_data = json.loads(login_response.content)
        token = login_data['data']['access_token']
        
        # Test token verification
        verify_response = self.client.get('/api/v1/auth/verify/', 
                                        HTTP_AUTHORIZATION=f'Bearer {token}')
        
        self.assertEqual(verify_response.status_code, status.HTTP_200_OK)
        verify_data = json.loads(verify_response.content)
        
        self.assertTrue(verify_data['success'])
        self.assertIn('data', verify_data)
        self.assertEqual(verify_data['data']['email'], 'customer@test.com')