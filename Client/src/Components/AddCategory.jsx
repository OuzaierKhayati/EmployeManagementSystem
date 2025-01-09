import axios from 'axios'
import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'

const AddCategory = () => {
    const [category, setCategory] = useState()
    const navigate = useNavigate()

    const handleSubmit = (e) => {
        e.preventDefault()
        axios.post('http://localhost:3000/auth/add_category', {category})
        .then(result => {
            if(result.data.Status) {
                navigate('/dashboard/category')
            } else {
                alert(result.data.Error)
            }
        })
        .catch(err => console.log(err))
    }
  return (
    <div className="d-flex justify-content-center align-items-center h-75">
    <div className="p-4 rounded w-50 border border-black bg-light shadow">
        <div className="d-flex justify-content-between align-items-center mb-4">
        <Link to={'/dashboard/category'} className="btn btn-success">
            <i className="bi bi-arrow-left"></i> 
        </Link>
        <h4 className="text-center flex-grow-1">Add Category</h4>
        </div>
        <form onSubmit={handleSubmit}>
        <div className="mb-2">
            <label htmlFor="category" className="mb-2">
            <strong>Category:</strong>
            </label>
            <input
            type="text"
            name="category"
            placeholder="Enter Category"
            onChange={(e) => setCategory(e.target.value)}
            className="form-control rounded-2"
            />
        </div>
        <button className="btn btn-success w-100 rounded-2">Add Category</button>
        </form>
    </div>
    </div>
  )
}

export default AddCategory