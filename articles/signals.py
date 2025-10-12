from django.dispatch import receiver
from django.db.models.signals import post_save
from allauth.socialaccount.signals import social_account_added, social_account_updated
from .models import User


@receiver(social_account_added)
def set_name_on_social_add(request, sociallogin, **kwargs):
    """When a social account is first added, set the User.name combining
    provider first and last names (Google: given_name + family_name).
    """
    try:
        user = sociallogin.user
        extra = getattr(sociallogin.account, 'extra_data', {}) or {}
        first = extra.get('given_name') or extra.get('first_name') or ''
        last = extra.get('family_name') or extra.get('last_name') or ''
        full = (first + ' ' + last).strip() or extra.get('name') or user.get_full_name() or getattr(user, 'username', '')
        if full:
            user.name = full
        # also populate first_name/last_name if available
        if first and not user.first_name:
            user.first_name = first
        if last and not user.last_name:
            user.last_name = last
        user.save()
    except Exception:
        # Do not block the login flow for any unexpected error
        pass


@receiver(social_account_updated)
def set_name_on_social_update(request, sociallogin, **kwargs):
    """When social account data is updated, refresh the User.name similarly."""
    try:
        user = sociallogin.user
        extra = getattr(sociallogin.account, 'extra_data', {}) or {}
        first = extra.get('given_name') or extra.get('first_name') or ''
        last = extra.get('family_name') or extra.get('last_name') or ''
        full = (first + ' ' + last).strip() or extra.get('name') or user.get_full_name() or getattr(user, 'username', '')
        if full and user.name != full:
            user.name = full
        if first and user.first_name != first:
            user.first_name = first
        if last and user.last_name != last:
            user.last_name = last
        user.save()
    except Exception:
        pass


# Ensure that newly created User instances always have a 'name' value.
@receiver(post_save, sender=User)
def ensure_name_on_user_create(sender, instance, created, **kwargs):
    try:
        if created:
            current = (instance.name or '').strip()
            if not current:
                # Default to username when no name provided by social/provider
                instance.name = getattr(instance, 'username', '') or ''
                # Avoid recursion by saving only when changed
                instance.save(update_fields=['name'])
    except Exception:
        pass
