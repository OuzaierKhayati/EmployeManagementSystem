import express from 'express';
import con from "../utils/db.js";
import jwt from "jsonwebtoken";
import bcrypt from 'bcrypt';
import axios from 'axios';
import crypto from 'crypto';

const router = express.Router();

// AES Encryption
function aesEncrypt(text, key) {
  const cipher = crypto.createCipheriv('aes-128-ecb', Buffer.from(key), null);
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  return encrypted;
}

// Cesar Encryption
function cesarEncrypt(text, shift) {
  const shiftAmount = shift % 26;
  return text.replace(/[a-zA-Z]/g, (char) => {
      const base = char >= 'a' ? 97 : 65; // ASCII for 'a' or 'A'
      return String.fromCharCode(((char.charCodeAt(0) - base + shiftAmount) % 26) + base);
  });
}

router.post("/employee_login", async (req, res) => {
  const { email, password, recaptchaToken } = req.body;

  const secretKey = '6LefZI4qAAAAACPk5eCR6_gHJ9dzNJNSZcorfwqg'; // Your reCAPTCHA secret key

  try {
    // Step 1: Verify the reCAPTCHA token
    const recaptchaUrl = `https://www.google.com/recaptcha/api/siteverify?secret=${secretKey}&response=${recaptchaToken}`;
    const response = await axios.post(recaptchaUrl);

    if (!response.data.success) {
      return res.json({ loginStatus: false, Error: "reCAPTCHA verification failed" });
    }

    // Step 2: Query the database for the user
    const sql = "SELECT * FROM employee WHERE email = ?";
    con.query(sql, [email], async (err, result) => {
      if (err) {
        return res.json({ loginStatus: false, Error: "Query error" });
      }

      if (result.length === 0) {
        return res.json({ loginStatus: false, Error: "Wrong email or password" });
      }

      // Extract user data
      const { cryptMethod, inputValue, password: passwordCrypt, id } = result[0];

      // Step 3: Verify password based on cryptMethod
      try {
        let isPasswordValid = false;

        if (cryptMethod === "AES") {
          const key = inputValue;
          const passwordDec = aesEncrypt(password, key);
          isPasswordValid = passwordDec === passwordCrypt;

        } else if (cryptMethod === "Cesar") {
          const shift = parseInt(inputValue, 10);
          const encryptedPassword = cesarEncrypt(password, shift);
          isPasswordValid = encryptedPassword === passwordCrypt;

        } else if (cryptMethod === "Bcrypt") {
          isPasswordValid = await bcrypt.compare(password, passwordCrypt);

        } else {
          isPasswordValid = password === passwordCrypt;
        }

        // Step 4: Handle password validation result
        if (!isPasswordValid) {
          return res.json({ loginStatus: false, Error: "Wrong Password" });
        }

        // Generate JWT token
        const token = jwt.sign(
          { role: "employee", email, id },
          "jwt_secret_key", // Use a proper secret key
          { expiresIn: "1d" }
        );

        // Set cookie and respond
        res.cookie('token', token);
        return res.json({ loginStatus: true, id });

      } catch (error) {
        console.error("Error during password validation:", error);
        return res.json({ loginStatus: false, Error: "Internal server error" });
      }
    });

  } catch (error) {
    console.error('Error during reCAPTCHA verification:', error);
    return res.json({ loginStatus: false, Error: "reCAPTCHA verification error" });
  }
});


  router.get('/detail/:id', (req, res) => {
    const id = req.params.id;
    const sql = "SELECT * FROM employee where id = ?"
    con.query(sql, [id], (err, result) => {
        if(err) return res.json({Status: false});
        return res.json(result)
    })
  })

  router.get('/adminDetails/:id', (req, res) => {
    const id = req.params.id;
    const sql = "SELECT * FROM admin WHERE id = ?";
    con.query(sql, [id], (err, result) => {
      if (err) return res.json({ Status: false, Error: err });
      return res.json(result);
    });
  });
  

  router.get('/logout', (req, res) => {
    res.clearCookie('token')
    return res.json({Status: true})
  })

  export {router as EmployeeRouter}