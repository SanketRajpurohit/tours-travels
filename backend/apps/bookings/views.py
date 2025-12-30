from rest_framework import viewsets, status
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from .models import Booking
from .serializers import BookingSerializer
from apps.core.response import APIResponse

class BookingViewSet(viewsets.ModelViewSet):
    queryset = Booking.objects.all()
    serializer_class = BookingSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        if self.request.user.is_admin:
            return Booking.objects.all()
        return Booking.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        # Basic price calculation logic
        tour = serializer.validated_data.get('tour')
        package = serializer.validated_data.get('package')
        count = serializer.validated_data.get('travelers_count', 1)
        
        base_price = tour.base_price
        if package:
            base_price += package.price_modifier
            
        total_price = base_price * count
        serializer.save(user=self.request.user, total_price=total_price)

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        if serializer.is_valid():
            self.perform_create(serializer)
            return APIResponse.success(
                data=serializer.data,
                message="Booking created successfully",
                status_code=status.HTTP_201_CREATED
            )
        return APIResponse.error(
            message="Booking creation failed",
            errors=serializer.errors,
            status_code=status.HTTP_400_BAD_REQUEST
        )
