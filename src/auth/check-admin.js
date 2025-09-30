import User from "../entities/users/user.model.js";
import { checkPassword } from "../utils/encrypt.js";

export const checkAdmin = async (req, res) => {
  try {
    const { usernameAdmin, passwordAdmin } = req.body;

    if (!usernameAdmin || !passwordAdmin) {
      return res.status(400).json({ valid: false, message: "Faltan datos del administrador." });
    }

    // Buscar admin con password explícito
    const admin = await User.findOne({ username: usernameAdmin }).select("+password role");

    if (!admin) {
      return res.status(404).json({ valid: false, message: "Administrador no encontrado." });
    }

    if (admin.role !== "Admin") {
      return res.status(403).json({ valid: false, message: "El usuario no tiene rol de administrador." });
    }

    console.log("🔑 Hash en DB:", admin.password);
    console.log("🔑 Password enviada:", passwordAdmin);

    const passwordValid = await checkPassword(admin.password, passwordAdmin);

    if (!passwordValid) {
      return res.status(403).json({ valid: false, message: "Contraseña de administrador incorrecta." });
    }

    return res.status(200).json({ valid: true });
  } catch (error) {
    console.error("❌ Error en checkAdmin:", error);
    return res.status(500).json({ valid: false, message: "Error en el servidor." });
  }
};
