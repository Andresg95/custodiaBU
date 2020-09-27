//constants

const messages = {
  EN: {
    err: {
      GEN_ERR_NOT_FOUND:
        "error => Unable to fetch records in database (most likely not existant)",
      GEN_ERR_BAD_BODY:
        "error => Sent params not as expected. (Bad request in params) ",
      GEN_ERR_BD_UNREACHABLE: "Unable to connect to database.",
      AD_CT_ERR_ADMINS_NOT_FOUND: "Admin clients not found",
      AD_CT_ERR_ADMIN_NOT_FOUND: "Unable to find requested admin.",
      AD_CT_ERR_ADMIN_UPDATE_NOT_FOUND_BY_ID:
        "Not possible to update admin. There is NOT a admin with requested id to update.",
      AD_CT_ERR_ADMIN_DELETE_NOT_FOUND_BY_ID:
        "Not possible to delete admin. Admin not found.",
      CL_CT_ERR_CLIENT_NOT_FOUND: "Unable to find requested client.",
      CL_CT_ERR_CLIENTS_NOT_FOUND: "Clients not found.",
      CL_CT_ERR_CLIENT_UPDATE_NOT_FOUND_BY_ID:
        "Not possible to update client. There is NOT a client with requested id to update.",
      CL_CT_ERR_CLIENT_DELETE_NOT_FOUND_BY_ID:
        "Not possible to delete client. Client not found.",
      CL_CT_ERR_CLIENT_DELETE_HAS_FILES:
        "This client has assigned files and cannot be deleted.",
      US_CT_ERR_USER_NOT_FOUND: "Unable to find requested user.",
      US_CT_ERR_USER_UPDATE_NOT_FOUND_BY_ID:
        "Not possible to update user. There is NOT a user with the requested id to update.",
      US_CT_ERR_USER_DELETE_NOT_FOUND_BY_ID:
        "Not possible to delete user. User not found.",
      US_CT_ERR_USER_NOT_ACCEPTED: "Not posible to accept user",
      US_CT_ERR_USER_NOT_ACCEPTED_YET: "This user has not been accepted by an administrator",
      DP_CT_ERR_DEPARTMENT_DELETE_NOT_FOUND_BY_ID:
        "Not possible to delete department. Department not found.",
      DP_CT_ERR_CLIENT_NOT_FOUND_BY_ID:
        "Not possible to create department. Client with provided id not found.",
      FL_SV_ERR_FILE_NOT_FOUND_BY_ID:
        "Not possible to delete file, found not found."
    },
    msg: {
      AD_CT_ADMIN_UPDATED_SUCCESFULLY: "Admin updated succesfully",
      AD_CT_ADMIN_DELETED_SUCCESFULLY: "Admin deleted succesfully",
      CL_CT_CLIENT_DELETED_SUCCESFULLY: "Client disabled succesfully",
      CL_CT_CLIENT_CREATED_SUCCESFULLY: "Client created succesfully",
      CL_CT_CLIENT_UPDATED_SUCCESFULLY: "Client updated succesfully",
      US_CT_USER_DELETED_SUCCESFULLY: "User deleted succesfully",
      US_CT_USER_CREATED_SUCCESFULLY: "User created succesfully",
      US_CT_USER_UPDATED_SUCCESFULLY: "User updated succesfully",
      US_CT_USER_ACCEPTED_SUCCESFULLY: "User accepted succesfully",
      DP_CT_DEPARTMENT_CREATED_SUCCESFULLY: "Department created succesfully",
      DP_CT_DEPARTMENT_DELETED_SUCCESFULLY: "Department deleted succesfully",
      FL_CT_FILE_DELETED_SUCCESFULLY: "File deleted succesfully"
    }
  },
  ES: {
    err: {
      GEN_ERR_NOT_FOUND:
        "error => No se pueden recuperar registros en la base de datos (lo más probable es que no existan)",
      GEN_ERR_BAD_BODY:
        "error => Los parámetros enviados no son como se esperaban. (Solicitud incorrecta en params)",
      GEN_ERR_BD_UNREACHABLE: "Incapaz de conectar a la base de datos.",
      CL_CT_ERR_CLIENT_NOT_FOUND:
        "No se puede encontrar el cliente solicitado.",
      CL_CT_ERR_CLIENTS_NOT_FOUND: "Clientes no encontrados.",
      CL_CT_ERR_CLIENT_UPDATE_NOT_FOUND_BY_ID:
        "No es posible actualizar el cliente. NO hay un cliente con el id solicitado para actualizar.",
      CL_CT_ERR_CLIENT_DELETE_NOT_FOUND_BY_ID:
        "No es posible eliminar el cliente. Cliente no encontrado.",
        CL_CT_ERR_CLIENT_DELETE_HAS_FILES:
        "No es posible eliminar este cliente ya que tiene archivos asignados",
      US_CT_ERR_USER_NOT_FOUND: "No se puede encontrar el usuario solicitado.",
      US_CT_ERR_USER_UPDATE_NOT_FOUND_BY_ID:
        "No es posible actualizar al usuario. NO hay un usuario con el id solicitado para actualizar.",
      US_CT_ERR_USER_DELETE_NOT_FOUND_BY_ID:
        "No es posible eliminar usuario. Usuario no encontrado.",
      US_CT_ERR_USER_NOT_ACCEPTED: "No ha sido posible aceptar al usuario.",
      US_CT_ERR_USER_NOT_ACCEPTED_YET: "Este usuario no ha sido aceptado por un administrador",
      DP_CT_ERR_DEPARTMENT_DELETE_NOT_FOUND_BY_ID:
        "No es posible eliminar el departamento. Departamento no encontrado.",
      DP_CT_ERR_CLIENT_NOT_FOUND_BY_ID:
        "No es posible agregar departamento. No hay un cliente con el id porporcionado.",
      FL_SV_ERR_FILE_NOT_FOUND_BY_ID:
        "No es posible borrar fichero. No ha sido encontrado"
    },
    msg: {
      CL_CT_CLIENT_DELETED_SUCCESFULLY: "Cliente borrado exitosamente",
      CL_CT_CLIENT_CREATED_SUCCESFULLY: "Cliente creado exitosamente",
      CL_CT_CLIENT_UPDATED_SUCCESFULLY: "Cliente actualizado exitosamente",
      US_CT_USER_DELETED_SUCCESFULLY: "Usuario borrado exitosamente",
      US_CT_USER_CREATED_SUCCESFULLY: "Usuario creado exitosamente",
      US_CT_USER_UPDATED_SUCCESFULLY: "Usuario actualizado exitosamente",
      US_CT_USER_ACCEPTED_SUCCESFULLY: "Usuario aceptado exitosamente",
      DP_CT_DEPARTMENT_CREATED_SUCCESFULLY: "Departmento creado exitosamente",
      DP_CT_DEPARTMENT_DELETED_SUCCESFULLY: "Departmento borrado exitosamente",
      FL_CT_FILE_DELETED_SUCCESFULLY: "Fichero(s) borrado exitosamente",
      FL_CT_FILE_CREATED_SUCCESFULLY: "Fichero creado y guardado exitosamente"
    }
  }
};

module.exports = messages.ES;
