from flask import Blueprint, request, jsonify
from functools import wraps
from models.permissions import get_all_permissions, get_permissions_by_role, get_permissions_by_roles, update_role_permissions

permissions_bp = Blueprint('permissions', __name__)

# Función para verificar si el usuario tiene permiso para gestionar permisos
def require_permission(permission_code):
    def decorator(f):
        @wraps(f)
        def decorated_function(current_user, *args, **kwargs):
            from models.permissions import get_permissions_by_role
            
            user_permissions = get_permissions_by_role(current_user.role)
            permission_codes = [p['code'] for p in user_permissions]
            
            if permission_code not in permission_codes:
                return jsonify({'message': 'Unauthorized: Missing required permission'}), 403
                
            return f(current_user, *args, **kwargs)
        return decorated_function
    return decorator

@permissions_bp.route('/api/permissions', methods=['GET'])
def get_permissions(current_user):
    # Verificar si el usuario tiene permisos para gestionar permisos
    if current_user.role != 'admin':
        return jsonify({'message': 'Unauthorized'}), 403
    
    permissions = get_all_permissions()
    return jsonify({'permissions': permissions})

@permissions_bp.route('/api/permissions/roles', methods=['GET'])
def get_role_permissions(current_user):
    # Verificar si el usuario tiene permisos para gestionar permisos
    if current_user.role != 'admin':
        return jsonify({'message': 'Unauthorized'}), 403
    
    role_permissions = get_permissions_by_roles()
    return jsonify({'role_permissions': role_permissions})

@permissions_bp.route('/api/permissions/roles/<role>', methods=['GET'])
def get_specific_role_permissions(current_user, role):
    # Verificar si el usuario tiene permisos para gestionar permisos
    if current_user.role != 'admin':
        return jsonify({'message': 'Unauthorized'}), 403
    
    # Verificar que el rol sea válido
    valid_roles = ["admin", "sub_admin", "management", "employer", "public"]
    if role not in valid_roles:
        return jsonify({'message': 'Invalid role'}), 400
    
    permissions = get_permissions_by_role(role)
    return jsonify({'permissions': permissions})

@permissions_bp.route('/api/permissions/roles/<role>', methods=['PUT'])
def update_permissions(current_user, role):
    # Verificar si el usuario tiene permisos para gestionar permisos
    if current_user.role != 'admin':
        return jsonify({'message': 'Unauthorized'}), 403
    
    # Verificar que el rol sea válido
    valid_roles = ["admin", "sub_admin", "management", "employer", "public"]
    if role not in valid_roles:
        return jsonify({'message': 'Invalid role'}), 400
    
    data = request.get_json()
    
    if not data or 'permission_ids' not in data:
        return jsonify({'message': 'Missing permission_ids field'}), 400
    
    # No permitir modificar los permisos del rol admin
    if role == 'admin':
        return jsonify({'message': 'Cannot modify admin permissions'}), 403
    
    success = update_role_permissions(role, data['permission_ids'])
    
    if success:
        return jsonify({'message': f'Permissions for role {role} updated successfully'})
    else:
        return jsonify({'message': 'Error updating permissions'}), 500
