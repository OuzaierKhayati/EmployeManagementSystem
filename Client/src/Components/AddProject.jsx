import axios from "axios";
import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import "./style.css";

const AddEmployee = () => {
  const [project, setProject] = useState({
    name: "",
    department: "",
    employees: [],
    deadline: "",
    priority: "",
    projectCost: "",
  });
  const [category, setCategory] = useState([]);
  const [employeeNames, setEmployeeNames] = useState([]);
  const [priorities] = useState(['DO THIS NOW', 'DO THIS LATER', 'DELEGATE THIS', 'DELETE THIS'])
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate()
  
  const verifData = (projedt) => {
    const notFilled =  Object.entries(projedt)
      .filter(([key, value]) => typeof value === "string" && value.trim() === "")
      .map(([key]) => key);
    if(notFilled.length > 0) return false;
    else return true;
  };


  const handleAddEmployee = (employeeName) => {
    if (!project.employees.includes(employeeName)) {
      setProject({
        ...project,
        employees: [...project.employees, employeeName],
      });
    }
  };

  const handleRemoveEmployee = (employeeName) => {
    setProject({
      ...project,
      employees: project.employees.filter((name) => name !== employeeName),
    });
  };

  const filteredEmployees = employeeNames.filter((e) =>
    e.name.toLowerCase().startsWith(searchTerm.toLowerCase())
  );

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

  useEffect(() => {
    axios
      .get("http://localhost:3000/auth/employee")
      .then((result) => {
        if (result.data.Status) {
          setEmployeeNames(result.data.Result);
        } else {
          alert(result.data.Error);
        }
      })
      .catch((err) => console.log(err));
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (verifData(project)){

      const formData = new FormData();
      formData.append("name", project.name);
      formData.append("department", project.department);
      formData.append("employees", JSON.stringify(project.employees));
      formData.append("deadline", project.deadline);
      formData.append("priority", project.priority);
      formData.append("projectCost", project.projectCost.toString());

      axios
        .post("http://localhost:3000/auth/add_project", formData)
        .then ((result) => {
          if(result.data.Status){
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
            navigate("/dashboard/projects");
          
          }else{
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

    }else{
      alert("Please fill in all fields.");
      setProject(project);
    }
  };


  return (
    <div className="d-flex justify-content-center align-items-center mt-3">
      <div className="p-3 rounded w-50 border border-black bg-light shadow">
        <Link to={'/dashboard/projects'} className="btn custom-btn-view">
            <i className="bi bi-arrow-left"></i>
        </Link>
        <h3 className="text-center">Add Project</h3>
        <form className="row g-1" onSubmit={handleSubmit}>
          <div className="col-12">
            <label htmlFor="ProjectsName" className="form-label">
              <b>Project's name</b>
            </label>
            <input
              type="text"
              className="form-control rounded-0"
              id="ProjectsName"
              placeholder="Enter Name of the project"
              onChange={(e) =>
                setProject({ ...project, name: e.target.value })
              }
            />
          </div>
          <div className="col-12">
            <label htmlFor="department" className="form-label">
            <b>Department</b>
            </label>
            <select name="department"
              id="department"
              className="form-select"
              value={project.department}
              onChange={(e) => setProject({ ...project, department: e.target.value })}
            >
              <option value="" disabled>
                Select a department
              </option>
              {category.map((c, id) => (
                <option value={c.name} key={id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
          <div className="col-12">
            {/* Employee Search */}
            <div className="col-12">
              <label htmlFor="searchEmployees" className="form-label">
                <b>Search Employees</b>
              </label>
              <input
                type="text"
                id="searchEmployees"
                className="form-control"
                placeholder="Start typing employee name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)} 
              />
            </div>

            {/* Employee Selection */}
            {searchTerm !=="" &&
              <div className="col-12 searchContainer">
                <ul className="customList">
                  {filteredEmployees.length > 0 ? (
                    filteredEmployees.map((e, id) => (
                      <li
                        className="customListItem"
                        key={id}
                        onClick={() => handleAddEmployee(e.email)} 
                        style={{ cursor: "pointer" }}
                      >
                        {e.name}: {e.email}
                      </li>
                    ))
                  ) : (
                    <li className="customListItem">No employees found</li>
                  )}
                </ul>
              </div>
            }

            {/* Selected Employees */}
            {project.employees.length > 0 && (
              <div className="col-12 mt-2">
                <ul className="list-group">
                  {project.employees.map((employee, index) => (
                    <li className="list-group-item d-flex justify-content-between" key={index}>
                      {employee}
                      <button
                        type="button" 
                        className="btn btn-danger btn-sm"
                        onClick={() => handleRemoveEmployee(employee)}
                      >
                        Remove
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
          <div className="col-12">
            <label htmlFor="deadline" className="form-label">
              <b>Deadline</b>
            </label>
            <input
              type="date"
              className="form-control rounded-0"
              id="deadline"
              placeholder="Enter Deadline"
              autoComplete="off"
              onChange={(e) =>
                setProject({ ...project, deadline: e.target.value })
              }
            />
          </div>
          <div className="col-12">
            <label htmlFor="priorityLevel" className="form-label">
              <b>Priority Level</b>
            </label>
            <select name="priorityLevel"
              id="priorityLevel"
              className="form-select"
              value={project.priority}
              onChange={(e) => setProject({ ...project, priority: e.target.value })}
            >
              <option value="" disabled>Select priority level</option>
              {priorities.map((p, index) => (
                <option value={p} key={index}>
                  {p}
                </option>
              ))}
            </select>
          </div>
          <div className="col-12">
            <label htmlFor="projectCost" className="form-label">
              <b>Project Cost</b>
            </label>
            <input
              type="number"
              className="form-control rounded-0"
              id="projectCost"
              placeholder="Project cost"
              autoComplete="off"
              onChange={(e) =>
                setProject({ ...project, projectCost: e.target.value })
              }
            />
          </div>
          <div className="col-12 mt-3">
            <button type="submit" className="btn btn-success w-100 ">
              Add Project
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddEmployee;
