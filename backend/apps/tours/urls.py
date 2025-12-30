"""
URL configuration for tours app
"""

from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework_nested import routers
from .views import (
    DestinationViewSet, TourViewSet, TourPackageViewSet,
    HotelViewSet, VehicleViewSet, OfferViewSet,
    CustomPackageViewSet, InquiryViewSet, SeasonViewSet,
    TourPricingViewSet, TourItineraryViewSet
)

# Create main router
router = DefaultRouter()
router.register(r'destinations', DestinationViewSet, basename='destination')
router.register(r'', TourViewSet, basename='tour')
router.register(r'hotels', HotelViewSet, basename='hotel')
router.register(r'vehicles', VehicleViewSet, basename='vehicle')
router.register(r'offers', OfferViewSet, basename='offer')
router.register(r'custom-packages', CustomPackageViewSet, basename='custompackage')
router.register(r'inquiries', InquiryViewSet, basename='inquiry')
router.register(r'seasons', SeasonViewSet, basename='season')
router.register(r'pricings', TourPricingViewSet, basename='pricing')
router.register(r'itineraries', TourItineraryViewSet, basename='itinerary')

# Create nested router for tour packages
tours_router = routers.NestedDefaultRouter(router, r'', lookup='tour')
tours_router.register(r'packages', TourPackageViewSet, basename='tour-packages')

app_name = 'tours'

urlpatterns = [
    path('', include(router.urls)),
    path('', include(tours_router.urls)),
]