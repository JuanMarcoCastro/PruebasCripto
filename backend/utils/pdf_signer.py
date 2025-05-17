import os
import logging
from pathlib import Path
from typing import Optional, Tuple, Dict, Any, List, Union
from datetime import datetime

from pyhanko.sign import signers
from pyhanko.pdf_utils.incremental_writer import IncrementalPdfFileWriter
from pyhanko.pdf_utils.reader import PdfFileReader
from pyhanko.sign.validation import validate_pdf_signature
from pyhanko_certvalidator import ValidationContext

# Configurar logging
logger = logging.getLogger(__name__)

class PDFSigner:
    """
    Clase para manejar la firma digital de documentos PDF utilizando pyHanko.
    
    Esta clase proporciona métodos para firmar documentos PDF con diferentes
    configuraciones y verificar firmas existentes.
    """
    
    def __init__(self, 
                 key_path: str,
                 cert_path: str,
                 ca_chain_paths: List[str] = None,
                 passphrase: Optional[str] = None):
        """
        Inicializa el firmante PDF con los certificados y configuraciones necesarias.
        
        Args:
            key_path: Ruta al archivo de clave privada (.pem)
            cert_path: Ruta al archivo de certificado (.pem)
            ca_chain_paths: Lista de rutas a certificados intermedios (opcional)
            passphrase: Contraseña para la clave privada si está protegida
        """
        self.key_path = key_path
        self.cert_path = cert_path
        self.ca_chain_paths = ca_chain_paths or []
        self.passphrase = passphrase
        
        # Verificar que los archivos existan
        if not os.path.exists(key_path):
            raise FileNotFoundError(f"El archivo de clave privada no existe: {key_path}")
        
        if not os.path.exists(cert_path):
            raise FileNotFoundError(f"El archivo de certificado no existe: {cert_path}")
        
        for ca_path in self.ca_chain_paths:
            if not os.path.exists(ca_path):
                raise FileNotFoundError(f"El archivo de certificado CA no existe: {ca_path}")
    
    def sign_pdf_inplace(self, 
                        pdf_path: str,
                        field_name: str = "Signature",
                        reason: str = None,
                        location: str = None) -> bool:
        """
        Firma un documento PDF en el mismo archivo.
        
        Args:
            pdf_path: Ruta al archivo PDF a firmar
            field_name: Nombre del campo de firma
            reason: Razón de la firma (opcional)
            location: Ubicación donde se realiza la firma (opcional)
            
        Returns:
            True si la operación fue exitosa, False en caso contrario
        """
        if not os.path.exists(pdf_path):
            logger.error(f"El archivo PDF no existe: {pdf_path}")
            return False
        
        try:
            # Cargar firmante
            signer = signers.SimpleSigner.load(
                self.key_path,
                self.cert_path,
                ca_chain_files=self.ca_chain_paths,
                key_passphrase=self.passphrase.encode() if self.passphrase else None
            )
            
            # Metadata para la firma
            metadata = signers.PdfSignatureMetadata(
                field_name=field_name,
                reason=reason,
                location=location
            )
            
            # Firma PDF
            pdf_signer = signers.PdfSigner(
                metadata,
                signer=signer
            )
            
            # Abrir y firmar el PDF
            with open(pdf_path, "r+b") as pdf_file:
                writer = IncrementalPdfFileWriter(pdf_file)
                pdf_signer.sign_pdf(
                    writer,
                    in_place=True,
                    output=pdf_file
                )
            
            logger.info(f"PDF firmado exitosamente: {pdf_path}")
            return True
            
        except Exception as e:
            logger.error(f"Error al firmar el PDF: {str(e)}")
            return False
    
    def sign_pdf(self, 
                input_path: str, 
                output_path: str = None,
                field_name: str = "Signature",
                reason: str = None,
                location: str = None) -> Optional[str]:
        """
        Firma un documento PDF y guarda el resultado en un nuevo archivo.
        
        Args:
            input_path: Ruta al archivo PDF de entrada
            output_path: Ruta donde se guardará el PDF firmado (si es None, se usa input_path)
            field_name: Nombre del campo de firma
            reason: Razón de la firma (opcional)
            location: Ubicación donde se realiza la firma (opcional)
            
        Returns:
            La ruta al archivo firmado si la operación fue exitosa, None en caso contrario
        """
        if not os.path.exists(input_path):
            logger.error(f"El archivo PDF no existe: {input_path}")
            return None
        
        # Si no se especifica output_path, usar input_path
        if output_path is None:
            return self.sign_pdf_inplace(input_path, field_name, reason, location)
        
        # Crear directorio de salida si no existe
        output_dir = os.path.dirname(output_path)
        if output_dir and not os.path.exists(output_dir):
            os.makedirs(output_dir)
        
        try:
            # Cargar firmante
            signer = signers.SimpleSigner.load(
                self.key_path,
                self.cert_path,
                ca_chain_files=self.ca_chain_paths,
                key_passphrase=self.passphrase.encode() if self.passphrase else None
            )
            
            # Metadata para la firma
            metadata = signers.PdfSignatureMetadata(
                field_name=field_name,
                reason=reason,
                location=location
            )
            
            # Firma PDF
            pdf_signer = signers.PdfSigner(
                metadata,
                signer=signer
            )
            
            # Abrir y firmar el PDF
            with open(input_path, 'rb') as in_file:
                writer = IncrementalPdfFileWriter(in_file)
                with open(output_path, 'wb') as out_file:
                    pdf_signer.sign_pdf(
                        writer,
                        output=out_file
                    )
            
            logger.info(f"PDF firmado exitosamente: {output_path}")
            return output_path
            
        except Exception as e:
            logger.error(f"Error al firmar el PDF: {str(e)}")
            # Si se creó un archivo de salida parcial, eliminarlo
            if os.path.exists(output_path):
                try:
                    os.remove(output_path)
                except:
                    pass
            return None
    
    @staticmethod
    def check_signatures(pdf_path: str) -> List[Dict[str, Any]]:
        """
        Verifica las firmas en un documento PDF.
        
        Args:
            pdf_path: Ruta al archivo PDF
            
        Returns:
            Lista de diccionarios con información sobre las firmas encontradas
        """
        if not os.path.exists(pdf_path):
            logger.error(f"El archivo PDF no existe: {pdf_path}")
            return []
        
        try:
            signatures = []
            with open(pdf_path, 'rb') as f:
                reader = PdfFileReader(f)
                embedded_signatures = reader.embedded_signatures
                
                for i, sig in enumerate(embedded_signatures):
                    signatures.append({
                        'index': i + 1,
                        'field_name': sig.field_name,
                        'signer_name': sig.signer_name if hasattr(sig, 'signer_name') else None,
                        'signing_time': sig.signing_time if hasattr(sig, 'signing_time') else None
                    })
            
            return signatures
                
        except Exception as e:
            logger.error(f"Error al verificar las firmas: {str(e)}")
            return []
    
    @staticmethod
    def validate_signature(pdf_path: str, field_name: Optional[str] = None) -> Dict[str, Any]:
        """
        Valida la firma digital en un documento PDF.
        
        Args:
            pdf_path: Ruta al archivo PDF firmado
            field_name: Nombre del campo de firma a validar (si es None, valida la primera firma)
            
        Returns:
            Un diccionario con los resultados de la validación
        """
        if not os.path.exists(pdf_path):
            logger.error(f"El archivo PDF no existe: {pdf_path}")
            return {'valid': False, 'error': 'Archivo no encontrado'}
        
        try:
            # Crear contexto de validación
            validation_context = ValidationContext(trust_roots=[])
            
            with open(pdf_path, 'rb') as f:
                # Validar firma
                signature = validate_pdf_signature(
                    f, 
                    sig_field_name=field_name,
                    validation_context=validation_context
                )
                
                # Extraer información relevante
                result = {
                    'valid': signature.intact and signature.valid,
                    'signer': signature.signer_reported_name,
                    'signing_time': signature.signing_time,
                    'reason': signature.sig_object.get('/Reason', ''),
                    'location': signature.sig_object.get('/Location', ''),
                    'has_timestamp': signature.has_timestamp,
                    'timestamp_valid': signature.timestamp_validity if signature.has_timestamp else None,
                    'certified': signature.docmdp_level is not None
                }
                
                return result
                
        except Exception as e:
            logger.error(f"Error al validar la firma: {str(e)}")
            return {
                'valid': False,
                'error': str(e)
            }
