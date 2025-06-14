from django.shortcuts import render
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .models import Producto
from .serializer import ProductoSerializer
from rest_framework.permissions import IsAuthenticated
from utils.permissions import IsSuperUser
from rest_framework.generics import ListAPIView

class ProductoCrearView(APIView):
    """!
    @brief Vista para la creación de nuevos productos.
    @details
        Esta vista hereda de APIView y permite crear un nuevo producto
        mediante una solicitud POST.
        El acceso está restringido a usuarios autenticados.
    """

    permission_classes = [IsAuthenticated]

    def post(self, request):
        """!
        @brief Maneja las solicitudes POST para crear un nuevo producto.
        @details
            Valida los datos del producto proporcionados en request.data utilizando ProductoSerializer. 
            Si son válidos, guarda el nuevo producto.
            
        @param request: Objeto de la solicitud HTTP.
        @return: 
            - Éxito: Devuelve los datos del producto creado y un estado HTTP 200 OK.
            - Fallo: Devuelve los errores de validación y un estado HTTP 400 BAD REQUEST.
        """

        serializer = ProductoSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class ProductoEditarView(APIView):
    """!
    @brief Vista para la edición de productos existentes.
    @details
        Permite actualizar un producto específico mediante una solicitud PUT.
        El ID de la producto a editar se espera como parámetro 'id' en la query string.
        Requiere que el usuario esté autenticado y sea superusuario.
    """
    permission_classes = [IsAuthenticated, IsSuperUser]

    def put(self, request):
        """!
        @brief Maneja las solicitudes PUT para editar una categoría.
        @details
            Obtiene el 'id' de la categoría de la query string de la URL.
            Intenta obtener y actualizar la categoría.
            
        @param request: Objeto de la solicitud HTTP.
        @return: 
            - Si falta el 'id', devuelve HTTP 400 BAD REQUEST.
            - Éxito en actualización: Mensaje de éxito y HTTP 200 OK.
            - Datos inválidos: Errores del serializador y HTTP 400 BAD REQUEST.
            - Categoría no encontrada: Mensaje de error y HTTP 404 NOT FOUND.
        """

        id = request.query_params.get('id')

        if not id:
            return Response({'detail':'Falta proporcionar el id del producto a editar'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            producto = Producto.objects.get(id=id)
            productoSerializer = ProductoSerializer(producto, data=request.data)

            if productoSerializer.is_valid():
                productoSerializer.save()
                return Response({'detail':'Producto editado exitosamente'}, status=status.HTTP_200_OK)
            else:
                return Response(productoSerializer.errors, status=status.HTTP_400_BAD_REQUEST)
        except:
            return Response({'detail':'Producto a editar no encontrado'}, status=status.HTTP_404_NOT_FOUND)

class ProductoEliminarView(APIView):
    """!
    @brief Vista para la eliminación de productos.
    @details
        Permite eliminar un producto específico mediante una solicitud POST.
        El ID del producto a eliminar se espera como parámetro 'id' en la query string.
        Requiere que el usuario esté autenticado y sea superusuario.
    """
    permission_classes = [IsAuthenticated, IsSuperUser]

    def post(self, request):
        """!
        @brief Maneja las solicitudes POST para eliminar un producto.
        @details
            Obtiene el 'id' del producto de la query string de la URL.
            Intenta encontrar y eliminar el producto.

        @param request: Objeto de la solicitud HTTP.
        @return: 
            - Si falta el 'id', devuelve HTTP 400 BAD REQUEST.
            - Éxito en eliminación: Mensaje de éxito y HTTP 200 OK.
            - Categoría no encontrada: Mensaje de error y HTTP 400 BAD REQUEST.
        """

        id = request.query_params.get('id')

        if not id:
            return Response({'detail':'Falta proporcionar el id del producto a eliminar'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            producto = Producto.objects.get(id=id)
            producto.delete()
            return Response({'detail':'Producto eliminado exitosamente'}, status=status.HTTP_200_OK)
        except:
            return Response({'detail':'Producto a eliminar no encontrado'}, status=status.HTTP_400_BAD_REQUEST)
        
class ProductoListarView(APIView):
    """!
    @brief Vista para listar todos los productos.
    @details
        Permite obtener una lista de todos los productos mediante una solicitud GET.
        Requiere que el usuario esté autenticado.
        No se requieren privilegios de superusuario para esta acción.
    """
    permission_classes = [IsAuthenticated]

    def get(self, request):
        """!
        @brief Maneja las solicitudes GET para listar todos las productos.
        @details
            Obtiene todas las instancias de Producto, los serializa con ProductoSerializer
            y las devuelve con un estado HTTP 200 OK.
        @param request: Objeto de la solicitud HTTP.
        @return: Respuesta HTTP 200 OK con la lista de productos serializados.
        """

        productos = Producto.objects.all()
        serializer = ProductoSerializer(productos, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

class ProductoBuscarView(ListAPIView):
    """!
    @brief Vista para buscar productos según criterios.
    @details
        Hereda de ListAPIView para facilitar la visualización de listas filtradas.
        Permite buscar productos por 'id' o 'nombre' (parámetros en query string).
        Requiere que el usuario esté autenticado.
        No se requieren privilegios de superusuario para esta acción.

    @property serializer_class: Especifica ProductoSerializer.
    @property permission_classes: Define los permisos IsAuthenticated.
    """

    serializer_class = ProductoSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        """!
        @brief Define el queryset para la búsqueda de productos.
        @details
            Filtra las productos según los parámetros 'id' o 'nombre' de la solicitud GET.
    
        @return: Queryset de Categoria filtradas.
        """
        id = self.request.query_params.get('id')
        nombre = self.request.query_params.get('nombre')

        if not id and not nombre:
            return Response({'detail':'Falta proporcionar al menos id ó nombre del producto a buscar'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            if not id:
                producto = Producto.objects.filter(nombre=nombre, disponible=True)
                return producto
            else:
                producto = Producto.objects.filter(id=id)
                return producto
        except:
            return Producto.objects.none()
