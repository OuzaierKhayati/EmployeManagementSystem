import React, { useState } from 'react';
import './style.css';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import ReCAPTCHA from 'react-google-recaptcha';

const Login = () => {
    const [values, setValues] = useState({
        email: '',
        password: ''
    });
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState(null);
    const [captchaValue, setCaptchaValue] = useState(null);
    const navigate = useNavigate();
    axios.defaults.withCredentials = true;

    // Handle the captcha response
    const handleCaptchaChange = (value) => {
        setCaptchaValue(value);
    };

    const handleSubmit = (event) => {
        event.preventDefault();

        // Ensure reCAPTCHA is completed
        if (!captchaValue) {
            setError('Please verify that you are not a robot');
            return;
        }

        // Send email, password, and captcha token to the backend
        axios.post('http://localhost:3000/auth/adminlogin', {
            ...values,
            recaptchaToken: captchaValue
        })
        .then(result => {
            if (result.data.loginStatus) {
                localStorage.setItem("valid", true);
                localStorage.setItem("id", result.data.id);
                navigate('/dashboard/', { state: { id: result.data.id } });
            } else {
                setError(result.data.Error);
            }
        })
        .catch(err => console.log(err));
    };

    return (
        <div className='d-flex justify-content-center align-items-center vh-100 loginPage'>
            <div className='p-3 w-25 loginForm'>
                <div className='text-warning'>
                    {error && error}
                </div>
                <h2 className='text-center' style={{ color: "white" }}>Login Page</h2>
                <form onSubmit={handleSubmit}>
                    <div className='mb-3'>
                        <label htmlFor="email"><strong>Email:</strong></label>
                        <input
                            type="email"
                            name='email'
                            autoComplete='off'
                            placeholder='Enter Email'
                            onChange={(e) => setValues({ ...values, email: e.target.value })}
                            className='form-control rounded-0'
                        />
                    </div>
                    <div className='mb-3'>
                        <label htmlFor="password"><strong>Password:</strong></label>
                        <div className='input-group'>
                            <input
                                type = {showPassword ? "text" : "password"}
                                name ='password'
                                placeholder='Enter Password'
                                onChange={(e) => setValues({ ...values, password: e.target.value })}
                                className='form-control rounded-0'
                            />
                            <button
                                type='button'
                                className="btn input-group-text custom-btn-black"
                                onClick={() => setShowPassword(!showPassword)}
                                style={{ border: "2px solid black"}}
                            >
                                <i className={`bi ${ !showPassword ? "bi-eye-slash" : "bi-eye"}`}></i>
                            </button>
                        </div>
                    </div>

                    {/* reCAPTCHA v2 Widget */}
                    <div className="mb-3 d-flex justify-content-center">
                        <ReCAPTCHA
                            sitekey="6LefZI4qAAAAAOcPNQb7LDCDim0nS69i6RY9XdFu"
                            onChange={handleCaptchaChange}
                        />
                    </div>

                    <div className='d-flex flex-column justify-content-center align-items-center'>
                        <button className='btn btn-success w-50 rounded mb-2' style={{ fontSize: '1.2rem' }}>Log in</button>
                        <div className='mb-1'>
                            <input type="checkbox" name="tick" id="tick" className='me-2' />
                            <label htmlFor="password">You agree with terms & conditions</label>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default Login;
