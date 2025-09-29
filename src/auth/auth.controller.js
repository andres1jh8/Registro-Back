import User from "../entities/users/user.model.js";
import { encrypt, checkPassword } from "../utils/encrypt.js";
import { generateToken } from "../utils/jwt.js";

/**
 * Registrar un nuevo usuario
 * - Se requiere autorización de un Admin (usernameAdmin + passwordAdmin)
 * - Valida que el email y username del nuevo usuario no estén duplicados
 * - Encripta la contraseña
 * - Por defecto los usuarios son EMPLOYEE
 */
export const registerUser = async (req, res) => {
  try {
    const { name, surname, username, email, password, phone, usernameAdmin, passwordAdmin } = req.body;

    // Validar datos del nuevo usuario
    if (!name || !surname || !username || !email || !password || !phone) {
      return res.status(400).json({ message: "Faltan datos del nuevo usuario." });
    }

    // Validar autorización del Admin
    if (!usernameAdmin || !passwordAdmin) {
      return res.status(401).json({ message: "Se requiere autorización de un administrador." });
    }

    // Buscar Admin en la DB
    const admin = await User.findOne({ username: usernameAdmin }).select("+password role");
    if (!admin) {
      return res.status(403).json({ message: "Administrador no encontrado." });
    }

    // Validar rol del Admin
    if (admin.role !== "Admin") {
      return res.status(403).json({ message: "El usuario proporcionado no tiene rol de administrador." });
    }

    // Verificar contraseña del Admin
    const validAdminPassword = await checkPassword(admin.password, passwordAdmin);
    if (!validAdminPassword) {
      return res.status(403).json({ message: "Contraseña de administrador incorrecta." });
    }

    // Verificar duplicados
    const existingUser = await User.findOne({ $or: [{ username }, { email }] });
    if (existingUser) return res.status(400).json({ message: "El email o username ya están en uso." });

    // Encriptar contraseña
    const hashedPassword = await encrypt(password);

    // Crear nuevo usuario
    const newUser = new User({
      name,
      surname,
      username,
      email,
      password: hashedPassword,
      phone,
      role: "Employee", // rol por defecto
    });

    await newUser.save();

    return res.status(201).json({
      message: "Usuario creado exitosamente con autorización de administrador.",
      user: {
        id: newUser._id,
        username: newUser.username,
        email: newUser.email,
        role: newUser.role,
      },
    });
  } catch (error) {
    console.error("❌ Error en registerUser:", error);
    return res.status(500).json({ message: "Error en el servidor", error: error.message });
  }
};

/**
 * Login
 */
export const loginUser = async (req, res) => {
  try {
    const { userlogin, password } = req.body;

    const user = await User.findOne({ $or: [{ username: userlogin }, { email: userlogin }] }).select("+password");
    if (!user) return res.status(400).json({ message: "Credenciales inválidas." });

    const isValid = await checkPassword(user.password, password);
    if (!isValid) return res.status(400).json({ message: "Credenciales inválidas." });

    const token = await generateToken({
      uid: user._id,
      username: user.username,
      role: user.role,
    });

    return res.status(200).json({ token });
  } catch (error) {
    console.error("❌ Error en loginUser:", error);
    return res.status(500).json({ message: "Error en el servidor", error: error.message });
  }
};
