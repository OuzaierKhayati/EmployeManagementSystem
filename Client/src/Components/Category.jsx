import axios from 'axios'
import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'

const Category = () => {

    const [category, setCategory] = useState([])
    const [editingId, setEditingId] = useState(null);
    const [newCategory, setNewCategory] = useState("")

    const deleteCategory = (id) => {
        axios.delete('http://localhost:3000/auth/delete_category/' + id)
        .then((result) => {
            if(result.data.Status) {
                window.location.reload();
            }else{
                alert(result.data.Error);
            }
        }).catch(err => console.log(err));
    }   

    const editCategory = (id,newCategory) => {
        axios.put('http://localhost:3000/auth/edit_category/' + id, { name: newCategory })
        .then (result => {
            if(result.data.Status) {
                window.location.reload();
            }else{
                alert(result.data.Error)
            }
        }).catch(err => console.log(err));
        setEditingId(null);
    }

    useEffect(()=> {
        axios.get('http://localhost:3000/auth/category')
        .then(result => {
            if(result.data.Status) {
                setCategory(result.data.Result);
            } else {
                alert(result.data.Error)
            }
        }).catch(err => console.log(err))
    }, [])
  return (
    <div className='px-5 mt-3'>
        <div className='d-flex justify-content-center'>
            <h3>Cetegory List</h3>
        </div>
        <Link to="/dashboard/add_category" className='btn btn-success'>Add Cetegory</Link>
        <div className='mt-3'>
            <table className='table'>
                <thead>
                    <tr>
                        <th>Name</th>
                    </tr>
                </thead>
                <tbody>
                {
                    category.map((c, id) => (
                        <tr key={id} className="d-flex align-items-center">
                            <td className="d-flex justify-content-between w-100">
                                {editingId === c.id ? (
                                    <>
                                        <input 
                                            type="text" 
                                            defaultValue={c.name} 
                                            onChange={(e) => setNewCategory(e.target.value)}
                                        />
                                        <button
                                            className="btn btn-success btn-sm ms-1"
                                            onClick={() => editCategory(c.id,newCategory) }
                                        >
                                            Update
                                        </button>
                                    </>
                                ) : (
                                    <>
                                        <span>{c.name}</span>
                                        <div className="ms-auto d-flex">
                                            <button 
                                                className="btn btn-info btn-sm edit-btn"
                                                onClick={() => {
                                                    setEditingId(c.id);
                                                    setNewCategory(c.name);
                                                }}

                                            >
                                                Edit
                                            </button>
                                            <button 
                                                className="btn btn-warning btn-sm ms-1"
                                                onClick={() => deleteCategory(c.id)}
                                            >
                                                Delete
                                            </button>
                                        </div>
                                    </>
                                )}
                            </td>
                        </tr>
                    ))
                }
                </tbody>
            </table>
        </div>

    </div>
  )
}

export default Category