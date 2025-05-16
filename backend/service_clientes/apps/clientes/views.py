from django.shortcuts import render

# Create your views here.
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
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class ClienteEditarView(APIView):
    def put(self, request, pk):
        cliente = get_object_or_404(Cliente, pk=pk)
        serializer = ClienteSerializer(cliente, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class ClienteEliminarView(APIView):
    def delete(self, request, pk):
        cliente = get_object_or_404(Cliente, pk=pk)
        cliente.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

class ClienteListarView(APIView):
    def get(self, request):
        clientes = Cliente.objects.all()
        serializer = ClienteSerializer(clientes, many=True)
        return Response(serializer.data)

class ClienteBuscarView(APIView):
    def get(self, request, pk):
        cliente = get_object_or_404(Cliente, pk=pk)
        serializer = ClienteSerializer(cliente)
        return Response(serializer.data)