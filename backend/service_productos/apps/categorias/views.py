from django.shortcuts import render
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .models import Categoria
from .serializer import CategoriaSerializer
from rest_framework.permissions import IsAuthenticated
from utils.permissions import IsSuperUser
from rest_framework.generics import ListAPIView

class CategoriaCrearView(APIView):
    """!
    @brief Vista para la creación de nuevas categorías de productos.
    @details
        Esta vista hereda de APIView y permite crear una nueva categoría
        mediante una solicitud POST.
        El acceso está restringido a usuarios autenticados.
    """
    permission_classes = [IsAuthenticated]

    def post(self, request):
        """!
        @brief Maneja las solicitudes POST para crear una nueva categoría.
        @details
            Valida los datos de la categoría proporcionados en request.data utilizando CategoriaSerializer. 
            Si son válidos, guarda la nueva categoría.
            
        @param request: Objeto de la solicitud HTTP.
        @return: 
            - Éxito: Devuelve los datos de la categoría creada y un estado HTTP 200 OK.
            - Fallo: Devuelve los errores de validación y un estado HTTP 400 BAD REQUEST.
        """
        serializer = CategoriaSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class CategoriaEditarView(APIView):
    """!
    @brief Vista para la edición de categorías de productos existentes.
    @details
        Permite actualizar una categoría específica mediante una solicitud PUT.
        El ID de la categoría a editar se espera como parámetro 'id' en la query string.
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
            return Response({'detail':'Falta proporcionar el id del categoría a editar'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            categoria = Categoria.objects.get(id=id)
            categoriaSerializer = CategoriaSerializer(categoria, data=request.data)

            if categoriaSerializer.is_valid():
                categoriaSerializer.save()
                return Response({'detail':'Categoría editada exitosamente'}, status=status.HTTP_200_OK)
            else:
                return Response(categoriaSerializer.errors, status=status.HTTP_400_BAD_REQUEST)
        except:
            return Response({'detail':'Categoría a editar no encontrada'}, status=status.HTTP_404_NOT_FOUND)

class CategoriaEliminarView(APIView):
    """!
    @brief Vista para la eliminación de categorías de productos.
    @details
        Permite eliminar una categoría específica mediante una solicitud POST.
        El ID de la categoría a eliminar se espera como parámetro 'id' en la query string.
        Requiere que el usuario esté autenticado y sea superusuario.
    """

    permission_classes = [IsAuthenticated, IsSuperUser]

    def post(self, request):
        """!
        @brief Maneja las solicitudes POST para eliminar una categoría.
        @details
            Obtiene el 'id' de la categoría de la query string de la URL.
            Intenta encontrar y eliminar la categoría.

        @param request: Objeto de la solicitud HTTP.
        @return: 
            - Si falta el 'id', devuelve HTTP 400 BAD REQUEST.
            - Éxito en eliminación: Mensaje de éxito y HTTP 200 OK.
            - Categoría no encontrada: Mensaje de error y HTTP 400 BAD REQUEST.
        """

        id = request.query_params.get('id')

        if not id:
            return Response({'detail':'Falta proporcionar el id del categoría a eliminar'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            categoria = Categoria.objects.get(id=id)
            categoria.delete()
            return Response({'detail':'Categoría eliminada exitosamente'}, status=status.HTTP_200_OK)
        except:
            return Response({'detail':'Categoría a eliminar no encontrada'}, status=status.HTTP_400_BAD_REQUEST)
        
class CategoriaListarView(APIView):
    """!
    @brief Vista para listar todas las categorías de productos.
    @details
        Permite obtener una lista de todas las categorías mediante una solicitud GET.
        Requiere que el usuario esté autenticado.
        No se requieren privilegios de superusuario para esta acción.
    """
    permission_classes = [IsAuthenticated]

    def get(self, request):
        """!
        @brief Maneja las solicitudes GET para listar todas las categorías.
        @details
            Obtiene todas las instancias de Categoria, las serializa con CategoriaSerializer
            y las devuelve con un estado HTTP 200 OK.
        @param request: Objeto de la solicitud HTTP.
        @return: Respuesta HTTP 200 OK con la lista de categorías serializadas.
        """
        categoria = Categoria.objects.all()
        serializer = CategoriaSerializer(categoria, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

class CategoriaBuscarView(ListAPIView):
    """!
    @brief Vista para buscar categorías de productos según criterios.
    @details
        Hereda de ListAPIView para facilitar la visualización de listas filtradas.
        Permite buscar categorías por 'id' o 'nombre' (parámetros en query string).
        Requiere que el usuario esté autenticado.
        No se requieren privilegios de superusuario para esta acción.

    @property serializer_class: Especifica CategoriaSerializer.
    @property permission_classes: Define los permisos IsAuthenticated.
    """

    serializer_class = CategoriaSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        """!
        @brief Define el queryset para la búsqueda de categorías.
        @details
            Filtra las categorías según los parámetros 'id' o 'nombre' de la solicitud GET.
    
        @return: Queryset de Categoria filtradas.
        """
        id = self.request.query_params.get('id')
        nombre = self.request.query_params.get('nombre')

        if not id and not nombre:
            return Response({'detail':'Falta proporcionar al menos id ó nombre de la categoría a buscar'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            if not id:
                categoria = Categoria.objects.filter(nombre=nombre)
                return categoria
            else:
                categoria = Categoria.objects.filter(id=id)
                return categoria
        except:
            return Categoria.objects.none()
