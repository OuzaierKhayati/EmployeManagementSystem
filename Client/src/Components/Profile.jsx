import axios from "axios";
import React, { useState, useEffect, useRef } from "react";
import { Chart } from "chart.js/auto";
import "bootstrap/dist/css/bootstrap.min.css";

const Profile = () => {
  const [employee, setEmployee] = useState([]);
  const [projects, setProjects] = useState([]);
  const projectOverviewRef = useRef(null);
  const projectProfitRef = useRef(null);
  const overviewChartRef = useRef(null); // Store the chart instance for cleanup
  const profitChartRef = useRef(null); // Store the chart instance for cleanup

  useEffect(() => {
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
  }, []);

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
              label: "Projects Overview",
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
              data: projects.map((proj) => proj.projectCost * 0.56),
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
    <div className="container mt-5">
      <h1 className="text-center mb-4">Admin Dashboard</h1>
      <div className="row mb-4">
        <div className="col-md-6">
          <div className="card text-center">
            <div className="card-body">
              <h5 className="card-title"><b>Total Employees</b></h5>
              <p className="card-text" style={{fontSize: "30px"}}>{employee.length}</p>
            </div>
          </div>
        </div>
        <div className="col-md-6">
          <div className="card text-center">
            <div className="card-body">
              <h5 className="card-title"><b>Total Projects</b></h5>
              <p className="card-text" style={{fontSize: "30px"}}>{projects.length}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="row">
        <div className="col-md-6 md-5">
          <h3 className="text-center">Projects Overview</h3>
          <canvas ref={projectOverviewRef}></canvas>
        </div>
        <div className="col-md-5 ms-5">
          <h3 className="text-center">Projects' Profit</h3>
          <canvas ref={projectProfitRef}></canvas>
        </div>
      </div>
    </div>
  );
};

export default Profile;
