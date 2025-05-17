from flask import Blueprint, request, jsonify, g
from backend.models.signature_flow import SignatureFlow
from backend.utils.auth import token_required, admin_required

signature_flow_bp = Blueprint('signature_flow', __name__)

@signature_flow_bp.route('/api/documents/<document_id>/flow', methods=['GET'])
@token_required
def get_document_flow(document_id):
    """Obtiene el flujo de firmas para un documento."""
    flow = SignatureFlow.get_document_flow(document_id)
    return jsonify({"success": True, "flow": flow})

@signature_flow_bp.route('/api/documents/<document_id>/flow', methods=['POST'])
@token_required
@admin_required
def create_flow(document_id):
    """Crea un nuevo flujo de firmas para un documento."""
    data = request.json
    required_signatures = data.get('required_signatures', [])
    
    if not required_signatures:
        return jsonify({"success": False, "message": "Se requiere al menos una firma"}), 400
    
    result = SignatureFlow.create_flow(document_id, required_signatures)
    
    if result:
        return jsonify({"success": True, "message": "Flujo de firmas creado correctamente"})
    else:
        return jsonify({"success": False, "message": "Error al crear el flujo de firmas"}), 500

@signature_flow_bp.route('/api/documents/<document_id>/sign', methods=['POST'])
@token_required
def sign_document(document_id):
    """Registra la firma de un usuario en un documento."""
    user_id = g.user_id
    user_role = g.user_role
    
    result = SignatureFlow.record_signature(document_id, user_id, user_role)
    
    if result["success"]:
        return jsonify(result)
    else:
        return jsonify(result), 400

@signature_flow_bp.route('/api/documents/pending', methods=['GET'])
@token_required
def get_pending_documents():
    """Obtiene los documentos pendientes de firma para el usuario actual."""
    user_id = g.user_id
    user_role = g.user_role
    
    documents = SignatureFlow.get_pending_signatures(user_id, user_role)
    return jsonify({"success": True, "documents": documents})
