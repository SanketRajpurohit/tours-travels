from rest_framework import viewsets, status
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from .models import Payment, Invoice, Refund
from .serializers import PaymentSerializer, InvoiceSerializer, RefundSerializer
from apps.core.response import APIResponse
import uuid

class PaymentViewSet(viewsets.ModelViewSet):
    queryset = Payment.objects.all()
    serializer_class = PaymentSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        if self.request.user.is_admin:
            return Payment.objects.all()
        return Payment.objects.filter(booking__user=self.request.user)

    def perform_create(self, serializer):
        # Mock payment processing
        transaction_id = f"TXN-{uuid.uuid4().hex[:10].upper()}"
        serializer.save(status='SUCCESS', transaction_id=transaction_id)
        
        # Update booking status
        payment = serializer.instance
        booking = payment.booking
        booking.status = 'CONFIRMED'
        booking.save()

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        if serializer.is_valid():
            self.perform_create(serializer)
            return APIResponse.success(
                data=serializer.data,
                message="Payment processed successfully",
                status_code=status.HTTP_201_CREATED
            )
        return APIResponse.error(
            message="Payment failed",
            errors=serializer.errors,
            status_code=status.HTTP_400_BAD_REQUEST
        )


class InvoiceViewSet(viewsets.ModelViewSet):
    """ViewSet for managing invoices"""
    queryset = Invoice.objects.select_related('booking').all()
    serializer_class = InvoiceSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        if self.request.user.is_admin:
            return Invoice.objects.all()
        return Invoice.objects.filter(booking__user=self.request.user)


class RefundViewSet(viewsets.ModelViewSet):
    """ViewSet for managing refunds"""
    queryset = Refund.objects.select_related('payment').all()
    serializer_class = RefundSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        if self.request.user.is_admin:
            return Refund.objects.all()
        return Refund.objects.filter(payment__booking__user=self.request.user)
