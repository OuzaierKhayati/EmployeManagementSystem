import axios from 'axios';
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import "./style.css";

const AddAdmin = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = (e) => {
        e.preventDefault();
        axios
            .post('http://localhost:3000/auth/add_admin', { email: email, password: password })
            .then((result) => {
                if (result.data.Status) {
                    // Success notification
                    toast.success(result.data.Message, {
                        position: "top-right",
                        autoClose: 5000, // 5 seconds
                        hideProgressBar: false,
                        closeOnClick: true,
                        pauseOnHover: true,
                        draggable: true,
                        progress: undefined,
                        className: 'custom-toastSuccess',
                        progressClassName: 'custom-progressSuccess',
                    });

                    // Navigate to the dashboard
                    navigate('/dashboard');
                } else {
                    // Error notification
                    toast.error(result.data.Error, {
                        position: "top-right",
                        autoClose: 5000,
                        hideProgressBar: false,
                        closeOnClick: true,
                        pauseOnHover: true,
                        draggable: true,
                        progress: undefined,
                        className: 'custom-toastError',
                        progressClassName: 'custom-progressError',
                    });
                }
            })
            .catch((err) => {
                console.error(err);

                // General error notification
                toast.error('An error occurred. Please try again.', {
                    position: "top-right",
                    autoClose: 5000,
                    hideProgressBar: false,
                    closeOnClick: true,
                    pauseOnHover: true,
                    draggable: true,
                    progress: undefined,
                    className: 'custom-toastError',
                    progressClassName: 'custom-progressError',
                });
            });
    };

    return (
        <div className='d-flex justify-content-center align-items-center h-75'>
            <div className='p-3 rounded w-50 border border-black bg-light shadow'>
                <Link to={'/dashboard'} className="btn custom-btn-view">
                    <i className="bi bi-arrow-left"></i>
                </Link>
                <h2 className='text-center'>Add Admin</h2>
                <form onSubmit={handleSubmit}>
                    <div>
                        <div className='d-flex flex-column mb-3'>
                            <label htmlFor="email"><strong>Email:</strong></label>
                            <input
                                type="email"
                                name='email'
                                placeholder='Email'
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className='form-control rounded-0 mb-2'
                            />
                        </div>
                        <div className='d-flex flex-column mb-3'>
                            <label htmlFor="password"><strong>Password:</strong></label>
                            <div className="input-group">
                                <input
                                    type={showPassword ? "text" : "password"}
                                    name='password'
                                    placeholder='Password'
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className='form-control rounded-0'
                                />
                                <button
                                    type="button"
                                    className="btn input-group-text custom-btn-black"
                                    onClick={() => setShowPassword(!showPassword)}
                                    style={{ borderLeft: "none" }}
                                >
                                    <i className={`bi ${!showPassword ? "bi-eye-slash" : "bi-eye"}`}></i>
                                </button>
                            </div>
                        </div>
                    </div>
                    <button className='btn btn-success w-100 rounded-2 mb-2'>Add Admin</button>
                </form>
            </div>
        </div>
    );
};

export default AddAdmin;
