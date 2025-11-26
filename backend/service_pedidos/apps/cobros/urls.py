from rest_framework.routers import DefaultRouter
from .views import CobroViewSet

router = DefaultRouter()
router.register(r'cobros', CobroViewSet, basename='cobros')

urlpatterns = router.urls
