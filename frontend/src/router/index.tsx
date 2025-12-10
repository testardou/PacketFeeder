import { createBrowserRouter, Navigate } from "react-router-dom";

// import Layout from "@/layouts/Layout";
import Replay from "@/pages/Replay";
import Speak from "@/pages/Speak";
import Layout from "../layouts/Layout";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <Layout />,
    children: [
      {
        index: true,
        element: <Navigate to="/replay" replace />,
      },
      {
        path: "replay",
        element: <Replay />,
      },
      {
        path: "speak",
        element: <Speak />,
      },
    ],
  },
]);
