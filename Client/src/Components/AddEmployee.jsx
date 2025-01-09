import axios from "axios";
import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import "./style.css";

const AddEmployee = () => {
  const [employee, setEmployee] = useState({
    name: "",
    email: "",
    password: "",
    salary: "",
    address: "",
    category_id: "",
    image: "",
  });
  const [category, setCategory] = useState([]);
  const [showPassword, setShowPassword] = useState(false);
  const [selectedPasswordMethod, setSelectedPasswordMethod] = useState('');
  const [inputValue, setInputValue] = useState();
  const navigate = useNavigate()

  const handleSelectChange = (event) => {
    setSelectedPasswordMethod(event.target.value);
    setInputValue("");
  };
  
  const handleInputChange = (event) => {
    setInputValue(event.target.value);
  };
  
  const handleSave = () => {
    if (selectedPasswordMethod ==="AES"){
      if (inputValue.length === 16) {
        alert("Saved successfully!");
      } else {
        alert("Please enter exactly 16 characters.");
      }

    }else{
      alert("Saved successfully!")
    }
  };
  
  const verifData = (employee) => {
    const notFilled =  Object.entries(employee)
      .filter(([key, value]) => typeof value === "string" && value.trim() === "")
      .map(([key]) => key);
    if(notFilled.length > 0) return false;
    else return true;
  };

  function checkPassword(password) {
    if (password.length < 7) {
      alert("Password must be at least 7 characters long.");
      return false;
    }
  
    const hasUpperCase = /[A-Z]/.test(password);
    if (!hasUpperCase) {
      alert("Password must contain at least one uppercase letter.");
      return false;
    }

    const hasLowerCase = /[a-z]/.test(password);
    if (!hasLowerCase) {
      alert("Password must contain at least one lowercase letter.");
      return false;
    }
  
    const specialChars = /[\/!;,.?§\{\[\(\}\]\)°=+\-*#\\_~]/;
    if (!specialChars.test(password)) {
      alert("Password must contain at least one special character. "); //  / ! ; , . ? § { [ ( } ] ) ° = + - * # \\ _ ~
      return false;
    }

    const whitespace = /[ ]/;
    if(whitespace.test(password)){
      alert("Password must not contain whitespace.");
      return false;
    }
  
    return true;
  }

  useEffect(() => {
    axios
      .get("http://localhost:3000/auth/category")
      .then((result) => {
        if (result.data.Status) {
          setCategory(result.data.Result);
        } else {
          alert(result.data.Error);
        }
      })
      .catch((err) => console.log(err));
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();

    // Validate password before submitting
    if (!checkPassword(employee.password)) {
      return;
    }
    
    if (verifData(employee)){
      const formData = new FormData();
      formData.append("name", employee.name);
      formData.append("email", employee.email);
      formData.append("password", employee.password);
      formData.append("address", employee.address);
      formData.append("salary", employee.salary);
      formData.append("image", employee.image);
      formData.append("category_id", employee.category_id);
      formData.append("cryptMethod", selectedPasswordMethod);
      formData.append("inputValue", inputValue);
    
      axios
        .post("http://localhost:3000/auth/add_employee", formData)
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
            navigate("/dashboard/employee");
          } else {
            console.log("Server error response:", result.data); // Log the error structure
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
          console.error("Request failed:", err);
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
    }else{
      alert("Please fill in all fields.")
      setEmployee(employee);
    }
  };


  return (
    <div className="d-flex justify-content-center align-items-center mt-3">
      <div className="p-3 rounded w-50 border border-black bg-light shadow">
        <Link to={'/dashboard/employee'} className="btn custom-btn-view">
            <i className="bi bi-arrow-left"></i>
        </Link>
        <h3 className="text-center">Add Employee</h3>
        <form className="row g-1" onSubmit={handleSubmit}>
          <div className="col-12">
            <label htmlFor="inputName" className="form-label">
              Name
            </label>
            <input
              type="text"
              className="form-control rounded-0"
              id="inputName"
              placeholder="Enter Name"
              onChange={(e) =>
                setEmployee({ ...employee, name: e.target.value })
              }
            />
          </div>
          <div className="col-12">
            <label htmlFor="inputEmail4" className="form-label">
              Email
            </label>
            <input
              type="email"
              className="form-control rounded-0"
              id="inputEmail4"
              placeholder="Enter Email"
              autoComplete="off"
              onChange={(e) =>
                setEmployee({ ...employee, email: e.target.value })
              }
            />
          </div>
          <div className="col-12">
            <label htmlFor="inputPassword4" className="form-label d-flex align-items-center">
              Password
              <select name="methodCrypt"
                id="methodCrypt"
                className="form-select ms-2"
                style={{ width: "auto" }}
                defaultValue=""
                onChange={handleSelectChange}
                >
                  <option value="" disabled>Select a Method of crypt</option>
                  <option value="AES" >AES Method</option>
                  <option value="Cesar" >Cesar Method</option>
                  <option value="Bcrypt">bcrypt Method</option>
              </select>

              {selectedPasswordMethod === "AES" && (
                <div className="d-flex align-items-center ms-2" style={{ border: "1px solid #ced4da", borderRadius: "0.375rem", padding: "0.25rem", background: "#fff" }}>
                  <input
                    type="text"
                    maxLength="16"
                    placeholder="Enter 16 characters"
                    className="form-control border-0"
                    value={inputValue}
                    onChange={handleInputChange}
                    style={{ width: "auto", boxShadow: "none" }}
                  />
                  <button
                    type="button"
                    className="btn btn-primary ms-2"
                    onClick={handleSave}
                    style={{ padding: "0.25rem 0.5rem" }}
                  >
                    Save
                  </button>
                </div>
              )}
              {selectedPasswordMethod === "Cesar" && (
                <div className="d-flex align-items-center ms-2" style={{ border: "1px solid #ced4da", borderRadius: "0.375rem", padding: "0.25rem", background: "#fff" }}>
                  <input
                    type="number"
                    placeholder="Enter a number"
                    className="form-control border-0"
                    value={inputValue}
                    onChange={handleInputChange}
                    style={{ width: "auto", boxShadow: "none" }}
                  />
                  <button
                    type="button"
                    className="btn btn-primary ms-2"
                    onClick={handleSave}
                    style={{ padding: "0.25rem 0.5rem" }}
                  >
                    Save
                  </button>
                </div>
              )}
            </label>
            <div className="input-group">
              <input
                type={showPassword ? "text" : "password"}
                className="form-control"
                id="inputPassword4"
                placeholder="Enter Password"
                value={employee.password}
                onChange={(e) => {
                    setEmployee({ ...employee, password: e.target.value })
                  }
                }
              />
              <button
                type="button"
                className="btn input-group-text custom-btn-black"
                onClick={() => setShowPassword(!showPassword)}
                style={{ borderLeft: "none" }}
              >
                <i className={`bi ${ !showPassword ? "bi-eye-slash" : "bi-eye"}`}></i>
              </button>
            </div>
            <label htmlFor="inputSalary" className="form-label">
              Salary
            </label>
            <input
              type="text"
              className="form-control rounded-0"
              id="inputSalary"
              placeholder="Enter Salary"
              autoComplete="off"
              onChange={(e) =>
                setEmployee({ ...employee, salary: e.target.value })
              }
            />
          </div>
          <div className="col-12">
            <label htmlFor="inputAddress" className="form-label">
              Address
            </label>
            <input
              type="text"
              className="form-control rounded-0"
              id="inputAddress"
              placeholder="1234 Main St"
              autoComplete="off"
              onChange={(e) =>
                setEmployee({ ...employee, address: e.target.value })
              }
            />
          </div>
          <div className="col-12">
            <label htmlFor="category" className="form-label">
              Category
            </label>
            <select name="category"
              id="category"
              className="form-select"
              value={employee.category_id}
              onChange={(e) => setEmployee({ ...employee, category_id: e.target.value })}
            >
              <option value="" disabled>
                Select a category
              </option>
              {category.map((c, id) => (
                <option value={c.id} key={id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
          <div className="col-12 mb-3">
            <label className="form-label" htmlFor="inputGroupFile01">
              Select Image
            </label>
            <input
              type="file"
              className="form-control rounded-0"
              id="inputGroupFile01"
              name="image"
              onChange={(e) => setEmployee({...employee, image: e.target.files[0]})}
            />
          </div>
          <div className="col-12">
            <button type="submit" className="btn btn-primary w-100 ">
              Add Employee
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddEmployee;
