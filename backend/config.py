import os
from dotenv import load_dotenv

# Cargar variables de entorno desde .env
load_dotenv()

class Config:
    # Configuración general
    SECRET_KEY = os.environ.get('SECRET_KEY') or 'casamonarca_secret_key'
    DEBUG = False
    TESTING = False
    
    # Configuración de la base de datos
    SQLALCHEMY_DATABASE_URI = os.environ.get('DATABASE_URL') or 'postgresql://postgres:password@localhost/casamonarca'
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    
    # Configuración de OneDrive
    ONEDRIVE_CLIENT_ID = os.environ.get('ONEDRIVE_CLIENT_ID')
    ONEDRIVE_CLIENT_SECRET = os.environ.get('ONEDRIVE_CLIENT_SECRET')
    ONEDRIVE_TENANT_ID = os.environ.get('ONEDRIVE_TENANT_ID')
    
    # Configuración de correo electrónico
    MAIL_SERVER = os.environ.get('MAIL_SERVER') or 'smtp.gmail.com'
    MAIL_PORT = int(os.environ.get('MAIL_PORT') or 587)
    MAIL_USE_TLS = os.environ.get('MAIL_USE_TLS') or True
    MAIL_USERNAME = os.environ.get('MAIL_USERNAME')
    MAIL_PASSWORD = os.environ.get('MAIL_PASSWORD')
    MAIL_DEFAULT_SENDER = os.environ.get('MAIL_DEFAULT_SENDER') or 'noreply@casamonarca.com'

class DevelopmentConfig(Config):
    DEBUG = True

class TestingConfig(Config):
    TESTING = True
    SQLALCHEMY_DATABASE_URI = 'postgresql://postgres:password@localhost/casamonarca_test'

class ProductionConfig(Config):
    # Configuración específica para producción
    pass

# Configuración para Azure
class AzureConfig(ProductionConfig):
    # Configuración específica para Azure
    SQLALCHEMY_DATABASE_URI = os.environ.get('AZURE_DATABASE_URL')
    
    # Azure Blob Storage en lugar de OneDrive
    AZURE_STORAGE_CONNECTION_STRING = os.environ.get('AZURE_STORAGE_CONNECTION_STRING')
    AZURE_STORAGE_CONTAINER_NAME = os.environ.get('AZURE_STORAGE_CONTAINER_NAME') or 'documents'

config = {
    'development': DevelopmentConfig,
    'testing': TestingConfig,
    'production': ProductionConfig,
    'azure': AzureConfig,
    'default': DevelopmentConfig
}
