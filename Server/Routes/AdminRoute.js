import express from "express";
import con from "../utils/db.js";
import jwt from "jsonwebtoken";
import bcrypt from 'bcrypt';
import multer from "multer";
import path from "path";
import crypto from 'crypto';
import axios from 'axios';
import nodemailer from 'nodemailer';

const router = express.Router();

router.post("/adminlogin", async (req, res) => {
    const { email, password, recaptchaToken } = req.body;
    const secretKey = '6LefZI4qAAAAACPk5eCR6_gHJ9dzNJNSZcorfwqg';  // Your reCAPTCHA secret key

    try {
        // Verify the reCAPTCHA token with Google
        const recaptchaUrl = `https://www.google.com/recaptcha/api/siteverify?secret=${secretKey}&response=${recaptchaToken}`;
        const response = await axios.post(recaptchaUrl);
        const data = response.data;
        
        if (!data.success) {
            return res.json({ loginStatus: false, Error: "reCAPTCHA verification failed" });
        }

        // If reCAPTCHA is successful, proceed with login
        const sql = "SELECT * FROM admin WHERE email = ?";
        con.query(sql, [email], (err, result) => {
            if (err) return res.json({ loginStatus: false, Error: "Query error" });

            if (result.length > 0) {
                const storedHash = result[0].password; // The hashed password from the database

                // Compare the entered password with the stored hashed password
                bcrypt.compare(password, storedHash, (err, isMatch) => {
                    if (err) return res.json({ loginStatus: false, Error: "Password comparison error" });

                    if (isMatch) {
                        const email = result[0].email;
                        const token = jwt.sign(
                            { role: "admin", email: email, id: result[0].id },
                            "jwt_secret_key",
                            { expiresIn: "1d" }
                        );
                        res.cookie('token', token);
                        return res.json({ loginStatus: true, id: result[0].id });
                    } else {
                        return res.json({ loginStatus: false, Error: "Wrong email or password" });
                    }
                });
            } else {
                return res.json({ loginStatus: false, Error: "Wrong email or password" });
            }
        });
    } catch (error) {
        return res.json({ loginStatus: false, Error: "reCAPTCHA verification error" });
    }
});

router.post('/add_admin', (req, res) => {
    const sql = "INSERT INTO admin (email,password) VALUES (?)"
    let password = req.body.password;
    bcrypt.hash(password, 10, (err, hash) => {
        if (err) return res.json({ Status: false, Error: "Hashing Error" });
        const values = [
            req.body.email,
            hash,
        ]
        try {
            // Run the database query
            con.query(sql, [values], async (err, result) => {
                if (err) {
                    // If there's an error with the database, respond and exit early
                    return res.json({ Status: false, Error: err });
                }
    
                // Proceed with sending the email only if the database query succeeds
                try {
                    const transporter = nodemailer.createTransport({
                        service: 'gmail',
                        auth: {
                            user: process.env.EMAIL_USER,
                            pass: process.env.EMAIL_PASS
                        }
                    });
    
                    const mailOptions = {
                        from: process.env.EMAIL_USER,
                        to: req.body.email,
                        subject: 'Welcome to the Admin Panel',
                        text: `Hello, you've been added as an admin. Your temporary password is ${req.body.password}`
                    };
    
                    // Send the email and handle errors
                    await transporter.sendMail(mailOptions);
    
                    // Send response once both the database and email are successful
                    return res.json({ Status: true, Message: "Admin added and email sent successfully!" });
                } catch (error) {
                    console.error("Error sending email:", error);
                    return res.json({ Status: false, Error: "An error occurred while sending the email." });
                }
            });
        }catch (error) {
            console.error(error);
            return res.json({ Status: false, Error: "An error occurred while adding admin." });
        }
    });
});

router.delete("/delete_admin/:id", (req, res) => { 
    const id = req.params.id;
    const sql = "delete from admin where id = ?"
    con.query(sql, [id], (err, result) => {
        if(err) return res.json({Status: false, Error: "Query Error" + err});
        return res.json({Status: true, Result: result});
    })
})

router.get('/category', (req, res) => {
    const sql = "SELECT * FROM category";
    con.query(sql, (err, result) => {
        if(err) return res.json({Status: false, Error: "Query Error"})
        return res.json({Status: true, Result: result})
    })
})

router.post('/add_category', (req, res) => {
    const sql = "INSERT INTO category (name) VALUES (?)"
    con.query(sql, [req.body.category], (err, result) => {
        if(err) return res.json({Status: false, Error: "Query Error"})
        return res.json({Status: true})
    })
})

router.put('/edit_category/:id', (req, res) => {
    const id = req.params.id;
    const sql = `UPDATE category 
        set name = ? Where id = ?`
    const value = req.body.name
    con.query(sql,[value, id], (err, result) => {
        if(err) return res.json({Status: false, Error: "Query Error"+err})
        return res.json({Status: true, Result: result})
    })
})

router.delete('/delete_category/:id', (req, res) => {
    const id = req.params.id;
    const sql = "delete from category where id = ?"
    con.query(sql, [id], (err, result) => {
        if(err) return res.json({Status: false, Error: "Query Error" + err});
        return res.json({Status: true, Result: result});
    })
})

// image upload 
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'Public/Images')
    },
    filename: (req, file, cb) => {
        cb(null, file.fieldname + "_" + Date.now() + path.extname(file.originalname))
    }
})
const upload = multer({
    storage: storage
})
// end imag eupload 

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

router.post('/add_employee', upload.single('image'), (req, res) => {
    const sql = `INSERT INTO employee 
    (name, email, password, address, salary, image, cryptMethod, inputValue, category_id) 
    VALUES (?)`;

    let password = req.body.password;

    if (req.body.cryptMethod === "Bcrypt") {
        bcrypt.hash(password, 10, (err, hash) => {
            if (err) return res.json({ Status: false, Error: "Hashing Error" });
            saveEmployee(hash);
        });

    } else if (req.body.cryptMethod === "Cesar") {
        const shift = req.body.inputValue;
        password = cesarEncrypt(password, shift);
        saveEmployee(password);

    } else if (req.body.cryptMethod === "") {
        saveEmployee(password);

    } else {
        // Assume AES encryption using the provided `cryptMethod` as the key
        const key = req.body.inputValue;
        if (key.length !== 16) {
            return res.json({ Status: false, Error: "AES Key must be 16 characters" });
        }
        password = aesEncrypt(password, key);
        saveEmployee(password);
    }

    function saveEmployee(encryptedPassword) {
        const input = String(req.body.inputValue);
        const values = [
            req.body.name,
            req.body.email,
            encryptedPassword,
            req.body.address,
            req.body.salary,
            req.file.filename,
            req.body.cryptMethod,
            input,
            req.body.category_id
        ];
        con.query(sql, [values], async(err, result) => {
            if (err) return res.json({ Status: false, Error: err });

            try {
                const transporter = nodemailer.createTransport({
                    service: 'gmail',
                    auth: {
                        user: process.env.EMAIL_USER,
                        pass: process.env.EMAIL_PASS
                    }
                });

                const mailOptions = {
                    from: process.env.EMAIL_USER,
                    to: req.body.email,
                    subject: 'Welcome to the employee Panel',
                    text: `Hello, you've been added as an employee. Your temporary password is: ${req.body.password}`
                };

                // Send the email and handle errors
                await transporter.sendMail(mailOptions);

                // Send response once both the database and email are successful
                return res.json({ Status: true, Message: "Employee added and email sent successfully!" });
            } catch (error) {
                console.error("Error sending email:", error);
                return res.json({ Status: false, Error: "An error occurred while sending the email." });
            }
        });
    }
});

router.post('/add_project', upload.none(), (req, res) => {
    const sql = `INSERT INTO project 
    (name, department, employees, deadline, priority, projectCost) 
    VALUES (?)`;

    const values = [
        req.body.name,
        req.body.department,
        req.body.employees,
        req.body.deadline,
        req.body.priority,
        req.body.projectCost,
    ];
    con.query(sql, [values], async(err, result) => {
        if (err) return res.json({ Status: false, Error: err });
        return res.json({ Status: true, Message: "Project added successfully!" });
    });
});

router.get('/employee', (req, res) => {
    const sql = "SELECT * FROM employee";
    con.query(sql, (err, result) => {
        if(err) return res.json({Status: false, Error: "Query Error"})
        return res.json({Status: true, Result: result})
    })
})

router.get('/employee/:id', (req, res) => {
    const id = req.params.id;
    const sql = "SELECT * FROM employee WHERE id = ?";
    con.query(sql,[id], (err, result) => {
        if(err) return res.json({Status: false, Error: "Query Error"})
        return res.json({Status: true, Result: result})
    })
})

router.put('/edit_employee/:id', (req, res) => {
    const id = req.params.id;
    const sql = `UPDATE employee 
        set name = ?, email = ?, salary = ?, address = ?, category_id = ? 
        Where id = ?`
    const values = [
        req.body.name,
        req.body.email,
        req.body.salary,
        req.body.address,
        req.body.category_id
    ]
    con.query(sql,[...values, id], (err, result) => {
        if(err) return res.json({Status: false, Error: "Query Error"+err})
        return res.json({Status: true, Result: result})
    })
})

router.put('/edit_employeeImg/:id', upload.single('image'), (req, res) => {
    const id = req.params.id;
    const image = req.file ? req.file.filename : req.body.image;
    const sql = ` UPDATE employee 
        set image = ? 
        where id = ? `
    con.query(sql, [image, id], (err, result) => {
        if(err) return res.json({Status: false, Error: "Query Error"+err})
        return res.json({Status: true, Result: result})
    })
})

router.put('/edit_employee_password/:id', (req, res) => {
    const id = req.params.id;
    const sql = `UPDATE employee 
        set password = ?, cryptMethod = ?
        where id = ?`;

    const password = req.body.password;
    bcrypt.hash(password, 10, (err, hash) => {
        if (err) return res.json({ Status: false, Error: "Hashing Error" });

        const values = [hash, "Bcrypt", id];

        con.query(sql, values, (err, result) => {
            if (err) return res.json({ Status: false, Error: "Query Error: " + err });
            return res.json({ Status: true, Result: result });
        });
    });
});

router.delete('/delete_employee/:id', (req, res) => {
    const id = req.params.id;
    const sql = "delete from employee where id = ?"
    con.query(sql,[id], (err, result) => {
        if(err) return res.json({Status: false, Error: "Query Error"+err})
        return res.json({Status: true, Result: result})
    })
})

router.get('/project', (req, res) => {
    const sql = "SELECT * FROM project";
    con.query(sql, (err, result) => {
        if(err) return res.json({Status: false, Error: "Query Error"})
        return res.json({Status: true, Result: result})
    })
})

router.get('/project/:id', (req, res) => {
    const id = req.params.id;
    const sql = "SELECT * FROM project WHERE id = ?";
    con.query(sql,[id], (err, result) => {
        if(err) return res.json({Status: false, Error: "Query Error"})
        return res.json({Status: true, Result: result})
    })
})

router.put('/edit_project/:id', (req, res) => {
    const id = req.params.id;
    const sql = `UPDATE project 
        set name = ?, department = ?, employees = ?, deadline = ?, priority = ?, projectCost = ? 
        Where id = ?`
    const values = [
        req.body.name,
        req.body.department,
        req.body.employees,
        req.body.deadline,
        req.body.priority,
        req.body.projectCost,
    ]
    con.query(sql,[...values, id], (err, result) => {
        if(err) return res.json({Status: false, Error: "Query Error"+err})
        return res.json({Status: true, Result: result})
    })
})

router.delete('/delete_project/:id', (req, res) => {
    const id = req.params.id;
    const sql = "delete from project where id = ?"
    con.query(sql,[id], (err, result) => {
        if(err) return res.json({Status: false, Error: "Query Error"+err})
        return res.json({Status: true, Result: result})
    })
})

router.get('/admin_count', (req, res) => {
    const sql = "select count(id) as admin from admin";
    con.query(sql, (err, result) => {
        if(err) return res.json({Status: false, Error: "Query Error"+err})
        return res.json({Status: true, Result: result})
    })
})

router.get('/employee_count', (req, res) => {
    const sql = "select count(id) as employee from employee";
    con.query(sql, (err, result) => {
        if(err) return res.json({Status: false, Error: "Query Error"+err})
        return res.json({Status: true, Result: result})
    })
})

router.get('/salary_count', (req, res) => {
    const sql = "select sum(salary) as salaryOFEmp from employee";
    con.query(sql, (err, result) => {
        if(err) return res.json({Status: false, Error: "Query Error"+err})
        return res.json({Status: true, Result: result})
    })
})

router.get('/admin_records', (req, res) => {
    const sql = "select * from admin"
    con.query(sql, (err, result) => {
        if(err) return res.json({Status: false, Error: "Query Error"+err})
        return res.json({Status: true, Result: result})
    })
})

router.get('/logout', (req, res) => {
    res.clearCookie('token')
    return res.json({Status: true})
})

export { router as adminRouter };
