import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { Link } from "react-router-dom";
import 'react-toastify/dist/ReactToastify.css';

const EditProject = () => {
    const {id} = useParams()
    const [project, setProject] = useState({
        name: "",
        department: "",
        employees: [],
        deadline: "",
        priority: "",
        projectCost: "",
    });
      const [category, setCategory] = useState([]);
      const [searchTerm, setSearchTerm] = useState("");
      const [employeeNames, setEmployeeNames] = useState([]);
      const [priorities] = useState(['DO THIS NOW', 'DO THIS LATER', 'DELEGATE THIS', 'DELETE THIS'])
      const [toDelete, setToDelete] = useState(false)
      const navigate = useNavigate();

      const verifData = (project) => {
        const notFilled =  Object.entries(project)
          .filter(([key, value]) => typeof value === "string" && value.trim() === "")
          .map(([key]) => key);
        if(notFilled.length > 0) return false;
        if(project.employees.length === 0) return false ;
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

      useEffect(()=> {
        axios.get('http://localhost:3000/auth/category')
        .then(result => {
            if(result.data.Status) {
                setCategory(result.data.Result);
            } else {
                alert(result.data.Error)
            }
        }).catch(err => console.log(err))

        axios.get('http://localhost:3000/auth/project/'+id)
        .then(result => {
            const deadline = new Date(result.data.Result[0].deadline);
            deadline.setDate(deadline.getDate() + 1)
            setProject({
                ...project,
                name: result.data.Result[0].name,
                department: result.data.Result[0].department,
                employees: JSON.parse(result.data.Result[0].employees),
                deadline: deadline.toLocaleDateString('en-CA'),
                priority: result.data.Result[0].priority,
                projectCost: Number(result.data.Result[0].projectCost),
            })
        }).catch(err => console.log(err))

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
    }, [])

    const handleSubmit = (e) => {
        e.preventDefault()

        if(toDelete){
            axios.delete('http://localhost:3000/auth/delete_project/'+id)
            .then(result => {
                if(result.data.Status) {
                    navigate('/dashboard/projects')
                } else {
                    alert(result.data.Error)
                }
            })
        }else{
            if (verifData(project)){
                project.employees = JSON.stringify(project.employees);
                project.projectCost = project.projectCost.toString();
                axios.put('http://localhost:3000/auth/edit_project/'+id, project)
                .then(result => {
                    if(result.data.Status) {
                        toast.success("Project edited successfully!", {
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
                        navigate('/dashboard/projects')
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
                }).catch(err => console.log(err))
            
            }else{
                alert("Please fill in all fields.");
                setProject(project);
            }
        }
    }
    
  return (
    <div className="d-flex justify-content-center align-items-center mt-3">
      <div className="p-3 rounded w-50 border border-black bg-light shadow">
        <div className="d-flex justify-content-between align-items-center mt-3">
            <Link 
            to={`/dashboard/projects/`}
            className="btn custom-btn-view"
            >
            <i className="bi bi-arrow-left"></i>
            </Link>
            <h3 className="text-center w-100">Check Project</h3>
        </div>
        <form className="row g-1 mt-4" onSubmit={handleSubmit}>
          <div className="col-12">
            <label htmlFor="ProjectsName" className="form-label">
              Project's name
            </label>
            <input
              type="text"
              className="form-control rounded-0"
              id="ProjectsName"
              value={project.name}
              placeholder="Enter Name of the project"
              onChange={(e) =>
                setProject({ ...project, name: e.target.value })
              }
            />
          </div>
          <div className="col-12">
            <label htmlFor="department" className="form-label">
            Department
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
                Search Employees
              </label>
              <input
                type="text"
                id="searchEmployees"
                className="form-control"
                placeholder="Start typing employee name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)} // Update search term
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
                        onClick={() => handleAddEmployee(e.email)} // Add employee when clicked
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
              Deadline
            </label>
            <input
              type="date"
              className="form-control rounded-0"
              id="deadline"
              value={project.deadline}
              placeholder="Enter Deadline"
              autoComplete="off"
              onChange={(e) =>
                setProject({ ...project, deadline: e.target.value })
              }
            />
          </div>
          <div className="col-12">
            <label htmlFor="priorityLevel" className="form-label">
              Priority Level
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
              Project Cost
            </label>
            <input
              type="number"
              className="form-control rounded-0"
              id="projectCost"
              value={project.projectCost}
              placeholder="Project cost"
              autoComplete="off"
              onChange={(e) =>
                setProject({ ...project, projectCost: e.target.value })
              }
            />
          </div>
          
          <div className="col-12 d-flex justify-content-between mt-4 mb-2">
            <button type="submit" className="btn btn-primary" style={{ width: '28%' }}>
                Edit Project
            </button>
            <button type="submit" onClick = {() => setToDelete(true)} className="btn btn-danger" style={{ width: '18%' }}>
                Delete
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default EditProject;