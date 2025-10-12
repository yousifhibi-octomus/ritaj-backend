from allauth.socialaccount.providers.google.views import GoogleOAuth2Adapter
from allauth.socialaccount.providers.oauth2.client import OAuth2Client as _AllAuthOAuth2Client
from dj_rest_auth.registration.views import SocialLoginView
from django.conf import settings


# Wrap AllAuth's OAuth2Client so we can accept the positional arguments
# that dj-rest-auth passes while avoiding accidentally supplying the
# same argument twice (which triggers "multiple values for argument
# 'scope_delimiter'" on some package versions).
class OAuth2ClientFactory:
    """Callable factory that returns an instance of AllAuth's OAuth2Client.

    It accepts arbitrary positional and keyword args (to match what
    dj-rest-auth may pass) and constructs the client using explicit
    keyword arguments to avoid duplicate-argument TypeErrors.
    """
    def __call__(self, *args, **kwargs):
        try:
            print('OAuth2ClientFactory called with args=', args)
            print('OAuth2ClientFactory called with kwargs=', kwargs)
        except Exception:
            pass
        # Map positional args to expected names defensively
        request = kwargs.get('request') if 'request' in kwargs else (args[0] if len(args) > 0 else None)
        client_id = kwargs.get('client_id') if 'client_id' in kwargs else (args[1] if len(args) > 1 else None)
        secret = kwargs.get('secret') if 'secret' in kwargs else (args[2] if len(args) > 2 else None)
        access_token_method = kwargs.get('access_token_method') if 'access_token_method' in kwargs else (args[3] if len(args) > 3 else None)
        access_token_url = kwargs.get('access_token_url') if 'access_token_url' in kwargs else (args[4] if len(args) > 4 else None)
        callback_url = kwargs.get('callback_url') if 'callback_url' in kwargs else (args[5] if len(args) > 5 else None)

        # Start with any other kwargs (scope, scope_delimiter, etc.) but
        # ensure we don't pass duplicate values for the same parameter.
        call_kwargs = {k: v for k, v in kwargs.items()}
        # Overwrite with our explicit values (if present)
        if request is not None:
            call_kwargs['request'] = request
        if client_id is not None:
            call_kwargs['client_id'] = client_id
        if secret is not None:
            call_kwargs['secret'] = secret
        if access_token_method is not None:
            call_kwargs['access_token_method'] = access_token_method
        if access_token_url is not None:
            call_kwargs['access_token_url'] = access_token_url
        if callback_url is not None:
            call_kwargs['callback_url'] = callback_url

        # Remove None values
        call_kwargs = {k: v for k, v in call_kwargs.items() if v is not None}
        return _AllAuthOAuth2Client(**call_kwargs)


# Compatibility subclass that accepts the positional signature dj-rest-auth uses
# and forwards everything as explicit keyword args to the real AllAuth client.
class CompatOAuth2Client(_AllAuthOAuth2Client):
    def __init__(
        self,
        request,
        client_id,
        secret,
        access_token_method,
        access_token_url,
        callback_url,
        scope=None,
        scope_delimiter=" ",
        headers=None,
        basic_auth=False,
        *args,
        **kwargs,
    ):
        # dj-rest-auth passes 'scope' as a positional argument before
        # scope_delimiter which causes AllAuth's client to receive two
        # values for scope_delimiter (positional + keyword). To be
        # compatible, ignore the incoming `scope` positional value and
        # forward only the parameters AllAuth expects.
        super().__init__(
            request,
            client_id,
            secret,
            access_token_method,
            access_token_url,
            callback_url,
            scope_delimiter=scope_delimiter,
            headers=headers,
            basic_auth=basic_auth,
        )

    def get_access_token(self, code, *args, **kwargs):
        """Exchange authorization code for access token with extra debug logging.

        This logs non-secret details (endpoint, client_id, callback_url)
        and the parsed token response where available to help diagnose
        failures like redirect_uri_mismatch or invalid_client.
        """
        try:
            # Try to collect harmless diagnostic fields without printing secrets
            info = {
                'access_token_url': getattr(self, 'access_token_url', None),
                'callback_url': getattr(self, 'callback_url', None),
                'client_id': getattr(self, 'consumer_key', None) or getattr(self, 'client_id', None),
            }
            print('OAuth2Client DEBUG: exchanging code for token, details=', info)
        except Exception:
            pass

        try:
            token = super().get_access_token(code, *args, **kwargs)
            try:
                print('OAuth2Client DEBUG: token response (truncated)=', str(token)[:1000])
            except Exception:
                pass
            return token
        except Exception as exc:
            try:
                print('OAuth2Client DEBUG: exception during token exchange:', repr(exc))
            except Exception:
                pass
            # Re-raise so existing error handling in dj-rest-auth/allauth still works
            raise

class GoogleLogin(SocialLoginView):
    adapter_class = GoogleOAuth2Adapter
    # Prefer explicit setting, but allow the frontend to POST a redirect_uri
    callback_url = getattr(settings, 'GOOGLE_OAUTH_CALLBACK', '')
    # Use compatibility class which accepts dj-rest-auth's positional
    # signature (including `scope`) and forwards only the expected
    # parameters to AllAuth's OAuth2Client.
    client_class = CompatOAuth2Client

    def get_callback_url(self):
        # Called by the allauth adapter — prefer setting, then POSTed value
        if self.callback_url:
            return self.callback_url
        # Fallback will be handled in dispatch using the incoming request
        return ''

    # dj-rest-auth's SocialLoginView uses adapter_class and expects callback_url attribute
    # We'll override dispatch to ensure adapter gets a callback_url when processing the POST
    def dispatch(self, request, *args, **kwargs):
        # attach resolved callback_url to the view instance before handling
        # Prefer settings value, otherwise read redirect_uri from the POST body
        cb = getattr(settings, 'GOOGLE_OAUTH_CALLBACK', '')
        if not cb:
            try:
                # Debug: show request info to diagnose missing redirect_uri
                try:
                    raw = (request.body.decode('utf-8', errors='replace')[:1000])
                except Exception:
                    raw = '<unavailable>'
                print('GoogleLogin DEBUG: method=', request.method, 'content_type=', getattr(request, 'content_type', None))
                print('GoogleLogin DEBUG: raw_body=', raw)
                try:
                    print('GoogleLogin DEBUG: request.data=', request.data)
                except Exception:
                    print('GoogleLogin DEBUG: request.data unavailable')
                cb = request.data.get('redirect_uri') or ''
            except Exception:
                cb = ''
        self.callback_url = cb
        # simple debug output in dev to help troubleshooting
        try:
            if self.callback_url == '':
                print('GoogleLogin: no callback_url resolved')
            else:
                print('GoogleLogin: callback_url=', self.callback_url)
        except Exception:
            pass
        return super().dispatch(request, *args, **kwargs)
