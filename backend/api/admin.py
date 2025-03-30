from django.contrib import admin
from .models import (
    UserProfile, Doctor, Appointment, Medicine, Order, OrderItem,
    LabTest, HealthPackage, HealthRecord, Cart, CartItem,
    EmergencyService, OnlineConsultation
)

@admin.register(UserProfile)
class UserProfileAdmin(admin.ModelAdmin):
    list_display = ('user', 'phone_number', 'gender')
    search_fields = ('user__username', 'phone_number')

@admin.register(Doctor)
class DoctorAdmin(admin.ModelAdmin):
    list_display = ('name', 'specialization', 'experience', 'consultation_fee')
    search_fields = ('name', 'specialization')
    list_filter = ('specialization',)

@admin.register(Appointment)
class AppointmentAdmin(admin.ModelAdmin):
    list_display = ('user', 'doctor', 'date', 'time_slot', 'status')
    list_filter = ('status', 'date')
    search_fields = ('user__username', 'doctor__name')

@admin.register(Medicine)
class MedicineAdmin(admin.ModelAdmin):
    list_display = ('name', 'manufacturer', 'price', 'stock', 'prescription_required')
    search_fields = ('name', 'manufacturer')
    list_filter = ('prescription_required',)

@admin.register(Order)
class OrderAdmin(admin.ModelAdmin):
    list_display = ('user', 'total_amount', 'status', 'created_at')
    list_filter = ('status', 'created_at')
    search_fields = ('user__username',)

@admin.register(OrderItem)
class OrderItemAdmin(admin.ModelAdmin):
    list_display = ('order', 'medicine', 'quantity', 'price')
    search_fields = ('order__user__username', 'medicine__name')

@admin.register(LabTest)
class LabTestAdmin(admin.ModelAdmin):
    list_display = ('name', 'price', 'turnaround_time')
    search_fields = ('name',)

@admin.register(HealthPackage)
class HealthPackageAdmin(admin.ModelAdmin):
    list_display = ('name', 'price', 'duration')
    search_fields = ('name',)

@admin.register(HealthRecord)
class HealthRecordAdmin(admin.ModelAdmin):
    list_display = ('user', 'record_type', 'uploaded_at')
    list_filter = ('record_type', 'uploaded_at')
    search_fields = ('user__username', 'record_type')

@admin.register(Cart)
class CartAdmin(admin.ModelAdmin):
    list_display = ('user', 'created_at')
    search_fields = ('user__username',)

@admin.register(CartItem)
class CartItemAdmin(admin.ModelAdmin):
    list_display = ('cart', 'medicine', 'quantity')
    search_fields = ('cart__user__username', 'medicine__name')

@admin.register(EmergencyService)
class EmergencyServiceAdmin(admin.ModelAdmin):
    list_display = ('name', 'service_type', 'contact_number', 'is_available')
    list_filter = ('service_type', 'is_available')
    search_fields = ('name',)

@admin.register(OnlineConsultation)
class OnlineConsultationAdmin(admin.ModelAdmin):
    list_display = ('user', 'doctor', 'date', 'time_slot', 'status')
    list_filter = ('status', 'date')
    search_fields = ('user__username', 'doctor__name')
