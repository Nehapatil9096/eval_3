import bcrypt from "bcryptjs";
import User from "../models/user.model.js";
import generateTokenAndSetCookie from "../utils/generateToken.js";

export const signup = async (req, res) => {
	try {
		const { username, email, password, confirmPassword } = req.body;
		console.log(username, email, email, password, confirmPassword);

		if (password !== confirmPassword) {	
			return res.status(400).json({ error: "Passwords don't match" });
		}

		const user = await User.findOne({ username });

		if (user) {
			return res.status(400).json({ error: "Username already exists" });
		}

		// HASH PASSWORD HERE
		const salt = await bcrypt.genSalt(10);
		const hashedPassword = await bcrypt.hash(password, salt);


		const newUser = new User({
			username, 
			email,
			password: hashedPassword,
			
		});

		if (newUser) {
			// Generate JWT token here
			generateTokenAndSetCookie(newUser._id, res);
			await newUser.save();

			res.status(201).json({
				_id: newUser._id,
				username: newUser.username,
				email: newUser.email,
			});
		} else {
			res.status(400).json({ error: "Invalid user data" });
		}
	} catch (error) {
		console.log("Error in signup controller", error.message);
		res.status(500).json({ error: "Internal Server Error" });
	}
};

export const login = async (req, res) => {
	try {
	  const { email, password } = req.body;
	  const user = await User.findOne({ email });
  
	  if (!user) {
		return res.status(400).json({ error: "Invalid email/user" });
	  }
	  console.log("user retrived info:", user);

	  console.log("Email:", email);
	  console.log("Password outer :", password);
  
	  const isPasswordCorrect = await bcrypt.compare(password, user?.password || "");
  
	  if (!isPasswordCorrect) {
		return res.status(400).json({ error: "Invalid password" });
	  }
  
	  generateTokenAndSetCookie(user._id, res);
  
	  res.status(200).json({
		_id: user._id,
		username: user.username,
		email: user.email,
	  });
	} catch (error) {
	  console.log("Error in login controller", error.message);
	  res.status(500).json({ error: "Internal Server Error" });
	}
  };
  


export const logout = (req, res) => {
	try {
		res.cookie("jwt", "", { maxAge: 0 });
		res.status(200).json({ message: "Logged out successfully" });
	} catch (error) {
		console.log("Error in logout controller", error.message);
		res.status(500).json({ error: "Internal Server Error" });
	}
};
