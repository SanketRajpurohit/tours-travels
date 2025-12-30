from rest_framework import serializers
from .models import Review
from apps.users.serializers import UserProfileSerializer

class ReviewSerializer(serializers.ModelSerializer):
    user_details = UserProfileSerializer(source='user', read_only=True)

    class Meta:
        model = Review
        fields = [
            'id', 'user', 'tour', 'rating', 'comment',
            'is_verified', 'user_details', 'created_at'
        ]
        read_only_fields = ['id', 'user', 'is_verified', 'created_at']
