import axios from 'axios'
import React, { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { Chart } from "chart.js/auto";
import "bootstrap/dist/css/bootstrap.min.css";

const Home = () => {
  const [adminTotal, setAdminTotal] = useState(0)
  const [employee, setEmployee] = useState([]);
  const [projects, setProjects] = useState([]);
  const [salaryTotal, setSalaryTotal] = useState(0)
  const [admins, setAdmins] = useState([])
  const [admin, setAdmin] = useState({});
  const id = localStorage.getItem("id");

  // Dashboard const
  const projectOverviewRef = useRef(null);
  const projectProfitRef = useRef(null);
  const overviewChartRef = useRef(null); // Store the chart instance for cleanup
  const profitChartRef = useRef(null); // Store the chart instance for cleanup
  
  useEffect(() => {
    adminCount();
    salaryCount();
    AdminRecords();
  }, [])

  useEffect(() => {
    axios.get('http://localhost:3000/employee/adminDetails/' + id)
      .then(result => {
        if (result.data.length > 0) {
          setAdmin(result.data[0]);
        } else {
          console.log("Admin not found.");
        }
      })
      .catch(err => console.log(err))

    // Fetch employee data
    axios
      .get("http://localhost:3000/auth/employee")
      .then((result) => {
        if (result.data.Status) {
          setEmployee(result.data.Result);
        } else {
          alert(result.data.Error);
        }
      })
      .catch((err) => console.log(err));

    // Fetch projects data
    axios
      .get("http://localhost:3000/auth/project")
      .then((result) => {
        if (result.data.Status) {
          const allProjects = result.data.Result;
          const updatedFilteredProjects = allProjects.map((project) => {
            const deadline = new Date(project.deadline);
            deadline.setDate(deadline.getDate() + 1);
            return {
              ...project,
              deadline: deadline.toISOString().split("T")[0],
            };
          });

          setProjects(updatedFilteredProjects);
        } else {
          alert(result.data.Error);
        }
      })
      .catch((err) => console.log("Error fetching projects:", err));
  }, [id]);

  const AdminRecords = () => {
    axios.get('http://localhost:3000/auth/admin_records')
    .then(result => {
      if(result.data.Status) {
        setAdmins(result.data.Result)
      } else {
         alert(result.data.Error)
      }
    })
  }
  const adminCount = () => {
    axios.get('http://localhost:3000/auth/admin_count')
    .then(result => {
      if(result.data.Status) {
        setAdminTotal(result.data.Result[0].admin)
      }
    })
  }

  const salaryCount = () => {
    axios.get('http://localhost:3000/auth/salary_count')
    .then(result => {
      if(result.data.Status) {
        setSalaryTotal(result.data.Result[0].salaryOFEmp)
      } else {
        alert(result.data.Error)
      }
    })
  }

  const deleteAdmin = (id) => {
    axios.delete('http://localhost:3000/auth/delete_admin/' + id)
    .then((result) => {
      if(result.data.Status) {
        window.location.reload();
      }else{
          alert(result.data.Error);
      }
    }).catch(err => console.log(err));
  }


  // Dashboard useEffect
  useEffect(() => {
      if (projects.length > 0) {
        // Clean up existing charts
        if (overviewChartRef.current) {
          overviewChartRef.current.destroy();
        }
        if (profitChartRef.current) {
          profitChartRef.current.destroy();
        }
  
        // Create Project Overview Chart
        const overviewCtx = projectOverviewRef.current.getContext("2d");
        overviewChartRef.current = new Chart(overviewCtx, {
          type: "bar",
          data: {
            labels: projects.map((proj) => proj.name),
            datasets: [
              {
                label: "Project Overview",
                data: projects.map((proj) => proj.projectCost),
                backgroundColor: "rgba(75, 192, 192, 0.32)",
                borderColor: "rgba(75, 192, 192, 1)",
                borderWidth: 2,
              },
            ],
          },
          options: {
            responsive: true,
            plugins: {
              legend: { display: true },
              title: { display: true, text: "Projects Overview (Budget)" },
            },
            scales: {
              x: {
                grid: {
                  color: (context) => {
                    if (context.index  === 0) {
                      return "rgb(0, 0, 0)"; // Specific x-axis line
                    }
                    return "rgba(0, 0, 0, 0.1)"; // Default color for other lines
                  },
                  lineWidth: 2, // Line thickness
                },
              },
              y: {
                grid: {
                  color: (context) => {   
                    // Check for a specific tick value on the y-axis
                    if (context.index === 0) {  // Replace 1 with the value of the specific tick you want to change
                      return "rgb(0, 0, 0)";  // Red color for specific y-axis line
                    }
            
                    // Default color for other lines
                    return "rgba(0, 0, 0, 0.2)";
                  },
                  lineWidth: 2,  // Line thickness
                },
                ticks: {
                  font: {
                    size: 12, // Size of tick labels
                  },
                },
                title: {
                  display: true,
                  text: "Cost (in USD)",
                  font: {
                    size: 14,
                  },
                },
              },
            },
          },
        });
  
        // Create Projects' Profit Chart
        const profitCtx = projectProfitRef.current.getContext("2d");
        profitChartRef.current = new Chart(profitCtx, {
          type: "pie",
          data: {
            labels: projects.map((proj) => proj.name),
            datasets: [
              {
                label: "Project Profit",
                data: projects.map((proj) => proj.projectCost * 0.65),
                backgroundColor: [
                  "rgba(255, 99, 133, 0.61)",
                  "rgba(54, 163, 235, 0.61)",
                  "rgba(255, 206, 86, 0.61)",
                  "rgba(75, 192, 192, 0.61)",
                  "rgba(153, 102, 255, 0.61)",
                ],
                borderColor: [
                  "rgba(255, 99, 132, 1)",
                  "rgba(54, 162, 235, 1)",
                  "rgba(255, 206, 86, 1)",
                  "rgba(75, 192, 192, 1)",
                  "rgba(153, 102, 255, 1)",
                ],
                borderWidth: 2,
              },
            ],
          },
          options: {
            responsive: true,
            plugins: {
              legend: { display: true },
              title: { display: true, text: "Projects Profit Distribution" },
            },
          },
        });
      }
  
      // Cleanup function
      return () => {
        if (overviewChartRef.current) {
          overviewChartRef.current.destroy();
        }
        if (profitChartRef.current) {
          profitChartRef.current.destroy();
        }
      };
    }, [projects]);

  return (
    <div className='border-success'>
      <h1 className="text-center mt-3 mb-4">Admin Dashboard</h1>
      <div className='p-3 d-flex justify-content-around mt-3 mb-3'>
        <div className='px-3 pt-2 pb-3 border border-2 border-black shadow-sm' style={{width: "280px"}}>
          <div className='text-center pb-1'>
            <h4>Admin</h4>
          </div>
          <hr />
          <div className='d-flex justify-content-between'>
            <h5>Total :</h5>
            <h5>{adminTotal}</h5>
          </div>
        </div>
        <div className='px-3 pt-2 pb-3 border border-2 border-black shadow-sm'  style={{width: "280px"}}>
          <div className='text-center pb-2'>
            <h4>Employee</h4>
          </div>
          <hr />
          <div className='d-flex justify-content-between'>
            <h5>Total :</h5>
            <h5>{employee.length}</h5>
          </div>
        </div>
        <div className='px-3 pt-2 pb-3 border border-2 border-black shadow-sm '  style={{width: "280px"}}>
          <div className='text-center pb-1'>
            <h4>Salary</h4>
          </div>
          <hr />
          <div className='d-flex justify-content-between'>
            <h5>Total :</h5>
            <h5>${salaryTotal}</h5>
          </div>
        </div>
        <div className='px-3 pt-2 pb-3 border border-2 border-black shadow-sm' style={{width: "280px"}}>
          <div className='text-center pb-1'>
            <h4>Project</h4>
          </div>
          <hr />
          <div className='d-flex justify-content-between'>
            <h5>Total :</h5>
            <h5>{projects.length}</h5>
          </div>
        </div>
      </div>
      <hr className='mt-4 mb-4'/>
      <div className="row">
        <div className="col-md-6 md-5">
          <h3 className="text-center text-black">Projects Overview</h3>
          <canvas ref={projectOverviewRef}></canvas>
        </div>
        <div className="col-md-5 ms-5">
          <h3 className="text-center text-black">Profit</h3>
          <canvas ref={projectProfitRef}></canvas>
        </div>
      </div>
      <hr className='mt-4' />
      <div className='mt-4 px-5 pt-3'>
        {admin.id == 1 && admin.email == "admin@gmail.com" && 
          <Link 
            to="/dashboard/add_admin"
            className='btn btn-success btn-xl me-2 mb-3'>
            Add an Admin
          </Link>
        }
        <h3>List of Admins</h3>
        <table className='table'>
          <thead>
            <tr>
              <th>Email</th>
              {admin.id == 1 && admin.email == "admin@gmail.com" && 
                <th>Action</th>
              }
            </tr>
          </thead>
          <tbody>
            {
              admins.map((a,id) => (
                <tr key={id}>
                  {a.id === 1 ? (
                    <td className="bg-secondary rounded"><b>{a.email}</b></td>
                  ):(
                    <td>{a.email}</td>
                  )}
                  <td>
                    {admin.id === 1 && admin.email === "admin@gmail.com" && 
                      <div>
                        <button
                          onClick={() => deleteAdmin(a.id)}
                          className="btn btn-danger btn-sm" >
                          Delete
                        </button>
                      </div>
                    }
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

export default Home