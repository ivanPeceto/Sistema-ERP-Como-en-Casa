from django.shortcuts import render
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .models import Cliente
from .serializer import ClienteSerializer
from django.shortcuts import get_object_or_404

class ClienteCrearView(APIView):
    def post(self, request):
        serializer = ClienteSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_404_NOT_FOUND)

class ClienteEditarView(APIView):
    def put(self, request, pk):
        cliente = get_object_or_404(Cliente, pk=pk)
        serializer = ClienteSerializer(cliente, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_404_NOT_FOUND)

class ClienteEliminarView(APIView):
    def post(self, request, pk):
        cliente = get_object_or_404(Cliente, pk=pk)
        cliente.delete()
        return Response({'mensaje': 'Cliente eliminado correctamente.'}, status=status.HTTP_200_OK)

class ClienteListarView(APIView):
    def get(self, request):
        clientes = Cliente.objects.all()
        serializer = ClienteSerializer(clientes, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

class ClienteBuscarView(APIView):
    def get(self, request, pk):
        cliente = get_object_or_404(Cliente, pk=pk)
        serializer = ClienteSerializer(cliente)
        return Response(serializer.data, status=status.HTTP_200_OK)
