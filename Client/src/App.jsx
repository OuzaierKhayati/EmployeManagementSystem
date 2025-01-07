import './App.css'
import 'bootstrap/dist/css/bootstrap.min.css'
import Login from './Components/Login'
import {BrowserRouter, Routes, Route} from 'react-router-dom'
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Dashboard from './Components/Dashboard'
import Home from './Components/Home'
import Employee from './Components/Employee'
import Category from './Components/Category'
import Projects from './Components/Projects'
import AddProject from './Components/AddProject'
import Profile from './Components/Profile'
import AddCategory from './Components/AddCategory'
import AddEmployee from './Components/AddEmployee'
import EditEmployee from './Components/EditEmployee'
import Start from './Components/Start'
import EmployeeLogin from './Components/EmployeeLogin'
import EmployeeDetail from './Components/EmployeeDetail'
import PrivateRoute from './Components/PrivateRoute'
import AddAdmin from './Components/AddAdmin'
import EditProject from './Components/EditProject';
import EmployeeEdit from './Components/EmployeeEdit';

function App() {
  return (
    <>
      <BrowserRouter>
      <Routes>
        <Route path='/' element={<Start />}></Route>
        <Route path='/adminlogin' element={<Login />}></Route>
        <Route path='/employee_login' element={<EmployeeLogin />}></Route>
        <Route path='/employee_detail/:id' element={<EmployeeDetail />}></Route>
        <Route path='/employee_detail/employee_edit/:id' element={<EmployeeEdit />}></Route>
        <Route path='/dashboard' element={
          <PrivateRoute >
            <Dashboard />
          </PrivateRoute>
        }>
          <Route path='' element={<Home />}></Route>
          <Route path='/dashboard/add_admin' element={<AddAdmin />}></Route>
          <Route path='/dashboard/employee' element={<Employee />}></Route>
          <Route path='/dashboard/category' element={<Category />}></Route>
          <Route path='/dashboard/projects' element={<Projects />}></Route>
          <Route path='/dashboard/add_project' element={<AddProject />}></Route>
          <Route path='/dashboard/edit_project/:id' element={<EditProject />}></Route>
          <Route path='/dashboard/profile' element={<Profile />}></Route>
          <Route path='/dashboard/add_category' element={<AddCategory />}></Route>
          <Route path='/dashboard/add_employee' element={<AddEmployee />}></Route>
          <Route path='/dashboard/edit_employee/:id' element={<EditEmployee />}></Route>
        </Route>
      </Routes>
      </BrowserRouter>
      <ToastContainer />
    </>
  )
}

export default App
