import {createBrowserRouter, RouterProvider} from "react-router-dom"
import Login from "./components/auth/login";
import Signup from "./components/auth/Signup";
import Home from "./components/Home";
import Profile from "./components/profile/Profile.jsx"
import UpdateProfile from "./components/profile/UpdateProfile.jsx";
import ProjectForm from "./components/projects/ProjectForm.jsx";
import BrowseProjects from "./components/projects/BrowseProjects.jsx";
import ProjectDetails from "./components/projects/ProjectDetails.jsx";
import { NotificationProvider } from './context/NotificationContext';
import NotificationsPage from './components/notifications/NotificationsPage';

const appRouter = createBrowserRouter([
  {
    path: "/",
    element: <Home/>,
  },
  {
    path: "/login",
    element: <Login/>,
  },
  {
    path: "/signup",
    element: <Signup/>,
  },
  {
    path: "/profile",
    element: <Profile/>,
  },
  {
    path: "/profile/update",
    element: <UpdateProfile/>,
  },
  {
    path: "/project/new",
    element: <ProjectForm/>,
  },
  {
    path: "/projects",
    element: <BrowseProjects/>,
  },
  {
    path: "/project/:id",
    element: <ProjectDetails/>,
  },
  {
    path: "/notifications",
    element: <NotificationsPage />,
  }
])
function App() {
  return (
    <>
      <NotificationProvider>
        <RouterProvider router = {appRouter} />
      </NotificationProvider>
    </>
  )
}

export default App