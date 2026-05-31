from django.contrib.auth.models import AbstractBaseUser, BaseUserManager, PermissionsMixin
from django.db import models
from django.utils import timezone
import random
import string


class UserManager(BaseUserManager):
    def create_user(self, username, email, password=None, **extra_fields):
        if not email:
            raise ValueError('Email address is required')
        if not username:
            raise ValueError('Username is required')
        email = self.normalize_email(email)
        user = self.model(username=username, email=email, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, username, email, password=None, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        extra_fields.setdefault('role', 'admin')
        return self.create_user(username, email, password, **extra_fields)


class User(AbstractBaseUser, PermissionsMixin):
    ROLE_CHOICES = [
        ('user', 'User'),
        ('support_staff', 'Support Staff'),
        ('admin', 'Admin'),
    ]
    name           = models.CharField(max_length=100)
    email          = models.EmailField(unique=True)
    state          = models.CharField(max_length=100, blank=True, null=True)
    contact_number = models.CharField(max_length=15)
    username       = models.CharField(max_length=50, unique=True)
    role           = models.CharField(max_length=20, choices=ROLE_CHOICES, default='user')
    is_active      = models.BooleanField(default=True)
    is_staff       = models.BooleanField(default=False)
    date_joined    = models.DateTimeField(default=timezone.now)

    objects = UserManager()

    USERNAME_FIELD  = 'username'
    REQUIRED_FIELDS = ['email', 'name']

    class Meta:
        db_table = 'auth_users'

    @staticmethod
    def generate_support_staff_username():
        """Generate unique username like support_001"""
        existing_usernames = User.objects.filter(username__startswith='support_').values_list('username', flat=True)
        existing_nums = []
        for uname in existing_usernames:
            try:
                num = int(uname.split('_')[1])
                existing_nums.append(num)
            except (IndexError, ValueError):
                pass
        if existing_nums:
            num = max(existing_nums) + 1
        else:
            num = 1
        return f"support_{num:03d}"

    def __str__(self):
        return self.username


class PasswordResetOTP(models.Model):
    user       = models.ForeignKey(User, on_delete=models.CASCADE, related_name='otps')
    otp        = models.CharField(max_length=6)
    created_at = models.DateTimeField(auto_now_add=True)
    is_used    = models.BooleanField(default=False)

    class Meta:
        db_table = 'password_reset_otps'

    def is_valid(self):
        """OTP is valid for 10 minutes."""
        elapsed = (timezone.now() - self.created_at).total_seconds()
        return not self.is_used and elapsed < 600

    @staticmethod
    def generate_otp():
        return ''.join(random.choices(string.digits, k=6))

    def __str__(self):
        return f"OTP for {self.user.username} - {'used' if self.is_used else 'active'}"


class Booking(models.Model):
    user    = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True)
    name    = models.CharField(max_length=100)
    email   = models.EmailField()
    state   = models.CharField(max_length=100, blank=True, null=True)
    package = models.CharField(max_length=200, blank=True)
    message = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'bookings'

    def __str__(self):
        return f"Booking by {self.name} for {self.package}"
