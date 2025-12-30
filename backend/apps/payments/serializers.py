from rest_framework import serializers
from .models import Payment, Invoice, Refund

class InvoiceSerializer(serializers.ModelSerializer):
    """Serializer for Invoice model"""
    booking_id = serializers.IntegerField(source='booking.id', read_only=True)
    
    class Meta:
        model = Invoice
        fields = [
            'id', 'booking', 'booking_id', 'invoice_number', 'amount',
            'status', 'due_date', 'created_date', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'invoice_number', 'created_date', 'created_at', 'updated_at']


class RefundSerializer(serializers.ModelSerializer):
    """Serializer for Refund model"""
    payment_id = serializers.IntegerField(source='payment.id', read_only=True)
    
    class Meta:
        model = Refund
        fields = [
            'id', 'payment', 'payment_id', 'amount', 'reason',
            'status', 'processed_at', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'processed_at', 'created_at', 'updated_at']


class PaymentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Payment
        fields = [
            'id', 'booking', 'amount', 'payment_method',
            'status', 'transaction_id', 'payment_date',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'status', 'transaction_id', 'payment_date', 'created_at', 'updated_at']
