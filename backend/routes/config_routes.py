from flask import Blueprint, request, jsonify
from models.config import SystemConfig
from flask_sqlalchemy import SQLAlchemy
from functools import wraps
import jwt
import os

# Crear blueprint para rutas de configuración
config_bp = Blueprint('config', __name__, url_prefix='/api/config')

# Referencia a la base de datos (se inicializará en la aplicación principal)
db = None

# Función para inicializar el blueprint con la instancia de la base de datos
def init_blueprint(database):
    global db
    db = database

# Función para verificar el token JWT
def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = None
        
        if 'Authorization' in request.headers:
            token = request.headers['Authorization'].split(" ")[1]
            
        if not token:
            return jsonify({'message': 'Token is missing!'}), 401
            
        try:
            data = jwt.decode(token, os.environ.get('SECRET_KEY', 'casamonarca_secret_key'), algorithms=["HS256"])
            from models.user import User
            current_user = User.query.filter_by(id=data['user_id']).first()
            
            # Verificar si el usuario es administrador
            if current_user.role != 'admin':
                return jsonify({'message': 'Unauthorized access!'}), 403
        except:
            return jsonify({'message': 'Token is invalid!'}), 401
            
        return f(current_user, *args, **kwargs)
    
    return decorated

# Ruta para obtener todas las configuraciones de una categoría
@config_bp.route('/<category>', methods=['GET'])
@token_required
def get_config_category(current_user, category):
    """
    Obtiene todas las configuraciones de una categoría.
    
    Args:
        category: Categoría de las configuraciones
        
    Returns:
        JSON con las configuraciones de la categoría
    """
    configs = SystemConfig.get_category(db.session, category)
    return jsonify(configs)

# Ruta para obtener una configuración específica
@config_bp.route('/<category>/<key>', methods=['GET'])
@token_required
def get_config(current_user, category, key):
    """
    Obtiene el valor de una configuración específica.
    
    Args:
        category: Categoría de la configuración
        key: Clave de la configuración
        
    Returns:
        JSON con el valor de la configuración
    """
    value = SystemConfig.get_value(db.session, category, key)
    return jsonify({'value': value})

# Ruta para establecer una configuración
@config_bp.route('/<category>/<key>', methods=['POST'])
@token_required
def set_config(current_user, category, key):
    """
    Establece el valor de una configuración.
    
    Args:
        category: Categoría de la configuración
        key: Clave de la configuración
        
    Body:
        value: Valor a establecer
        value_type: Tipo del valor (string, integer, boolean, json)
        description: Descripción de la configuración
        
    Returns:
        JSON con el resultado de la operación
    """
    data = request.get_json()
    
    if not data or 'value' not in data:
        return jsonify({'message': 'Missing value'}), 400
    
    value = data['value']
    value_type = data.get('value_type', 'string')
    description = data.get('description')
    
    config = SystemConfig.set_value(
        db.session,
        category,
        key,
        value,
        value_type,
        description
    )
    
    return jsonify({
        'message': 'Configuration updated successfully',
        'config': {
            'category': config.category,
            'key': config.key,
            'value': SystemConfig.get_value(db.session, category, key),
            'value_type': config.value_type,
            'description': config.description
        }
    })

# Ruta para establecer múltiples configuraciones de una categoría
@config_bp.route('/<category>', methods=['POST'])
@token_required
def set_config_category(current_user, category):
    """
    Establece múltiples configuraciones de una categoría.
    
    Args:
        category: Categoría de las configuraciones
        
    Body:
        JSON con las configuraciones a establecer
        
    Returns:
        JSON con el resultado de la operación
    """
    data = request.get_json()
    
    if not data:
        return jsonify({'message': 'Missing configuration data'}), 400
    
    results = {}
    
    for key, value in data.items():
        # Si el valor es un diccionario, puede contener metadatos
        if isinstance(value, dict) and 'value' in value:
            config_value = value['value']
            value_type = value.get('value_type', 'string')
            description = value.get('description')
        else:
            config_value = value
            value_type = 'string'
            description = None
        
        config = SystemConfig.set_value(
            db.session,
            category,
            key,
            config_value,
            value_type,
            description
        )
        
        results[key] = {
            'value': SystemConfig.get_value(db.session, category, key),
            'value_type': config.value_type
        }
    
    return jsonify({
        'message': 'Configurations updated successfully',
        'configs': results
    })

# Ruta para eliminar una configuración
@config_bp.route('/<category>/<key>', methods=['DELETE'])
@token_required
def delete_config(current_user, category, key):
    """
    Elimina una configuración.
    
    Args:
        category: Categoría de la configuración
        key: Clave de la configuración
        
    Returns:
        JSON con el resultado de la operación
    """
    config = db.session.query(SystemConfig).filter_by(category=category, key=key).first()
    
    if not config:
        return jsonify({'message': 'Configuration not found'}), 404
    
    db.session.delete(config)
    db.session.commit()
    
    return jsonify({'message': 'Configuration deleted successfully'})

# Ruta para obtener todas las categorías de configuración
@config_bp.route('/categories', methods=['GET'])
@token_required
def get_categories(current_user):
    """
    Obtiene todas las categorías de configuración.
    
    Returns:
        JSON con las categorías de configuración
    """
    categories = db.session.query(SystemConfig.category).distinct().all()
    return jsonify({'categories': [category[0] for category in categories]})

# Ruta para inicializar configuraciones por defecto
@config_bp.route('/initialize', methods=['POST'])
@token_required
def initialize_configs(current_user):
    """
    Inicializa las configuraciones por defecto del sistema.
    
    Returns:
        JSON con el resultado de la operación
    """
    # Configuraciones generales
    general_configs = {
        'systemName': {'value': 'CasaMonarca', 'value_type': 'string', 'description': 'Nombre del sistema'},
        'organizationName': {'value': 'Casa Monarca', 'value_type': 'string', 'description': 'Nombre de la organización'},
        'logoUrl': {'value': '', 'value_type': 'string', 'description': 'URL del logo'},
        'defaultLanguage': {'value': 'es', 'value_type': 'string', 'description': 'Idioma predeterminado'},
        'sessionTimeout': {'value': 30, 'value_type': 'integer', 'description': 'Tiempo de sesión en minutos'},
        'enableAuditLog': {'value': True, 'value_type': 'boolean', 'description': 'Habilitar registro de auditoría'}
    }
    
    # Configuraciones de correo
    email_configs = {
        'smtpServer': {'value': 'smtp.gmail.com', 'value_type': 'string', 'description': 'Servidor SMTP'},
        'smtpPort': {'value': 587, 'value_type': 'integer', 'description': 'Puerto SMTP'},
        'smtpUser': {'value': '', 'value_type': 'string', 'description': 'Usuario SMTP'},
        'smtpPassword': {'value': '', 'value_type': 'string', 'description': 'Contraseña SMTP'},
        'senderEmail': {'value': 'noreply@casamonarca.com', 'value_type': 'string', 'description': 'Correo del remitente'},
        'senderName': {'value': 'Sistema CasaMonarca', 'value_type': 'string', 'description': 'Nombre del remitente'},
        'enableEmailNotifications': {'value': True, 'value_type': 'boolean', 'description': 'Habilitar notificaciones por correo'}
    }
    
    # Configuraciones de seguridad
    security_configs = {
        'enableTwoFactor': {'value': True, 'value_type': 'boolean', 'description': 'Habilitar autenticación de dos factores'},
        'twoFactorMethod': {'value': 'email', 'value_type': 'string', 'description': 'Método de autenticación de dos factores'},
        'passwordMinLength': {'value': 8, 'value_type': 'integer', 'description': 'Longitud mínima de contraseña'},
        'passwordRequireSpecialChars': {'value': True, 'value_type': 'boolean', 'description': 'Requerir caracteres especiales en contraseñas'},
        'passwordRequireNumbers': {'value': True, 'value_type': 'boolean', 'description': 'Requerir números en contraseñas'},
        'passwordRequireUppercase': {'value': True, 'value_type': 'boolean', 'description': 'Requerir mayúsculas en contraseñas'},
        'maxLoginAttempts': {'value': 5, 'value_type': 'integer', 'description': 'Intentos máximos de inicio de sesión'},
        'lockoutDuration': {'value': 30, 'value_type': 'integer', 'description': 'Duración del bloqueo en minutos'}
    }
    
    # Configuraciones de firma digital
    signature_configs = {
        'keyPath': {'value': '/certificates/key.pem', 'value_type': 'string', 'description': 'Ruta a la clave privada'},
        'certPath': {'value': '/certificates/cert.pem', 'value_type': 'string', 'description': 'Ruta al certificado digital'},
        'caChainPaths': {'value': '', 'value_type': 'string', 'description': 'Rutas a certificados intermedios (separados por coma)'},
        'keyPassphrase': {'value': '', 'value_type': 'string', 'description': 'Contraseña de la clave privada'},
        'signatureReason': {'value': 'Firma digital de documento', 'value_type': 'string', 'description': 'Razón de la firma'},
        'signatureLocation': {'value': 'CasaMonarca', 'value_type': 'string', 'description': 'Ubicación de la firma'},
        'signatureFieldName': {'value': 'Signature', 'value_type': 'string', 'description': 'Nombre del campo de firma'}
    }
    
    # Configuraciones de almacenamiento
    storage_configs = {
        'storageType': {'value': 'onedrive', 'value_type': 'string', 'description': 'Tipo de almacenamiento'},
        'oneDriveClientId': {'value': '', 'value_type': 'string', 'description': 'Client ID de OneDrive'},
        'oneDriveClientSecret': {'value': '', 'value_type': 'string', 'description': 'Client Secret de OneDrive'},
        'oneDriveTenantId': {'value': '', 'value_type': 'string', 'description': 'Tenant ID de OneDrive'},
        'localStoragePath': {'value': '/documents', 'value_type': 'string', 'description': 'Ruta de almacenamiento local'},
        'retentionPeriod': {'value': 365, 'value_type': 'integer', 'description': 'Período de retención en días'},
        'maxFileSize': {'value': 10, 'value_type': 'integer', 'description': 'Tamaño máximo de archivo en MB'},
        'allowedFileTypes': {'value': 'pdf', 'value_type': 'string', 'description': 'Tipos de archivo permitidos'}
    }
    
    # Guardar configuraciones
    for key, config in general_configs.items():
        SystemConfig.set_value(db.session, 'general', key, config['value'], config['value_type'], config['description'])
    
    for key, config in email_configs.items():
        SystemConfig.set_value(db.session, 'email', key, config['value'], config['value_type'], config['description'])
    
    for key, config in security_configs.items():
        SystemConfig.set_value(db.session, 'security', key, config['value'], config['value_type'], config['description'])
    
    for key, config in signature_configs.items():
        SystemConfig.set_value(db.session, 'signature', key, config['value'], config['value_type'], config['description'])
    
    for key, config in storage_configs.items():
        SystemConfig.set_value(db.session, 'storage', key, config['value'], config['value_type'], config['description'])
    
    return jsonify({'message': 'Default configurations initialized successfully'})
