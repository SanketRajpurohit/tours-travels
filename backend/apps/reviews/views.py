from rest_framework import viewsets, status
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticatedOrReadOnly
from .models import Review
from .serializers import ReviewSerializer
from apps.core.response import APIResponse

class ReviewViewSet(viewsets.ModelViewSet):
    queryset = Review.objects.all()
    serializer_class = ReviewSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]

    def get_queryset(self):
        tour_id = self.request.query_params.get('tour')
        if tour_id:
            return Review.objects.filter(tour_id=tour_id, is_verified=True)
        return Review.objects.filter(is_verified=True)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

    def create(self, request, *args, **kwargs):
        if not request.user.is_authenticated:
            return APIResponse.error(
                message="Authentication required to post a review",
                status_code=status.HTTP_401_UNAUTHORIZED
            )
            
        serializer = self.get_serializer(data=request.data)
        if serializer.is_valid():
            self.perform_create(serializer)
            return APIResponse.success(
                data=serializer.data,
                message="Review submitted successfully. It will be visible after verification.",
                status_code=status.HTTP_201_CREATED
            )
        return APIResponse.error(
            message="Review submission failed",
            errors=serializer.errors,
            status_code=status.HTTP_400_BAD_REQUEST
        )
