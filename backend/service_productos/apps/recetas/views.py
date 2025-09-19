from django.shortcuts import render

# Create your views here.
from django.shortcuts import render
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .models import Receta
from .serializer import RecetaSerializer
from rest_framework.permissions import IsAuthenticated
from utils.permissions import IsSuperUser
from rest_framework.generics import ListAPIView

class RecetaCrearView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        serializer = RecetaSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class RecetaEditarView(APIView):
    permission_classes = [IsAuthenticated, IsSuperUser]

    def put(self, request):
        id = request.query_params.get('id')
        if not id:
            return Response({'detail':'Falta proporcionar el id de la receta a editar'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            receta = Receta.objects.get(id=id)
            serializer = RecetaSerializer(receta, data=request.data)
            if serializer.is_valid():
                serializer.save()
                return Response({'detail':'Receta editada exitosamente'}, status=status.HTTP_200_OK)
            else:
                return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        except Receta.DoesNotExist:
            return Response({'detail':'Receta a editar no encontrada'}, status=status.HTTP_404_NOT_FOUND)

class RecetaEliminarView(APIView):
    permission_classes = [IsAuthenticated, IsSuperUser]

    def post(self, request):
        id = request.query_params.get('id')
        if not id:
            return Response({'detail':'Falta proporcionar el id de la receta a eliminar'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            receta = Receta.objects.get(id=id)
            receta.delete()
            return Response({'detail':'Receta eliminada exitosamente'}, status=status.HTTP_200_OK)
        except Receta.DoesNotExist:
            return Response({'detail':'Receta a eliminar no encontrada'}, status=status.HTTP_400_BAD_REQUEST)

class RecetaListarView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        recetas = Receta.objects.all()
        serializer = RecetaSerializer(recetas, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

class RecetaBuscarView(ListAPIView):
    serializer_class = RecetaSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        id = self.request.query_params.get('id')
        nombre = self.request.query_params.get('nombre')

        if not id and not nombre:
            return Receta.objects.none()

        queryset = Receta.objects.all()
        if id:
            queryset = queryset.filter(id=id)
        if nombre:
            queryset = queryset.filter(nombre__icontains=nombre)
        
        return queryset