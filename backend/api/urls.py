from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    UserViewSet, LoginView, LogoutView, DoctorViewSet, AppointmentViewSet,
    MedicineViewSet, OrderViewSet, CartViewSet, LabTestViewSet,
    HealthPackageViewSet, HealthRecordViewSet, EmergencyServiceViewSet,
    OnlineConsultationViewSet
)

router = DefaultRouter()
router.register(r'users', UserViewSet)
router.register(r'doctors', DoctorViewSet)
router.register(r'appointments', AppointmentViewSet, basename='appointment')
router.register(r'medicines', MedicineViewSet)
router.register(r'orders', OrderViewSet, basename='order')
router.register(r'cart', CartViewSet, basename='cart')
router.register(r'lab-tests', LabTestViewSet)
router.register(r'health-packages', HealthPackageViewSet)
router.register(r'health-records', HealthRecordViewSet, basename='health-record')
router.register(r'emergency-services', EmergencyServiceViewSet)
router.register(r'online-consultations', OnlineConsultationViewSet, basename='online-consultation')

urlpatterns = [
    path('', include(router.urls)),
    path('login/', LoginView.as_view(), name='login'),
    path('logout/', LogoutView.as_view(), name='logout'),
]