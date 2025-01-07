import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { Link } from "react-router-dom";

const Projects = () => {
  const [project, setProject] = useState([]);

  useEffect(() => {
    axios
      .get("http://localhost:3000/auth/project")
      .then((result) => {
        if (result.data.Status) {
          setProject(result.data.Result);
        } else {
          alert(result.data.Error);
        }
      })
      .catch((err) => console.log(err));
  }, []);

  return (
    <div className='px-5 mt-3'>
          <h3 className='text-center'>Projects List</h3>
      <div className='d-block justify-content-center'>
        <table className='table'>
          <thead>
            <tr>
              <th className='text-start'>Project's name</th>
              <th className='text-end' style={{ paddingRight: '40px' }}>Profit</th>
              <th>Check</th>
            </tr>
          </thead>
          <tbody>
          {project.map((p, id) => (
            <tr key={id}>
              <td>{p.name}</td>
              <td className='text-end' style={{ paddingRight: '40px' }}>{Number(p.projectCost) * 0.65 }</td>
              <td>
                <Link 
                  to={`/dashboard/edit_project/` + p.id}
                  className="btn custom-btn-view"
                >
                  <i className="bi bi-eye"></i>
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
        </table>
        <Link to="/dashboard/add_project" className='btn btn-success mt-4 ms-3'>Add Project</Link>
      </div>
    </div>
  )
}

export default Projects