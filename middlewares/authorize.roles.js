/**
 * Middleware para autorizar el acceso a rutas basado en el rol del usuario.
 *
 * @param  {...string} roles - Los roles permitidos para acceder a la ruta.
 * @returns {Function} Middleware que verifica el rol del usuario.
 */
export const authorizeRoles = (...roles) => (req, res, next) => {
    const userRole = req.user.role; // Obtenemos el rol del usuario autenticado
  
    // 🔹 Verificar si el usuario tiene un rol permitido para la ruta
    if (!roles.includes(userRole)) {
        return res.status(403).json({ message: "Forbidden: Insufficient permissions" });
    }
  
    // 🔹 Bloquear que un CLIENT pueda cambiar su rol a ADMIN
    if (req.body.role === "Admin" && userRole !== "Admin") {
        return res.status(403).json({ message: "Forbidden: You cannot assign yourself as ADMIN" });
    }
  
    // 🔹 Permitir el acceso si todas las validaciones se cumplen
    next();

};

