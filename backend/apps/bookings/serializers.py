from rest_framework import serializers
from .models import Booking
from apps.tours.serializers import TourListSerializer, TourPackageSerializer

class BookingSerializer(serializers.ModelSerializer):
    tour_details = TourListSerializer(source='tour', read_only=True)
    package_details = TourPackageSerializer(source='package', read_only=True)

    class Meta:
        model = Booking
        fields = [
            'id', 'user', 'tour', 'package', 'travelers_count',
            'total_price', 'status', 'booking_date',
            'special_requests', 'tour_details', 'package_details',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'user', 'booking_date', 'created_at', 'updated_at', 'total_price']

    def create(self, validated_data):
        # Calculate total price if not provided (should be calculated on backend ideally)
        # For simplicity, we assume price is passed or handled in view
        return super().create(validated_data)
