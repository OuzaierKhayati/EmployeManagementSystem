import axios from 'axios'
import React, { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Link } from "react-router-dom"

const EmployeeDetail = () => {
    const [employee, setEmployee] = useState([])
    const {id} = useParams()
    const navigate = useNavigate()
    useEffect(() => {
        axios.get('http://localhost:3000/employee/detail/'+id)
        .then(result => {
            setEmployee(result.data[0])
        })
        .catch(err => console.log(err))
    }, [])
    const handleLogout = () => {
        axios.get('http://localhost:3000/employee/logout')
        .then(result => {
          if(result.data.Status) {
            localStorage.removeItem("valid")
            navigate('/')
          }
        }).catch(err => console.log(err))
      }
  return (
    <div>
        <div className="p-2 d-flex justify-content-center shadow">
            <h4>Emoployee Management System</h4>
        </div>
        <div className='box d-flex justify-content-center flex-column align-items-center mt-3'>
            <img src={`http://localhost:3000/Images/`+employee.image} className='emp_det_image'/>
            <div className='d-flex align-items-center flex-column mt-2 mb-4'>
                <h3>Welcome <span className="fw-bold">{employee.name}</span> to your Employee Space!</h3>
            </div>
            <div>
                <Link 
                  to={`/employee_detail/employee_edit/` + id}
                  className="btn custom-btn-view me-2"
                >
                  Check <i className="bi bi-eye"></i>
                </Link>
                <button className='btn btn-danger' onClick={handleLogout}>Logout</button>
            </div>
        </div>
    </div>
  )
}

export default EmployeeDetail

{/* <div>
<div className="p-2 d-flex justify-content-center shadow">
    <h4>Emoployee Management System</h4>
</div>
<div className="d-flex align-items-center">
    <div className='boxImage'>
        <img 
            src={`http://localhost:3000/Images/` + employee.image} 
            className="styleImg" 
        />
    </div>
    <div className="tableBox">
        <table>
            <tbody>
                <tr>
                    <td><h5><b>Name :</b></h5></td>
                    <td className="text-cen"><h5>{employee.name}</h5></td>
                </tr>
                <tr>
                    <td><h5><b>Salary :</b></h5></td>
                    <td className="text-start"><h5>${employee.salary}</h5></td>
                </tr>
                <tr>
                    <td><h5><b>Email :</b></h5></td>
                    <td className="text-start"><h5>{employee.email}</h5></td>
                </tr>
            </tbody>
        </table>

        <div className="d-flex">
          <Link
            to={`/edit_employee_user/` + id}
            className="btn btn-primary btn-sm me-2"
          >
            Edit
          </Link>
            <button className="btn btn-danger" onClick={handleLogout}>Logout</button>
        </div>
    </div>
</div>
</div> */}