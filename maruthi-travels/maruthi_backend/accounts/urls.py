from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView
from .views import RegisterView, LoginView, AdminLoginView, LogoutView, MeView, ProfileView, ChangePasswordView, ForgotPasswordView, ResetPasswordView, BookingView, MyBookingsView, AllBookingsView, AllUsersView, UpdateUserView, AllUsersReadOnlyView, AllBookingsReadOnlyView, CreateSupportStaffView, AdminUpdateSupportStaffView, DeleteUserView, DeleteSupportStaffView

urlpatterns = [
     path('register/', RegisterView.as_view(), name='register'),
     path('login/', LoginView.as_view(), name='login'),
     path('admin-login/', AdminLoginView.as_view(), name='admin_login'),
     path('logout/', LogoutView.as_view(), name='logout'),
     path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
     path('forgot-password/', ForgotPasswordView.as_view(), name='forgot_password'),
     path('reset-password/', ResetPasswordView.as_view(), name='reset_password'),
     path('me/', MeView.as_view(), name='current_user'),
     path('book/', BookingView.as_view(), name='booking'),
     path('my-bookings/', MyBookingsView.as_view(), name='my_bookings'),
     path('all-bookings/', AllBookingsView.as_view(), name='all_bookings'),
     path('all-users/', AllUsersView.as_view(), name='all_users'),
     path('all-users-readonly/', AllUsersReadOnlyView.as_view(), name='all_users_readonly'),
     path('all-bookings-readonly/', AllBookingsReadOnlyView.as_view(), name='all_bookings_readonly'),
     path('update-user/<int:user_id>/', UpdateUserView.as_view(), name='update_user'),
     path('delete-user/<int:user_id>/', DeleteUserView.as_view(), name='delete_user'),
     path('create-support-staff/', CreateSupportStaffView.as_view(), name='create_support_staff'),
     path('update-support-staff/<int:user_id>/', AdminUpdateSupportStaffView.as_view(), name='update_support_staff'),
     path('delete-support-staff/<int:user_id>/', DeleteSupportStaffView.as_view(), name='delete_support_staff'),
 ]