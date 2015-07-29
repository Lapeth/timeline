from django.contrib.auth.forms import UserCreationForm, AuthenticationForm, PasswordChangeForm, PasswordResetForm
from django import forms
from django.utils.translation import ugettext, ugettext_lazy as _
from django.contrib.auth import authenticate

from inspect import getmembers
from pprint import pprint


class StyledUserCreationForm(UserCreationForm):
    email = forms.RegexField(
        label=_("Email"),
        max_length=40,
        regex = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$',
        help_text=_("Optional email address. Adding this will help you if you forget your password."),
        error_messages={'invalid': _("Invalid email address")},
        required=False
        )
     
    def __init__(self, request=None, *args, **kwargs):
        super(StyledUserCreationForm, self).__init__(*args, **kwargs)

        self.fields['username'].widget.attrs['class'] = 'form-control'
        self.fields['password1'].widget.attrs['class'] = 'form-control'
        self.fields['password2'].widget.attrs['class'] = 'form-control'
        self.fields['email'].widget.attrs['class'] = 'form-control'
        
    def save(self, commit=True):
        user = super(StyledUserCreationForm, self).save(commit=False)
        user.email = self.cleaned_data["email"]
        if commit:
            user.save()
        return user
       
class UserDestructionForm(forms.Form):
    username = forms.CharField(widget=forms.HiddenInput)
    password = forms.CharField(label=_("Password"), widget=forms.PasswordInput)

    error_messages = {
        'invalid_login': _("The entered password is incorrect"),
    }

    def __init__(self, request=None, *args, **kwargs):
        super(UserDestructionForm, self).__init__(*args, **kwargs)
        if request is not None:
            self.fields['username'].initial = request.user.username
    
    def clean(self):
        username = self.cleaned_data.get('username')
        password = self.cleaned_data.get('password')
        
        if username and password:
            user = authenticate(username=username, password=password)
            if user is None:
                raise forms.ValidationError(
                    self.error_messages['invalid_login'],
                    code='invalid_login',
                    params={'username': 'username'},
                )
        
        return self.cleaned_data
        
         

class StyledUserDestructionForm(UserDestructionForm):
    
    def __init__(self, request=None, *args, **kwargs):
        super(StyledUserDestructionForm, self).__init__(request, *args, **kwargs)
        self.fields['password'].widget.attrs['class'] = 'form-control'
        self.fields['password'].widget.attrs['autofocus'] = ""



class StyledAuthenticationForm(AuthenticationForm):
    def __init__(self, request=None, *args, **kwargs):
        super(StyledAuthenticationForm, self).__init__(request, *args, **kwargs)
        
        self.fields['username'].widget.attrs['class'] = 'form-control'
        self.fields['password'].widget.attrs['class'] = 'form-control'


class StyledPasswordChangeForm(PasswordChangeForm):
    def __init__(self, user=None, *args, **kwargs):
        super(StyledPasswordChangeForm, self).__init__(user, *args, **kwargs)
        
        self.fields['old_password'].widget.attrs['class'] = 'form-control'
        self.fields['new_password1'].widget.attrs['class'] = 'form-control'
        self.fields['new_password2'].widget.attrs['class'] = 'form-control'
        
class StyledPasswordResetForm(PasswordResetForm):
    def __init__(self, user=None, *args, **kwargs):
        super(StyledPasswordResetForm, self).__init__(user, *args, **kwargs)
        print "hejsa"
        self.fields['email'].widget.attrs['class'] = 'form-control'
    