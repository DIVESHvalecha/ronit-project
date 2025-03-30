from rest_framework import viewsets, status, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.views import APIView
from django.shortcuts import get_object_or_404
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.models import User
from rest_framework.authtoken.models import Token
from .models import (
    UserProfile, Doctor, Appointment, Medicine, Order, OrderItem,
    LabTest, HealthPackage, HealthRecord, Cart, CartItem,
    EmergencyService, OnlineConsultation
)
from .serializers import (
    UserSerializer, UserProfileSerializer, DoctorSerializer, AppointmentSerializer,
    MedicineSerializer, OrderSerializer, OrderItemSerializer, LabTestSerializer,
    HealthPackageSerializer, HealthRecordSerializer, CartSerializer, CartItemSerializer,
    EmergencyServiceSerializer, OnlineConsultationSerializer
)

class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_permissions(self):
        if self.action == 'register':
            return [permissions.AllowAny()]
        return super().get_permissions()

    @action(detail=False, methods=['post'])
    def register(self, request):
        serializer = UserSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            UserProfile.objects.create(user=user)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class LoginView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        email = request.data.get('email')
        password = request.data.get('password')
        
        print(f"Login attempt for email: {email}")  # Debug log
        
        try:
            user = User.objects.get(email=email)
            print(f"User found: {user.username}")  # Debug log
            
            # Try to authenticate with username
            authenticated_user = authenticate(username=user.username, password=password)
            print(f"Authentication result: {authenticated_user is not None}")  # Debug log
            
            if authenticated_user is not None:
                login(request, authenticated_user)
                token, _ = Token.objects.get_or_create(user=authenticated_user)
                serializer = UserSerializer(authenticated_user)
                response_data = {
                    'token': token.key,
                    'user': serializer.data,
                    'message': 'Login successful'
                }
                print(f"Login successful for user: {authenticated_user.username}")  # Debug log
                return Response(response_data)
            
            print("Invalid password")  # Debug log
            return Response({'error': 'Invalid credentials'}, status=status.HTTP_401_UNAUTHORIZED)
            
        except User.DoesNotExist:
            print(f"User not found for email: {email}")  # Debug log
            return Response({'error': 'User not found'}, status=status.HTTP_401_UNAUTHORIZED)
        except Exception as e:
            print(f"Unexpected error during login: {str(e)}")  # Debug log
            return Response({'error': 'An unexpected error occurred'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class LogoutView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        logout(request)
        return Response({'message': 'Successfully logged out'})

class DoctorViewSet(viewsets.ModelViewSet):
    queryset = Doctor.objects.all()
    serializer_class = DoctorSerializer
    permission_classes = [permissions.IsAuthenticated]

    @action(detail=True, methods=['get'])
    def available_slots(self, request, pk=None):
        doctor = self.get_object()
        return Response(doctor.available_slots)

class AppointmentViewSet(viewsets.ModelViewSet):
    serializer_class = AppointmentSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Appointment.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

class MedicineViewSet(viewsets.ModelViewSet):
    queryset = Medicine.objects.all()
    serializer_class = MedicineSerializer
    permission_classes = [permissions.IsAuthenticated]

class OrderViewSet(viewsets.ModelViewSet):
    serializer_class = OrderSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Order.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        cart = Cart.objects.get(user=self.request.user)
        cart_items = CartItem.objects.filter(cart=cart)
        
        # Create order
        order = serializer.save(user=self.request.user)
        
        # Create order items and clear cart
        for cart_item in cart_items:
            OrderItem.objects.create(
                order=order,
                medicine=cart_item.medicine,
                quantity=cart_item.quantity,
                price=cart_item.medicine.price
            )
            cart_item.delete()

class CartViewSet(viewsets.ModelViewSet):
    serializer_class = CartSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Cart.objects.filter(user=self.request.user)

    @action(detail=True, methods=['post'])
    def add_item(self, request, pk=None):
        cart = self.get_object()
        medicine_id = request.data.get('medicine_id')
        quantity = request.data.get('quantity', 1)
        
        medicine = get_object_or_404(Medicine, id=medicine_id)
        cart_item, created = CartItem.objects.get_or_create(
            cart=cart,
            medicine=medicine,
            defaults={'quantity': quantity}
        )
        
        if not created:
            cart_item.quantity += quantity
            cart_item.save()
        
        serializer = CartItemSerializer(cart_item)
        return Response(serializer.data)

    @action(detail=True, methods=['post'])
    def remove_item(self, request, pk=None):
        cart = self.get_object()
        medicine_id = request.data.get('medicine_id')
        
        try:
            cart_item = CartItem.objects.get(cart=cart, medicine_id=medicine_id)
            cart_item.delete()
            return Response({'message': 'Item removed from cart'})
        except CartItem.DoesNotExist:
            return Response({'error': 'Item not found in cart'}, status=status.HTTP_404_NOT_FOUND)

class LabTestViewSet(viewsets.ModelViewSet):
    queryset = LabTest.objects.all()
    serializer_class = LabTestSerializer
    permission_classes = [permissions.IsAuthenticated]

class HealthPackageViewSet(viewsets.ModelViewSet):
    queryset = HealthPackage.objects.all()
    serializer_class = HealthPackageSerializer
    permission_classes = [permissions.IsAuthenticated]

class HealthRecordViewSet(viewsets.ModelViewSet):
    serializer_class = HealthRecordSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return HealthRecord.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

class EmergencyServiceViewSet(viewsets.ModelViewSet):
    queryset = EmergencyService.objects.all()
    serializer_class = EmergencyServiceSerializer
    permission_classes = [permissions.IsAuthenticated]

class OnlineConsultationViewSet(viewsets.ModelViewSet):
    serializer_class = OnlineConsultationSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return OnlineConsultation.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)