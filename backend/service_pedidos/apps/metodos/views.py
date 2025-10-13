#/backend/service_pedidos/apps/metodos/views.py
from django.shortcuts import render
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .models import MetodoCobro
from .serializer import MetodoCobroSerializer
from rest_framework.permissions import IsAuthenticated
from utils.permissions import IsSuperUser
from rest_framework.generics import ListAPIView

class MetodoCobroCrearView(APIView):
    permission_classes = [IsAuthenticated, IsSuperUser]

    def post(self, request):
        serializer = MetodoCobroSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class MetodoCobroEditarView(APIView):
    permission_classes = [IsAuthenticated, IsSuperUser]

    def put(self, request):
        id = request.query_params.get('id')
        if not id:
            return Response({'detail': 'Falta proporcionar el ID del método de cobro a editar'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            metodo_cobro = MetodoCobro.objects.get(id=id)
        except MetodoCobro.DoesNotExist:
            return Response({'detail': 'Método de cobro no encontrado'}, status=status.HTTP_404_NOT_FOUND)

        serializer = MetodoCobroSerializer(metodo_cobro, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response({'detail': 'Método de cobro editado exitosamente'}, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class MetodoCobroEliminarView(APIView):
    permission_classes = [IsAuthenticated, IsSuperUser]

    def post(self, request):
        id = request.query_params.get('id')
        if not id:
            return Response({'detail': 'Falta proporcionar el ID del método de cobro a eliminar'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            metodo_cobro = MetodoCobro.objects.get(id=id)
            metodo_cobro.delete()
            return Response({'detail': 'Método de cobro eliminado exitosamente'}, status=status.HTTP_200_OK)
        except MetodoCobro.DoesNotExist:
            return Response({'detail': 'Método de cobro no encontrado'}, status=status.HTTP_404_NOT_FOUND)


class MetodoCobroListarView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        metodos = MetodoCobro.objects.all()
        serializer = MetodoCobroSerializer(metodos, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)


class MetodoCobroBuscarView(ListAPIView):
    serializer_class = MetodoCobroSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        id = self.request.query_params.get('id')
        nombre = self.request.query_params.get('nombre')

        if id:
            return MetodoCobro.objects.filter(id=id)
        elif nombre:
            return MetodoCobro.objects.filter(nombre=nombre)
        else:
            return MetodoCobro.objects.none()
