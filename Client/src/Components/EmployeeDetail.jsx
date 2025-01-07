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
    }, []);

    const handleLogout = () => {
        axios.get('http://localhost:3000/employee/logout')
        .then(result => {
          if(result.data.Status) {
            localStorage.removeItem("valid")
            navigate('/')
          }
        }).catch(err => console.log(err))
    };

    const handleButtonClick = () => {
        document.getElementById('inputGroupFile01').click();  // Trigger the file input click
    };
    useEffect(() => {
        if (employee.image) {

            const formData = new FormData();
            formData.append('image', employee.image);

            axios.put('http://localhost:3000/auth/edit_employeeImg/' + id, formData)
                .then(result => {
                    if (result.data.Status) {
                        axios.get('http://localhost:3000/employee/detail/'+id)
                        .then(result => {
                            setEmployee(result.data[0])
                        })
                        .catch(err => console.log(err));

                    } else {
                        alert(result.data.Error);
                        console.log(result.data.Error);
                    }
                })
                .catch(err => console.log(err));
        }
    }, [employee.image]); 

  return (
<div>
    <div className="p-2 d-flex justify-content-center shadow">
        <h4>Employee Management System</h4>
    </div>
    <div className="box d-flex justify-content-center flex-column align-items-center mt-3">

        <img 
            src={`http://localhost:3000/Images/` + employee.image} 
            className="emp-det-image rounded-circle shadow-lg mb-3"
            alt="Employee Profile"
        />

        <div>
            <button className="btn btn-outline-primary edit-profile-btn mt-2" 
                    type='button'
                    onClick={handleButtonClick}>
                <i className="bi bi-pen"></i> Edit Profile Image
            </button>
            <input
                type="file"
                id="inputGroupFile01"
                style={{ display: 'none' }}
                name="image"
                onChange={(e) => {
                    setEmployee({...employee, image: e.target.files[0]});
                }}
            />
        </div>

        <div className="d-flex align-items-center flex-column mt-3 mb-4">
            <h3>Welcome <span className="fw-bold">{employee.name}</span> to your Employee Space!</h3>
        </div>
        <div>
            <Link 
              to={`/employee_detail/employee_edit/` + id}
              className="btn custom-btn-view me-2"
            >
              Check <i className="bi bi-eye"></i>
            </Link>
            <button className="btn btn-danger" onClick={handleLogout}>Logout</button>
        </div>
    </div>
</div>

  )
}

export default EmployeeDetail;