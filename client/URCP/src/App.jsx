import {createBrowserRouter, RouterProvider} from "react-router-dom"
import Login from "./components/auth/login";
import Signup from "./components/auth/Signup";
import Home from "./components/Home";
import Profile from "./components/profile/Profile.jsx"
import UpdateProfile from "./components/profile/UpdateProfile.jsx";

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
  }
])
function App() {
  return (
    <>
      <RouterProvider router = {appRouter} />
    </>
  )
}

export default App