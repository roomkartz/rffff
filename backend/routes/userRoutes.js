import express from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import nodemailer from "nodemailer";
import User from "../models/UserModel.js";
import verifyToken  from "../middleware/auth.js"; // Ensure the correct file extension

const saltRounds = 10;
const router = express.Router();



const SECRET_KEY = process.env.JWT_SECRET_KEY;
const EMAIL_USER = process.env.EMAIL_USER;
const EMAIL_PASS = process.env.EMAIL_PASS;







// Register User
router.post('/register', async (req, res) => {
  const { name, email, mobile, password, role } = req.body;
  try {
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    const newUser = new User({ name, email, mobile, password: hashedPassword, role });

    await newUser.save();

    res.status(201).json({ message: 'User registered successfully', user: newUser });
  } catch (err) {
    console.error("Error during user registration:", err);
    res.status(500).json({ message: 'Error registering user' });
  }
});



// Login user

router.post('/login', async (req, res) => {
  const { mobile, password } = req.body;

  try {
    const user = await User.findOne({ mobile });
    if (!user) return res.status(400).json({ message: 'Invalid credentials' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

    // ✅ Set user as active
    user.isActive = true;
    await user.save();

    // ✅ Create JWT with 48h expiration
    const token = jwt.sign(
      { userId: user._id, role: user.role },
      SECRET_KEY,
      { expiresIn: '2h' } // Token valid for 48 hours
    );

    // ✅ Decode the token to get expiry time
    const decoded = jwt.decode(token); // Only decodes the payload (doesn't verify)

    res.json({
      message: 'Login successful',
      token,
      user,
      expiresAt: decoded.exp * 1000 // Convert to milliseconds for frontend use
    });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ error: 'Failed to login' });
  }
});


// Delete Account Route
router.delete('/delete-account', verifyToken, async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.user.userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // You might want to add additional cleanup here (delete associated data, etc.)
    
    res.json({ status: 'success', message: 'Account deleted successfully' });
  } catch (error) {
    console.error('Delete account error:', error);
    res.status(500).json({ error: 'Failed to delete account' });
  }
});

router.post('/logout', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(401).json({ message: "Unauthorized" });

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, SECRET_KEY);
    const userId = decoded.userId;

    // Set user as inactive
    await User.findByIdAndUpdate(userId, { isActive: false });

    res.json({ message: "Logout successful" });
  } catch (err) {
    console.error("Logout error:", err);
    res.status(500).json({ message: "Logout failed" });
  }
});


router.get('/all-users', async (req, res) => {
  try {
    const users = await User.find({}, 'name mobile role isActive'); // Fetch only required fields
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});




// ✅ Reset Password (Firebase version)
router.post("/forgot-password", async (req, res) => {
  const { mobile, newPassword } = req.body;

  // Basic validation
  if (!mobile || !/^\d{10}$/.test(mobile)) {
    return res.status(400).json({ message: "Invalid mobile number" });
  }
  if (!newPassword || newPassword.length < 6) {
    return res.status(400).json({ 
      message: "Password must be at least 6 characters" 
    });
  }

  try {
    // Find user by mobile number
    const user = await User.findOne({ mobile });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Update password (OTP was already verified by Firebase)
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    await user.save();

    res.json({ 
      success: true, 
      message: "Password updated successfully" 
    });
  } catch (err) {
    console.error("Password reset error:", err);
    res.status(500).json({ 
      success: false, 
      message: "Failed to reset password" 
    });
  }
});

// Profile Route
router.get('/profile', verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select('-password -otp -otpExpires');
    if (!user) return res.status(404).json({ error: 'User not found' });

    res.json({ status: 'success', user });
  } catch (error) {
    res.status(401).json({ error: 'Invalid token' });
  }
});
router.get("/my-properties", verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select("properties");
    if (!user) return res.status(404).json({ error: "User not found" });

    res.status(200).json({ properties: user.properties });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch properties" });
  }
});
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: EMAIL_USER,
    pass: EMAIL_PASS, // your app password
  },
});
router.post("/add-property", verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);
    if (!user) return res.status(404).json({ error: "User not found" });

    const {
      address,
      near,
      description,
      rent,
      gender,
      furnishing,
      restriction,
      images,
      status,
      wifi,
      ac,
      waterSupply,
      powerBackup,
      security,
      bhk,
      bathroom,
      floor,
      totalFloors,
    } = req.body;

    const newProperty = {
      address,
      near,
      description,
      rent,
      gender,
      furnishing,
      restriction,
      images,
      status: status || "Open",
      wifi,
      ac,
      waterSupply,
      powerBackup,
      security,
      bhk,
      bathroom,
      floor,
      totalFloors,
    };

    user.properties.push(newProperty);
    await user.save();

    // Send email to notify about the new property
    const mailOptions = {
      from: '"Property Notifier" <itsayushmaurya991@gmail.com>',
      to: "ayushmaurya3596@gmail.com",
      subject: "New Property Registered",
      html: `
        <h2>New Property Details</h2>
        <p><strong>Address:</strong> ${address}</p>
        <p><strong>Description:</strong> ${description}</p>
        <p><strong>Rent:</strong> ₹${rent}</p>
        <p><strong>Near:</strong> ${near}</p>
        <p><strong>BHK:</strong> ${bhk}</p>
        <p><strong>Bathrooms:</strong> ${bathroom}</p>
        <p><strong>Floor:</strong> ${floor} (Total: ${totalFloors})</p>
        <p><strong>Gender:</strong> ${gender}</p>
        <p><strong>Furnishing:</strong> ${furnishing}</p>
        <p><strong>Restriction:</strong> ${restriction}</p>
        <p><strong>Status:</strong> ${status}</p>
        <p><strong>Amenities:</strong> 
          ${wifi ? "WiFi, " : ""} 
          ${ac ? "AC, " : ""} 
          ${waterSupply ? "Water Supply, " : ""} 
          ${powerBackup ? "Power Backup, " : ""} 
          ${security ? "Security" : ""}
        </p>
        <p><strong>Submitted By:</strong> ${user.name} (${user.email})</p>
      `,
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error("Error sending email:", error);
      } else {
        console.log("Email sent: " + info.response);
      }
    });

    res.status(200).json({ status: "success", property: newProperty });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to add property" });
  }
});
router.get("/properties", async (req, res) => {
  try {
    // Get all users with their properties
    const users = await User.find({}, "properties");

    // Flatten and merge all properties into one array
    const allProperties = users.flatMap(user => user.properties);

    res.status(200).json(allProperties);
  } catch (error) {
    console.error("Error fetching properties:", error);
    res.status(500).json({ error: "Failed to fetch properties" });
  }
});

// Update property by ID
// PUT /api/users/:id


// Update a specific property of the user
router.put("/update-property/:propertyId", verifyToken, async (req, res) => {
  try {
    const { propertyId } = req.params;
    const { rent, status } = req.body;

    // Validate input
    if (rent === undefined && status === undefined) {
      return res.status(400).json({ error: "No fields to update" });
    }

    if (rent !== undefined && (isNaN(rent) || rent <= 0)) {
      return res.status(400).json({ error: "Invalid rent amount" });
    }

    if (status && !["Open", "Closed"].includes(status)) {
      return res.status(400).json({ error: "Invalid status value" });
    }

    // Find user and the specific property
    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const propertyIndex = user.properties.findIndex(
      p => p._id.toString() === propertyId
    );

    if (propertyIndex === -1) {
      return res.status(404).json({ error: "Property not found" });
    }

    // Update the property fields
    if (rent !== undefined) {
      user.properties[propertyIndex].rent = rent;
    }
    if (status !== undefined) {
      user.properties[propertyIndex].status = status;
    }

    await user.save();

    res.status(200).json(user.properties[propertyIndex]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to update property" });
  }
});


router.delete("/delete-property/:propertyId", verifyToken, async (req, res) => {
  try {
    const { propertyId } = req.params;

    // Find the user making the request
    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Find index of the property to delete
    const propertyIndex = user.properties.findIndex(
      (p) => p._id.toString() === propertyId
    );

    if (propertyIndex === -1) {
      return res.status(404).json({ error: "Property not found" });
    }

    // Remove property from user's properties
    user.properties.splice(propertyIndex, 1);
    
    await user.save();

    res.status(200).json({ message: "Property deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to delete property" });
  }
});

export default router;
