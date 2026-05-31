from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, permissions
from rest_framework_simplejwt.tokens import RefreshToken
from django.conf import settings
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator
from .models import User, PasswordResetOTP, Booking
from .serializers import (
    RegisterSerializer, LoginSerializer,
    UserProfileSerializer, ChangePasswordSerializer,
)

DEBUG = settings.DEBUG

# import sendgrid
# from sendgrid.helpers.mail import Mail


# ── helpers ──────────────────────────────────────────────────────────────

def get_tokens_for_user(user):
    refresh = RefreshToken.for_user(user)
    return {
        'refresh': str(refresh),
        'access':  str(refresh.access_token),
    }


def set_auth_cookies(response, tokens):
    """Attach JWT tokens as HttpOnly cookies."""
    response.set_cookie(
        'access_token',
        tokens['access'],
        httponly=True,
        secure=False,        # ← set True in production (HTTPS)
        samesite='Lax',
        max_age=3600,        # 1 hour
        path='/',
    )
    response.set_cookie(
        'refresh_token',
        tokens['refresh'],
        httponly=True,
        secure=False,
        samesite='Lax',
        max_age=86400 * 7,   # 7 days
        path='/',
    )


def send_otp_email(to_email, otp):
    # Temporarily disabled email sending
    print(f"OTP for {to_email}: {otp}")  # For debugging


# ── views ─────────────────────────────────────────────────────────────────

class RegisterView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = RegisterSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            return Response(
                {'message': 'Registration successful. Please log in.',
                 'username': user.username},
                status=status.HTTP_201_CREATED,
            )
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class LoginView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = LoginSerializer(data=request.data)
        if serializer.is_valid():
            user   = serializer.validated_data['user']
            tokens = get_tokens_for_user(user)
            response = Response({
                'message': 'Login successful.',
                'user': UserProfileSerializer(user).data,
            })
            set_auth_cookies(response, tokens)
            return response
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class AdminLoginView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        data = request.data.copy()
        data['role'] = 'admin'
        serializer = LoginSerializer(data=data)
        if serializer.is_valid():
            user = serializer.validated_data['user']
            tokens = get_tokens_for_user(user)
            response = Response({
                'message': 'Admin login successful.',
                'user': UserProfileSerializer(user).data,
            })
            set_auth_cookies(response, tokens)
            return response
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class LogoutView(APIView):
    """Clear JWT cookies."""

    def post(self, request):
        response = Response({'message': 'Logged out successfully.'})
        response.delete_cookie('access_token', samesite='Lax', path='/')
        response.delete_cookie('refresh_token', samesite='Lax', path='/')
        return response


class MeView(APIView):
    """Return current user info (used by React to restore session on refresh)."""
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        return Response(UserProfileSerializer(request.user).data)


class ProfileView(APIView):
    """View & update profile."""
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        return Response(UserProfileSerializer(request.user).data)

    def put(self, request):
        serializer = UserProfileSerializer(
            request.user, data=request.data,
            partial=True, context={'request': request},
        )
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class ChangePasswordView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        serializer = ChangePasswordSerializer(data=request.data)
        if serializer.is_valid():
            user = request.user
            if not user.check_password(serializer.validated_data['old_password']):
                return Response(
                    {'old_password': 'Current password is incorrect.'},
                    status=status.HTTP_400_BAD_REQUEST,
                )
            user.set_password(serializer.validated_data['new_password'])
            user.save()
            # Re-issue tokens so the user stays logged in
            tokens   = get_tokens_for_user(user)
            response = Response({'message': 'Password changed successfully.'})
            set_auth_cookies(response, tokens)
            return response
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class ForgotPasswordView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        email = request.data.get('email', '').strip()
        if not email:
            return Response({'error': 'Email is required.'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            user = User.objects.get(email__iexact=email)
        except User.DoesNotExist:
            # Don't reveal whether the email exists
            return Response({'message': 'If this email is registered, an OTP has been sent.'})

        otp = PasswordResetOTP.generate_otp()
        PasswordResetOTP.objects.create(user=user, otp=otp)

        try:
            send_otp_email(email, otp)
        except Exception as exc:
            return Response(
                {'error': f'Failed to send email: {str(exc)}'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )

        return Response({'message': 'OTP sent to your email address.'})


class ResetPasswordView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        email            = request.data.get('email', '').strip()
        otp_value        = request.data.get('otp', '').strip()
        new_password     = request.data.get('new_password', '')
        confirm_password = request.data.get('confirm_password', '')

        if not all([email, otp_value, new_password, confirm_password]):
            return Response({'error': 'All fields are required.'}, status=status.HTTP_400_BAD_REQUEST)

        if new_password != confirm_password:
            return Response({'error': 'Passwords do not match.'}, status=status.HTTP_400_BAD_REQUEST)

        if len(new_password) < 8:
            return Response({'error': 'Password must be at least 8 characters.'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            user    = User.objects.get(email__iexact=email)
            otp_obj = PasswordResetOTP.objects.filter(
                user=user, otp=otp_value, is_used=False
            ).latest('created_at')
        except (User.DoesNotExist, PasswordResetOTP.DoesNotExist):
            return Response({'error': 'Invalid OTP.'}, status=status.HTTP_400_BAD_REQUEST)

        if not otp_obj.is_valid():
            return Response({'error': 'OTP has expired. Please request a new one.'}, status=status.HTTP_400_BAD_REQUEST)

        user.set_password(new_password)
        user.save()
        otp_obj.is_used = True
        otp_obj.save()

        return Response({'message': 'Password reset successful. Please log in.'})


class BookingView(APIView):
    permission_classes = [permissions.AllowAny]  # Allow anyone to book

    def post(self, request):
        name = request.data.get('name', '').strip()
        email = request.data.get('email', '').strip()
        package = request.data.get('package', '').strip()
        message = request.data.get('message', '').strip()
        state = request.data.get('state', '').strip() or (request.user.state if request.user.is_authenticated else '')

        if not all([name, email, message]):
            return Response({'error': 'Name, email, and message are required.'}, status=status.HTTP_400_BAD_REQUEST)

        # Optional: link to user if logged in
        user = None
        if request.user.is_authenticated:
            user = request.user
            # Use user's state if not provided explicitly
            if not state and user.state:
                state = user.state

        booking = Booking.objects.create(
            user=user,
            name=name,
            email=email,
            state=state or None,
            package=package,
            message=message,
        )

        return Response({'message': 'Booking submitted successfully.'}, status=status.HTTP_201_CREATED)


class MyBookingsView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        bookings = Booking.objects.filter(user=request.user).order_by('-created_at')
        data = [
            {
                'id': b.id,
                'name': b.name,
                'email': b.email,
                'state': b.state,
                'package': b.package,
                'message': b.message,
                'created_at': b.created_at.isoformat(),
            }
            for b in bookings
        ]
        return Response(data)


class AllBookingsView(APIView):
    permission_classes = [permissions.IsAdminUser]

    def get(self, request):
        bookings = Booking.objects.select_related('user').order_by('-created_at')
        data = [
            {
                'id': b.id,
                'name': b.name,
                'email': b.email,
                'state': b.state,
                'package': b.package,
                'message': b.message,
                'user_id': b.user.id if b.user else None,
                'created_at': b.created_at.isoformat(),
            }
            for b in bookings
        ]
        return Response(data)


class AllBookingsReadOnlyView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        if request.user.role != 'support_staff':
            return Response({'error': 'Access denied'}, status=status.HTTP_403_FORBIDDEN)

        # Filter bookings where user's state or booking's state matches support staff's state
        support_staff_state = request.user.state
        if support_staff_state:
            from django.db.models import Q
            bookings = Booking.objects.filter(
                Q(user__state=support_staff_state) | Q(state=support_staff_state)
            ).select_related('user').order_by('-created_at')
        else:
            bookings = Booking.objects.none()

        data = [
            {
                'id': b.id,
                'name': b.name,
                'email': b.email,
                'state': b.user.state if b.user else b.state,
                'package': b.package,
                'message': b.message,
                'user_id': b.user.id if b.user else None,
                'created_at': b.created_at.isoformat(),
            }
            for b in bookings
        ]
        return Response(data)


class AllUsersView(APIView):
    permission_classes = [permissions.IsAdminUser]

    def get(self, request):
        users = User.objects.order_by('-date_joined')
        data = [
            {
                'id': u.id,
                'name': u.name,
                'email': u.email,
                'username': u.username,
                'contact_number': u.contact_number,
                'state': u.state,
                'role': u.role,
                'is_staff': u.is_staff,
                'is_active': u.is_active,
                'date_joined': u.date_joined.isoformat(),
            }
            for u in users
        ]
        return Response(data)


class AllUsersReadOnlyView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        if request.user.role != 'support_staff':
            return Response({'error': 'Access denied'}, status=status.HTTP_403_FORBIDDEN)

        # Filter users by the state of the logged-in support staff
        support_staff_state = request.user.state
        if support_staff_state:
            # Only show users from the same state who have placed bookings (active customers)
            users = User.objects.filter(state=support_staff_state, role='user').order_by('-date_joined')
        else:
            users = User.objects.none()

        data = [
            {
                'id': u.id,
                'name': u.name,
                'email': u.email,
                'username': u.username,
                'contact_number': u.contact_number,
                'state': u.state,
                'role': u.role,
                'is_active': u.is_active,
                'date_joined': u.date_joined.isoformat(),
            }
            for u in users
        ]
        return Response(data)


class UpdateUserView(APIView):
    permission_classes = [permissions.IsAdminUser]

    def put(self, request, user_id):
        try:
            user = User.objects.get(id=user_id)
        except User.DoesNotExist:
            return Response({'error': 'User not found'}, status=status.HTTP_404_NOT_FOUND)

        name = request.data.get('name')
        email = request.data.get('email')
        contact_number = request.data.get('contact_number')
        state = request.data.get('state')
        role = request.data.get('role')
        is_staff = request.data.get('is_staff')
        is_active = request.data.get('is_active')

        if name is not None:
            user.name = name
        if email is not None:
            user.email = email
        if contact_number is not None:
            user.contact_number = contact_number
        if state is not None:
            user.state = state
        if role is not None:
            user.role = role
        if is_staff is not None:
            user.is_staff = is_staff
        if is_active is not None:
            user.is_active = is_active

        user.save()
        return Response({
            'id': user.id,
            'name': user.name,
            'email': user.email,
            'username': user.username,
            'contact_number': user.contact_number,
            'state': user.state,
            'role': user.role,
            'is_staff': user.is_staff,
            'is_active': user.is_active,
            'message': 'User updated successfully'
        })


@method_decorator(csrf_exempt, name='dispatch')
class CreateSupportStaffView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        if request.user.role != 'admin':
            return Response({'error': 'Admin access required.'}, status=status.HTTP_403_FORBIDDEN)

        name = request.data.get('name', '').strip()
        email = request.data.get('email', '').strip()
        username = request.data.get('username', '').strip()
        password = request.data.get('password', '').strip()
        contact_number = request.data.get('contact_number', '').strip()
        state = request.data.get('state', '').strip()

        if not all([name, email, username, password, contact_number, state]):
            return Response({'error': 'All fields including state are required.'}, status=status.HTTP_400_BAD_REQUEST)

        if User.objects.filter(email__iexact=email).exists():
            return Response({'error': 'Email already exists.'}, status=status.HTTP_400_BAD_REQUEST)

        if User.objects.filter(username__iexact=username).exists():
            return Response({'error': 'Username already taken.'}, status=status.HTTP_400_BAD_REQUEST)

        if len(password) < 8:
            return Response({'error': 'Password must be at least 8 characters.'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            user = User.objects.create_user(
                username=username,
                email=email,
                password=password,
                name=name,
                contact_number=contact_number,
                state=state,
                role='support_staff'
            )
            user.save()
        except Exception as e:
            print(f"Error creating user: {e}")
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

        return Response({
            'id': user.id,
            'name': user.name,
            'email': user.email,
            'username': user.username,
            'password': password,
            'contact_number': user.contact_number,
            'state': user.state,
            'role': user.role,
            'message': 'Support staff created successfully'
        })


class AdminUpdateSupportStaffView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def put(self, request, user_id):
        if request.user.role != 'admin':
            return Response({'error': 'Admin access required.'}, status=status.HTTP_403_FORBIDDEN)

        try:
            user = User.objects.get(id=user_id, role='support_staff')
        except User.DoesNotExist:
            return Response({'error': 'Support staff not found.'}, status=status.HTTP_404_NOT_FOUND)

        state = request.data.get('state')
        if state is not None:
            user.state = state.strip()
            user.save()
            return Response({
                'id': user.id,
                'name': user.name,
                'email': user.email,
                'state': user.state,
                'message': 'Support staff state updated successfully'
            })
        return Response({'error': 'State is required.'}, status=status.HTTP_400_BAD_REQUEST)


class DeleteUserView(APIView):
    permission_classes = [permissions.IsAdminUser]

    def delete(self, request, user_id):
        try:
            user = User.objects.get(id=user_id)
        except User.DoesNotExist:
            return Response({'error': 'User not found'}, status=status.HTTP_404_NOT_FOUND)

        # Prevent deleting self
        if user.id == request.user.id:
            return Response({'error': 'Cannot delete your own account'}, status=status.HTTP_400_BAD_REQUEST)

        username = user.username
        user.delete()
        return Response({'message': f'User {username} deleted successfully'})


class DeleteSupportStaffView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def delete(self, request, user_id):
        if request.user.role != 'admin':
            return Response({'error': 'Admin access required.'}, status=status.HTTP_403_FORBIDDEN)

        try:
            user = User.objects.get(id=user_id, role='support_staff')
        except User.DoesNotExist:
            return Response({'error': 'Support staff not found.'}, status=status.HTTP_404_NOT_FOUND)

        username = user.username
        user.delete()
        return Response({'message': f'Support staff {username} deleted successfully'})
