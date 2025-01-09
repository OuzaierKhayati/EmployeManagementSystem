import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const EditEmployee = () => {
  const { id } = useParams();
  const [employee, setEmployee] = useState({
    name: '',
    email: '',
    salary: '',
    address: '',
    category_id: '',
  });
  const [category, setCategory] = useState([]);
  const [showPasswordModal, setShowPasswordModal] = useState(false); 
  const [newPassword, setNewPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false); 
  const [filteredProjects, setFilteredProjects] = useState([]);
  const [ShowProject, setShowProject] = useState(false);
  const navigate = useNavigate();


  useEffect(() => {
    axios.get('http://localhost:3000/auth/category')
      .then(result => {
        if (result.data.Status) {
          setCategory(result.data.Result);
        } else {
          alert(result.data.Error);
        }
      }).catch(err => console.log(err));

    axios.get('http://localhost:3000/auth/employee/' + id)
      .then(result => {
        setEmployee({
          ...employee,
          name: result.data.Result[0].name,
          email: result.data.Result[0].email,
          address: result.data.Result[0].address,
          salary: result.data.Result[0].salary,
          category_id: result.data.Result[0].category_id,
        });
      }).catch(err => console.log(err));
  }, []);

  const checkNewPassword = (newPassword) => {
    if (newPassword.length < 7) {
      alert("Password must be at least 7 characters long.");
      return false;
    }
  
    const hasUpperCase = /[A-Z]/.test(newPassword);
    if (!hasUpperCase) {
      alert("Password must contain at least one uppercase letter.");
      return false;
    }

    const hasLowerCase = /[a-z]/.test(newPassword);
    if (!hasLowerCase) {
      alert("Password must contain at least one lowercase letter.");
      return false;
    }
  
    const specialChars = /[\/!;,.?§\{\[\(\}\]\)°=+\-*#\\_~]/;
    if (!specialChars.test(newPassword)) {
      alert("Password must contain at least one special character. "); //  / ! ; , . ? § { [ ( } ] ) ° = + - * # \\ _ ~
      return false;
    }

    const whitespace = /[ ]/;
    if(whitespace.test(newPassword)){
      alert("Password must not contain whitespace.");
      return false;
    }
  
    return true;
  }

  const handleDisplayProjects = () => {
    axios
      .get("http://localhost:3000/auth/project")
      .then((result) => {
        if (result.data.Status) {
          const allProjects = result.data.Result;
  
          const filtered = allProjects.filter((project) => {
            if (!project.employees) return false;
  
            let employeeNames;
            try {
              employeeNames = JSON.parse(project.employees);
            } catch (error) {
              console.error("Error parsing employees JSON:", error);
              return false;
            }
  
            const employeeEmail = employee.email; 
            return employeeNames.includes(employeeEmail);
          });
  
          const updatedFilteredProjects = filtered.map((project) => {
            const deadline = new Date(project.deadline);
            deadline.setDate(deadline.getDate() + 1); 
            return {
              ...project,
              deadline: deadline.toISOString().split("T")[0], 
            };
          });
  
          setFilteredProjects(updatedFilteredProjects);
        } else {
          alert(result.data.Error);
        }
      })
      .catch((err) => console.log("Error fetching projects:", err));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    axios.put('http://localhost:3000/auth/edit_employee/' + id, employee)
      .then(result => {
        if (result.data.Status) {
          navigate('/employee_detail/' + id);
        } else {
          alert(result.data.Error);
        }
      }).catch(err => console.log(err));
  };

  const handlePasswordSubmit = (e) => {
    e.preventDefault();

    if(!checkNewPassword(newPassword)){
      return
    }

    axios.put('http://localhost:3000/auth/edit_employee_password/' + id, { password: newPassword })
      .then(result => {
        if (result.data.Status) {
          toast.success("Password changed successfully!", {
            position: "top-right",
            autoClose: 5000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            progress: undefined,
            className: 'custom-toastSuccess',
            progressClassName: 'custom-progressSuccess',
          });
        } else {
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
      }).catch(err => console.log(err));
    setNewPassword('');
    setShowPasswordModal(false); 
  };

  return (
    <>
      <div className="p-2 d-flex justify-content-center shadow">
        <h4>Employee Management System</h4>
      </div>
      <div className="box d-flex justify-content-center align-items-center">
        <div className="p-3 rounded w-50 border bg-white border-black">
          <div className="d-flex justify-content-between align-items-center mt-2 mb-4">
            <Link to={'/employee_detail/' + id} className="btn custom-btn-view">
              <i className="bi bi-arrow-left"></i>
            </Link>
            <h3 className="text-center w-100"><b>Your informations</b></h3>
          </div>
          <form className="row g-1" onSubmit={handleSubmit}>
            <div className="col-12">
              <label htmlFor="inputName" className="form-label">
                <b>Name</b>
              </label>
              <input
                type="text"
                className="form-control rounded-0"
                id="inputName"
                placeholder="Enter Name"
                value={employee.name}
                onChange={(e) =>
                  setEmployee({ ...employee, name: e.target.value })
                }
              />
            </div>
            <div className="col-12">
              <label htmlFor="inputAddress" className="form-label">
                <b>Address</b>
              </label>
              <input
                type="text"
                className="form-control rounded-0"
                id="inputAddress"
                placeholder="1234 Main St"
                autoComplete="off"
                value={employee.address}
                onChange={(e) =>
                  setEmployee({ ...employee, address: e.target.value })
                }
              />
            </div>
            <div className="col-12">
              <label htmlFor="inputEmail4" className="form-label">
                <b>Email</b>
              </label>
              <input
                type="email"
                className="form-control rounded-0"
                id="inputEmail4"
                value={employee.email}
                disabled
              />
            </div>
            <div className='col-12'>
              <label htmlFor="inputSalary" className="form-label">
                <b>Salary</b>
              </label>
              <input
                type="text"
                className="form-control rounded-0"
                id="inputSalary"
                value={employee.salary}
                disabled
              />
            </div>
            <div className="col-12">
              <label htmlFor="category" className="form-label">
                <b>Category</b>
              </label>
              <select name="category"
                id="category"
                className="form-select"
                value={employee.category_id}
                disabled
              >
                {category.map((c, id) => (
                  <option value={c.id} key={id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
            <div className='col-12 mt-3'>
              <label htmlFor="inputSalary" className="form-label">
                <b>Project</b>
                <button 
                  type='button'
                  onClick={() => {
                    setShowProject(true)
                    handleDisplayProjects();
                  }}
                  className="btn custom-btn-view ms-2"
                >
                  <i className="bi bi-eye"></i>
                </button>
              </label>
            </div>
            <div className="col-12 d-flex justify-content-center mt-4 mb-2">
              <button type="submit" className="btn btn-primary me-4" style={{ width: '28%' }}>
                Edit name and address
              </button>
              <button type="button" onClick={() => setShowPasswordModal(true)} className="btn btn-primary ms-4" style={{ width: '18%' }}>
                Edit Password
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Password Modal */}
      {showPasswordModal && (
        <div className="password-modal-overlay mt-5">
          <div className="password-modal">
            <h3 className='text-center mb-3'>Edit Password</h3>
            <form onSubmit={handlePasswordSubmit}>
              <div className="mb-3">
                <label htmlFor="newPassword" className="form-label"><b>New Password</b></label>
                <div className="input-group">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    className="form-control"
                    id="newPassword"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                  />
                  <span className="input-group-text custom-btn-black" onClick={() => setShowPassword(!showPassword)}>
                    <i className={`bi ${showPassword ? 'bi-eye' : 'bi-eye-slash'}`}></i>
                  </span>
                </div>
              </div>
              <button type="submit" className="btn btn-success">Save</button>
              <button type="button" className="btn btn-secondary" onClick={() => setShowPasswordModal(false)}>Cancel</button>
            </form>
          </div>
        </div>
      )}
      {ShowProject && (
        <div className="password-modal-overlay mt-5">
        <div className="password-modal mb-5" style={{ width: "800px" }}>
          <div
            className="d-block justify-content-center"
            style={{ width: "AUTO" }}
          >
            <table className="table">
              <thead>
                <tr>
                  <th className="text-start">Project's name</th>
                  <th className="text-start">Department</th>
                  <th className="text-start">Priority</th>
                  <th className="text-start">Deadline</th>
                </tr>
              </thead>
              <tbody>
                {filteredProjects.map((p, id) => (
                  <tr key={id}>
                    <td>{p.name}</td>
                    <td>{p.department}</td>
                    <td>{p.priority}</td>
                    <td>{p.deadline}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => setShowProject(false)}
            >
              Back
            </button>
          </div>
        </div>
      </div>      
      )}
    </>
  );
}

export default EditEmployee;
