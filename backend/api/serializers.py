from rest_framework import serializers
from django.contrib.auth.models import User
from .models import (
    UserProfile, Doctor, Appointment, Medicine, Order, OrderItem,
    LabTest, HealthPackage, HealthRecord, Cart, CartItem,
    EmergencyService, OnlineConsultation
)

class UserSerializer(serializers.ModelSerializer):
    phone_number = serializers.CharField(source='userprofile.phone_number', required=False)
    
    class Meta:
        model = User
        fields = ('id', 'username', 'email', 'password', 'first_name', 'last_name', 'phone_number')
        extra_kwargs = {'password': {'write_only': True}}

    def create(self, validated_data):
        profile_data = validated_data.pop('userprofile', {})
        password = validated_data.pop('password', '')
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data['email'],
            password=password
        )
        UserProfile.objects.create(user=user, **profile_data)
        return user

class UserProfileSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)

    class Meta:
        model = UserProfile
        fields = '__all__'

class DoctorSerializer(serializers.ModelSerializer):
    class Meta:
        model = Doctor
        fields = '__all__'

class AppointmentSerializer(serializers.ModelSerializer):
    doctor = DoctorSerializer(read_only=True)
    doctor_id = serializers.IntegerField(write_only=True)
    user = UserSerializer(read_only=True)
    consultation_type = serializers.CharField(required=False, default='in_clinic')
    symptoms = serializers.CharField(required=False, allow_blank=True)

    class Meta:
        model = Appointment
        fields = ('id', 'doctor', 'doctor_id', 'user', 'date', 'time_slot', 
                 'consultation_type', 'symptoms', 'status', 'created_at', 'updated_at')

    def to_representation(self, instance):
        data = super().to_representation(instance)
        # Convert status to lowercase for frontend compatibility
        data['status'] = data['status'].lower()
        return data

    def create(self, validated_data):
        doctor_id = validated_data.pop('doctor_id')
        doctor = Doctor.objects.get(id=doctor_id)
        return Appointment.objects.create(doctor=doctor, **validated_data)

class MedicineSerializer(serializers.ModelSerializer):
    class Meta:
        model = Medicine
        fields = '__all__'

class OrderItemSerializer(serializers.ModelSerializer):
    medicine = MedicineSerializer(read_only=True)

    class Meta:
        model = OrderItem
        fields = '__all__'

class OrderSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    items = OrderItemSerializer(many=True, read_only=True)

    class Meta:
        model = Order
        fields = '__all__'

class LabTestSerializer(serializers.ModelSerializer):
    class Meta:
        model = LabTest
        fields = '__all__'

class HealthPackageSerializer(serializers.ModelSerializer):
    included_tests = LabTestSerializer(many=True, read_only=True)

    class Meta:
        model = HealthPackage
        fields = '__all__'

class HealthRecordSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)

    class Meta:
        model = HealthRecord
        fields = '__all__'

class CartItemSerializer(serializers.ModelSerializer):
    medicine = MedicineSerializer(read_only=True)

    class Meta:
        model = CartItem
        fields = '__all__'

class CartSerializer(serializers.ModelSerializer):
    items = CartItemSerializer(many=True, read_only=True)
    user = UserSerializer(read_only=True)

    class Meta:
        model = Cart
        fields = '__all__'

class EmergencyServiceSerializer(serializers.ModelSerializer):
    class Meta:
        model = EmergencyService
        fields = '__all__'

class OnlineConsultationSerializer(serializers.ModelSerializer):
    doctor = DoctorSerializer(read_only=True)
    user = UserSerializer(read_only=True)

    class Meta:
        model = OnlineConsultation
        fields = '__all__'