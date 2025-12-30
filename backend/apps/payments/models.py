from django.db import models
from apps.core.models import BaseModel
from apps.bookings.models import Booking


class Invoice(BaseModel):
    """
    Invoice model for bookings
    """
    STATUS_CHOICES = [
        ('UNPAID', 'Unpaid'),
        ('PAID', 'Paid'),
        ('CANCELLED', 'Cancelled'),
    ]

    booking = models.ForeignKey(
        Booking,
        related_name='invoices',
        on_delete=models.CASCADE
    )
    invoice_number = models.CharField(max_length=50, unique=True)
    amount = models.DecimalField(max_digits=12, decimal_places=2)
    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default='UNPAID'
    )
    due_date = models.DateField()
    created_date = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'payments_invoice'
        ordering = ['-created_at']
        verbose_name = 'Invoice'
        verbose_name_plural = 'Invoices'

    def __str__(self):
        return f"Invoice {self.invoice_number} for Booking {self.booking.id}"


class Refund(BaseModel):
    """
    Refund model for payments
    """
    STATUS_CHOICES = [
        ('PENDING', 'Pending'),
        ('PROCESSED', 'Processed'),
        ('REJECTED', 'Rejected'),
    ]

    payment = models.ForeignKey(
        'Payment',
        related_name='refunds',
        on_delete=models.CASCADE
    )
    amount = models.DecimalField(max_digits=12, decimal_places=2)
    reason = models.TextField()
    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default='PENDING'
    )
    processed_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        db_table = 'payments_refund'
        ordering = ['-created_at']
        verbose_name = 'Refund'
        verbose_name_plural = 'Refunds'

    def __str__(self):
        return f"Refund for Payment {self.payment.id}: {self.amount}"


class Payment(BaseModel):
    PAYMENT_METHOD_CHOICES = [
        ('CREDIT_CARD', 'Credit Card'),
        ('DEBIT_CARD', 'Debit Card'),
        ('UPI', 'UPI'),
        ('NET_BANKING', 'Net Banking'),
        ('CASH', 'Cash'),
    ]

    PAYMENT_STATUS_CHOICES = [
        ('PENDING', 'Pending'),
        ('SUCCESS', 'Success'),
        ('FAILED', 'Failed'),
        ('REFUNDED', 'Refunded'),
    ]

    booking = models.ForeignKey(
        Booking,
        on_delete=models.CASCADE,
        related_name='payments'
    )
    amount = models.DecimalField(max_digits=12, decimal_places=2)
    payment_method = models.CharField(
        max_length=20,
        choices=PAYMENT_METHOD_CHOICES,
        default='UPI'
    )
    status = models.CharField(
        max_length=20,
        choices=PAYMENT_STATUS_CHOICES,
        default='PENDING'
    )
    transaction_id = models.CharField(max_length=100, unique=True, blank=True, null=True)
    payment_date = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'payments_payment'
        ordering = ['-created_at']

    def __str__(self):
        return f"Payment {self.id} for Booking {self.booking.id}"
