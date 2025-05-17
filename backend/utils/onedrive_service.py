import os
import requests
from msal import ConfidentialClientApplication
from flask import current_app

class OneDriveService:
    @staticmethod
    def get_token():
        """
        Obtiene un token de acceso para la API de Microsoft Graph.
        
        Returns:
            str: Token de acceso o None si hay un error
        """
        try:
            client_id = current_app.config['ONEDRIVE_CLIENT_ID']
            client_secret = current_app.config['ONEDRIVE_CLIENT_SECRET']
            tenant_id = current_app.config['ONEDRIVE_TENANT_ID']
            authority = f'https://login.microsoftonline.com/{tenant_id}'
            scope = ['https://graph.microsoft.com/.default']
            
            app = ConfidentialClientApplication(
                client_id,
                authority=authority,
                client_credential=client_secret
            )
            
            result = app.acquire_token_for_client(scopes=scope)
            
            if "access_token" in result:
                return result['access_token']
            else:
                print(f"Error al obtener token: {result.get('error')}")
                print(f"Descripción: {result.get('error_description')}")
                return None
        except Exception as e:
            print(f"Error en get_token: {str(e)}")
            return None
    
    @staticmethod
    def upload_file(file_path, file_name, folder_path=None):
        """
        Sube un archivo a OneDrive.
        
        Args:
            file_path: Ruta local del archivo
            file_name: Nombre del archivo en OneDrive
            folder_path: Ruta de la carpeta en OneDrive (opcional)
        
        Returns:
            str: ID del archivo en OneDrive o None si hay un error
        """
        token = OneDriveService.get_token()
        
        if not token:
            return None
        
        try:
            headers = {
                'Authorization': f'Bearer {token}',
                'Content-Type': 'application/octet-stream'
            }
            
            # Determinar la URL de destino
            if folder_path:
                url = f'https://graph.microsoft.com/v1.0/me/drive/root:/{folder_path}/{file_name}:/content'
            else:
                url = f'https://graph.microsoft.com/v1.0/me/drive/root:/Documents/{file_name}:/content'
            
            with open(file_path, 'rb') as file:
                response = requests.put(url, headers=headers, data=file)
            
            if response.status_code in [200, 201]:
                return response.json().get('id')
            else:
                print(f"Error al subir archivo: {response.status_code}")
                print(f"Respuesta: {response.text}")
                return None
        except Exception as e:
            print(f"Error en upload_file: {str(e)}")
            return None
    
    @staticmethod
    def download_file(file_id, destination_path):
        """
        Descarga un archivo de OneDrive.
        
        Args:
            file_id: ID del archivo en OneDrive
            destination_path: Ruta local donde guardar el archivo
        
        Returns:
            bool: True si la descarga fue exitosa, False en caso contrario
        """
        token = OneDriveService.get_token()
        
        if not token:
            return False
        
        try:
            headers = {
                'Authorization': f'Bearer {token}'
            }
